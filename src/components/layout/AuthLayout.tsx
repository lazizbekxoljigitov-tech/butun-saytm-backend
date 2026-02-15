import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
      <div className="w-full">
        {children}
      </div>
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
