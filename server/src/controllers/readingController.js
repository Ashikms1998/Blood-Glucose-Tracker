import pool from '../config/db.js';
import { VALID_SLOTS, formatDuplicateSlotMessage } from '../constants/slots.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const getTodayDateString = () =>{
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isValidCalendarDate = (dateStr) => {
  if (!DATE_REGEX.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
};


const validateReadingInput = ({ reading_date, slot, value }) => {
  if (!reading_date || !isValidCalendarDate(reading_date)) {
    return 'Please enter a valid date (YYYY-MM-DD).';
  }

  if (reading_date > getTodayDateString()) {
    return 'Date cannot be in the future.';
  }

  if (!slot || !VALID_SLOTS.includes(slot)) {
    return 'Please select a valid time slot.';
  }

  if (value === undefined || value === null || String(value).trim() === '') {
    return 'Please enter a glucose value.';
  }

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < 40 || numericValue > 600) {
    return 'Value must be between 40 and 600 mg/dl.';
  }

  return null;
};


// GET /api/readings only if have date=YYYY-MM-DD

export const getReadings = async (req, res, next) => {
  try {
    const { date } = req.query;
    const params = [req.user.id];
    let whereClause = 'WHERE user_id = $1';

    if (date) {
      if (!isValidCalendarDate(date)) {
        return res.status(400).json({ message: 'Invalid date filter.' });
      }
      params.push(date);
      whereClause += ' AND reading_date = $2';
    }

    const result = await pool.query(
      `SELECT id, reading_date, slot, value, created_at, updated_at
       FROM readings
       ${whereClause}
       ORDER BY reading_date DESC,
         CASE slot
           WHEN 'morning_fasting' THEN 1
           WHEN 'after_breakfast' THEN 2
           WHEN 'after_lunch' THEN 3
           WHEN 'after_dinner' THEN 4
         END ASC`,
      params
    );

    res.json({ readings: result.rows });
  } catch (err) {
    next(err);
  }
};


// POST /api/readings

export const createReading = async (req, res, next) => {
  try {
    const { reading_date, slot, value } = req.body;

    const validationError = validateReadingInput({ reading_date, slot, value });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingResult = await pool.query(
      'SELECT id, slot FROM readings WHERE user_id = $1 AND reading_date = $2',
      [req.user.id, reading_date]
    );

    if (existingResult.rows.length >= 4) {
      return res.status(400).json({ message: 'You can add only 4 readings per day.' });
    }

    if (existingResult.rows.some((row) => row.slot === slot)) {
      return res.status(400).json({ message: formatDuplicateSlotMessage(slot) });
    }

    const result = await pool.query(
      `INSERT INTO readings (user_id, reading_date, slot, value)
       VALUES ($1, $2, $3, $4)
       RETURNING id, reading_date, slot, value, created_at, updated_at`,
      [req.user.id, reading_date, slot, Number(value)]
    );

    res.status(201).json({ reading: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: formatDuplicateSlotMessage(req.body.slot) });
    }
    next(err);
  }
};

// PUT /api/readings/:id
export const updateReading = async (req, res, next) => {
  try {
    const readingId = Number(req.params.id);
    if (!Number.isInteger(readingId) || readingId <= 0) {
      return res.status(400).json({ message: 'Invalid reading ID.' });
    }

    const existingOwned = await pool.query(
      'SELECT id FROM readings WHERE id = $1 AND user_id = $2',
      [readingId, req.user.id]
    );

    if (existingOwned.rows.length === 0) {
      return res.status(404).json({ message: 'Reading not found.' });
    }

    const { reading_date, slot, value } = req.body;
    const validationError = validateReadingInput({ reading_date, slot, value });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const sameDayOthers = await pool.query(
      'SELECT id, slot FROM readings WHERE user_id = $1 AND reading_date = $2 AND id != $3',
      [req.user.id, reading_date, readingId]
    );

    if (sameDayOthers.rows.length >= 4) {
      return res.status(400).json({ message: 'You can add only 4 readings per day.' });
    }

    if (sameDayOthers.rows.some((row) => row.slot === slot)) {
      return res.status(400).json({ message: formatDuplicateSlotMessage(slot) });
    }

    const result = await pool.query(
      `UPDATE readings
       SET reading_date = $1,
           slot = $2,
           value = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING id, reading_date, slot, value, created_at, updated_at`,
      [reading_date, slot, Number(value), readingId, req.user.id]
    );

    res.json({ reading: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: formatDuplicateSlotMessage(req.body.slot) });
    }
    next(err);
  }
};

// DELETE /api/readings/:id
export const deleteReading = async (req, res, next) => {
  try {
    const readingId = Number(req.params.id);
    if (!Number.isInteger(readingId) || readingId <= 0) {
      return res.status(400).json({ message: 'Invalid reading ID.' });
    }

    const result = await pool.query(
      'DELETE FROM readings WHERE id = $1 AND user_id = $2 RETURNING id',
      [readingId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reading not found.' });
    }

    res.json({ message: 'Reading deleted.' });
  } catch (err) {
    next(err);
  }
};
