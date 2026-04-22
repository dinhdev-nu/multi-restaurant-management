import Button from "@/features/pos/components/Button"
import Icon from "@/components/AppIcon"

import type { OrderingCategory } from "../types"

interface MenuCategoryProps {
  categories: OrderingCategory[]
  activeCategory: string
  onCategoryChange: (id: string) => void
}

const MenuCategory = ({ categories, activeCategory, onCategoryChange }: MenuCategoryProps) => {
  return (
    <div className="mb-4 flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className="hover-scale flex flex-shrink-0 items-center space-x-2 whitespace-nowrap"
        >
          {category.icon && (
            <Icon
              name={category.icon}
              size={16}
              className={activeCategory === category.id ? "text-primary-foreground" : ""}
            />
          )}
          <span>{category.name}</span>
        </Button>
      ))}
    </div>
  )
}

export default MenuCategory