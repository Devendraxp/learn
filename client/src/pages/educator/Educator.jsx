import React, { useState, useContext, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/educator/Navbar";
import Sidebar from "../../components/educator/Sidebar";
import Footer from "../../components/student/Footer";
import { AppContext } from "../../context/AppContext";
import { useUser } from "@clerk/clerk-react";
import Loading from "../../components/student/Loading";

const Educator = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState('checking'); // checking, pending, approved, rejected
  const { user, isLoaded } = useUser();
  const { updateRoleToEducator } = useContext(AppContext);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Proper authentication check
  const isEducator = user?.publicMetadata?.role === 'educator';
  const location = useLocation();
  // Routes that should be accessible inside the educator layout even when user is not yet an approved educator
  const publicEducatorRoutes = ['/educator/apply', '/educator/my-applications'];
  const isPublicEducatorRoute = publicEducatorRoutes.some(p => location.pathname.startsWith(p));
  
  useEffect(() => {
    if (isLoaded && user) {
      if (isEducator) {
        setApplicationStatus('approved');
      } else {
        setApplicationStatus('pending');
      }
    }
  }, [isLoaded, user, isEducator]);

  useEffect(() => {
    if (isLoaded && user && user?.publicMetadata?.role === 'admin') {
      navigate('/admin');
    }
  }, [isLoaded, user, navigate]);

  const handleApplyForEducator = async () => {
    navigate('/educator/apply');
  };


  if (!isLoaded || applicationStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

 
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-6">Please sign in to access the educator dashboard.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

   if (applicationStatus === 'pending' && !isPublicEducatorRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Become an Educator</h3>
            <p className="text-gray-600 mb-6">
              To access the educator dashboard and create courses, you need to apply for educator privileges.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleApplyForEducator}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Apply for Educator Role
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Application rejected
  if (applicationStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Application Failed</h3>
            <p className="text-gray-600 mb-6">
              There was an error processing your educator application. Please try again later.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleApplyForEducator}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Approved educator - render the dashboard
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block transition-all duration-300`}>
          <Sidebar />
        </div>
        
        <main className="flex-1 overflow-y-auto">
          <div className="py-2">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Footer spans full width, overlapping sidebar */}
      <Footer />
    </div>
  );
};

export default Educator;
