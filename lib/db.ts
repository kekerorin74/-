import { sql } from '@vercel/postgres';

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS predictions (
      id SERIAL PRIMARY KEY,
      race_date TEXT NOT NULL,
      race_name TEXT NOT NULL,
      firm_horse TEXT NOT NULL,
      value_horse_1 TEXT NOT NULL,
      value_horse_2 TEXT,
      value_horse_3 TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export default sql;
