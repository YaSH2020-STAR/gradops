import { NextResponse } from 'next/server';
import { runIngestion } from '@/lib/ingestion/run';

/**
 * Cron endpoint to run job ingestion automatically.
 * Call this from a cron service (e.g. every 6 hours) so jobs stay fresh.
 * Protect with CRON_SECRET so only your cron service can trigger it.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const querySecret = new URL(req.url).searchParams.get('secret');

  if (secret && token !== secret && querySecret !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runIngestion();
    return NextResponse.json({
      ok: true,
      created: result.created,
      updated: result.updated,
    });
  } catch (e) {
    console.error('Cron ingest failed:', e);
    return NextResponse.json(
      { error: 'Ingestion failed', details: String(e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
