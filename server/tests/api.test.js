import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/config/db.js';

const uniqueSuffix = Date.now();
const userAEmail = `test_a_${uniqueSuffix}@sweety.test`;
const userBEmail = `test_b_${uniqueSuffix}@sweety.test`;

let tokenA = '';
let tokenB = '';
let readingIdA = null;

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const today = new Date();
const todayStr = formatDate(today);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = formatDate(tomorrow);

describe('Sweety API', () => {
  beforeAll(async () => {
    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'Test Patient A',
      email: userAEmail,
      password: 'password123',
    });
    expect(resA.status).toBe(201);
    tokenA = resA.body.token;

    // Register User B (to verify isolation)
    const resB = await request(app).post('/api/auth/register').send({
      name: 'Test Patient B',
      email: userBEmail,
      password: 'password123',
    });
    expect(resB.status).toBe(201);
    tokenB = resB.body.token;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [
      userAEmail,
      userBEmail,
    ]);
    await pool.end();
  });

  describe('Auth', () => {
    it('rejects duplicate email registration', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Duplicate',
        email: userAEmail,
        password: 'password123',
      });
      expect(res.status).toBe(409);
    });

    it('logs in with valid credentials and rejects wrong password', async () => {
      const okRes = await request(app).post('/api/auth/login').send({
        email: userAEmail,
        password: 'password123',
      });
      expect(okRes.status).toBe(200);
      expect(okRes.body.token).toBeTruthy();

      const badRes = await request(app).post('/api/auth/login').send({
        email: userAEmail,
        password: 'wrongpassword',
      });
      expect(badRes.status).toBe(401);
    });

    it('blocks unauthenticated access to protected routes', async () => {
      const res = await request(app).get('/api/readings');
      expect(res.status).toBe(401);
    });
  });

  describe('Readings Validation & CRUD', () => {
    it('requires a glucose value', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reading_date: todayStr, slot: 'morning_fasting', value: '' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Please enter a glucose value.');
    });

    it('rejects values outside 40-600 or non-integers', async () => {
      for (const badValue of [39, 601, 120.5]) {
        const res = await request(app)
          .post('/api/readings')
          .set('Authorization', `Bearer ${tokenA}`)
          .send({ reading_date: todayStr, slot: 'morning_fasting', value: badValue });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
      }
    });

    it('rejects future dates', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reading_date: tomorrowStr, slot: 'morning_fasting', value: 110 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Date cannot be in the future.');
    });

    it('creates reading, rejects duplicate slot, and enforces max 4 per day', async () => {
      // 1st slot
      const r1 = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reading_date: todayStr, slot: 'after_lunch', value: 150 });
      expect(r1.status).toBe(201);
      readingIdA = r1.body.reading.id;

      // Duplicate slot
      const dup = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reading_date: todayStr, slot: 'after_lunch', value: 140 });
      expect(dup.status).toBe(400);
      expect(dup.body.message).toBe(
        'You already have an After lunch reading for this date.'
      );

      // Remaining 3 slots
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reading_date: todayStr, slot: 'morning_fasting', value: 100 });

      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reading_date: todayStr, slot: 'after_breakfast', value: 126 });

      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reading_date: todayStr, slot: 'after_dinner', value: 140 });

      // 5th reading on same date
      const fifth = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reading_date: todayStr, slot: 'after_lunch', value: 130 });
      expect(fifth.status).toBe(400);
      expect(fifth.body.message).toBe('You can add only 4 readings per day.');
    });

    it('prevents another user from viewing, editing, or deleting User A readings', async () => {
      const listB = await request(app)
        .get('/api/readings')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(listB.status).toBe(200);
      expect(listB.body.readings).toHaveLength(0);

      const editB = await request(app)
        .put(`/api/readings/${readingIdA}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ reading_date: todayStr, slot: 'after_lunch', value: 120 });
      expect(editB.status).toBe(404);

      const deleteB = await request(app)
        .delete(`/api/readings/${readingIdA}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(deleteB.status).toBe(404);
    });
  });

  describe('Reports', () => {
    it('calculates daily highest, lowest, average (1 decimal), and count', async () => {
      const res = await request(app)
        .get(`/api/reports?date=${todayStr}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      // Values inserted for User A today: 150, 100, 126, 140 -> avg 129.0, max 150, min 100
      expect(res.body.daily.count).toBe(4);
      expect(res.body.daily.highest).toBe(150);
      expect(res.body.daily.lowest).toBe(100);
      expect(res.body.daily.average).toBe(129);
      expect(res.body.daily.readings).toHaveLength(4);
    });

    it('returns empty state metrics when no readings exist', async () => {
      const res = await request(app)
        .get(`/api/reports?date=${todayStr}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.daily.count).toBe(0);
      expect(res.body.daily.highest).toBeNull();
      expect(res.body.daily.lowest).toBeNull();
      expect(res.body.daily.average).toBeNull();
      expect(res.body.daily.readings).toEqual([]);
    });
  });
});