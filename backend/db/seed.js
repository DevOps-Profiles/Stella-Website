const fs = require('fs');
const path = require('path');
const db = require('./index');
require('dotenv').config();

async function seed() {
  try {
    console.log('Starting database seeding...');

    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await db.query(schemaSql);
    console.log('Schema initialized.');

    const seedSql = fs.readFileSync(path.join(__dirname, 'complete-seed.sql'), 'utf8');
    await db.query(seedSql);
    console.log('Dummy data seeded from complete-seed.sql.');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
