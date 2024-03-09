import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient;
}

// biome-ignore lint/suspicious/noRedeclare: <explanation>
const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['warn', 'error'],
    datasourceUrl: process.env.NODE_ENV === 'test' ? process.env.DATABASE_TEST_URL : process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
