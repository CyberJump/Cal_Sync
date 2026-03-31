const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const queries = require('../db/queries/auth.queries');

async function register(username, email, password) {
  // Check if email already exists
  const existing = await db.execute(queries.CHECK_EMAIL_EXISTS, { email });
  if (existing.rows[0].CNT > 0) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Insert user
  const result = await db.execute(queries.INSERT_USER, {
    username,
    email,
    passwordHash,
    userId: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
  });

  const userId = result.outBinds.userId[0];

  // Create default calendar for new user
  const calQueries = require('../db/queries/calendar.queries');
  await db.execute(calQueries.INSERT_CALENDAR, {
    userId,
    calendarName: 'My Calendar',
    colorHex: '#3478F6',
    isDefault: 1,
    calendarId: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER },
  });

  return { userId, username, email };
}

async function login(email, password) {
  const result = await db.execute(queries.FIND_USER_BY_EMAIL, { email });

  if (result.rows.length === 0) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.PASSWORD_HASH);

  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign(
    { userId: user.USER_ID, email: user.EMAIL, username: user.USERNAME },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    token,
    user: {
      userId: user.USER_ID,
      username: user.USERNAME,
      email: user.EMAIL,
    },
  };
}

async function getProfile(userId) {
  const result = await db.execute(queries.FIND_USER_BY_ID, { userId });

  if (result.rows.length === 0) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
}

module.exports = { register, login, getProfile };
