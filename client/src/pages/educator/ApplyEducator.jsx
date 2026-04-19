import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateApplyForm } from '../../utils/validation';

const ApplyEducator = () => {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const [bio, setBio] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [website, setWebsite] = useState('');
  const [sampleCourseLink, setSampleCourseLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const backendurl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [existingApp, setExistingApp] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    // Use central validator
    const { isValid, errors: validationErrors } = validateApplyForm({
      bio,
      website,
      sampleCourseLink,
      certifications: qualifications,
      // portfolio not passed directly; validator accepts website/sampleCourseLink too
    });

    if (!isValid) {
      setErrors(validationErrors);
      setSubmitting(false);
      return;
    }

    try {
      const token = await getToken();
      const payload = {
        bio,
        // server expects portfolio as array of objects { title, url, type }
        portfolio: website
          ? [{ title: '', url: String(website).trim(), type: 'website' }]
          : [],
        cvUrl: '',
        sampleLectureUrl: sampleCourseLink || '',
        certifications: qualifications ? [qualifications] : [],
        supportingMessage: ''
      };

      const { data } = await axios.post(`${backendurl}/api/user/applications`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
          setSuccessMessage("Application submitted — you'll be notified upon approval.");
        setBio('');
        setQualifications('');
        setWebsite('');
        setSampleCourseLink('');
      } else {
        setErrors({ general: data.message || 'Failed to submit application' });
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: error.response?.data?.message || error.message || 'Failed to submit application' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) return <div className="p-6">Loading user...</div>;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get(`${backendurl}/api/user/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!mounted) return;
        if (data.success && Array.isArray(data.applications) && data.applications.length > 0) {
          // find any application for this user that is pending/reviewing/approved
          const active = data.applications.find(app => ['pending', 'reviewing', 'approved'].includes(app.status));
          setExistingApp(active || null);
        } else {
          setExistingApp(null);
        }
      } catch (err) {
        console.error('Failed to load existing applications', err);
        setExistingApp(null);
      } finally {
        if (mounted) setLoadingApp(false);
      }
    };
    if (isLoaded) load();
    return () => { mounted = false };
  }, [isLoaded]);

  if (loadingApp) return <div className="p-6">Loading application status...</div>;

  if (existingApp && existingApp.status && existingApp.status !== 'rejected') {
    const statusLabel = existingApp.status === 'pending' ? 'Pending approval' : (existingApp.status === 'reviewing' ? 'Under review' : 'Approved');
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Educator application</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-yellow-800">You have an existing application ({statusLabel}). You'll be notified when it's reviewed.</p>
          <div className="mt-3">
            <button onClick={() => navigate('/educator/my-applications')} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">View application</button>
            <button onClick={() => navigate('/')} className="bg-gray-100 px-4 py-2 rounded">Back to Home</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Apply to Become an Educator</h2>
      <div className="bg-white rounded shadow p-6">
        {successMessage && <div className="mb-4 p-3 rounded bg-green-50 text-green-800">{successMessage}</div>}
        {errors.general && <div className="mb-4 p-3 rounded bg-red-50 text-red-800">{errors.general}</div>}
        <p className="text-sm text-gray-600 mb-4">We need some brief information to evaluate your educator application.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input readOnly value={user?.fullName || ''} className="mt-1 block w-full border rounded px-3 py-2 bg-gray-50" />
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              readOnly
              value={
                user?.primaryEmailAddress?.emailAddress ||
                user?.emailAddresses?.[0]?.emailAddress ||
                user?.email ||
                ''
              }
              className="mt-1 block w-full border rounded px-3 py-2 bg-gray-50"
            />
          </div>

          {errors.bio && <div className="text-sm text-red-600">{errors.bio}</div>}
          {errors.missingPortfolio && <div className="text-sm text-red-600">{errors.missingPortfolio}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Short bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="mt-1 block w-full border rounded px-3 py-2" placeholder="Tell us about your teaching experience, topics you teach, and why you want to join"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Qualifications / Certifications</label>
            <input value={qualifications} onChange={e => setQualifications(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" placeholder="List relevant degrees, certifications, or experience" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Website / Portfolio (optional)</label>
            <input value={website} onChange={e => setWebsite(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" placeholder="https://your-portfolio.example" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sample course or video link (optional)</label>
            <input value={sampleCourseLink} onChange={e => setSampleCourseLink(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" placeholder="Share a sample lecture or course link" />
          </div>

          <div className="flex items-center space-x-3">
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyEducator;
