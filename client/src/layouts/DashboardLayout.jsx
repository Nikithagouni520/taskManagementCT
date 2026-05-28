import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import MobileNav from '../components/navigation/MobileNav';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile sidebar overlay */}
      <MobileNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="lg:pl-72">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
