import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 print:hidden">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-xs font-medium backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-white/95 dark:bg-[#1B272F]/95 border-[#16836F]/40 text-[#20313C] dark:text-[#EDF3F5]'
                : isError
                ? 'bg-white/95 dark:bg-[#1B272F]/95 border-[#B94949]/40 text-[#20313C] dark:text-[#EDF3F5]'
                : 'bg-white/95 dark:bg-[#1B272F]/95 border-[#E2E9EC] dark:border-[#34434C] text-[#20313C] dark:text-[#EDF3F5]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#16836F]" />}
              {isError && <AlertCircle className="w-4 h-4 text-[#B94949]" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-[#1C4357]" />}
            </div>
            <div className="flex-1 leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 text-[#71818B] hover:text-[#20313C] dark:hover:text-white rounded"
              aria-label="Fechar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
