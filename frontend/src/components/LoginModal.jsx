import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Reveal3D from '@/components/Reveal3D';
import CleanLogo from '@/components/CleanLogo';

export default function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  
  const [step, setStep] = useState('ENTER_PHONE'); // ENTER_PHONE, ENTER_PASSWORD, REGISTER, RESET_PASSWORD
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || !agreed) return;

    // Hardcoded Admin Bypass
    if (phoneNumber.toLowerCase() === 'admin@stellahitech.com') {
      setStep('ENTER_PASSWORD');
      return;
    }

    // Reject any other emails or non-numeric inputs
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      const exists = await authStore.checkUser(phoneNumber);
      if (exists) {
        setStep('ENTER_PASSWORD');
      } else {
        await authStore.sendOTP(phoneNumber);
        setStep('REGISTER');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLoginSubmit = async () => {
    if (!password) return;
    try {
      const loggedInUser = await authStore.login(phoneNumber, password);
      onClose();
      if (loggedInUser?.role === 'admin') navigate('/admin/dashboard');
      else navigate('/account');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegisterSubmit = async () => {
    if (otp.length !== 6 || !password || !name) return;
    try {
      await authStore.register(phoneNumber, password, otp, name);
      onClose();
      navigate('/account');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await authStore.sendOTP(phoneNumber);
      setStep('RESET_PASSWORD');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (otp.length !== 6 || !password) return;
    try {
      await authStore.resetPassword(phoneNumber, password, otp);
      alert('Password reset successfully! Please login.');
      setPassword('');
      setOtp('');
      setStep('ENTER_PASSWORD');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBack = () => {
    if (step === 'ENTER_PASSWORD') setStep('ENTER_PHONE');
    if (step === 'RESET_PASSWORD') setStep('ENTER_PASSWORD');
    setPassword('');
    setOtp('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Reveal3D variant="zoom" duration={600} className="w-full max-w-md">
        <div className="bg-stella-charcoal border border-gray-800 rounded-2xl w-full overflow-hidden shadow-2xl relative shadow-black">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors bg-stella-black w-8 h-8 rounded-full flex items-center justify-center border border-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {(step === 'ENTER_PASSWORD' || step === 'RESET_PASSWORD') && (
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 z-10 text-gray-400 hover:text-white transition-colors bg-stella-black w-8 h-8 rounded-full flex items-center justify-center border border-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="p-8">
            <div className="text-center mb-8 border-b border-gray-800 pb-6">
              <div className="flex flex-col items-center justify-center mb-4">
                <CleanLogo className="h-10 object-contain" height={40} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-wide">
                {step === 'ENTER_PHONE' && 'Welcome Back'}
                {step === 'ENTER_PASSWORD' && 'Enter Password'}
                {step === 'REGISTER' && 'Create Account'}
                {step === 'RESET_PASSWORD' && 'Reset Password'}
              </h2>
            </div>

            {step === 'ENTER_PHONE' && (
              <Reveal3D variant="up" stagger={80} className="space-y-6" refreshKey="step-1">
                <div data-reveal-child>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mobile Number / Admin Email</label>
                  <div className="flex">
                    <span className="bg-stella-black border border-gray-700 border-r-0 text-gray-400 rounded-l-md px-4 py-3 flex items-center font-bold">
                      {phoneNumber.includes('@') ? '✉️' : '+91'}
                    </span>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter mobile or email"
                      className="w-full bg-stella-charcoal border border-gray-700 text-white rounded-r-md py-3 px-4 focus:outline-none focus:border-stella-red transition-colors shadow-inner"
                    />
                  </div>
                </div>

                <label data-reveal-child className="flex items-start cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="peer sr-only" />
                    <div className="w-5 h-5 border border-gray-600 rounded bg-stella-black peer-checked:bg-stella-red peer-checked:border-stella-red transition-colors flex items-center justify-center">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="ml-3 text-[11px] text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    I agree to the <a href="#" className="text-stella-red hover:underline">Terms & Conditions</a> and{' '}
                    <a href="#" className="text-stella-red hover:underline">Privacy Policy</a>
                  </span>
                </label>

                <button
                  data-reveal-child
                  onClick={handlePhoneSubmit}
                  disabled={!phoneNumber || !agreed || authStore.loading}
                  className="w-full bg-stella-red text-white py-3.5 rounded font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-stella-red/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {authStore.loading ? 'Loading...' : 'Continue'}
                </button>
              </Reveal3D>
            )}

            {step === 'ENTER_PASSWORD' && (
              <Reveal3D variant="up" stagger={80} className="space-y-6" refreshKey="step-password">
                <div data-reveal-child>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-stella-charcoal border border-gray-700 text-white rounded-md py-3 px-4 focus:outline-none focus:border-stella-red transition-colors shadow-inner"
                  />
                  <div className="flex justify-end mt-2">
                    <button onClick={handleForgotPassword} className="text-stella-red text-xs hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <button
                  data-reveal-child
                  onClick={handleLoginSubmit}
                  disabled={!password || authStore.loading}
                  className="w-full bg-stella-red text-white py-3.5 rounded font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-stella-red/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {authStore.loading ? 'Logging in...' : 'Login'}
                </button>
              </Reveal3D>
            )}

            {step === 'REGISTER' && (
              <Reveal3D variant="up" stagger={80} className="space-y-6" refreshKey="step-register">
                <div data-reveal-child className="bg-stella-black/50 border border-gray-800 rounded-lg p-3 text-center mb-4">
                  <p className="text-xs text-gray-400 uppercase">OTP sent to +91 {phoneNumber}</p>
                </div>

                <div data-reveal-child>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="• • • • • •"
                    className="w-full bg-stella-black border border-gray-700 text-white rounded-md py-3 px-4 text-center tracking-[0.5em] font-mono shadow-inner mb-4 focus:outline-none focus:border-stella-red"
                    maxLength={6}
                  />

                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-stella-charcoal border border-gray-700 text-white rounded-md py-3 px-4 focus:outline-none focus:border-stella-red transition-colors shadow-inner mb-4"
                  />

                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Create Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a secure password"
                    className="w-full bg-stella-charcoal border border-gray-700 text-white rounded-md py-3 px-4 focus:outline-none focus:border-stella-red transition-colors shadow-inner"
                  />
                </div>

                <button
                  data-reveal-child
                  onClick={handleRegisterSubmit}
                  disabled={otp.length !== 6 || !password || !name || authStore.loading}
                  className="w-full bg-stella-red text-white py-3.5 rounded font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-stella-red/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {authStore.loading ? 'Creating...' : 'Register & Login'}
                </button>
              </Reveal3D>
            )}

            {step === 'RESET_PASSWORD' && (
              <Reveal3D variant="up" stagger={80} className="space-y-6" refreshKey="step-reset">
                <div data-reveal-child className="bg-stella-black/50 border border-gray-800 rounded-lg p-3 text-center mb-4">
                  <p className="text-xs text-gray-400 uppercase">OTP sent to +91 {phoneNumber}</p>
                </div>

                <div data-reveal-child>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="• • • • • •"
                    className="w-full bg-stella-black border border-gray-700 text-white rounded-md py-3 px-4 text-center tracking-[0.5em] font-mono shadow-inner mb-4 focus:outline-none focus:border-stella-red"
                    maxLength={6}
                  />

                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-stella-charcoal border border-gray-700 text-white rounded-md py-3 px-4 focus:outline-none focus:border-stella-red transition-colors shadow-inner"
                  />
                </div>

                <button
                  data-reveal-child
                  onClick={handleResetPasswordSubmit}
                  disabled={otp.length !== 6 || !password || authStore.loading}
                  className="w-full bg-stella-red text-white py-3.5 rounded font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-stella-red/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {authStore.loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </Reveal3D>
            )}

          </div>
        </div>
      </Reveal3D>
    </div>
  );
}
