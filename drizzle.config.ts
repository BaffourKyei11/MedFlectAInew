import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Parse DATABASE_URL for drizzle-kit config
const match = process.env.DATABASE_URL?.match(/^postgres(?:ql)?:\/\/(?<user>[^:]+):(?<password>[^@]+)@(?<host>[^:/]+)(?::(?<port>\d+))?\/(?<database>[^?]+)/);
if (!match?.groups) throw new Error('Invalid DATABASE_URL');
const { user, password, host, port, database } = match.groups;

export default {
  schema: './shared/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host,
    user,
    password,
    database,
    port: port ? Number(port) : 5432,
    ssl: 'require',
  },
} satisfies Config;
