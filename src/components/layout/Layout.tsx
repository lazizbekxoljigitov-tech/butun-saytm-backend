import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toaster } from 'react-hot-toast';
import { SecretAdminModal } from '../ui/SecretAdminModal';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        {children}
      </main>
      <Footer />
      <SecretAdminModal />
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
