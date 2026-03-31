const oracledb = require('oracledb');
require('dotenv').config();

// Use Thin mode (no Oracle Client needed for Node.js oracledb 6+)
// If you have Oracle Instant Client installed, you can switch to Thick mode

let pool;

async function initialize() {
  try {
    pool = await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log('✅ Oracle connection pool created successfully');
  } catch (err) {
    console.error('❌ Failed to create Oracle connection pool:', err.message);
    throw err;
  }
}

async function getConnection() {
  if (!pool) {
    throw new Error('Connection pool not initialized. Call initialize() first.');
  }
  return await pool.getConnection();
}

async function close() {
  if (pool) {
    await pool.close(0);
    console.log('Oracle connection pool closed');
  }
}

// Helper: execute a query and return result
async function execute(sql, binds = {}, options = {}) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options,
    });
    return result;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Helper: execute a PL/SQL procedure
async function executeProcedure(sql, binds = {}) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, binds, {
      autoCommit: true,
    });
    return result;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = {
  initialize,
  getConnection,
  close,
  execute,
  executeProcedure,
  oracledb,
};
