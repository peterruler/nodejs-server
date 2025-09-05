import 'dotenv/config';
import { ensureDatabaseExists } from '../database/ensure-database';

async function main() {
  const url = process.env.DATABASE_URL;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!url && !host) {
    // eslint-disable-next-line no-console
    console.warn(
      'No DATABASE_URL or DB_HOST provided. Set env vars in backend/.env before running.',
    );
  }

  await ensureDatabaseExists({ url, host, port, user, password, database });
  // eslint-disable-next-line no-console
  console.log('Database ensured (created if missing).');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to ensure database:', err);
  process.exit(1);
});

