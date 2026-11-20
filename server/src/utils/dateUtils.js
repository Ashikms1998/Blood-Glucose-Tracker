const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isValidCalendarDate = (dateStr) => {
  if (!DATE_REGEX.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
};

export const getReportDateRanges = (selectedDate) => {
  const [year, month] = selectedDate.split('-').map(Number);
  const pad = (n) => String(n).padStart(2, '0');

  // Month-to-date: 1st of selected month -> selectedDate
  const mtdStart = `${year}-${pad(month)}-01`;

  // Previous month: handle January (month === 1) rolling back to previous year Dec
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const lastDayOfPrevMonth = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate();

  const prevMonthStart = `${prevYear}-${pad(prevMonth)}-01`;
  const prevMonthEnd = `${prevYear}-${pad(prevMonth)}-${pad(lastDayOfPrevMonth)}`;

  return {
    daily: { startDate: selectedDate, endDate: selectedDate },
    monthToDate: { startDate: mtdStart, endDate: selectedDate },
    monthly: { startDate: prevMonthStart, endDate: prevMonthEnd },
  };
};