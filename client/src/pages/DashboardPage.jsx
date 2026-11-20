import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import ReadingForm from '../components/ReadingForm';
import ReadingsList from '../components/ReadingsList';
import Navbar from '../components/Navbar';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReading, setEditingReading] = useState(null);
  const [filterDate, setFilterDate] = useState('');

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = filterDate ? `?date=${filterDate}` : '';
      const { data } = await api.get(`/readings${query}`);
      setReadings(data.readings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const handleSaveReading = async (payload) => {
    if (editingReading) {
      await api.put(`/readings/${editingReading.id}`, payload);
      setEditingReading(null);
    } else {
      await api.post('/readings', payload);
    }
    await fetchReadings();
  };

  const handleDeleteReading = async (id) => {
    if (!window.confirm('Delete this reading?')) return;
    try {
      await api.delete(`/readings/${id}`);
      if (editingReading?.id === id) {
        setEditingReading(null);
      }
      await fetchReadings();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <ReadingForm
          initialReading={editingReading}
          onSubmit={handleSaveReading}
          onCancel={() => setEditingReading(null)}
        />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="filter_date" className="text-sm text-slate-600 font-medium">
              Filter by date:
            </label>
            <input
              id="filter_date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-xs text-teal-600 hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <ReadingsList
          readings={readings}
          loading={loading}
          onEdit={(reading) => setEditingReading(reading)}
          onDelete={handleDeleteReading}
        />
      </main>
    </div>
  );
}