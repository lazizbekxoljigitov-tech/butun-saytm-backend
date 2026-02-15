import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { AdminSidebar } from './AdminSidebar';
import { Toaster } from 'react-hot-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#050505] flex">
      <AdminSidebar />
      <main className="flex-grow ml-64 p-10 min-h-screen overflow-x-hidden">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#161617',
            color: '#fff',
            border: '1px solid #2a2a2d',
          },
        }}
      />
    </div>
  );
};
