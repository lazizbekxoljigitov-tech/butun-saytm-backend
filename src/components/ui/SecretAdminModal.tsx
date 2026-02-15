import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { useAuthStore } from '../../features/auth/store/authStore';
import toast from 'react-hot-toast';

export const SecretAdminModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [sequence, setSequence] = useState('');
  const navigate = useNavigate();
  const setSecretAdmin = useAuthStore(state => state.setSecretAdmin);

  const TRIGGER = 'pono0908';
  const ADMIN_PASS = 'admin123';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const newSequence = (sequence + e.key).slice(-TRIGGER.length);
      setSequence(newSequence);

      if (newSequence === TRIGGER) {
        setIsOpen(true);
        setSequence(''); // Reset sequence
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequence]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASS) {
      setSecretAdmin();
      toast.success('Admin access granted');
      setIsOpen(false);
      setPassword('');
      navigate('/admin');
    } else {
      toast.error('Incorrect password');
      setPassword('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-dark-bg border border-dark-border/50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full" />
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white bg-white/5 rounded-2xl transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-6 ring-8 ring-primary/5">
                <Lock size={32} />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
                Restricted <span className="text-primary">Zone</span>
              </h2>
              <p className="text-gray-500 font-medium">Enter secret code to proceed</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <Input
                  type="password"
                  placeholder="Secret Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="bg-dark-accent/50 border-dark-border py-4 text-center text-xl tracking-[0.5em] font-black"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 rounded-2xl text-lg font-black italic uppercase tracking-tighter group"
              >
                Access Panel
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <p className="text-center mt-8 text-[10px] font-bold text-gray-700 uppercase tracking-[0.3em]">
              Authorized Personnel Only
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
