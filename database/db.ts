import { neon } from '@neondatabase/serverless';
import { config } from '../config';

export const sql = neon(config.POSTGRES_URL);

export async function getPgVersion() {
  const result = await sql`SELECT version()`;
  console.log('📦 PostgreSQL version:', result[0]);
}

export async function initDB() {
  await sql`CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    public_key TEXT NOT NULL UNIQUE,
    private_key TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  console.log('✅ Database tables initialized');
}