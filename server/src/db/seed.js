import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const formatDate = (year, monthIndex, day) => {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

async function seed() {
  try {
    const demoEmail = 'demo@sweety.app';
    const demoPassword = 'password123';
    const passwordHash = await bcrypt.hash(demoPassword, 10);

    // Upsert demo user cleanly
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [demoEmail]);

    let userId;
    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      await pool.query('DELETE FROM readings WHERE user_id = $1', [userId]);
      console.log('Reset readings for existing demo user.');
    } else {
      const inserted = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['Demo Patient', demoEmail, passwordHash]
      );
      userId = inserted.rows[0].id;
      console.log('Created demo user.');
    }

    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth(); // 0-11
    const day = now.getDate();

    const sampleReadings = [];

    // 1. Today: 3 readings (leaves 1 slot open so you can test adding the 4th & 5th)
    const todayStr = formatDate(year, monthIndex, day);
    sampleReadings.push(
      [todayStr, 'morning_fasting', 98],
      [todayStr, 'after_breakfast', 142],
      [todayStr, 'after_lunch', 131]
    );

    // 2. Earlier days in current month (for Month-to-Date report)
    if (day > 1) {
      const day1 = formatDate(year, monthIndex, 1);
      sampleReadings.push(
        [day1, 'morning_fasting', 102],
        [day1, 'after_dinner', 155]
      );
    }
    if (day > 3) {
      const earlierDay = formatDate(year, monthIndex, day - 2);
      sampleReadings.push(
        [earlierDay, 'morning_fasting', 94],
        [earlierDay, 'after_breakfast', 136],
        [earlierDay, 'after_lunch', 148],
        [earlierDay, 'after_dinner', 129]
      );
    }

    // 3. Previous month readings (for Monthly report)
    const prevMonthDate = new Date(year, monthIndex - 1, 1);
    const prevY = prevMonthDate.getFullYear();
    const prevM = prevMonthDate.getMonth();

    sampleReadings.push(
      [formatDate(prevY, prevM, 3), 'morning_fasting', 105],
      [formatDate(prevY, prevM, 3), 'after_lunch', 160],
      [formatDate(prevY, prevM, 10), 'morning_fasting', 92],
      [formatDate(prevY, prevM, 10), 'after_breakfast', 140],
      [formatDate(prevY, prevM, 18), 'after_lunch', 172],
      [formatDate(prevY, prevM, 18), 'after_dinner', 138],
      [formatDate(prevY, prevM, 25), 'morning_fasting', 99],
      [formatDate(prevY, prevM, 25), 'after_dinner', 144]
    );

    for (const [readingDate, slot, value] of sampleReadings) {
      await pool.query(
        `INSERT INTO readings (user_id, reading_date, slot, value)
         VALUES ($1, $2, $3, $4)`,
        [userId, readingDate, slot, value]
      );
    }

    console.log(`Seeded ${sampleReadings.length} sample readings.`);
    console.log('Demo credentials -> Email: demo@sweety.app | Password: password123');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();