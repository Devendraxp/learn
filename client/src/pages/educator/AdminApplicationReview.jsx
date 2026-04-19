import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminApplicationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const backendurl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get(`${backendurl}/api/admin/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) setApp(data.application);
        else toast.error(data.message || 'Failed to load application');
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || error.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDecision = async (decision) => {
    setSubmitting(true);
    try {
      const token = await getToken();
      const url = `${backendurl}/api/admin/applications/${id}/${decision}`;
      const { data } = await axios.put(url, { adminNotes }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success(`Application ${decision}d`);
  navigate('/admin/applications');
      } else {
        toast.error(data.message || 'Failed to update application');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (!app) return <div className="p-6">Application not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Review Application</h2>
      <div className="bg-white rounded shadow p-6">
        <div className="mb-4">
          <div className="font-medium text-lg">{app.name || app.userId || 'Applicant'}</div>
          <div className="text-sm text-gray-500">{app.email || ''}</div>
          <div className="text-sm text-gray-500">Submitted: {new Date(app.createdAt).toLocaleString()}</div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium">Bio</h3>
          <p className="text-gray-700 mt-2">{app.bio}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-medium">Certifications</h3>
          <p className="text-gray-700 mt-2">{(app.certifications || []).join(', ') || '—'}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-medium">Portfolio / Links</h3>
          <div className="text-gray-700 mt-2 space-y-1">
            {(app.portfolio || []).length === 0 && (app.cvUrl || app.sampleLectureUrl) ? (
              <>
                {app.cvUrl && (<div><a href={app.cvUrl} target="_blank" rel="noreferrer" className="text-blue-600">CV</a></div>)}
                {app.sampleLectureUrl && (<div><a href={app.sampleLectureUrl} target="_blank" rel="noreferrer" className="text-blue-600">Sample Lecture</a></div>)}
              </>
            ) : (
              (app.portfolio || []).map((p, i) => (
                <div key={i}><a href={p.url} target="_blank" rel="noreferrer" className="text-blue-600">{p.title || p.url}</a></div>
              ))
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Admin notes (optional)</label>
          <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} className="mt-1 block w-full border rounded px-3 py-2" placeholder="Reason for approval or rejection"></textarea>
        </div>

        <div className="flex space-x-3">
          <button disabled={submitting} onClick={() => handleDecision('approve')} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">{submitting ? 'Working…' : 'Approve'}</button>
          <button disabled={submitting} onClick={() => handleDecision('reject')} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">{submitting ? 'Working…' : 'Reject'}</button>
          <button onClick={() => navigate(-1)} className="bg-gray-100 px-4 py-2 rounded">Back</button>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationReview;
