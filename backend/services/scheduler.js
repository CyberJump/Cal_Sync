const cron = require('node-cron');
const db = require('../db/connection');
const { GET_EVENTS_FOR_REMINDER, MARK_REMINDER_SENT } = require('../db/queries/event.queries');
const { GET_EMAILS_FOR_EVENT } = require('../db/queries/participant.queries');
const emailService = require('./email.service');

function startScheduler() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('[Scheduler] Checking for upcoming events...');
    try {
      // 1. Fetch events starting in the next 15 minutes that haven't sent a reminder
      const result = await db.execute(GET_EVENTS_FOR_REMINDER);
      const events = result.rows || [];

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        
        // 2. Fetch all unique emails for this event
        const emailsResult = await db.execute(GET_EMAILS_FOR_EVENT, { eventId: event.EVENT_ID });
        const attendees = emailsResult.rows || [];
        
        if (attendees.length > 0) {
          const emailList = attendees.map(a => a.EMAIL);
          
          // Construct email text
          const subject = `Reminder: ${event.TITLE} is starting soon!`;
          const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5ea; border-radius: 12px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #FF3B30; margin: 0; font-size: 24px;">CalSync</h1>
                <p style="color: #86868b; margin-top: 4px; font-size: 14px;">Event Reminder</p>
              </div>
              
              <h2 style="color: #1a1c1f; margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 600;">
                ${event.TITLE}
              </h2>
              
              <div style="background-color: #f9f9fe; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; color: #1a1c1f; font-size: 15px;">
                  <strong style="color: #FF3B30; display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">When</strong>
                  ${new Date(event.START_TIME).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
                
                ${event.LOCATION ? `
                <p style="margin: 0 0 12px 0; color: #1a1c1f; font-size: 15px;">
                  <strong style="color: #FF3B30; display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Where</strong>
                  ${event.LOCATION}
                </p>` : ''}
                
                ${event.DESCRIPTION ? `
                <p style="margin: 0; color: #1a1c1f; font-size: 15px;">
                  <strong style="color: #FF3B30; display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Details</strong>
                  ${event.DESCRIPTION.replace(/\n/g, '<br/>')}
                </p>` : ''}
              </div>
              
              <div style="text-align: center; margin-top: 32px;">
                <p style="color: #86868b; font-size: 13px; margin: 0;">
                  This is an automated reminder from CalSync.
                </p>
              </div>
            </div>
          `;

          // 3. Send out email
          const success = await emailService.sendEventReminder(emailList, subject, htmlContent);
          
          // 4. If successful, mark reminder as sent
          if (success) {
            await db.execute(MARK_REMINDER_SENT, { eventId: event.EVENT_ID });
            console.log(`[Scheduler] Reminder sent & marked for Event ID: ${event.EVENT_ID}`);
          }
        }
      }
    } catch (error) {
      console.error('[Scheduler] Error processing event reminders:', error.message);
    }
  });

  console.log('✅ Cron scheduler initialized for event reminders.');
}

module.exports = {
  startScheduler
};
