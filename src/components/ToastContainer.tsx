import { ToastMessage } from '../types';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none"
      id="toast-container"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.15 } }}
            className="pointer-events-auto flex items-center justify-between gap-3 bg-#0B2D5C text-white border-l-4 border-#D4AF37 p-4 rounded-r-xl shadow-2xl backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(11, 45, 92, 0.96)',
              borderColor: '#D4AF37'
            }}
            id={`toast-${toast.id}`}
          >
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10"
                style={{ color: '#D4AF37' }}
              >
                <Check className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Copied successfully!</span>
                <span className="text-xs text-white/80 line-clamp-1 break-all">
                  "{toast.copiedValue}"
                </span>
              </div>
            </div>
            
            <button
              onClick={() => onClose(toast.id)}
              className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
              aria-label="Close notification"
              id={`close-toast-${toast.id}`}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
