import 'dotenv/config';
import { Client } from 'pg';

function parseDbConfig() {
  const url = process.env.DATABASE_URL;
  let host = process.env.DB_HOST;
  let port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;
  let user = process.env.DB_USER;
  let password = process.env.DB_PASSWORD;
  let database = process.env.DB_NAME;

  if (url) {
    try {
      const u = new URL(url);
      if (u.protocol.startsWith('postgres')) {
        host = host || u.hostname;
        port = port || (u.port ? parseInt(u.port, 10) : 5432);
        user = user || decodeURIComponent(u.username);
        password = password || decodeURIComponent(u.password);
        database = database || u.pathname.replace(/^\//, '');
      }
    } catch {}
  }

  return { host, port: port || 5432, user, password, database } as const;
}

async function main() {
  const { host, port, user, password, database } = parseDbConfig();
  if (!host || !user || !database) {
    console.error('Missing DB configuration. Ensure DATABASE_URL or DB_HOST/DB_USER/DB_NAME are set.');
    process.exit(1);
  }

  const admin = new Client({ host, port, user, password, database: 'postgres' });
  await admin.connect();
  try {
    console.log(`Dropping database: ${database}`);
    // Terminate existing connections to allow DROP DATABASE
    await admin.query(
      'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
      [database],
    );
    await admin.query(`DROP DATABASE IF EXISTS "${database.replace(/"/g, '""')}"`);
    console.log('Database dropped (if it existed).');
  } finally {
    await admin.end();
  }
}

main().catch((err) => {
  console.error('Failed to drop database:', err);
  process.exit(1);
});

