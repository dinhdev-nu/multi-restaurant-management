import React from 'react';
import { toast } from 'sonner';
import {
    deleteMenuCategory,
    listMenuItems,
    listMenuCategories,
    reorderMenuCategories,
    reorderMenuItems,
    toggleMenuCategory,
    toggleMenuItemAvailability,
    toggleMenuItemFeatured,
    deleteMenuItem,
    toMenuEndpointError,
} from '@/services/menu';
import type { MenuItem, MenuCategoryWithCount } from '@/types/menu-type';
import { MENU_SECTION_MOCK_CATEGORIES, MENU_SECTION_MOCK_ITEMS } from '../menu-mock';

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

const DEFAULT_PAGINATION: PaginationState = {
    page: 1,
    limit: 50,
    total: 0,
    total_pages: 1,
};

type ItemAction = 'toggle-availability' | 'toggle-featured' | 'reorder-up' | 'reorder-down' | 'delete';
type CategoryAction = 'toggle-active' | 'reorder-up' | 'reorder-down' | 'delete';

const isMockId = (id: string) => id.startsWith('mock-');

export function useMenuManagement(restaurantId: string) {
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    
    // Categories and Items
    const [categories, setCategories] = React.useState<MenuCategoryWithCount[]>([]);
    const [items, setItems] = React.useState<MenuItem[]>([]);
    
    // Filters & Pagination
    const [filterCategory, setFilterCategory] = React.useState<string>('all');
    const [filterAvailability, setFilterAvailability] = React.useState<'all' | 'available' | 'unavailable'>('all');
    const [filterFeatured, setFilterFeatured] = React.useState<'all' | 'featured' | 'normal'>('all');
    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(50);
    const [pagination, setPagination] = React.useState<PaginationState>(DEFAULT_PAGINATION);
    const [usingMockData, setUsingMockData] = React.useState(false);
    const [pendingActions, setPendingActions] = React.useState<Record<string, boolean>>({});

    const getActionKey = React.useCallback((scope: 'item' | 'category', action: string, id: string) => {
        return `${scope}:${action}:${id}`;
    }, []);

    const setActionPending = React.useCallback((scope: 'item' | 'category', action: string, id: string, pending: boolean) => {
        const key = getActionKey(scope, action, id);
        setPendingActions((prev) => {
            if (pending) return { ...prev, [key]: true };
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, [getActionKey]);

    const isItemActionPending = React.useCallback((itemId: string, action: ItemAction) => {
        return Boolean(pendingActions[getActionKey('item', action, itemId)]);
    }, [pendingActions, getActionKey]);

    const isCategoryActionPending = React.useCallback((categoryId: string, action: CategoryAction) => {
        return Boolean(pendingActions[getActionKey('category', action, categoryId)]);
    }, [pendingActions, getActionKey]);

    const applyMockData = React.useCallback(() => {
        const allItems = MENU_SECTION_MOCK_ITEMS.filter((item) => {
            const matchesCategory = filterCategory === 'all' || item.category_id === filterCategory;
            const matchesAvailability = filterAvailability === 'all'
                || (filterAvailability === 'available' ? item.is_available : !item.is_available);
            const matchesFeatured = filterFeatured === 'all'
                || (filterFeatured === 'featured' ? item.is_featured : !item.is_featured);
            return matchesCategory && matchesAvailability && matchesFeatured;
        });
        const start = (page - 1) * limit;
        const data = allItems.slice(start, start + limit);

        setCategories(MENU_SECTION_MOCK_CATEGORIES);
        setItems(data);
        setPagination({
            page,
            limit,
            total: allItems.length,
            total_pages: Math.max(Math.ceil(allItems.length / limit), 1),
        });
        setUsingMockData(true);
    }, [filterAvailability, filterCategory, filterFeatured, limit, page]);

    // Fetch lists
    const fetchMenuData = React.useCallback(async (silent = false) => {
        if (!silent) setIsLoadingData(true);
        try {
            // Fetch categories
            const cats = await listMenuCategories(restaurantId, { include_inactive: true });
            setCategories(cats.data);

            // Fetch items
            const queryParams: any = { page, limit };
            if (filterCategory !== 'all') {
                queryParams.category_id = filterCategory;
            }
            if (filterAvailability !== 'all') {
                queryParams.is_available = filterAvailability === 'available';
            }
            if (filterFeatured !== 'all') {
                queryParams.is_featured = filterFeatured === 'featured';
            }

            const itemsRes = await listMenuItems(restaurantId, queryParams);
            const serverHasData = cats.data.length > 0 || itemsRes.data.length > 0;

            if (serverHasData) {
                setCategories(cats.data);
                setItems(itemsRes.data);
                setPagination(itemsRes.pagination || DEFAULT_PAGINATION);
                setUsingMockData(false);
            } else {
                applyMockData();
            }
            
        } catch (error) {
            applyMockData();
            toast.error(`${toMenuEndpointError('list', error).message}. Đang hiển thị dữ liệu mẫu để kiểm tra giao diện.`);
        } finally {
            if (!silent) setIsLoadingData(false);
        }
    }, [restaurantId, page, limit, filterCategory, filterAvailability, filterFeatured, applyMockData]);

    React.useEffect(() => {
        void fetchMenuData();
    }, [fetchMenuData]);

    // Computed Stats
    const menuStats = React.useMemo(() => {
        const available = items.filter(i => i.is_available).length;
        return {
            total: items.length,
            available,
            unavailable: items.length - available,
        };
    }, [items]);

    // Category mappings for easy access
    const categoryMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        for (const cat of categories) {
            map[cat._id] = cat.name;
        }
        return map;
    }, [categories]);

    // Actions
    const handleToggleAvailability = async (itemId: string, currentAvailable: boolean) => {
        if (isMockId(itemId)) {
            toast.info('Dữ liệu mẫu chỉ dùng để kiểm tra giao diện');
            return false;
        }
        if (isItemActionPending(itemId, 'toggle-availability')) return false;

        setActionPending('item', 'toggle-availability', itemId, true);
        try {
            await toggleMenuItemAvailability(restaurantId, itemId, !currentAvailable);
            toast.success(!currentAvailable ? 'Đã kích hoạt món' : 'Đã tạm ngưng món');
            await fetchMenuData(true);
            return true;
        } catch (error) {
            toast.error(toMenuEndpointError('toggle', error).message);
            return false;
        } finally {
            setActionPending('item', 'toggle-availability', itemId, false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (isMockId(itemId)) {
            toast.info('Dữ liệu mẫu chỉ dùng để kiểm tra giao diện');
            return false;
        }
        if (isItemActionPending(itemId, 'delete')) return false;

        setActionPending('item', 'delete', itemId, true);
        try {
            await deleteMenuItem(restaurantId, itemId);
            toast.success('Đã xóa món ăn');
            await fetchMenuData(true);
            return true;
        } catch (error) {
            toast.error(toMenuEndpointError('delete', error).message);
            return false;
        } finally {
            setActionPending('item', 'delete', itemId, false);
        }
    };

    const handleToggleFeatured = async (itemId: string, currentFeatured: boolean) => {
        if (isMockId(itemId)) {
            toast.info('Dữ liệu mẫu chỉ dùng để kiểm tra giao diện');
            return false;
        }
        if (isItemActionPending(itemId, 'toggle-featured')) return false;

        setActionPending('item', 'toggle-featured', itemId, true);
        try {
            await toggleMenuItemFeatured(restaurantId, itemId, !currentFeatured);
            toast.success(!currentFeatured ? 'Đã đánh dấu nổi bật' : 'Đã bỏ nổi bật');
            await fetchMenuData(true);
            return true;
        } catch (error) {
            toast.error(toMenuEndpointError('toggle featured', error).message);
            return false;
        } finally {
            setActionPending('item', 'toggle-featured', itemId, false);
        }
    };

    const handleReorderItem = async (itemId: string, direction: 'up' | 'down') => {
        if (isMockId(itemId)) {
            toast.info('Dữ liệu mẫu chỉ dùng để kiểm tra giao diện');
            return false;
        }

        const action: ItemAction = direction === 'up' ? 'reorder-up' : 'reorder-down';
        if (isItemActionPending(itemId, action)) return false;

        const current = items.find((item) => item._id === itemId);
        if (!current) return false;

        const group = [...items]
            .filter((item) => item.category_id === current.category_id)
            .sort((a, b) => a.sort_order - b.sort_order);
        const currentIndex = group.findIndex((item) => item._id === itemId);
        if (currentIndex < 0) return false;

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= group.length) return false;

        const reordered = [...group];
        [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];

        setActionPending('item', action, itemId, true);
        try {
            await reorderMenuItems(restaurantId, current.category_id, {
                order: reordered.map((item) => item._id),
            });
            await fetchMenuData(true);
            return true;
        } catch (error) {
            toast.error(toMenuEndpointError('reorder item', error).message);
            return false;
        } finally {
            setActionPending('item', action, itemId, false);
        }
    };

    const handleReorderCategory = async (categoryId: string, direction: 'up' | 'down') => {
        if (isMockId(categoryId)) {
            toast.info('Dữ liệu mẫu chỉ dùng để kiểm tra giao diện');
            return false;
        }

        const action: CategoryAction = direction === 'up' ? 'reorder-up' : 'reorder-down';
        if (isCategoryActionPending(categoryId, action)) return false;

        const ordered = [...categories].sort((a, b) => a.sort_order - b.sort_order);
        const currentIndex = ordered.findIndex((cat) => cat._id === categoryId);
        if (currentIndex < 0) return false;

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= ordered.length) return false;

        const reordered = [...ordered];
        [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];

        setActionPending('category', action, categoryId, true);
        try {
            await reorderMenuCategories(restaurantId, { order: reordered.map((cat) => cat._id) });
            await fetchMenuData(true);
            return true;
        } catch (error) {
            toast.error(toMenuEndpointError('reorder category', error).message);
            return false;
        } finally {
            setActionPending('category', action, categoryId, false);
        }
    };

    const handleToggleCategoryActive = async (categoryId: string, isActive: boolean) => {
        if (isMockId(categoryId)) {
            toast.info('Dữ liệu mẫu chỉ dùng để kiểm tra giao diện');
            return false;
        }
        if (isCategoryActionPending(categoryId, 'toggle-active')) return false;

        setActionPending('category', 'toggle-active', categoryId, true);
        try {
            await toggleMenuCategory(restaurantId, categoryId, !isActive);
            toast.success(!isActive ? 'Đã kích hoạt danh mục' : 'Đã ẩn danh mục');
            await fetchMenuData(true);
            return true;
        } catch (error) {
            toast.error(toMenuEndpointError('toggle category', error).message);
            return false;
        } finally {
            setActionPending('category', 'toggle-active', categoryId, false);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (isMockId(categoryId)) {
            toast.info('Dữ liệu mẫu chỉ dùng để kiểm tra giao diện');
            return false;
        }
        if (isCategoryActionPending(categoryId, 'delete')) return false;

        setActionPending('category', 'delete', categoryId, true);
        try {
            await deleteMenuCategory(restaurantId, categoryId);
            toast.success('Đã xóa danh mục');
            if (filterCategory === categoryId) {
                setFilterCategory('all');
            }
            await fetchMenuData(true);
            return true;
        } catch (error) {
            toast.error(toMenuEndpointError('delete category', error).message);
            return false;
        } finally {
            setActionPending('category', 'delete', categoryId, false);
        }
    };

    const checkCategoryHasActiveItemsInCategory = async (categoryId: string): Promise<boolean> => {
        if (isMockId(categoryId)) {
            return items.some((item) => item.category_id === categoryId && item.is_available);
        }

        try {
            const result = await listMenuItems(restaurantId, {
                category_id: categoryId,
                is_available: true,
                page: 1,
                limit: 1,
            });

            const total = typeof result.pagination?.total === 'number'
                ? result.pagination.total
                : result.data.length;
            return total > 0;
        } catch {
            return false;
        }
    };

    const handleCategoryChange = (categoryId: string) => {
        setFilterCategory(categoryId);
        setPage(1);
    };

    const handleAvailabilityChange = (status: 'all' | 'available' | 'unavailable') => {
        setFilterAvailability(status);
        setPage(1);
    };

    const handleFeaturedChange = (featured: 'all' | 'featured' | 'normal') => {
        setFilterFeatured(featured);
        setPage(1);
    };

    return {
        isLoadingData,
        categories,
        items,
        page,
        setPage,
        limit,
        pagination,
        usingMockData,
        filterCategory,
        filterAvailability,
        filterFeatured,
        handleCategoryChange,
        handleAvailabilityChange,
        handleFeaturedChange,
        setLimit,
        menuStats,
        categoryMap,
        refetch: () => fetchMenuData(true),
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
    };
}
