import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerWithEmail } from '../../firebase/auth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill in all required fields.');
    if (password.length < 6) return toast.error('Password must be at least 6 characters.');
    if (password !== confirmPassword) return toast.error('Passwords do not match.');

    setLoading(true);
    try {
      await registerWithEmail(email, password, name, phone);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password must be at least 6 characters.');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Email/Password sign-in is not enabled in Firebase Console (Authentication > Sign-in method).', { duration: 6000 });
      } else if (error.code === 'auth/invalid-email') {
        toast.error('The email address is badly formatted.');
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden px-margin-mobile md:px-margin py-8 lg:py-16 min-h-[calc(100vh-5rem)]">
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-lg mx-auto z-10 relative">
        <div className="bg-surface-container-lowest rounded-2xl shadow-surface-3 p-6 sm:p-8 border border-outline-variant/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-headline-md text-on-surface">Create Account</h2>
              <p className="text-body-sm text-on-surface-variant mt-0.5">Register as a citizen reporter</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">person_add</span>
            </div>
          </div>

          {/* Role indicator */}
          <div className="mb-6 p-3 rounded-xl bg-primary-fixed/30 flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[20px]">person_pin_circle</span>
            <div>
              <p className="text-label-md text-on-surface">Citizen Account</p>
              <p className="text-code-sm text-on-surface-variant">You will be registered as a community reporter</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5">Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full h-11 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                required />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5">Email Address *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                required />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-11 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all" />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5">Password *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full h-11 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                required minLength={6} />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5">Confirm Password *</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-11 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-lg bg-primary text-on-primary text-label-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> : (
                <><span className="material-symbols-outlined text-[20px]">person_add</span>Create Account</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-surface-container-high text-center">
            <p className="text-body-sm text-on-surface-variant">
              Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
