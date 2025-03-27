import React, { useState, useEffect } from 'react';

const AutoDismissAlert = ({ message, type = 'info', duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const typeStyles = {
    info: 'bg-blue-100 border-blue-400 text-blue-700',
    success: 'bg-green-100 border-green-400 text-green-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    error: 'bg-red-100 border-red-400 text-red-700'
  };

  return (
    <div 
      className={`
        fixed 
        bottom-4 
        right-4 
        ${typeStyles[type]} 
        border-l-4
        z-10
        p-4 
        rounded 
        shadow-lg 
        transition-all 
        duration-300 
        ease-in-out
        flex 
        items-center 
        justify-between 
        w-72
        animate-slide-in
      `}
    >
      <span>{message}</span>
      <button 
        onClick={() => setIsVisible(false)} 
        className="ml-4 hover:bg-gray-200 rounded-full p-1"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="stroke-current"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

export default AutoDismissAlert;