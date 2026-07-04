import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://catalog:catalog@localhost:5432/catalog',
})

export const db = drizzle(pool, { schema })

export async function connectDB() {
  await pool.query('SELECT 1')
}

export async function disconnectDB() {
  await pool.end()
}
