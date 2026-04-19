import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const AdminDashboard = () => {
  const { getToken } = useAuth();
  const [stats, setStats] = useState({ totalEducators: 0, totalStudents: 0, totalCourses: 0, pendingApplications: 0 });
  const [loading, setLoading] = useState(true);
  const backendurl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const { data } = await axios.get(`${backendurl}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
        if (data.success && data.stats) setStats(data.stats);
      } catch (err) {
        console.warn('Failed to load admin stats', err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Total Educators</div>
          <div className="text-2xl font-bold mt-2">{loading ? '…' : stats.totalEducators}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Total Students</div>
          <div className="text-2xl font-bold mt-2">{loading ? '…' : stats.totalStudents}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Total Courses</div>
          <div className="text-2xl font-bold mt-2">{loading ? '…' : stats.totalCourses}</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="bg-white p-4 rounded shadow max-w-sm">
          <div className="text-sm text-gray-600">Pending Applications</div>
          <div className="text-xl font-bold mt-2">{loading ? '…' : stats.pendingApplications}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
