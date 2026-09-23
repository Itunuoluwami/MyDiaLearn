import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma CLI configuration.
 *
 * From Prisma 7 the connection URL lives here rather than in schema.prisma.
 * This file is read by `prisma db pull`, `prisma migrate` and `prisma studio`
 * — not by the running application, which builds its own client from a pg
 * adapter in src/database/prisma.service.ts.
 *
 * DATABASE_URL is read from backend/.env, which is gitignored.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
