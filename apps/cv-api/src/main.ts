import 'dotenv/config';
import { existsSync } from 'node:fs';
import type { ServerResponse } from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module.js';

const DEV_ORIGINS = ['http://localhost:4200', 'http://localhost:4300'];

// Dossiers de build des fronts, relatifs à apps/cv-api/dist/main.js.
const PUBLIC_DIR = fileURLToPath(
  new URL('../../cv-public/dist/cv-public/browser', import.meta.url),
);
const ADMIN_DIR = fileURLToPath(
  new URL('../../cv-admin/dist/cv-admin/browser', import.meta.url),
);

// CORS_ORIGINS : origines séparées par des virgules.
// Variable absente : origines de développement. Définie : celles-ci seulement.
function corsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (raw === undefined) {
    return DEV_ORIGINS;
  }
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

// Fichiers .js et .css : noms hachés par Angular, cache long.
// index.html : jamais en cache, pour voir tout de suite un nouveau build.
function setCacheHeaders(res: ServerResponse, filePath: string): void {
  if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (filePath.endsWith('index.html')) {
    res.setHeader('Cache-Control', 'no-cache');
  }
}

function isAdminPath(path: string): boolean {
  return path === '/admin' || path.startsWith('/admin/');
}

function isPublicFrontPath(path: string): boolean {
  return path === '/' || path === '/cv' || path.startsWith('/cv/');
}

function serveFronts(app: NestExpressApplication): void {
  const publicIndex = join(PUBLIC_DIR, 'index.html');
  const adminIndex = join(ADMIN_DIR, 'index.html');
  const hasPublic = existsSync(publicIndex);
  const hasAdmin = existsSync(adminIndex);

  if (hasPublic) {
    app.useStaticAssets(PUBLIC_DIR, {
      index: false,
      setHeaders: setCacheHeaders,
    });
  } else {
    console.log('cv-public : build absent, front non servi.');
  }
  if (hasAdmin) {
    app.useStaticAssets(ADMIN_DIR, {
      prefix: '/admin',
      index: false,
      setHeaders: setCacheHeaders,
    });
  } else {
    console.log('cv-admin : build absent, front non servi.');
  }

  // Repli SPA : seulement GET/HEAD, seulement les chemins des fronts,
  // et pas les fichiers (dernier segment avec un point) : les 404 de l'API
  // et des assets manquants restent des 404.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }
    const lastSegment = req.path.split('/').pop() ?? '';
    if (lastSegment.includes('.')) {
      return next();
    }
    if (isAdminPath(req.path) && hasAdmin) {
      return res.sendFile(adminIndex, {
        headers: { 'Cache-Control': 'no-cache' },
      });
    }
    if (isPublicFrontPath(req.path) && hasPublic) {
      return res.sendFile(publicIndex, {
        headers: { 'Cache-Control': 'no-cache' },
      });
    }
    return next();
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: corsOrigins() });
  serveFronts(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
