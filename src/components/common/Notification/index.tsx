import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

export function Notification({ message, duration = 3000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg opacity-90 transition-opacity duration-200"
      style={{ zIndex: 2147483647 }}>
      {message}
    </div>
  );
}

export default Notification;
