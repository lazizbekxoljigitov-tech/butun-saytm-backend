import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Play, Mail, Lock, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'new-password'>('email');
  const [forgotData, setForgotData] = useState({ email: '', otp: '', newPassword: '' });
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        setAuth(data.data.user, data.data.token);
        toast.success(t('auth.welcome_back') + ' to ANILEGEON!');
        navigate('/');
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        // Unverified - redirect to register or show verification modal?
        // Let's redirect to register and it will show OTP step if we pass email
        toast.error('Please verify your email. Verification code sent.');
        navigate('/register', { state: { email } });
      } else {
        toast.error(error.response?.data?.error || 'Failed to login. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (forgotStep === 'email') {
        const { data } = await api.post('/auth/forgot-password', { email: forgotData.email });
        if (data.success) {
          toast.success('Reset code sent to your email');
          setForgotStep('otp');
        }
      } else if (forgotStep === 'otp') {
        // Just move to next step, we verify with the final reset call or separately?
        // User said: "osha parolni kiritsa osha hisobga yangi paril qoya olish kerrak"
        // Let's just proceed to new password entry
        setForgotStep('new-password');
      } else if (forgotStep === 'new-password') {
        const { data } = await api.post('/auth/reset-password', {
          email: forgotData.email,
          otp: forgotData.otp,
          newPassword: forgotData.newPassword
        });
        if (data.success) {
          toast.success('Password updated successfully! Please login.');
          setShowForgotModal(false);
          setForgotStep('email');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-dark-light/40 backdrop-blur-xl border border-dark-border/50 p-10 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
              <Play className="text-white fill-white" size={32} />
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">
              {t('auth.welcome_back')} <span className="text-primary">Back</span>
            </h2>
            <p className="text-gray-500 mt-2 text-center">{t('auth.login_prompt')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-[38px] text-gray-500" size={20} />
              <Input
                label={t('auth.email')}
                placeholder="you@example.com"
                type="email"
                className="pl-10"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-[38px] text-gray-500" size={20} />
              <Input
                label={t('auth.password')}
                placeholder="••••••••"
                type="password"
                className="pl-10"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end">
              <button 
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-lg"
              isLoading={isLoading}
            >
              {t('common.login')}
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              {t('auth.create_account')}
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-dark-bg border border-white/10 p-8 rounded-3xl shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Reset Password</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-6">
              {forgotStep === 'email' && (
                <div className="relative">
                   <Mail className="absolute left-3 top-[38px] text-gray-500" size={20} />
                   <Input 
                      label="Email Address" 
                      placeholder="you@example.com" 
                      type="email"
                      className="pl-10"
                      required
                      value={forgotData.email}
                      onChange={(e) => setForgotData({...forgotData, email: e.target.value})}
                   />
                </div>
              )}

              {forgotStep === 'otp' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">6-Digit Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="w-full bg-black/40 border border-dark-border/50 rounded-xl py-4 text-center text-3xl font-bold tracking-[0.5em] text-primary focus:outline-none focus:border-primary transition-all"
                    required
                    value={forgotData.otp}
                    onChange={(e) => setForgotData({...forgotData, otp: e.target.value.replace(/\D/g, '')})}
                  />
                  <p className="text-xs text-gray-500 text-center">Enter the code sent to your email</p>
                </div>
              )}

              {forgotStep === 'new-password' && (
                <div className="relative">
                   <Lock className="absolute left-3 top-[38px] text-gray-500" size={20} />
                   <Input 
                      label="New Password" 
                      placeholder="••••••••" 
                      type="password"
                      className="pl-10"
                      required
                      value={forgotData.newPassword}
                      onChange={(e) => setForgotData({...forgotData, newPassword: e.target.value})}
                   />
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-4"
                isLoading={isLoading}
              >
                {forgotStep === 'email' ? 'Send Code' : forgotStep === 'otp' ? 'Verify Code' : 'Update Password'}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
