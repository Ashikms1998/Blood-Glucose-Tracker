import { useEffect, useState } from 'react';
import { READING_SLOTS, getTodayDateString } from '../constants/slots';

export default function ReadingForm({ initialReading, onSubmit, onCancel }) {
  const isEditing = Boolean(initialReading);

  const [readingDate, setReadingDate] = useState(getTodayDateString());
  const [slot, setSlot] = useState('morning_fasting');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialReading) {
      setReadingDate(initialReading.reading_date);
      setSlot(initialReading.slot);
      setValue(String(initialReading.value));
      setError('');
    } else {
      setReadingDate(getTodayDateString());
      setSlot('morning_fasting');
      setValue('');
      setError('');
    }
  }, [initialReading]);

  const validateClient = () => {
    if (!readingDate) {
      return 'Please select a date.';
    }
    if (readingDate > getTodayDateString()) {
      return 'Date cannot be in the future.';
    }
    if (value.trim() === '') {
      return 'Please enter a glucose value.';
    }
    const num = Number(value);
    if (!Number.isInteger(num) || num < 40 || num > 600) {
      return 'Value must be between 40 and 600 mg/dl.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const clientError = validateClient();
    if (clientError) {
      setError(clientError);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        reading_date: readingDate,
        slot,
        value: Number(value),
      });
      if (!isEditing) {
        setValue('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {isEditing ? 'Edit Reading' : 'Add Glucose Reading'}
      </h2>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="reading_date" className="block text-sm font-medium text-slate-700 mb-1">
            Date
          </label>
          <input
            id="reading_date"
            type="date"
            value={readingDate}
            onChange={(e) => setReadingDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label htmlFor="slot" className="block text-sm font-medium text-slate-700 mb-1">
            Time Slot
          </label>
          <select
            id="slot"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {READING_SLOTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="value" className="block text-sm font-medium text-slate-700 mb-1">
            Glucose (mg/dl)
          </label>
          <input
            id="value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 115"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="sm:col-span-3 flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition cursor-pointer"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Reading' : 'Add Reading'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-sm transition cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}