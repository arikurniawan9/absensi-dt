// components/layout/AdminLayout.js
import { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ title, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader title={title} toggleSidebar={toggleSidebar} />
      
      <div className="flex">
        {/* Sidebar for mobile */}
        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-200 ease-in-out`}>
          <AdminSidebar toggleSidebar={toggleSidebar} />
        </div>

        {/* Main content */}
        <main className={`flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}