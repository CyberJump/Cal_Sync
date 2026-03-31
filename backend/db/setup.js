/**
 * Database Setup Script
 * Runs SQL schema files, views, functions, procedures, and triggers.
 * Usage: node db/setup.js
 */
const fs = require('fs');
const path = require('path');
const db = require('./connection');

const SCHEMA_DIR = path.join(__dirname, 'schema');

// SQL files in order
const SQL_FILES = [
  '01_create_tables.sql',
  '02_constraints.sql',
  '03_indexes.sql',
  '04_seed_data.sql',
];

// PL/SQL files (views, functions, procedures, triggers) — use / as delimiter
const PLSQL_FILES = [
  { dir: 'views', file: 'event_summary_view.sql' },
  { dir: 'functions', file: 'count_user_events.sql' },
  { dir: 'procedures', file: 'add_event.sql' },
  { dir: 'procedures', file: 'add_participant.sql' },
  { dir: 'procedures', file: 'audit_trigger.sql' },
];

function splitStatements(sql) {
  // Remove block comments
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove line comments
  sql = sql.replace(/--.*$/gm, '');
  // Split on semicolons and filter empty
  return sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function splitPlsqlBlocks(sql) {
  // Remove block comments
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove line comments (but not inside strings)
  sql = sql.replace(/--.*$/gm, '');
  // Split on / at start of line (PL/SQL block terminator)
  return sql
    .split(/\n\/\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function runFile(filename) {
  const filePath = path.join(SCHEMA_DIR, filename);
  console.log(`\n📄 Running ${filename}...`);

  const sql = fs.readFileSync(filePath, 'utf-8');
  const statements = splitStatements(sql);

  let success = 0;
  let skipped = 0;

  for (const stmt of statements) {
    try {
      await db.execute(stmt);
      success++;
      const preview = stmt.replace(/\s+/g, ' ').substring(0, 60);
      console.log(`   ✅ ${preview}...`);
    } catch (err) {
      const ignorable = ['ORA-00955', 'ORA-02261', 'ORA-01430', 'ORA-02275', 'ORA-00001', 'ORA-01408'];
      const isIgnorable = ignorable.some((code) => err.message.includes(code));
      if (isIgnorable) {
        skipped++;
        const preview = stmt.replace(/\s+/g, ' ').substring(0, 60);
        console.log(`   ⏭️  Skipped (already exists): ${preview}...`);
      } else {
        const preview = stmt.replace(/\s+/g, ' ').substring(0, 80);
        console.error(`   ❌ FAILED: ${preview}...`);
        console.error(`      Error: ${err.message}`);
      }
    }
  }

  console.log(`   📊 ${success} succeeded, ${skipped} skipped`);
}

async function runPlsqlFile(dir, filename) {
  const filePath = path.join(__dirname, dir, filename);
  console.log(`\n📄 Running ${dir}/${filename}...`);

  const sql = fs.readFileSync(filePath, 'utf-8');
  const blocks = splitPlsqlBlocks(sql);

  for (const block of blocks) {
    try {
      await db.execute(block);
      const preview = block.replace(/\s+/g, ' ').substring(0, 60);
      console.log(`   ✅ ${preview}...`);
    } catch (err) {
      const preview = block.replace(/\s+/g, ' ').substring(0, 80);
      console.error(`   ❌ FAILED: ${preview}...`);
      console.error(`      Error: ${err.message}`);
    }
  }
}

async function setup() {
  try {
    console.log('🔧 Starting database setup...\n');
    await db.initialize();

    // 1. Run schema SQL files
    for (const file of SQL_FILES) {
      await runFile(file);
    }

    // 2. Run PL/SQL files (views, functions, procedures, triggers)
    console.log('\n📦 Creating views, functions, procedures, and triggers...');
    for (const { dir, file } of PLSQL_FILES) {
      await runPlsqlFile(dir, file);
    }

    console.log('\n✅ Database setup complete!');
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
  } finally {
    await db.close();
    process.exit(0);
  }
}

setup();
