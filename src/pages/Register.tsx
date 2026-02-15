import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Play, Mail, Lock, User } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const Register = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: location.state?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'otp'>(location.state?.email ? 'otp' : 'details');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { t } = useTranslation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      if (data.success) {
        toast.success(data.message || 'Verification code sent to your email');
        setStep('otp');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: otp
      });
      
      if (data.success) {
        setAuth(data.data.user, data.data.token);
        toast.success(t('auth.start_journey'));
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto px-6 py-12 flex items-center justify-center">
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
              {step === 'details' ? t('auth.join_us') : 'Verify Email'}
            </h2>
            <p className="text-gray-500 mt-2 text-center">
              {step === 'details' 
                ? t('auth.start_journey') 
                : `We sent a 6-digit code to ${formData.email}`}
            </p>
          </div>

          {step === 'details' ? (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="relative">
                <User className="absolute left-3 top-[38px] text-gray-500" size={20} />
                <Input
                  label={t('auth.full_name')}
                  placeholder="John Doe"
                  name="name"
                  className="pl-10"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-[38px] text-gray-500" size={20} />
                <Input
                  label={t('auth.email_address')}
                  placeholder="you@example.com"
                  type="email"
                  name="email"
                  className="pl-10"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-[38px] text-gray-500" size={20} />
                <Input
                  label={t('auth.password')}
                  placeholder="••••••••"
                  type="password"
                  name="password"
                  className="pl-10"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-[38px] text-gray-500" size={20} />
                <Input
                  label="Confirm Password"
                  placeholder="••••••••"
                  type="password"
                  name="confirmPassword"
                  className="pl-10"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full py-4 text-lg mt-4"
                isLoading={isLoading}
              >
                {t('common.register')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full bg-black/40 border border-dark-border/50 rounded-xl py-4 text-center text-3xl font-bold tracking-[0.5em] text-primary focus:outline-none focus:border-primary transition-all"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <Button
                type="submit"
                className="w-full py-4 text-lg"
                isLoading={isLoading}
              >
                Verify & Join
              </Button>

              <button 
                type="button"
                onClick={() => setStep('details')}
                className="w-full text-center text-sm text-gray-500 hover:text-white transition-colors"
                disabled={isLoading}
              >
                Change Email
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-gray-500">
            {t('auth.login_prompt')}{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              {t('common.login')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
