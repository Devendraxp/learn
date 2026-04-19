import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const MyApplications = () => {
  const { getToken } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendurl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get(`${backendurl}/api/user/applications`, {
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

  if (loading) return <div className="p-6">Loading applications…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">My Educator Applications</h2>
      {apps.length === 0 ? (
        <div className="text-gray-600">You haven't submitted any applications yet.</div>
      ) : (
        <div className="space-y-4">
          {apps.map(app => (
            <div key={app._id} className="bg-white rounded shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{app.snapshot?.name || 'Applicant'}</h3>
                  <p className="text-sm text-gray-500">Submitted on: {new Date(app.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs ${app.status === 'approved' ? 'bg-green-100 text-green-800' : app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {app.status}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700">{app.bio}</p>
              <div className="mt-3">
                <Link to={`/admin/applications/${app._id}`} className="text-blue-600 text-sm">View details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
