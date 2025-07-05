import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ fullWidth = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main
  className={`flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 ${
    !fullWidth ? 'max-w-7xl mx-auto' : ''
  }`}
>

        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;