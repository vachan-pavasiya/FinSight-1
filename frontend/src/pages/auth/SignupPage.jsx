import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Wallet, CheckCircle } from 'lucide-react';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
  const labels = ['Weak', 'Fair', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-white/10'}`} />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">{labels[score - 1] || 'Too weak'}</span>
        {checks.map(c => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? 'text-emerald-400' : 'text-slate-500'}`}>
            <CheckCircle size={10} /> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  const password = watch('password', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authAPI.signup({ name: data.name, email: data.email, password: data.password });
      setSuccess(true);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Check your email!</h2>
          <p className="text-slate-400 mb-6">We sent a verification link to your email. Click it to activate your account.</p>
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Back to sign in
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)' }}>
        <div className="absolute inset-0 opacity-30"
          style={{ background: 'radial-gradient(circle at 70% 30%, #6366f1 0%, transparent 50%), radial-gradient(circle at 20% 80%, #06b6d4 0%, transparent 50%)' }}
        />
        <div className="relative z-10 text-center px-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Wallet size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Join FinSight</h1>
          <p className="text-slate-400 text-lg">Your personal finance journey starts here</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'var(--bg-primary)' }}>
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create account</h2>
            <p className="text-slate-400">Start managing your finances smarter</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { key: 'name', label: 'Full name', type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
                <input
                  type={type}
                  {...register(key)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: errors[key] ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                />
                {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key].message}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: errors.password ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              <PasswordStrength password={password} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: errors.confirmPassword ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
