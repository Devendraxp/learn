import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const AdminEducators = () => {
  const { getToken } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const backendurl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const { data } = await axios.get(`${backendurl}/api/admin/educators`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(data.educators || []);
      } catch (err) {
        console.warn('Failed to load educators', err?.response?.data || err.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = items.filter(i => (i.name || '').toLowerCase().includes(query.toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Educators</h2>
      <div className="mb-4">
        <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search educators..." className="border px-3 py-2 rounded w-full max-w-md" />
      </div>
      {loading ? (
        <div className="p-4">Loading...</div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(u => (
                <tr key={u._id || u.id} className="border-t">
                  <td className="p-3">{u.name || u.firstName || '—'}</td>
                  <td className="p-3">{u.email || u.emailAddress || '—'}</td>
                  <td className="p-3">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">{filtered.length} educators</div>
            <div className="space-x-2">
              <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
              <span className="px-2">{page}/{pages}</span>
              <button disabled={page>=pages} onClick={() => setPage(p => Math.min(pages, p+1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEducators;
