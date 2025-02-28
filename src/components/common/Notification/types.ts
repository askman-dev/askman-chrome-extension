export interface NotificationProps {
  message: string;
  duration?: number;
  onClose?: () => void;
} 