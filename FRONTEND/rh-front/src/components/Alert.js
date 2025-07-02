import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Alert = ({ type = 'info', message, isOpen, onClose }) => {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
    if (isOpen) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!visible) return null;

  const alertStyles = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-full">
      <div className={`border-l-4 p-4 rounded-lg shadow-lg ${alertStyles[type]}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-semibold">{message}</p>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              onClose();
            }}
            className="ml-4 text-current hover:text-opacity-80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;