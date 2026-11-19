import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState('Checking API...');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(`API & DB connected (${data.status})`))
      .catch(() => setStatus('Failed to connect to API'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white shadow rounded-xl p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-teal-600 mb-2">Sweety</h1>
        <p className="text-slate-600 text-sm">{status}</p>
      </div>
    </div>
  );
}

export default App;