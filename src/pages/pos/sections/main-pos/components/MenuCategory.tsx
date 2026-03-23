import Button from '../../../components/Button.tsx';
import Icon from '@/components/AppIcon';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface MenuCategoryProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const MenuCategory = ({
  categories,
  activeCategory,
  onCategoryChange,
}: MenuCategoryProps) => {
  return (
    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
      {categories?.map((category) => (
        <Button
          key={category?.id}
          variant={activeCategory === category?.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category?.id)}
          className="whitespace-nowrap hover-scale flex items-center space-x-2 flex-shrink-0"
        >
          {category?.icon && (
            <Icon
              name={category?.icon}
              size={16}
              className={activeCategory === category?.id ? 'text-primary-foreground' : ''}
            />
          )}
          <span>{category?.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default MenuCategory;
