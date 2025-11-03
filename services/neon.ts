import { neon, Pool } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing VITE_DATABASE_URL environment variable. Please check your .env file.');
}

// Create Neon SQL client (for template literals)
export const sql = neon(databaseUrl);

// Create Neon Pool (for parameterized queries)
export const pool = new Pool({ connectionString: databaseUrl });

// Helper for executing parameterized queries
export async function executeQuery<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(queryText, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}
