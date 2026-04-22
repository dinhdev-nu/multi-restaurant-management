import React from 'react';
import Icon from '@/components/AppIcon';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { Spinner } from '@/components/ui/spinner';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';

// Import components
import MenuItemCard from './components/MenuItemCard';
import MenuItemModal, { type MenuItemFormData } from './components/MenuItemModal';
import MenuTable from './components/MenuTable';
import BulkActionsBar from './components/BulkActionsBar';
import CategoryFilter from './components/CategoryFilter';
import MenuStats from './components/MenuStats';

// ─── Static mock data ────────────────────────────────────────────────────────

const isLoadingData = false;
const viewMode: 'table' | 'grid' = 'table';
const isTableView = viewMode === 'table';
const noop = () => { };

type MenuItemStatus = 'available' | 'low_stock' | 'unavailable';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: MenuItemStatus;
  image?: string;
  updatedAt: string;
  stock_quantity?: number;
  unit?: string;
}

// Modal states
const showItemModal = false;
const editingItem: MenuItemFormData | null = null;
const showDeleteDialog = false;
const showBulkDeleteDialog = false;
const itemToDelete: string | null = null;
const showCategoryModal = false;
const newCategoryName = '';
const categoryIcon = 'Utensils';

// Filter states
const searchQuery = '';
const selectedCategory = 'all';
const sortBy = 'name';
const sortOrder = 'asc';

// Selection
const selectedItems: string[] = [];

const categories = [
  { id: 'cat1', name: 'Đồ uống', icon: 'Coffee' },
  { id: 'cat2', name: 'Khai vị', icon: 'Soup' },
  { id: 'cat3', name: 'Món chính', icon: 'UtensilsCrossed' },
  { id: 'cat4', name: 'Tráng miệng', icon: 'IceCream' }
];

const menuItems: MenuItem[] = [
  {
    _id: 'item001', name: 'Cà phê sữa đá', description: 'Cà phê phin truyền thống với sữa đặc',
    price: 35000, category: 'cat1', status: 'available',
    image: '', updatedAt: new Date().toISOString()
  },
  {
    _id: 'item002', name: 'Trà sữa trân châu', description: 'Trà sữa Đài Loan với trân châu đen',
    price: 45000, category: 'cat1', status: 'available',
    image: '', updatedAt: new Date().toISOString()
  },
  {
    _id: 'item003', name: 'Bánh mì thịt', description: 'Bánh mì giòn với nhân thịt và rau',
    price: 25000, category: 'cat3', status: 'unavailable',
    image: '', updatedAt: new Date().toISOString()
  },
  {
    _id: 'item004', name: 'Chả giò', description: 'Chả giò chiên giòn kèm nước chấm',
    price: 55000, category: 'cat2', status: 'available',
    image: '', updatedAt: new Date().toISOString()
  }
];

const filteredItems: MenuItem[] = menuItems;

const menuStats = {
  total: menuItems.length,
  available: menuItems.filter((item) => item.status === 'available').length,
  lowStock: menuItems.filter((item) => item.status === 'low_stock').length,
  unavailable: menuItems.filter((item) => item.status === 'unavailable').length,
};

const categoryItemCounts: Record<string, number> = {
  cat1: 2, cat2: 1, cat3: 1, cat4: 0
};

// Sort options
const sortOptions = [
  { value: 'name', label: 'Tên món' },
  { value: 'price', label: 'Giá' },
  { value: 'category', label: 'Danh mục' },
  { value: 'updatedAt', label: 'Cập nhật' },
  { value: 'status', label: 'Trạng thái' }
];

const sortOrderOptions = [
  { value: 'asc', label: 'Tăng dần' },
  { value: 'desc', label: 'Giảm dần' }
];

// ─── Component ────────────────────────────────────────────────────────────────

const MenuSection: React.FC = () => {
  return (
    <div>
      {isLoadingData ? (
        <div className="flex items-center justify-center gap-3 p-6 text-muted-foreground">
          <Spinner className="size-5" />
          <span className="text-sm">Đang tải danh sách món ăn...</span>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Quản lý thực đơn</h1>
                <p className="text-muted-foreground">
                  Quản lý món ăn, giá cả và tình trạng kho hàng
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View mode toggle */}
                <div className="flex items-center rounded-lg bg-muted p-1">
                  <Button
                    variant={isTableView ? 'default' : 'ghost'}
                    size="sm"
                    onClick={noop}
                    iconName="Table"
                    className="px-3"
                  >
                    Bảng
                  </Button>
                  <Button
                    variant={isTableView ? 'ghost' : 'default'}
                    size="sm"
                    onClick={noop}
                    iconName="Grid3X3"
                    className="px-3"
                  >
                    Lưới
                  </Button>
                </div>

                <Button
                  variant="default"
                  onClick={noop}
                  iconName="Plus"
                  iconPosition="left"
                  className="hover-scale"
                >
                  Thêm món mới
                </Button>
              </div>
            </div>

            {/* Stats */}
            <MenuStats stats={menuStats} />
          </div>

          {/* Filters and Search */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex flex-col gap-4">
              {/* Search and Sort */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Input
                    type="search"
                    placeholder="Tìm kiếm món ăn..."
                    value={searchQuery}
                    onChange={noop}
                    className="w-full"
                  />
                </div>

                <Select
                  placeholder="Sắp xếp theo"
                  options={sortOptions}
                  value={sortBy}
                  onChange={noop}
                />

                <Select
                  placeholder="Thứ tự"
                  options={sortOrderOptions}
                  value={sortOrder}
                  onChange={noop}
                />
              </div>

              {/* Category Filter */}
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={noop}
                itemCounts={categoryItemCounts}
                onAddCategory={noop}
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị {filteredItems.length} trong tổng số {menuItems.length} món ăn
              {selectedItems.length > 0 && (
                <span className="ml-2 text-primary">
                  • Đã chọn {selectedItems.length} món
                </span>
              )}
            </p>

            {filteredItems.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Filter" size={16} />
                <span>
                  {selectedCategory !== 'all' && `Danh mục: ${categories.find((c) => c.id === selectedCategory)?.name}`}
                  {searchQuery && ` • Tìm kiếm: "${searchQuery}"`}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          {isTableView ? (
            <MenuTable
              items={filteredItems}
              selectedItems={selectedItems}
              onSelectItem={noop}
              onSelectAll={noop}
              onEdit={noop}
              onDelete={noop}
              onToggleAvailability={noop}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  onEdit={noop}
                  onDelete={noop}
                  onToggleAvailability={noop}
                  isSelected={selectedItems.includes(item._id)}
                  onSelect={noop}
                />
              ))}

              {filteredItems.length === 0 && (
                <div className="col-span-full p-12 text-center">
                  <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Không tìm thấy món ăn nào
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                  </p>
                  <Button variant="outline" onClick={noop}>
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Bulk Actions Bar */}
          <BulkActionsBar
            selectedCount={selectedItems.length}
            onClearSelection={noop}
            onBulkDelete={noop}
            onBulkToggleAvailability={noop}
            onBulkUpdateCategory={noop}
          />

          {/* Item Modal */}
          <MenuItemModal
            isOpen={showItemModal}
            onClose={noop}
            onSave={noop}
            onFieldChange={noop}
            item={editingItem}
            categories={categories}
          />

          {/* Delete Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={showDeleteDialog}
            onClose={noop}
            onConfirm={noop}
            title="Xóa món ăn"
            message={
              itemToDelete
                ? `Bạn có chắc chắn muốn xóa món "${menuItems.find((item) => item._id === itemToDelete)?.name}"? Hành động này không thể hoàn tác.`
                : 'Bạn có chắc chắn muốn xóa món ăn này?'
            }
            confirmText="Xóa"
            cancelText="Hủy"
            variant="danger"
            icon="Trash2"
          />

          {/* Bulk Delete Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={showBulkDeleteDialog}
            onClose={noop}
            onConfirm={noop}
            title="Xóa nhiều món ăn"
            message={`Bạn có chắc chắn muốn xóa ${selectedItems.length} món ăn đã chọn? Hành động này không thể hoàn tác.`}
            confirmText="Xóa tất cả"
            cancelText="Hủy"
            variant="danger"
            icon="Trash2"
          />

          {/* Add Category Modal */}
          {showCategoryModal && (
            <div className="fixed inset-0 z-[1300] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-black/50" onClick={noop} />
              <div className="relative bg-white dark:bg-surface border border-border rounded-lg shadow-modal w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Thêm danh mục mới</h2>
                  <Button variant="ghost" size="icon" onClick={noop}>
                    <Icon name="X" size={20} />
                  </Button>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <Input
                    label="Tên danh mục"
                    type="text"
                    value={newCategoryName}
                    onChange={noop}
                    placeholder="Nhập tên danh mục"
                    required
                  />
                  <Select
                    label="Biểu tượng"
                    options={[
                      { value: 'Coffee', label: 'Coffee - Đồ uống' },
                      { value: 'Soup', label: 'Soup - Khai vị' },
                      { value: 'UtensilsCrossed', label: 'UtensilsCrossed - Món chính' },
                      { value: 'IceCream', label: 'IceCream - Tráng miệng' },
                      { value: 'Cookie', label: 'Cookie - Đồ ăn vặt' },
                      { value: 'Pizza', label: 'Pizza' },
                      { value: 'Salad', label: 'Salad' },
                      { value: 'Wine', label: 'Wine - Rượu' },
                      { value: 'Utensils', label: 'Utensils - Tổng quát' }
                    ]}
                    value={categoryIcon}
                    onChange={noop}
                    placeholder="Chọn biểu tượng"
                  />
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Icon name={categoryIcon} size={20} className="text-primary" />
                    <span className="text-sm text-muted-foreground">Xem trước biểu tượng</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                  <Button variant="outline" onClick={noop}>
                    Hủy
                  </Button>
                  <Button
                    variant="default"
                    onClick={noop}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Thêm danh mục
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuSection;