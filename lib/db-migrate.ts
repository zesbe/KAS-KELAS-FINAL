import { pool } from './db';
import fs from 'fs';
import path from 'path';

interface Migration {
  id: number;
  name: string;
  executed_at?: Date;
}

export class DatabaseMigration {
  private migrationsPath: string;

  constructor(migrationsPath: string = './migrations') {
    this.migrationsPath = migrationsPath;
  }

  async initialize() {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
  }

  async getMigrations(): Promise<Migration[]> {
    const result = await pool.query('SELECT * FROM migrations ORDER BY id');
    return result.rows;
  }

  async runMigrations() {
    await this.initialize();

    // Get list of executed migrations
    const executedMigrations = await this.getMigrations();
    const executedNames = new Set(executedMigrations.map(m => m.name));

    // Get list of migration files
    const migrationFiles = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executedNames.has(file)) {
        console.log(`Running migration: ${file}`);
        
        const filePath = path.join(this.migrationsPath, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
          console.log(`Migration ${file} completed successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Migration ${file} failed:`, error);
          throw error;
        } finally {
          client.release();
        }
      }
    }

    console.log('All migrations completed');
  }

  async rollback(steps: number = 1) {
    const migrations = await this.getMigrations();
    const toRollback = migrations.slice(-steps);

    for (const migration of toRollback.reverse()) {
      const rollbackFile = migration.name.replace('.sql', '.down.sql');
      const rollbackPath = path.join(this.migrationsPath, rollbackFile);

      if (fs.existsSync(rollbackPath)) {
        console.log(`Rolling back migration: ${migration.name}`);
        
        const sql = fs.readFileSync(rollbackPath, 'utf8');
        const client = await pool.connect();
        
        try {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query(
            'DELETE FROM migrations WHERE name = $1',
            [migration.name]
          );
          await client.query('COMMIT');
          console.log(`Rollback of ${migration.name} completed successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Rollback of ${migration.name} failed:`, error);
          throw error;
        } finally {
          client.release();
        }
      } else {
        console.warn(`No rollback file found for ${migration.name}`);
      }
    }
  }

  async status() {
    await this.initialize();
    
    const executedMigrations = await this.getMigrations();
    const migrationFiles = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql') && !file.endsWith('.down.sql'))
      .sort();

    console.log('Migration Status:');
    console.log('=================');
    
    for (const file of migrationFiles) {
      const executed = executedMigrations.find(m => m.name === file);
      if (executed) {
        console.log(`✓ ${file} (executed at: ${executed.executed_at})`);
      } else {
        console.log(`✗ ${file} (pending)`);
      }
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const migration = new DatabaseMigration();

  (async () => {
    try {
      switch (command) {
        case 'up':
          await migration.runMigrations();
          break;
        case 'down':
          const steps = parseInt(process.argv[3] || '1');
          await migration.rollback(steps);
          break;
        case 'status':
          await migration.status();
          break;
        default:
          console.log('Usage: ts-node db-migrate.ts [up|down|status] [steps]');
      }
    } catch (error) {
      console.error('Migration error:', error);
      process.exit(1);
    } finally {
      await pool.end();
    }
  })();
}