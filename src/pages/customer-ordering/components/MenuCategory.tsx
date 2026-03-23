import React from 'react';
import {
  LayoutGrid, UtensilsCrossed, GlassWater, IceCream,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '../types';

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutGrid,
  UtensilsCrossed,
  GlassWater,
  IceCream,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface MenuCategoryProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MenuCategory: React.FC<MenuCategoryProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        const IconComponent = category.icon ? ICON_MAP[category.icon] : null;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium
              whitespace-nowrap flex-shrink-0 transition-all duration-150
              ${isActive
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-foreground hover:bg-secondary'
              }
            `}
          >
            {IconComponent && (
              <IconComponent
                size={16}
                className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}
              />
            )}
            <span>{category.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MenuCategory;
