import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.js';

const PROFILE_ID = 1;
const BCRYPT_COST = 10;
const MIN_PASSWORD_LENGTH = 12;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

async function main(): Promise<void> {
  const email = requireEnv('ADMIN_EMAIL').trim();
  const password = requireEnv('ADMIN_PASSWORD');
  const databaseUrl = requireEnv('DATABASE_URL');

  if (!email.includes('@')) {
    throw new Error('ADMIN_EMAIL ne ressemble pas a une adresse email.');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD : ${MIN_PASSWORD_LENGTH} caracteres minimum.`,
    );
  }

  // Seul le nom de la base est affiche (ni hote, ni identifiants).
  console.log(`Base cible : ${new URL(databaseUrl).pathname.slice(1)}`);

  const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('Utilisateur : deja present, inchange.');
    } else {
      const hash = await bcrypt.hash(password, BCRYPT_COST);
      await prisma.user.create({ data: { email, password: hash } });
      console.log('Utilisateur : cree.');
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { id: PROFILE_ID },
    });
    if (existingProfile) {
      console.log('Profil id 1 : deja present, inchange.');
    } else {
      await prisma.profile.create({
        data: {
          id: PROFILE_ID,
          fullName: 'A renseigner',
          title: 'A renseigner',
          summary: '',
          email: 'a-renseigner@example.invalid',
        },
      });
      console.log(
        'Profil id 1 : cree (valeurs neutres, a completer dans cv-admin).',
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
