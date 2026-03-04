/**
 * Run job ingestion from enabled connectors (CLI).
 * Legal: Only uses sources that allow programmatic use (Adzuna, Greenhouse with permission).
 * Run: npm run ingest
 */

import { runIngestion } from '../src/lib/ingestion/run';
import { prisma } from '../src/lib/prisma';

async function main() {
  const adzunaEnabled = process.env.INGESTION_ADZUNA_ENABLED === 'true' && process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY;
  if (!adzunaEnabled) {
    console.log('Adzuna disabled. Set INGESTION_ADZUNA_ENABLED=true and ADZUNA_APP_ID, ADZUNA_APP_KEY.');
  }
  const result = await runIngestion();
  console.log(`Ingestion done. Created: ${result.created}, Updated: ${result.updated}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
