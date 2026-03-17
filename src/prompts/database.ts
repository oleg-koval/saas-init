import * as p from '@clack/prompts'
import type { DatabaseProvider } from '../types.js'

export type DatabaseAnswers = {
  database: DatabaseProvider
}

export async function promptDatabase(): Promise<DatabaseAnswers> {
  const database = await p.select<DatabaseProvider>({
    message: 'Database',
    options: [
      { value: 'postgres', label: 'Postgres' },
      { value: 'sqlite', label: 'SQLite' },
      { value: 'supabase', label: 'Supabase' },
    ],
  })

  if (p.isCancel(database)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  return { database: database as DatabaseProvider }
}
