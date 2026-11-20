import { useEffect, useState } from 'react';
import api from '../api/client';
import Navbar from '../components/Navbar';
import ReportCard from '../components/ReportCard';
import { SLOT_LABELS, getTodayDateString } from '../constants/slots';

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');

    api
      .get(`/reports?date=${selectedDate}`)
      .then(({ data }) => {
        if (!ignore) setReports(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Glucose Reports</h1>
            <p className="text-sm text-slate-500">
              View daily, month-to-date, and previous month summaries
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="report_date" className="text-sm font-medium text-slate-700">
              Selected Date:
            </label>
            <input
              id="report_date"
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading || !reports ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
            Loading reports...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <ReportCard title="Daily Report" report={reports.daily} />
              <ReportCard title="Month-to-Date" report={reports.monthToDate} />
              <ReportCard title="Previous Month" report={reports.monthly} />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-800">
                  Daily Readings Breakdown ({reports.selectedDate})
                </h2>
              </div>

              {reports.daily.readings.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    No readings recorded on {reports.selectedDate}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Select another date above or add a reading on the Readings page.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {reports.daily.readings.map((reading) => (
                    <li
                      key={reading.id}
                      className="px-6 py-3 flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-700 font-medium">
                        {SLOT_LABELS[reading.slot] || reading.slot}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {reading.value}{' '}
                        <span className="text-xs font-normal text-slate-500">mg/dl</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}