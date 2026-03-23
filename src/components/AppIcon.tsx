import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export interface AppIconProps extends Omit<LucideProps, 'ref'> {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 24,
  color,
  className = '',
  ...props
}) => {
  // Convert icon name to PascalCase if needed
  const iconName = name as keyof typeof LucideIcons;
  const IconComponent = LucideIcons[iconName] as React.ComponentType<LucideProps>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      {...props}
    />
  );
};

export default AppIcon;
