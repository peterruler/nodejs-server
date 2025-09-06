import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Project } from './issuetracker/entities/project.entity';
import { Issue } from './issuetracker/entities/issue.entity';
import { User } from './users/user.entity';
import * as bcrypt from 'bcrypt';
import * as fs from 'node:fs';
import * as path from 'node:path';

type DBJson = {
  Project: Array<{ id: string; name: string; active: boolean }>;
  Issue: Array<{
    id: string;
    title: string;
    priority: string; // '1' | '2' | '3'
    dueDate: string; // YYYY-MM-DD
    done: boolean;
    projectId: string;
  }>;
};

async function loadFromUrl(url: string): Promise<DBJson> {
  const base = url.replace(/\/$/, '');
  const fetchAny: any = (globalThis as any).fetch;
  if (!fetchAny) {
    throw new Error('Global fetch is not available in this Node runtime.');
  }

  // Try fetching individual collections first
  try {
    const [projRes, issueRes] = await Promise.all([
      fetchAny(`${base}/Project`),
      fetchAny(`${base}/Issue`),
    ]);
    if (projRes.ok && issueRes.ok) {
      const [projects, issues] = await Promise.all([projRes.json(), issueRes.json()]);
      if (Array.isArray(projects) && Array.isArray(issues)) {
        return { Project: projects, Issue: issues } as DBJson;
      }
    }
  } catch (_) {
    // Fall through to try full JSON
  }

  // Fallback: assume URL returns the full JSON document
  const res = await fetchAny(base);
  if (!res.ok) {
    throw new Error(`Failed to fetch seed data from URL: ${base} (status ${res.status})`);
  }
  const data = await res.json();
  if (!data || !Array.isArray(data.Project) || !Array.isArray(data.Issue)) {
    throw new Error('Seed URL did not return expected { Project: [], Issue: [] } shape.');
  }
  return data as DBJson;
}

async function run() {
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const dataSource = appContext.get(DataSource);
    const projectRepo = dataSource.getRepository(Project);
    const issueRepo = dataSource.getRepository(Issue);
    const userRepo = dataSource.getRepository(User);
    const resetEnv = (process.env.RESET_SEED || '').toLowerCase();
    const resetArg = process.argv.some((a) => a === '--reset' || a === '-r');
    const doReset = resetArg || ['1', 'true', 'yes', 'on'].includes(resetEnv);
    const urlArgIndex = process.argv.findIndex((a) => a === '--url' || a === '-u');
    const urlFromArg = urlArgIndex >= 0 ? process.argv[urlArgIndex + 1] : undefined;
    const urlFromEnv = process.env.SEED_URL;
    const useUrl = (urlFromArg || urlFromEnv)?.trim();

    if (doReset) {
      console.log('RESET_SEED enabled: clearing tables...');
      // Prefer TRUNCATE for speed and to cascade relations
      await dataSource.query('TRUNCATE TABLE issues, projects, users CASCADE');
      console.log('Tables cleared.');
    }

    let data: DBJson;
    if (useUrl) {
      console.log(`Seeding from URL: ${useUrl}`);
      data = await loadFromUrl(useUrl);
    } else {
      const dbPath = path.resolve(__dirname, '../../frontend/db.json');
      if (!fs.existsSync(dbPath)) {
        throw new Error(`Could not find frontend/db.json at: ${dbPath}`);
      }
      const raw = fs.readFileSync(dbPath, 'utf8');
      data = JSON.parse(raw) as DBJson;
      console.log(`Seeding from file: ${dbPath}`);
    }

    // Ensure a default user exists and own all seeded data
    let owner = await userRepo.findOne({ where: { email: 'seed@example.com' } });
    if (!owner) {
      const password = await bcrypt.hash('password', 10);
      owner = await userRepo.save(userRepo.create({ email: 'seed@example.com', password }));
      console.log('Created default seed user: seed@example.com / password');
    }

    console.log(`Seeding ${data.Project.length} projects...`);
    for (const p of data.Project) {
      await projectRepo.save({ id: p.id, name: p.name, active: p.active, userId: owner.id });
    }

    console.log(`Seeding ${data.Issue.length} issues...`);
    for (const i of data.Issue) {
      // Ensure project exists (in case of manual edits to db.json)
      const exists = await projectRepo.exist({ where: { id: i.projectId } });
      if (!exists) {
        console.warn(`Skipping issue ${i.id}: project ${i.projectId} not found`);
        continue;
      }
      await issueRepo.save({
        id: i.id,
        title: i.title,
        priority: i.priority,
        dueDate: i.dueDate,
        done: i.done,
        projectId: i.projectId,
        userId: owner.id,
      });
    }

    console.log('Seeding complete.');
  } finally {
    await appContext.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
