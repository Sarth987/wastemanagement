import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmail, setupRecaptcha, sendPhoneOTP, verifyOTP } from '../../firebase/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('email'); // 'email' | 'phone'
  const [loading, setLoading] = useState(false);

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields.');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toast.success('Login successful!');
      if (email.toLowerCase().includes('admin')) {
        navigate('/admin/dashboard');
      } else if (email.toLowerCase().includes('driver')) {
        navigate('/driver/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') toast.error('No account found with this email.');
      else if (error.code === 'auth/wrong-password') toast.error('Incorrect password.');
      else if (error.code === 'auth/invalid-credential') toast.error('Invalid credentials. Please try again.');
      else toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phone) return toast.error('Please enter a phone number.');
    setLoading(true);
    try {
      const appVerifier = setupRecaptcha('recaptcha-container');
      const result = await sendPhoneOTP(phone, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success('Verification code sent!');
    } catch (error) {
      console.error('OTP error:', error);
      if (error.code === 'auth/too-many-requests') toast.error('Too many attempts. Please try again later.');
      else toast.error('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Please enter the complete 6-digit code.');
    setLoading(true);
    try {
      await verifyOTP(confirmationResult, code);
      toast.success('Phone verified successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="relative w-full overflow-hidden px-margin-mobile md:px-margin py-8 lg:py-16 min-h-[calc(100vh-5rem)]">
      {/* Background effects */}
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[28rem] h-[28rem] bg-secondary-container/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column — Platform Info */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col space-y-8 z-10">
          <div className="flex flex-col space-y-3">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-surface-container-high text-primary">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Civic Infrastructure</span>
            </div>
            <h1 className="text-display-lg text-on-surface tracking-tight">
              Smart Waste Platform
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-xl">
              Unified authentication portal connecting citizen reporting, municipal dispatch, and fleet driver operations.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: 'person_pin_circle', title: 'Citizens', desc: 'Instant geo-tagged audits & waste triage tracking', link: 'Live Reports', color: 'bg-surface-container-high text-primary' },
              { icon: 'sensors', title: 'Dispatchers', desc: 'Real-time fleet dispatch & automated routing', link: 'Admin Console', color: 'bg-secondary-fixed text-secondary' },
              { icon: 'local_shipping', title: 'Fleet Drivers', desc: 'In-cab turn-by-turn collection & photographic proof', link: 'Route Cockpit', color: 'bg-primary-fixed text-primary' },
            ].map((tile) => (
              <div key={tile.title} className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between space-y-3 transition-transform duration-200 hover:-translate-y-0.5">
                <div className={`w-9 h-9 rounded-lg ${tile.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-[20px]">{tile.icon}</span>
                </div>
                <div>
                  <span className="text-label-md text-on-surface block">{tile.title}</span>
                  <p className="text-body-sm text-on-surface-variant mt-0.5">{tile.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-code-sm text-on-surface-variant">{tile.link}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Trust bar */}
          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm text-primary">
                <span className="material-symbols-outlined text-[22px]">verified_user</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface">End-to-End Encrypted Identity</p>
                <p className="text-body-sm text-on-surface-variant">Firebase Authentication with reCAPTCHA protection</p>
              </div>
            </div>
            <div className="flex items-center gap-space-xl">
              <div className="text-center">
                <span className="text-headline-sm text-on-surface font-bold">99.98%</span>
                <p className="text-code-sm text-on-surface-variant">Uptime SLA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Login Form */}
        <div className="lg:col-span-6 xl:col-span-5 z-10">
          <div className="bg-surface-container-lowest rounded-2xl shadow-surface-3 p-6 sm:p-8 border border-outline-variant/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-headline-md text-on-surface">System Sign In</h2>
                <p className="text-body-sm text-on-surface-variant mt-0.5">Select authentication protocol</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">lock_person</span>
              </div>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-surface-container-low mb-6">
              <button
                onClick={() => { setAuthMode('phone'); setOtpSent(false); }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-label-md transition-all ${
                  authMode === 'phone' ? 'bg-surface-container-lowest text-on-surface shadow-surface-1' : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">smartphone</span>
                Phone (SMS OTP)
              </button>
              <button
                onClick={() => setAuthMode('email')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-label-md transition-all ${
                  authMode === 'email' ? 'bg-surface-container-lowest text-on-surface shadow-surface-1' : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">mail</span>
                Email & Password
              </button>
            </div>

            {/* Email Login Form */}
            {authMode === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Link to="/forgot-password" className="text-label-sm text-primary hover:underline">Forgot Password?</Link>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-lg bg-primary text-on-primary text-label-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">login</span>
                      Sign In
                    </>
                  )}
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@smartwaste.com');
                      setPassword('Admin@123456');
                    }}
                    className="w-full py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-label-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                    Quick Fill Admin Account (admin@smartwaste.com)
                  </button>
                </div>
              </form>
            )}

            {/* Phone Login Form */}
            {authMode === 'phone' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <>
                    <div>
                      <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5">Mobile Phone Number</label>
                      <div className="flex items-center gap-2">
                        <span className="h-11 px-3 rounded-lg bg-surface-container flex items-center text-body-md text-on-surface-variant shrink-0">+91</span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          className="w-full h-11 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                        />
                      </div>
                      <p className="text-code-sm text-on-surface-variant mt-1.5">Include country code (e.g., +919876543210)</p>
                    </div>
                    <button
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full h-12 rounded-lg bg-primary text-on-primary text-label-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">send</span>
                          Send Verification Code
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">6-Digit Verification Code</label>
                        <button onClick={() => { setOtpSent(false); setOtp(['','','','','','']); }} className="text-label-sm text-primary hover:underline">
                          ↻ Resend Code
                        </button>
                      </div>
                      <div className="flex gap-2 justify-center">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`otp-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-12 h-14 text-center rounded-xl bg-surface-container-lowest border-2 border-outline-variant/50 text-headline-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading}
                      className="w-full h-12 rounded-lg bg-primary text-on-primary text-label-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">verified_user</span>
                          Verify & Proceed to Dashboard
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Bottom Links */}
            <div className="mt-6 pt-4 border-t border-surface-container-high text-center">
              <p className="text-body-sm text-on-surface-variant">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-semibold hover:underline">Create Account</Link>
              </p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-space-md text-code-sm text-on-surface-variant">
              <span>256-Bit SSL Security</span>
              <span>•</span>
              <span>Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
