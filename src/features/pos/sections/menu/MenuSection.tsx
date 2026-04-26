import React from 'react';
import Icon from '@/components/AppIcon';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { Spinner } from '@/components/ui/spinner';
import Button from '../../components/Button';
import Select from '../../components/Select';

// Import components
import MenuItemCard from './components/MenuItemCard';
import MenuItemModal from './components/MenuItemModal';
import MenuTable from './components/MenuTable';
import CategoryFilter from './components/CategoryFilter';
import MenuStats from './components/MenuStats';
import CategoryManagerModal from './components/CategoryManagerModal';
import CategoryFormModal from './components/CategoryFormModal';

// Import hooks
import { useMenuManagement } from './hooks/useMenuManagement';
import { useMenuForm } from './hooks/useMenuForm';
import { useCategoryForm } from './hooks/useCategoryForm';
import { useRequiredPosData } from '@/features/pos/contexts/usePosContext';

const MenuSection: React.FC = () => {
    const posData = useRequiredPosData();
    const restaurantId = posData.restaurant._id;
    console.log('MenuSection rendered with restaurantId:', restaurantId);
    const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('table');
    const isTableView = viewMode === 'table';

    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState<string | null>(null);
    const [showCategoryManager, setShowCategoryManager] = React.useState(false);
    const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = React.useState(false);
    const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(null);
    const [showToggleCategoryDialog, setShowToggleCategoryDialog] = React.useState(false);
    const [categoryToToggle, setCategoryToToggle] = React.useState<{ id: string; name: string; isActive: boolean } | null>(null);
    const [checkingToggleCategoryId, setCheckingToggleCategoryId] = React.useState<string | null>(null);

    // Management hooks
    const {
        isLoadingData,
        categories,
        items,
        page,
        setPage,
        pagination,
        filterCategory,
        filterAvailability,
        filterFeatured,
        setLimit,
        handleCategoryChange,
        handleAvailabilityChange,
        handleFeaturedChange,
        menuStats,
        categoryMap,
        refetch,
        isItemActionPending,
        isCategoryActionPending,
        handleToggleAvailability,
        handleToggleFeatured,
        handleReorderItem,
        handleDeleteItem,
        handleReorderCategory,
        handleToggleCategoryActive,
        handleDeleteCategory,
        checkCategoryHasActiveItemsInCategory,
    } = useMenuManagement(restaurantId);

    const {
        showItemModal,
        setShowItemModal,
        isSubmitting: isSubmittingMenu,
        isUploadingImage: isUploadingMenuImage,
        isEditing: isEditingMenuItem,
        formData: itemFormData,
        imagePreviewUrls,
        handleFieldChange,
        handleImageFileChange,
        handleAddImageUrl,
        handleRemoveImageAt,
        handleSubmit: handleSubmitMenu,
        openAddItem,
        openEditItem,
        resetForm: resetMenuForm,
    } = useMenuForm(restaurantId, refetch);

    const {
        showCategoryModal,
        setShowCategoryModal,
        isSubmitting: isSubmittingCategory,
        editingCategoryId,
        openAddCategory,
        openEditCategory,
        categoryName,
        setCategoryName,
        categoryDescription,
        setCategoryDescription,
        categoryImageUrl,
        setCategoryImageUrl,
        categorySortOrder,
        setCategorySortOrder,
        handleSubmitCategory,
        resetForm: resetCategoryForm,
    } = useCategoryForm(restaurantId, refetch);

    // Category filter formatting properties that child expects
    const uiCategories = React.useMemo(() => categories.map((cat) => ({
        id: cat._id,
        name: cat.name,
        imageUrl: cat.image_url,
    })), [categories]);

    const uiItemCounts = React.useMemo(() => categories.reduce((acc, cat) => {
        acc[cat._id] = cat.item_count || 0;
        return acc;
    }, {} as Record<string, number>), [categories]);

    const requestToggleCategory = React.useCallback(async (categoryId: string, isActive: boolean) => {
        const category = categories.find((cat) => cat._id === categoryId);
        if (!category) return;

        if (!isActive) {
            await handleToggleCategoryActive(categoryId, isActive);
            return;
        }

        setCheckingToggleCategoryId(categoryId);
        try {
            const hasActiveItems = await checkCategoryHasActiveItemsInCategory(categoryId);
            if (hasActiveItems) {
                setCategoryToToggle({ id: categoryId, name: category.name, isActive });
                setShowToggleCategoryDialog(true);
                return;
            }
            await handleToggleCategoryActive(categoryId, isActive);
        } finally {
            setCheckingToggleCategoryId(null);
        }
    }, [categories, checkCategoryHasActiveItemsInCategory, handleToggleCategoryActive]);

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
                                        onClick={() => setViewMode('table')}
                                        iconName="Table"
                                        className="px-3"
                                    >
                                        Bảng
                                    </Button>
                                    <Button
                                        variant={isTableView ? 'ghost' : 'default'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        iconName="Grid3X3"
                                        className="px-3"
                                    >
                                        Lưới
                                    </Button>
                                </div>

                                <Button
                                    variant="default"
                                    onClick={openAddItem}
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

                    {/* Filters and Sorts */}
                    <div className="bg-card border border-border rounded-lg p-6 mb-6">
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                <Select
                                    placeholder="Lọc trạng thái bán"
                                    options={[
                                        { value: 'all', label: 'Tất cả trạng thái' },
                                        { value: 'available', label: 'Đang bán' },
                                        { value: 'unavailable', label: 'Tạm ngưng' },
                                    ]}
                                    value={filterAvailability}
                                    onChange={(e) => handleAvailabilityChange(e.target.value as 'all' | 'available' | 'unavailable')}
                                />

                                <Select
                                    placeholder="Lọc nổi bật"
                                    options={[
                                        { value: 'all', label: 'Tất cả' },
                                        { value: 'featured', label: 'Nổi bật' },
                                        { value: 'normal', label: 'Bình thường' },
                                    ]}
                                    value={filterFeatured}
                                    onChange={(e) => handleFeaturedChange(e.target.value as 'all' | 'featured' | 'normal')}
                                />

                                <Select
                                    placeholder="Lọc danh mục"
                                    options={[
                                        { value: 'all', label: 'Tất cả danh mục' },
                                        ...uiCategories.map((category) => ({ value: category.id, label: category.name })),
                                    ]}
                                    value={filterCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                />

                                <Select
                                    placeholder="Số món mỗi trang"
                                    options={[
                                        { value: '10', label: '10 món' },
                                        { value: '25', label: '25 món' },
                                        { value: '50', label: '50 món' },
                                        { value: '100', label: '100 món' },
                                    ]}
                                    value={String(pagination.limit || 50)}
                                    onChange={(e) => {
                                        setPage(1);
                                        setLimit(Number(e.target.value));
                                    }}
                                />
                            </div>

                            {/* Category Filter */}
                            <CategoryFilter
                                categories={uiCategories}
                                selectedCategory={filterCategory}
                                onCategoryChange={handleCategoryChange}
                                itemCounts={uiItemCounts}
                                onAddCategory={openAddCategory}
                                onManageCategories={() => setShowCategoryManager(true)}
                            />
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">
                            Hiển thị {items.length} món ăn
                        </p>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {items.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Icon name="Filter" size={16} />
                                    <span>
                                        {filterCategory !== 'all' && `Danh mục: ${categoryMap[filterCategory] ?? ''}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    {isTableView ? (
                        <MenuTable
                            items={items}
                            categoryMap={categoryMap}
                            onEdit={openEditItem}
                            onDelete={(id) => { setItemToDelete(id); setShowDeleteDialog(true); }}
                            onToggleAvailability={handleToggleAvailability}
                            onToggleFeatured={handleToggleFeatured}
                            onMoveItem={handleReorderItem}
                            isItemActionPending={isItemActionPending}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {items.map((item) => (
                                <MenuItemCard
                                    key={item._id}
                                    item={item}
                                    categoryName={categoryMap[item.category_id] ?? 'Không rõ'}
                                    onEdit={openEditItem}
                                    onDelete={(id) => { setItemToDelete(id); setShowDeleteDialog(true); }}
                                    onToggleAvailability={handleToggleAvailability}
                                    onToggleFeatured={handleToggleFeatured}
                                    onMoveItem={handleReorderItem}
                                    isItemActionPending={isItemActionPending}
                                />
                            ))}

                            {items.length === 0 && (
                                <div className="col-span-full p-12 text-center">
                                    <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">
                                        Không tìm thấy món ăn nào
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Thử thay đổi bộ lọc hoặc thêm món mới
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="mt-6 flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                            Trước
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Trang {pagination.page}/{Math.max(pagination.total_pages || 1, 1)}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= Math.max(pagination.total_pages || 1, 1)}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Sau
                        </Button>
                    </div>

                    {/* Item Modal */}
                    <MenuItemModal
                        isOpen={showItemModal}
                        isLoading={isSubmittingMenu || isUploadingMenuImage}
                        isEditing={isEditingMenuItem}
                        onClose={() => { setShowItemModal(false); resetMenuForm(); }}
                        onSave={handleSubmitMenu}
                        onFieldChange={handleFieldChange}
                        onImageFileChange={handleImageFileChange}
                        onAddImageUrl={handleAddImageUrl}
                        onRemoveImageAt={handleRemoveImageAt}
                        imagePreviewUrls={imagePreviewUrls}
                        item={itemFormData}
                        categories={uiCategories}
                    />

                    {/* Delete Confirmation Dialog */}
                    <ConfirmationDialog
                        isOpen={showDeleteDialog}
                        onClose={() => { setShowDeleteDialog(false); setItemToDelete(null); }}
                        onConfirm={async () => {
                            if (itemToDelete) {
                                const ok = await handleDeleteItem(itemToDelete);
                                if (ok) {
                                    setShowDeleteDialog(false);
                                    setItemToDelete(null);
                                }
                            }
                        }}
                        title="Xóa món ăn"
                        message={'Bạn có chắc chắn muốn xóa món này? Hành động này thao tác vĩnh viễn trên cơ sở dữ liệu.'}
                        confirmText="Xóa"
                        cancelText="Hủy"
                        variant="danger"
                        icon="Trash2"
                        isLoading={itemToDelete ? isItemActionPending(itemToDelete, 'delete') : false}
                    />

                    <ConfirmationDialog
                        isOpen={showDeleteCategoryDialog}
                        onClose={() => {
                            setShowDeleteCategoryDialog(false);
                            setCategoryToDelete(null);
                        }}
                        onConfirm={async () => {
                            if (categoryToDelete) {
                                const ok = await handleDeleteCategory(categoryToDelete);
                                if (ok) {
                                    setShowDeleteCategoryDialog(false);
                                    setCategoryToDelete(null);
                                }
                            }
                        }}
                        title="Xóa danh mục"
                        message={'Danh mục chỉ có thể xóa khi không còn món. Bạn có chắc chắn muốn tiếp tục?'}
                        confirmText="Xóa"
                        cancelText="Hủy"
                        variant="danger"
                        icon="Trash2"
                        isLoading={categoryToDelete ? isCategoryActionPending(categoryToDelete, 'delete') : false}
                    />

                    <ConfirmationDialog
                        isOpen={showToggleCategoryDialog}
                        onClose={() => {
                            setShowToggleCategoryDialog(false);
                            setCategoryToToggle(null);
                        }}
                        onConfirm={async () => {
                            if (categoryToToggle) {
                                const ok = await handleToggleCategoryActive(categoryToToggle.id, categoryToToggle.isActive);
                                if (ok) {
                                    setShowToggleCategoryDialog(false);
                                    setCategoryToToggle(null);
                                }
                            }
                        }}
                        title="Ẩn danh mục còn món đang bán"
                        message={`Danh mục "${categoryToToggle?.name ?? ''}" vẫn còn món đang ở trạng thái active. Bạn có muốn tiếp tục ẩn danh mục này không?`}
                        confirmText="Vẫn ẩn"
                        cancelText="Hủy"
                        variant="warning"
                        icon="AlertTriangle"
                        isLoading={categoryToToggle ? isCategoryActionPending(categoryToToggle.id, 'toggle-active') : false}
                    />

                    <CategoryManagerModal
                        isOpen={showCategoryManager}
                        categories={categories}
                        onClose={() => setShowCategoryManager(false)}
                        onEdit={(category) => {
                            openEditCategory(category);
                            setShowCategoryManager(false);
                        }}
                        onToggleActive={requestToggleCategory}
                        onDelete={(categoryId) => {
                            setCategoryToDelete(categoryId);
                            setShowDeleteCategoryDialog(true);
                        }}
                        onMove={handleReorderCategory}
                        checkingToggleCategoryId={checkingToggleCategoryId}
                        isCategoryActionPending={isCategoryActionPending}
                    />

                    <CategoryFormModal
                        isOpen={showCategoryModal}
                        isSubmitting={isSubmittingCategory}
                        isEditing={Boolean(editingCategoryId)}
                        categoryName={categoryName}
                        categoryDescription={categoryDescription}
                        categoryImageUrl={categoryImageUrl}
                        categorySortOrder={categorySortOrder}
                        onClose={() => {
                            setShowCategoryModal(false);
                            resetCategoryForm();
                        }}
                        onSubmit={handleSubmitCategory}
                        onCategoryNameChange={setCategoryName}
                        onCategoryDescriptionChange={setCategoryDescription}
                        onCategoryImageUrlChange={setCategoryImageUrl}
                        onCategorySortOrderChange={setCategorySortOrder}
                    />
                </div>
            )}
        </div>
    );
};

export default MenuSection;