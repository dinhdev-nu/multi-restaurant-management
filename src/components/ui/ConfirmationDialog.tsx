import React from 'react';
import { cn } from '@/lib/utils';
import Icon from '@/components/AppIcon';
import { Button } from '@/components/ui/button';

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

const variantStyles = {
  danger: {
    iconWrapper: 'bg-destructive/10',
    iconColor: 'text-destructive',
    confirmButton: 'destructive' as const,
  },
  warning: {
    iconWrapper: 'bg-yellow-500/10',
    iconColor: 'text-yellow-600',
    confirmButton: 'default' as const,
  },
  default: {
    iconWrapper: 'bg-primary/10',
    iconColor: 'text-primary',
    confirmButton: 'default' as const,
  },
};

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

  const styles = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full max-w-md',
          'bg-card border border-border rounded-xl shadow-xl',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-300'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            {/* Icon badge */}
            <div
              className={cn(
                'flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center',
                styles.iconWrapper
              )}
            >
              <Icon name={icon} size={22} className={styles.iconColor} />
            </div>

            {/* Title + message */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-base font-semibold text-foreground leading-snug">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-secondary/30 rounded-b-xl">
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={styles.confirmButton} size="sm" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
