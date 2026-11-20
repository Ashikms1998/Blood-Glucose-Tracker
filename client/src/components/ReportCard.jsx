const formatShortDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
};

export default function ReportCard({ title, report }) {
  const dateRangeText =
    report.startDate === report.endDate
      ? formatShortDate(report.startDate)
      : `${formatShortDate(report.startDate)} – ${formatShortDate(report.endDate)}`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{dateRangeText}</p>
      </div>

      {report.count === 0 ? (
        <div className="py-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-sm font-medium text-slate-500">No readings found</p>
          <p className="text-xs text-slate-400 mt-1">
            Nothing logged in this period yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Average</p>
            <p className="text-xl font-bold text-teal-600 mt-0.5">
              {Number(report.average).toFixed(1)}
              <span className="text-xs font-normal text-slate-500 ml-1">mg/dl</span>
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Readings</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{report.count}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Highest</p>
            <p className="text-lg font-semibold text-rose-600 mt-0.5">
              {report.highest} <span className="text-xs font-normal text-slate-500">mg/dl</span>
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Lowest</p>
            <p className="text-lg font-semibold text-emerald-600 mt-0.5">
              {report.lowest} <span className="text-xs font-normal text-slate-500">mg/dl</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}