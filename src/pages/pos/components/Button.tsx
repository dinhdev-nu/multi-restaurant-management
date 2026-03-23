import React from 'react';
import { cn } from '@/lib/utils';
import Icon from '@/components/AppIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'secondary' | 'success' | 'warning' | 'error' | 'link';
type ButtonSize = 'xs' | 'sm' | 'default' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconName?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary',
  outline: 'border border-border bg-background hover:bg-muted hover:text-foreground',
  ghost: 'hover:bg-muted hover:text-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-600',
  error: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  link: 'text-primary underline-offset-4 hover:underline',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2 text-xs rounded-md',
  sm: 'h-9 px-3 text-sm rounded-md',
  default: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-11 px-6 text-base rounded-lg',
  icon: 'h-10 w-10 p-0 rounded-lg',
};

// ─── Component ────────────────────────────────────────────────────────────────

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'default',
      iconName,
      iconPosition = 'left',
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const hasIcon = !!iconName;
    const isIconOnly = hasIcon && !children;

    const iconSize = size === 'xs' ? 14 : size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          'select-none',
          // Variant
          variantStyles[variant],
          // Size
          isIconOnly ? 'h-10 w-10 p-0 rounded-lg' : sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          // Custom className
          className
        )}
        {...props}
      >
        {hasIcon && iconPosition === 'left' && (
          <Icon name={iconName} size={iconSize} className={children ? 'mr-2' : ''} />
        )}
        {children}
        {hasIcon && iconPosition === 'right' && (
          <Icon name={iconName} size={iconSize} className={children ? 'ml-2' : ''} />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
