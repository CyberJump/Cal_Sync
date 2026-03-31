// Auth-related SQL queries

const FIND_USER_BY_EMAIL = `
  SELECT user_id, username, email, password_hash, created_at
  FROM users
  WHERE email = :email
`;

const FIND_USER_BY_ID = `
  SELECT user_id, username, email, created_at
  FROM users
  WHERE user_id = :userId
`;

const INSERT_USER = `
  INSERT INTO users (username, email, password_hash)
  VALUES (:username, :email, :passwordHash)
  RETURNING user_id INTO :userId
`;

const CHECK_EMAIL_EXISTS = `
  SELECT COUNT(*) AS cnt
  FROM users
  WHERE email = :email
`;

module.exports = {
  FIND_USER_BY_EMAIL,
  FIND_USER_BY_ID,
  INSERT_USER,
  CHECK_EMAIL_EXISTS,
};
