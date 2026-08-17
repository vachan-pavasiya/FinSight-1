import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        {success ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Check your inbox</h2>
            <p className="text-slate-400 mb-8">We sent a reset link to <strong className="text-white">{email}</strong>. The link expires in 1 hour.</p>
            <Link to="/login" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
              <ArrowLeft size={16} /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
              <ArrowLeft size={16} /> Back to sign in
            </Link>
            <div className="glass-card p-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
                <Mail size={28} className="text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Forgot password?</h2>
              <p className="text-slate-400 mb-6">Enter your email address and we'll send you a link to reset your password.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
                >
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
