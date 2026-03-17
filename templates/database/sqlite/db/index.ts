import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

const client = new Database('./local.db')

export const db = drizzle(client, { schema })
