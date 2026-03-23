import React from 'react';
import { cn } from '@/lib/utils';
import Icon from '@/components/AppIcon';
import Button from '@/pages/pos/components/Button';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
  icon?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
  icon = 'AlertCircle',
}) => {
  if (!isOpen) return null;

  const iconColor = variant === 'danger' ? 'text-red-600' : variant === 'warning' ? 'text-yellow-600' : 'text-blue-600';
  const confirmVariant = variant === 'danger' ? 'error' : variant === 'warning' ? 'warning' : 'default';

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-background rounded-lg shadow-xl max-w-md w-full',
          'transform transition-all',
          'animate-in fade-in-0 zoom-in-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={cn('flex-shrink-0 mt-0.5', iconColor)}>
              <Icon name={icon} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-4 flex items-center justify-end space-x-2">
          <Button variant="outline" size="default" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} size="default" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
