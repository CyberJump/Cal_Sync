require('dotenv').config();
const db = require('./connection');
const fs = require('fs');

async function migrate() {
  try {
    await db.initialize();
    
    const result = await db.execute('ALTER TABLE events ADD reminder_sent NUMBER(1) DEFAULT 0');
    fs.writeFileSync('mig_res.txt', 'Success');
  } catch (error) {
    if (error.message.includes('ORA-01430')) {
      fs.writeFileSync('mig_res.txt', 'Already exists');
    } else {
      fs.writeFileSync('mig_res.txt', error.toString() + ' ' + error.message);
    }
  } finally {
    await db.close();
    process.exit(0);
  }
}

migrate();
