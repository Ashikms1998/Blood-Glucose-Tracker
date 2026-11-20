import { SLOT_LABELS } from '../constants/slots';

const getValueBadgeClass = (value) => {
  if (value < 70) return 'bg-amber-100 text-amber-800';
  if (value <= 140) return 'bg-emerald-100 text-emerald-800';
  if (value <= 199) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

export default function ReadingsList({ readings, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-500">
        Loading readings...
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <p className="text-slate-600 font-medium">No readings recorded yet</p>
        <p className="text-sm text-slate-400 mt-1">
          Use the form above to log your first blood glucose reading.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Recorded Readings</h2>
        <span className="text-xs text-slate-500">{readings.length} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Time Slot</th>
              <th className="px-6 py-3 font-medium">Reading</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {readings.map((reading) => (
              <tr key={reading.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 text-slate-700 font-medium">
                  {reading.reading_date}
                </td>
                <td className="px-6 py-3 text-slate-600">
                  {SLOT_LABELS[reading.slot] || reading.slot}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getValueBadgeClass(
                      reading.value
                    )}`}
                  >
                    {reading.value} mg/dl
                  </span>
                </td>
                <td className="px-6 py-3 text-right space-x-2">
                  <button
                    onClick={() => onEdit(reading)}
                    className="text-teal-600 hover:text-teal-800 font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(reading.id)}
                    className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}