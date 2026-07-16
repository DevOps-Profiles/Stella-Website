import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const loading = useAuthStore((s) => s.loading);
  const sendOTP = useAuthStore((s) => s.sendOTP);
  const verifyOTP = useAuthStore((s) => s.verifyOTP);
  const addToast = useToastStore((s) => s.addToast);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [step, setStep] = useState(1);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) return addToast('Enter a valid phone number', 'error');
    if (!acceptedTerms) return addToast('Please accept the Terms & Conditions', 'error');
    try {
      await sendOTP(phone);
      setStep(2);
      addToast('OTP sent successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleLogin = async () => {
    if (!otp || otp.length < 4) return addToast('Enter a valid OTP', 'error');
    try {
      await verifyOTP(otp, name);
      navigate('/account');
      addToast('Login successful', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-stella-red/5 rounded-full blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-stella-gold/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-stella-charcoal border border-gray-800 rounded-2xl p-10 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">
            Stella <span className="text-stella-red">Mobiles</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            {step === 1 ? 'Customer Login' : 'Verify Identity'}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full bg-stella-black border border-gray-700 text-white rounded-lg py-4 pl-14 pr-4 focus:outline-none focus:border-stella-red transition-all font-mono tracking-widest"
                />
              </div>
            </div>

            <div className="flex items-start space-x-3 group cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
              <div className={`mt-0.5 w-5 h-5 border rounded flex items-center justify-center transition-colors shrink-0 ${acceptedTerms ? 'bg-stella-red border-stella-red' : 'border-gray-700 group-hover:border-gray-500'}`}>
                {acceptedTerms && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider font-medium">
                I agree to the <span className="text-stella-gold border-b border-stella-gold/30">Terms & Conditions</span> and allow Stella Mobiles to access my contact details for order processing.
              </p>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-stella-red text-white py-4 rounded-lg font-bold uppercase tracking-[0.2em] text-xs hover:bg-red-700 transition-all shadow-xl shadow-stella-red/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Verification OTP'}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest mb-8">
              OTP sent to <span className="text-white font-bold">{phone}</span>
            </p>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="0 0 0 0"
                maxLength={6}
                className="w-full bg-stella-black border border-gray-700 text-white text-center rounded-lg py-5 text-2xl focus:outline-none focus:border-stella-red transition-all font-black tracking-[0.5em]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Full Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-stella-black border border-gray-700 text-white rounded-lg py-4 px-4 focus:outline-none focus:border-stella-red transition-all text-sm font-bold tracking-wide"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-stella-red text-white py-4 rounded-lg font-bold uppercase tracking-[0.2em] text-xs hover:bg-red-700 transition-all shadow-xl shadow-stella-red/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Log In'}
            </button>
            <button onClick={() => setStep(1)} className="w-full text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-colors">
              Change Phone Number
            </button>
          </div>
        )}

        <div className="mt-12 text-center border-t border-gray-800 pt-8">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Secure SSL Encrypted Access</p>
        </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
