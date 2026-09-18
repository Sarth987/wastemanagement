import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../../firebase/auth';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address.');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') toast.error('No account found with this email.');
      else toast.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden px-margin-mobile md:px-margin py-8 lg:py-16 min-h-[calc(100vh-5rem)] flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-surface-container-lowest rounded-2xl shadow-surface-3 p-6 sm:p-8 border border-outline-variant/20">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-container mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-primary">lock_reset</span>
            </div>
            <h2 className="text-headline-md text-on-surface">Reset Password</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Enter your email to receive a password reset link</p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-status-success-bg mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-status-success">check_circle</span>
              </div>
              <p className="text-body-md text-on-surface">Password reset email sent to <strong>{email}</strong></p>
              <p className="text-body-sm text-on-surface-variant">Check your inbox and follow the link to reset your password.</p>
              <Link to="/login" className="inline-flex items-center gap-2 text-label-md text-primary hover:underline">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-lg bg-primary text-on-primary text-label-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> : 'Send Reset Link'}
              </button>
              <div className="text-center">
                <Link to="/login" className="text-body-sm text-primary hover:underline">Back to Login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
