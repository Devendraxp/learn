import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const menu = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      )
    },
    {
      title: 'Educators',
      path: '/admin/educators',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      title: 'Students',
      path: '/admin/students',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        </svg>
      )
    },
    {
      title: 'Courses',
      path: '/admin/courses',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3 7h7l-5.5 4.5L20 21l-8-5-8 5 2.5-7.5L1 9h7l3-7z" />
        </svg>
      )
    },
    {
      title: 'Applications',
      path: '/admin/applications',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v10l8-5-8-5z" />
        </svg>
      )
    },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-gray-200 border-r border-gray-700/50">
      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Admin</h3>
        <nav className="space-y-2">
          {menu.map((m) => (
            <NavLink
              key={m.path}
              to={m.path}
              className={({ isActive }) => `flex items-center px-3 py-2 rounded-md ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`}>
              <span className="mr-3 text-sm opacity-80">{m.icon}</span>
              <span className="font-medium text-sm">{m.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
