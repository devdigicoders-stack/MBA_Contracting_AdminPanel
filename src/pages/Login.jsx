import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    const token = localStorage.getItem('mba_admin_token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store auth details
        localStorage.setItem('mba_admin_token', result.data.accessToken);
        localStorage.setItem('mba_admin_user', JSON.stringify(result.data.user));
        localStorage.setItem('mba_admin_auth', 'true');

        setSuccessMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setErrorMessage(result.message || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Server connection error. Please make sure the backend is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#e2e8f0] flex items-center justify-center p-0 md:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-[1360px] min-h-screen md:min-h-[780px] bg-white md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200/80">
        
        {/* Left Side: Architectural Villa Visuals (Uses /image.png) */}
        <div className="w-full md:w-[50%] lg:w-[52%] bg-slate-900 relative overflow-hidden select-none flex items-stretch">
          <img
            src="/image.png"
            alt="MBA Contracting Visual"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-[50%] lg:w-[48%] bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative">
          
          {/* Top Header: Back to Website Link */}
          <div className="flex justify-end">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Redirecting to public website...');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#b4833e] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Website</span>
            </a>
          </div>

          {/* Form Container */}
          <div className="max-w-[430px] w-full mx-auto my-auto py-4">
            
            {/* Header Titles */}
            <div className="mb-7">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 font-normal">
                Login to your MBA Contracting admin panel
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4.5">
              
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={17} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b4833e]/30 focus:border-[#b4833e] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={17} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b4833e]/30 focus:border-[#b4833e] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#b4833e] focus:ring-[#b4833e] border-slate-300 accent-[#b4833e] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-600">Remember me</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please contact super administrator to reset your password.');
                  }}
                  className="text-xs font-semibold text-[#b4833e] hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#b4833e] hover:bg-[#9e7131] active:scale-[0.99] text-white font-semibold text-sm rounded-lg shadow-lg shadow-[#b4833e]/25 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Verifying Credentials...' : 'Login to Dashboard'}</span>
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            {/* Divider OR */}
            <div className="relative flex py-6 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                OR
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Secure Access Box */}
            <div className="bg-slate-50/90 border border-slate-100 rounded-xl p-3.5 flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-slate-200/60 flex items-center justify-center shrink-0 text-slate-700">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Secure Access</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Connected directly to MBA API on port 5001.
                </p>
              </div>
            </div>

          </div>

          {/* Bottom Copyright with Subtle Architectural Lines */}
          <div className="pt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 mt-2">
            <span>© 2026 MBA Contracting. All rights reserved.</span>
            
            {/* Subtle watermark geometry */}
            <div className="opacity-20 hidden sm:block">
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                <line x1="0" y1="20" x2="20" y2="0" stroke="#b4833e" strokeWidth="1.5" />
                <line x1="10" y1="20" x2="30" y2="0" stroke="#b4833e" strokeWidth="1.5" />
                <line x1="20" y1="20" x2="40" y2="0" stroke="#b4833e" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
