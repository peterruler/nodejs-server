import { Client } from 'pg';

export async function ensureDatabaseExists(opts: {
  url?: string;
  host?: string;
  port?: number | string | undefined;
  user?: string;
  password?: string;
  database?: string;
}): Promise<void> {
  let host = opts.host;
  let port = typeof opts.port === 'string' ? parseInt(opts.port, 10) : opts.port;
  let user = opts.user;
  let password = opts.password;
  let database = opts.database;

  if (opts.url) {
    try {
      const u = new URL(opts.url);
      if (u.protocol.startsWith('postgres')) {
        host = host || u.hostname;
        port = port || (u.port ? parseInt(u.port, 10) : 5432);
        user = user || decodeURIComponent(u.username);
        password = password || decodeURIComponent(u.password);
        database = database || u.pathname.replace(/^\//, '');
      }
    } catch {
      // ignore URL parse issues; rely on discrete fields
    }
  }

  if (!host || !user || !database) {
    // Missing critical info; do not attempt creation
    return;
  }

  const targetConfig = { host, port: port || 5432, user, password, database } as const;

  // Try connecting to the target database first
  try {
    const probe = new Client(targetConfig);
    await probe.connect();
    await probe.end();
    return; // exists
  } catch (e: any) {
    const code = e && e.code;
    const msg = (e && (e.message as string)) || '';
    const notExists = code === '3D000' || /does not exist/i.test(msg) || /invalid catalog name/i.test(msg);
    if (!notExists) {
      // Different connection error; rethrow
      throw e;
    }
  }

  // Connect to default 'postgres' DB and create the target DB if missing
  const admin = new Client({ host, port: port || 5432, user, password, database: 'postgres' });
  await admin.connect();
  try {
    const check = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);
    if (check.rowCount === 0) {
      const dbIdent = (database || '').replace(/"/g, '""');
      await admin.query(`CREATE DATABASE "${dbIdent}"`);
    }
  } finally {
    await admin.end();
  }
}

