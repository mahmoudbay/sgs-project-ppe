import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

/**
 * Notifications Component
 * 
 * Displays toast notifications for user feedback.
 * Automatically dismisses after a timeout.
 */
export default function Notifications({ notifications }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Convert notifications to toast format
    const newToasts = notifications
      .filter((n) => !n.lu)
      .map((n) => ({
        id: n.id,
        type: n.type.toLowerCase().includes('error') ? 'error' : 'info',
        message: n.message,
        timestamp: Date.now(),
      }));

    setToasts((prev) => [...prev, ...newToasts]);

    // Auto-dismiss toasts after 5 seconds
    const timers = newToasts.map((toast) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000)
    );

    return () => timers.forEach(clearTimeout);
  }, [notifications]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg animate-slide-in ${
            toast.type === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          ) : (
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          )}

          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                toast.type === 'error' ? 'text-red-900' : 'text-blue-900'
              }`}
            >
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className={`flex-shrink-0 ${
              toast.type === 'error' ? 'text-red-400' : 'text-blue-400'
            } hover:opacity-75`}
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
