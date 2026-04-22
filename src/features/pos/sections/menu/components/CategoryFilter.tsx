import React from 'react';
import Button from '../../../components/Button';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  itemCounts?: Record<string, number>;
  onAddCategory: () => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  itemCounts = {},
  onAddCategory,
}) => {
  const allCount = Object.values(itemCounts).reduce((sum, count) => sum + count, 0);
  const getBadgeClass = (isSelected: boolean) =>
    cn(
      'ml-2 rounded-full px-2 py-0.5 text-xs',
      isSelected
        ? 'bg-primary-foreground/20 text-primary-foreground'
        : 'bg-muted text-muted-foreground'
    );

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onCategoryChange('all')}
        className="flex-shrink-0"
      >
        <span>Tất cả</span>
        {allCount > 0 && (
          <span className={getBadgeClass(selectedCategory === 'all')}>
            {allCount}
          </span>
        )}
      </Button>

      {categories.map((category) => {
        const count = itemCounts[category.id] ?? 0;
        const isSelected = selectedCategory === category.id;

        return (
          <Button
            key={category.id}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="flex-shrink-0"
            iconName={category.icon}
            iconPosition="left"
          >
            <span>{category.name}</span>
            {count > 0 && (
              <span className={getBadgeClass(isSelected)}>
                {count}
              </span>
            )}
          </Button>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 text-muted-foreground border-dashed"
        iconName="Plus"
        iconPosition="left"
        onClick={onAddCategory}
      >
        Thêm danh mục
      </Button>
    </div>
  );
};

export default CategoryFilter;
