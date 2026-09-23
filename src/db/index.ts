import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import path from "path";
import fs from "fs";

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL,
  display_name VARCHAR(150),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by INTEGER
);

CREATE TABLE IF NOT EXISTS login_logs (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  role VARCHAR(30),
  success BOOLEAN NOT NULL,
  ip_address VARCHAR(64),
  user_agent TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  username VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  page VARCHAR(100),
  metadata JSONB,
  ip_address VARCHAR(64),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by INTEGER
);

CREATE TABLE IF NOT EXISTS installation (
  id SERIAL PRIMARY KEY,
  installed BOOLEAN NOT NULL DEFAULT false,
  installed_at TIMESTAMPTZ,
  installed_by VARCHAR(100),
  system_name VARCHAR(200) NOT NULL DEFAULT 'Heavy Equipment Workshop Management System',
  file_manifest JSONB
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  username VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address VARCHAR(64)
);
`;

const globalForDb = globalThis as typeof globalThis & {
  __appDbInstance?: ReturnType<typeof drizzlePg>;
  __appPgPool?: Pool;
  __appPglite?: PGlite;
  __appTablesInitialized?: boolean;
};

const databaseUrl = process.env.DATABASE_URL;
const isRemotePg =
  databaseUrl &&
  (databaseUrl.startsWith("postgres://") ||
    databaseUrl.startsWith("postgresql://"));

function initDatabase(): ReturnType<typeof drizzlePg> {
  if (globalForDb.__appDbInstance) {
    return globalForDb.__appDbInstance;
  }

  if (isRemotePg) {
    const pool =
      globalForDb.__appPgPool ??
      new Pool({
        connectionString: databaseUrl,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__appPgPool = pool;
    }

    if (!globalForDb.__appTablesInitialized) {
      globalForDb.__appTablesInitialized = true;
      pool.query(INIT_SQL).catch((err) => {
        console.error("Auto-init PostgreSQL tables note:", err);
      });
    }

    const dbInstance = drizzlePg(pool);
    globalForDb.__appDbInstance = dbInstance;
    return dbInstance;
  } else {
    const dbDir = path.join(process.cwd(), "data", "db");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const client = globalForDb.__appPglite ?? new PGlite(dbDir);
    if (process.env.NODE_ENV !== "production") {
      globalForDb.__appPglite = client;
    }

    if (!globalForDb.__appTablesInitialized) {
      globalForDb.__appTablesInitialized = true;
      client.exec(INIT_SQL).catch((err) => {
        console.error("Auto-init PGlite tables note:", err);
      });
    }

    const dbInstance = drizzlePglite(client) as unknown as ReturnType<
      typeof drizzlePg
    >;
    globalForDb.__appDbInstance = dbInstance;
    return dbInstance;
  }
}

export const db = initDatabase();
export const pool = globalForDb.__appPgPool;
