import { PrismaClient } from '@prisma/client';
import { existsSync, copyFileSync } from 'fs';
import { join } from 'path';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getDatasourceUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (process.env.VERCEL) {
    const source = join(process.cwd(), 'prisma', 'dev.db');
    const target = '/tmp/chengtou-demo.db';

    if (existsSync(source) && !existsSync(target)) {
      copyFileSync(source, target);
    }

    return `file:${target}`;
  }

  return 'file:./dev.db';
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatasourceUrl()
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
