const db = require('./connection');

async function testEvent() {
  try {
    await db.initialize();
    
    // Creating a mock user
    let userResult = await db.execute(`
      INSERT INTO users (username, email, password_hash)
      VALUES ('scheduler_test_user', 'scheduler_test@ethereal.email', 'testpass')
      RETURNING user_id INTO :userId
    `, { userId: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER } });
    
    const userId = userResult.outBinds.userId[0];

    // Creating a mock calendar
    let calResult = await db.execute(`
      INSERT INTO calendars (user_id, calendar_name)
      VALUES (:userId, 'Test Calendar')
      RETURNING calendar_id INTO :calId
    `, { 
      userId,
      calId: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER }
     });
    
    const calId = calResult.outBinds.calId[0];

    // Creating mock event in 10 minutes (between 0 and 15 mins)
    let eventResult = await db.execute(`
      INSERT INTO events (calendar_id, title, description, location, start_time, end_time, created_by, status, is_all_day)
      VALUES (:calId, 'Mock Test Event', 'Event to test emails', 'Virtual', CURRENT_TIMESTAMP + INTERVAL '10' MINUTE, CURRENT_TIMESTAMP + INTERVAL '1' HOUR, :userId, 'active', 0)
      RETURNING event_id INTO :eventId
    `, { 
      calId, 
      userId,
      eventId: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER }
    });
    const eventId = eventResult.outBinds.eventId[0];
    
    console.log('✅ Created mock event with ID:', eventId);
    console.log('User used:', userId, 'Calendar:', calId);

    console.log('Wait 1 minute. Our cron job should pick it up and send an email to scheduler_test@ethereal.email.');
    
  } catch (e) {
    if (e.message.includes('unique constraint')) {
       console.log('Test user already exists, running it might require deleting test user earlier.');
    } else {
       console.error(e);
    }
  } finally {
    await db.close();
  }
}

testEvent();
