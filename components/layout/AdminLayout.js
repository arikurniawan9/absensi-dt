// components/layout/AdminLayout.js
import { useState, useEffect } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ title, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchPendingRequestsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPendingRequestsCount(data.totalPendingRequests);
      }
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
    }
  };

  useEffect(() => {
    fetchPendingRequestsCount(); // Fetch immediately on mount

    const interval = setInterval(() => {
      fetchPendingRequestsCount(); // Fetch every 30 seconds
    }, 30000); 

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader title={title} toggleSidebar={toggleSidebar} />
      
      <div className="flex">
        {/* Sidebar for mobile */}
        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-200 ease-in-out`}>
          <AdminSidebar toggleSidebar={toggleSidebar} pendingRequestsCount={pendingRequestsCount} />
        </div>

        {/* Main content */}
        <main className={`flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}