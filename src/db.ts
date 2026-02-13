import { Pool } from 'pg';

type GlobalWithPg = NodeJS.Global & { __pgPool?: Pool | null };
const globalAny = global as GlobalWithPg;

const possibleKeys = [
  'DATABASE_URL',
  'DATABASE_URL_PUBLIC',
  'DATABASE_URL_PUBLICA',
  'URL_DE_LA_BASE_DE_DATOS',
  'URL_PÚBLICA_DE_LA_BASE_DE_DATOS',
  'DATABASE_URL_VERSEL',
  'POSTGRES_URL',
  'PGDATABASE_URL',
];

function findDbUrl(): string | undefined {
  return possibleKeys.map((k) => ({ k, v: process.env[k] })).find((x) => x?.v)?.v;
}

export function getPool(): Pool | null {
  if (globalAny.__pgPool) return globalAny.__pgPool;
  const dbUrl = findDbUrl();
  if (!dbUrl) return null;
  const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  globalAny.__pgPool = pool;
  return pool;
}

export default getPool;
