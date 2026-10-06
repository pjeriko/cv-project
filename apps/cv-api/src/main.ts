import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

const DEV_ORIGINS = ['http://localhost:4200', 'http://localhost:4300'];

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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: corsOrigins() });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
