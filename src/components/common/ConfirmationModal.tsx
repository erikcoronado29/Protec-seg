import { AlertTriangle, X } from 'lucide-react';
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 print:hidden">
      <div className="w-full max-w-md bg-white dark:bg-[#1B272F] rounded-2xl shadow-2xl border border-[#E2E9EC] dark:border-[#34434C] overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-5 flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger
                ? 'bg-red-50 dark:bg-red-950/40 text-[#B94949]'
                : 'bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F]'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#20313C] dark:text-[#EDF3F5] mb-1.5">
              {title}
            </h3>
            <p className="text-xs text-[#71818B] dark:text-[#A8B6BE] leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-[#71818B] hover:text-[#20313C] dark:hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#F8FAFB] dark:bg-[#202E37] px-5 py-3.5 border-t border-[#E2E9EC] dark:border-[#34434C] flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-[#71818B] dark:text-[#A8B6BE] hover:text-[#20313C] dark:hover:text-white bg-white dark:bg-[#1B272F] border border-[#E2E9EC] dark:border-[#34434C] rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
              isDanger
                ? 'bg-[#B94949] hover:bg-red-700'
                : 'bg-[#16836F] hover:bg-[#126b5a]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
