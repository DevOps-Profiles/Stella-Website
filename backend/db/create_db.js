require('dotenv').config();
const mysql = require('mysql2/promise');

async function getAdminConnection() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    const database = url.pathname.replace(/^\//, '');
    url.pathname = '/';
    return {
      connection: await mysql.createConnection({
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        multipleStatements: true,
      }),
      database,
    };
  }

  return {
    connection: await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    }),
    database: process.env.DB_NAME || 'stella_mobiles',
  };
}

async function createDb() {
  const { connection, database } = await getAdminConnection();

  try {
    console.log('Connected to MariaDB...');
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`Database "${database}" is ready.`);
  } catch (err) {
    console.error('Failed to create database:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createDb();
