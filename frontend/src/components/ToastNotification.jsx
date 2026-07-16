import { useToastStore } from '@/stores/toastStore';

export default function ToastNotification() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed top-8 right-8 z-[1000] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between min-w-[300px] max-w-sm p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border backdrop-blur-xl transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-stella-red/90 border-stella-red/50 text-white'
              : toast.type === 'success'
                ? 'bg-green-600/90 border-green-500/50 text-white'
                : 'bg-[#1a1a1e]/90 border-white/10 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <span className="text-lg">✓</span>}
            {toast.type === 'error' && <span className="text-lg font-black">!</span>}
            {toast.type === 'info' && <span className="text-lg">ℹ</span>}
            <p className="text-xs font-bold uppercase tracking-widest">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-60 hover:opacity-100 transition-opacity">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
