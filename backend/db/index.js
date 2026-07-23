const mysql = require('mysql2/promise');
require('dotenv').config();

function getPoolConfig() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 30000, // 30 seconds idle timeout to close connections cleanly
      multipleStatements: true,
      dateStrings: false,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stella_mobiles',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 30000, // 30 seconds idle timeout
    multipleStatements: true,
    dateStrings: false,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  };
}

const pool = mysql.createPool(getPoolConfig());

// Handle connection-level error events to prevent fatal unhandled crashes
pool.on('connection', (connection) => {
  connection.on('error', (err) => {
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      // Quietly swallow normal connection drops from Hostinger MySQL idle terminations
      return;
    }
    console.error('MySQL Pool Connection socket error:', err);
  });
});

function toMysqlPlaceholders(sql) {
  return sql.replace(/\$(\d+)/g, '?');
}

function getTableName(sql) {
  const insertMatch = sql.match(/INSERT\s+INTO\s+`?(\w+)`?/i);
  if (insertMatch) return insertMatch[1];
  const updateMatch = sql.match(/UPDATE\s+`?(\w+)`?/i);
  if (updateMatch) return updateMatch[1];
  const deleteMatch = sql.match(/DELETE\s+FROM\s+`?(\w+)`?/i);
  if (deleteMatch) return deleteMatch[1];
  return null;
}

function getWhereIdParam(sql, params) {
  const match = sql.match(/WHERE\s+id\s*=\s*\?/i);
  if (!match) return null;
  const beforeWhere = sql.slice(0, match.index);
  const questionMarks = (beforeWhere.match(/\?/g) || []).length;
  return params[questionMarks];
}

async function runQuery(executor, text, params = []) {
  let sql = toMysqlPlaceholders(text);
  const hasReturning = /\s+RETURNING\s+(\*|\w+)/i.test(sql);
  const returningStar = /\s+RETURNING\s+\*/i.test(sql);
  const returningId = /\s+RETURNING\s+id\b/i.test(sql);

  if (hasReturning) {
    sql = sql.replace(/\s+RETURNING\s+(\*|\w+)/i, '').trim();
  }

  const table = getTableName(sql);
  const isInsert = /^INSERT/i.test(sql);
  const isUpdate = /^UPDATE/i.test(sql);
  const isDelete = /^DELETE/i.test(sql);

  if (hasReturning && isDelete && table) {
    const idVal = getWhereIdParam(sql, params);
    const [existing] = await executor.query(`SELECT * FROM ${table} WHERE id = ?`, [idVal]);
    const [result] = await executor.query(sql, params);
    return { rows: existing, rowCount: result.affectedRows };
  }

  const [result] = await executor.query(sql, params);

  if (hasReturning && isInsert && table && result.insertId) {
    const [rows] = await executor.query(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);
    return { rows, rowCount: result.affectedRows, insertId: result.insertId };
  }

  if (hasReturning && isUpdate && table) {
    const idVal = getWhereIdParam(sql, params);
    if (returningId) {
      return {
        rows: result.affectedRows > 0 ? [{ id: idVal }] : [],
        rowCount: result.affectedRows,
      };
    }
    const [rows] = await executor.query(`SELECT * FROM ${table} WHERE id = ?`, [idVal]);
    return { rows, rowCount: result.affectedRows };
  }

  if (Array.isArray(result)) {
    return { rows: result, rowCount: result.length };
  }

  return { rows: [], rowCount: result.affectedRows ?? 0, insertId: result.insertId };
}

async function query(text, params) {
  return runQuery(pool, text, params);
}

async function connect() {
  const connection = await pool.getConnection();
  return {
    query: (text, params) => runQuery(connection, text, params),
    release: () => connection.release(),
  };
}

async function end() {
  await pool.end();
}

module.exports = {
  query,
  connect,
  pool: {
    connect,
    query,
    end,
  },
  end,
};
