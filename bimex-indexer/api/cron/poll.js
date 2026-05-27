import { SorobanRpc } from '@stellar/stellar-sdk';
import { parseTx } from '../../eventParser.js';
import { upsertProyecto, upsertAportacion, insertEvento, getLastIndexedLedger } from '../../database.js';

// Allow up to 60 seconds on Vercel Pro / Hobby cron invocations
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const RPC_URL     = process.env.STELLAR_RPC_URL;
  const CONTRACT_ID = process.env.CONTRACT_ID;
  const START_LEDGER = parseInt(process.env.START_LEDGER ?? '0', 10);

  if (!RPC_URL || !CONTRACT_ID) {
    return res.status(500).json({ error: 'Missing STELLAR_RPC_URL or CONTRACT_ID' });
  }

  const rpc = new SorobanRpc.Server(RPC_URL, { allowHttp: false });

  let cursor = START_LEDGER || null;
  if (!cursor) {
    const last = await getLastIndexedLedger();
    cursor = last ? last + 1 : (await rpc.getLatestLedger()).sequence;
  }

  const resp = await rpc.getTransactions({
    startLedger: cursor,
    pagination: { limit: 200 },
  });

  let processed = 0;
  for (const tx of resp.transactions ?? []) {
    if (tx.status !== 'SUCCESS') continue;
    const parsed = parseTx(tx, CONTRACT_ID);
    if (!parsed) continue;
    const { evento, proyecto, aportacion } = parsed;
    await insertEvento(evento).catch(console.error);
    if (proyecto)   await upsertProyecto(proyecto).catch(console.error);
    if (aportacion) await upsertAportacion(aportacion).catch(console.error);
    processed++;
  }

  const nextCursor = resp.cursor ?? (resp.latestLedger + 1);
  console.log(`[poll] cursor=${cursor} processed=${processed} next=${nextCursor}`);
  res.json({ ok: true, cursor, nextCursor, processed });
}
