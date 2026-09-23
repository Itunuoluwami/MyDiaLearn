/**
 * Database seed.
 *
 * Deliberately seeds nothing yet.
 *
 * DiaLearn's reference data — subjects, curricula, education levels,
 * currencies, cancellation policies, commission rules, notification templates
 * — is administered through the admin portal and already exists in the
 * database. Migration rule 11 forbids hardcoding any of it, and rule 8 forbids
 * destructive database operations, so a seed that invented plausible-looking
 * rows would be worse than an empty one: it would create a second, divergent
 * source of truth for values the business owns.
 *
 * What this file is for: local development against an empty database, once
 * there is a fixture set someone has actually approved. The guard below is the
 * part that matters today.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

async function main(): Promise<void> {
  const env = process.env.APP_ENV ?? 'development';

  if (env === 'production' || env === 'staging') {
    throw new Error(
      `Refusing to seed with APP_ENV=${env}. Seeding is for local and test ` +
        'databases only.',
    );
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

  try {
    const profiles = await prisma.profile.count();
    console.log(`Connected. profiles table currently holds ${profiles} row(s).`);
    console.log(
      'No fixtures defined. Reference data is admin-managed and must not be ' +
        'invented here — see the comment at the top of this file.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
