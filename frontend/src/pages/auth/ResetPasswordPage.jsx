import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (!token) { toast.error('Invalid reset link'); return; }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset! You can now sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Reset failed. Link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
        <div className="glass-card p-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
            <Lock size={28} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Set new password</h2>
          <p className="text-slate-400 mb-6">Choose a strong password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'New password', value: password, onChange: setPassword, placeholder: '••••••••' },
              { label: 'Confirm password', value: confirm, onChange: setConfirm, placeholder: '••••••••' },
            ].map(({ label, value, onChange, placeholder }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
                <input
                  type="password"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  required
                  className="w-full px-4 py-3 rounded-xl border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
            >
              {isLoading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
