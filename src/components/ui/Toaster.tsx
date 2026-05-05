import { useUIStore, type Toast, type ToastType } from '@/stores/uiStore';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-green-500" />,
  error: <AlertCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-blue-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
};

const TOAST_BG: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  info: 'bg-blue-50 border-blue-200',
  warning: 'bg-amber-50 border-amber-200',
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useUIStore();

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-3 shadow-lg max-w-sm w-full',
        TOAST_BG[toast.type],
      )}
      role="alert"
    >
      <span className="flex-shrink-0 mt-0.5">{TOAST_ICONS[toast.type]}</span>
      <p className="flex-1 text-sm text-slate-800">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pb-safe"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
