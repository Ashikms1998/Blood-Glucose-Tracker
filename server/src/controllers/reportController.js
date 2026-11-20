import { generateUserReports } from '../services/reportService.js';
import { getTodayDateString, isValidCalendarDate } from '../utils/dateUtils.js';

export const getReports = async (req, res, next) => {
  try {
    const selectedDate = req.query.date || getTodayDateString();

    if (!isValidCalendarDate(selectedDate)) {
      return res.status(400).json({ message: 'Please provide a valid date (YYYY-MM-DD).' });
    }

    const report = await generateUserReports(req.user.id, selectedDate);
    res.json(report);
  } catch (err) {
    next(err);
  }
};