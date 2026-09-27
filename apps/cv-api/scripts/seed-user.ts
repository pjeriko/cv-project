import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcrypt';

const [, , email, plainPassword] = process.argv;

if (!email || !plainPassword) {
  console.error('Usage: npx tsx scripts/seed-user.ts <email> <password>');
  process.exit(1);
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const hashed = await bcrypt.hash(plainPassword, 10);

const user = await prisma.user.upsert({
  where: { email },
  update: { password: hashed },
  create: { email, password: hashed },
});

console.log(`✅ Utilisateur prêt : ${user.email} (id: ${user.id})`);
await prisma.$disconnect();
