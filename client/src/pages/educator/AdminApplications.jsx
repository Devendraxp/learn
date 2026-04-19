import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AdminApplications = () => {
  const { getToken } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendurl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get(`${backendurl}/api/admin/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) setApps(data.applications || []);
        else toast.error(data.message || 'Failed to load applications');
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || error.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDecision = async (id, decision) => {
    try {
      const token = await getToken();
      const url = `${backendurl}/api/admin/applications/${id}/${decision}`;
      const { data } = await axios.put(url, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setApps(prev => prev.map(a => a._id === id ? { ...a, status: decision === 'approve' ? 'approved' : 'rejected' } : a));
        toast.success(`Application ${decision === 'approve' ? 'approved' : 'rejected'}`);
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Action failed');
    }
  };

  if (loading) return <div className="p-6">Loading applications…</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Educator Applications</h2>
      {apps.length === 0 ? (
        <div className="text-gray-600">No pending applications.</div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app._id} className="bg-white rounded shadow p-4 flex justify-between items-center">
              <div>
                <div className="font-medium">{app.name || app.userId || 'Applicant'}</div>
                <div className="text-sm text-gray-500">{app.email || ''} • {new Date(app.createdAt).toLocaleString()}</div>
                <div className="text-sm text-gray-700 mt-2">{app.bio}</div>
              </div>
              <div className="space-x-2">
                <Link to={`/admin/applications/${app._id}`} className="bg-blue-600 text-white px-3 py-1 rounded">Review</Link>
                {app.status === 'pending' && (
                  <>
                    <button onClick={() => handleDecision(app._id, 'approve')} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                    <button onClick={() => handleDecision(app._id, 'reject')} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                  </>
                )}
                {app.status !== 'pending' && (
                  <span className="text-sm text-gray-600">{app.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
