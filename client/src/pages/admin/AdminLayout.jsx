import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Footer from '../../components/student/Footer';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      
    </div>
  );
};

export default AdminLayout;
