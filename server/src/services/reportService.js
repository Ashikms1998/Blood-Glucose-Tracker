import pool from '../config/db.js';
import { getReportDateRanges } from '../utils/dateUtils.js';

const getSummaryForRange = async (userId, startDate, endDate) => {
  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS count,
       MAX(value)::int AS highest,
       MIN(value)::int AS lowest,
       ROUND(AVG(value), 1)::float AS average
     FROM readings
     WHERE user_id = $1
       AND reading_date BETWEEN $2 AND $3`,
    [userId, startDate, endDate]
  );

  const row = result.rows[0];
  return {
    startDate,
    endDate,
    count: row.count,
    highest: row.highest,
    lowest: row.lowest,
    average: row.average,
  };
};

const getDailyReadingsList = async (userId, date) => {
  const result = await pool.query(
    `SELECT id, reading_date, slot, value
     FROM readings
     WHERE user_id = $1
       AND reading_date = $2
     ORDER BY CASE slot
       WHEN 'morning_fasting' THEN 1
       WHEN 'after_breakfast' THEN 2
       WHEN 'after_lunch' THEN 3
       WHEN 'after_dinner' THEN 4
     END ASC`,
    [userId, date]
  );

  return result.rows;
};

export const generateUserReports = async (userId, selectedDate) => {
  const ranges = getReportDateRanges(selectedDate);

  const [dailySummary, dailyReadings, monthToDateSummary, monthlySummary] =
    await Promise.all([
      getSummaryForRange(userId, ranges.daily.startDate, ranges.daily.endDate),
      getDailyReadingsList(userId, selectedDate),
      getSummaryForRange(
        userId,
        ranges.monthToDate.startDate,
        ranges.monthToDate.endDate
      ),
      getSummaryForRange(
        userId,
        ranges.monthly.startDate,
        ranges.monthly.endDate
      ),
    ]);

  return {
    selectedDate,
    daily: {
      ...dailySummary,
      readings: dailyReadings,
    },
    monthToDate: monthToDateSummary,
    monthly: monthlySummary,
  };
};