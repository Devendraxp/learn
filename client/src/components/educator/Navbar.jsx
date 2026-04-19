import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { useUser } from '@clerk/clerk-react';

const Navbar = ({ toggleSidebar }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // get current user info from context / Clerk
  const { userData } = useContext(AppContext);
  const { user, isLoaded } = useUser();

  const displayName = userData?.name || user?.fullName || user?.firstName || 'John Smith';
  const displayEmail = userData?.email || (user && user.emailAddresses && user.emailAddresses[0]?.emailAddress) || '';
  const displayImage = userData?.imageUrl || user?.imageUrl || user?.profileImageUrl || assets.profile_img_2;

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
    setNotificationsOpen(false);
  };

  // Dummy notifications
  const notifications = [
    {
      id: 1,
      message: "New student enrolled in 'JavaScript Basics'",
      time: "5 mins ago",
      read: false,
    },
    {
      id: 2,
      message: "Your course 'Web Development' received a new review",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 3,
      message: "Your payout of $250.00 has been processed",
      time: "Yesterday",
      read: true,
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-white via-blue-50/30 to-white border-b border-gray-200/50 px-4 py-3 shadow-lg backdrop-blur-sm z-10">
      <div className="flex justify-between items-center">
        {/* Left side: toggle button, logo and search */}
        <div className="flex items-center">
          {/* Toggle sidebar button */}
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none mr-4 p-2 rounded-lg transition-all duration-200 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* App Logo */}
          <Link to="/educator" className="mr-6 group" title="Go to Main Dashboard">
            <img 
              src={assets.logo} 
              alt="LMS Logo" 
              className="h-8 w-auto cursor-pointer group-hover:scale-105 transition-all duration-200 filter group-hover:brightness-110"
            />
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex items-center">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search courses, students..."
                className="bg-gray-50/80 border border-gray-200 text-gray-700 text-sm rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white w-72 lg:w-80 transition-all duration-200 shadow-sm hover:shadow-md"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile search button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right side: notifications and profile */}
        <div className="flex items-center space-x-3">
          {/* Notifications dropdown */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none relative p-2 rounded-xl transition-all duration-200 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-sm">
                <span className="absolute inset-0 h-3 w-3 bg-red-400 rounded-full animate-ping"></span>
              </span>
            </button>

            {/* Notifications dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-80 max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 z-10 transform transition-all duration-200 animate-in slide-in-from-top-2">
                <div className="py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="px-4 flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-800">Notifications</span>
                    <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors">
                      Mark all as read
                    </span>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 cursor-pointer ${
                        !notification.read ? "bg-gradient-to-r from-blue-50/50 to-transparent" : ""
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                            !notification.read 
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${!notification.read ? "font-medium text-gray-800" : "text-gray-600"}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 font-medium">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="py-3 text-center border-t border-gray-100 bg-gray-50/50">
                  <Link to="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={toggleProfile}
              className="flex items-center space-x-3 focus:outline-none hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 px-3 py-2 rounded-xl transition-all duration-200 group"
            >
              <div className="relative">
                <img
                  src={displayImage}
                  alt="User profile"
                  className="h-9 w-9 rounded-xl object-cover ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200 shadow-sm"
                />
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{displayName}</p>
                <p className="text-xs text-gray-500 font-medium">{(user && user.publicMetadata && user.publicMetadata.role) || (userData && userData.role) || 'Educator'}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-all duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 transform transition-all duration-200 animate-in slide-in-from-top-2">
                <div className="py-3 px-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center space-x-3">
                        <img
                          src={displayImage}
                          alt="User profile"
                          className="h-10 w-10 rounded-xl object-cover ring-2 ring-blue-200"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                          <p className="text-xs text-gray-600">{displayEmail}</p>
                        </div>
                  </div>
                </div>
                <div className="py-2">
                  <Link to="/" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent hover:text-green-700 transition-all duration-200 group">
                    <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Main Dashboard
                  </Link>
                  <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent hover:text-blue-700 transition-all duration-200 group">
                    <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Profile
                  </Link>
                  <Link to="/settings" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent hover:text-blue-700 transition-all duration-200 group">
                    <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <Link to="/help" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent hover:text-blue-700 transition-all duration-200 group">
                    <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help Center
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link to="/logout" className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-all duration-200 group">
                    <svg className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
