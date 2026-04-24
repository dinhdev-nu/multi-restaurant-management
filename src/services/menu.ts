import { apiClient, unwrapResponseData } from './client';
import type { ApiSuccessResponse, AppError } from './types';
import type {
    MenuCategory,
    MenuCategoryWithCount,
    MenuItem,
    ListMenuCategoryQuery,
    ListMenuItemsQuery,
    MenuItemListResponse,
    CreateMenuCategoryPayload,
    UpdateMenuCategoryPayload,
    ReorderCommandPayload,
    CreateMenuItemPayload,
    UpdateMenuItemPayload,
    AddMenuItemImagePayload,
    PublicMenuResponse,
    PublicMenuSearchResponse,
    MenuImage
} from '@/types/menu-type';

/**
 * Normalizes API errors for menu endpoints
 */
export function toMenuEndpointError(operation: string, error: unknown): AppError {
    const defaultMsg = `Lỗi ${operation} dữ liệu menu`;
    if (typeof error === 'object' && error !== null) {
        const err = error as AppError;
        // Kiểm tra nếu là axios error
        if ('response' in err && typeof err.response === 'object' && err.response !== null) {
            const responseData = (err as any).response.data as ApiErrorResponse | undefined;
            if (responseData && responseData.errorCode) {
                return {
                    status: (err as any).response.status || 500,
                    errorCode: responseData.errorCode,
                    message: responseData.message || defaultMsg,
                    details: responseData.details,
                }
            }
        }
        return {
            status: err.status || 500,
            errorCode: err.errorCode || 'MENU_ERROR',
            message: err.message || defaultMsg,
            details: err.details,
        };
    }
    return {
        status: 500,
        errorCode: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : defaultMsg,
    };
}

interface ApiErrorResponse {
    success: boolean;
    errorCode: string;
    message: string;
    details: unknown | null;
}

// -----------------------------------------------------------------------------
// Category API
// -----------------------------------------------------------------------------

export async function createMenuCategory(restaurantId: string, payload: CreateMenuCategoryPayload): Promise<MenuCategory> {
    const response = await apiClient.post<ApiSuccessResponse<MenuCategory>>(
        `/restaurants/${restaurantId}/menu/categories`,
        payload
    );
    return unwrapResponseData(response);
}

export async function listMenuCategories(
    restaurantId: string,
    query?: ListMenuCategoryQuery
): Promise<{ data: MenuCategoryWithCount[] }> {
    const response = await apiClient.get<ApiSuccessResponse<{ data: MenuCategoryWithCount[] }>>(
        `/restaurants/${restaurantId}/menu/categories`,
        { params: query }
    );
    return unwrapResponseData(response);
}

export async function reorderMenuCategories(restaurantId: string, payload: ReorderCommandPayload): Promise<{ reordered: boolean }> {
    const response = await apiClient.patch<ApiSuccessResponse<{ reordered: boolean }>>(
        `/restaurants/${restaurantId}/menu/categories/reorder`,
        payload
    );
    return unwrapResponseData(response);
}

export async function updateMenuCategory(
    restaurantId: string,
    categoryId: string,
    payload: UpdateMenuCategoryPayload
): Promise<{ updated: boolean; category: MenuCategory }> {
    const response = await apiClient.patch<ApiSuccessResponse<{ updated: boolean; category: MenuCategory }>>(
        `/restaurants/${restaurantId}/menu/categories/${categoryId}`,
        payload
    );
    return unwrapResponseData(response);
}

export async function toggleMenuCategory(
    restaurantId: string,
    categoryId: string,
    isActive: boolean
): Promise<{ is_active: boolean; message: string }> {
    const response = await apiClient.patch<ApiSuccessResponse<{ is_active: boolean; message: string }>>(
        `/restaurants/${restaurantId}/menu/categories/${categoryId}/toggle`,
        { is_active: isActive }
    );
    return unwrapResponseData(response);
}

export async function deleteMenuCategory(restaurantId: string, categoryId: string): Promise<{ deleted: boolean }> {
    const response = await apiClient.delete<ApiSuccessResponse<{ deleted: boolean }>>(
        `/restaurants/${restaurantId}/menu/categories/${categoryId}`
    );
    return unwrapResponseData(response);
}

// -----------------------------------------------------------------------------
// MenuItem API
// -----------------------------------------------------------------------------

export async function createMenuItem(restaurantId: string, payload: CreateMenuItemPayload): Promise<MenuItem> {
    const response = await apiClient.post<ApiSuccessResponse<MenuItem>>(
        `/restaurants/${restaurantId}/menu/items`,
        payload
    );
    return unwrapResponseData(response);
}

export async function listMenuItems(
    restaurantId: string,
    query?: ListMenuItemsQuery
): Promise<MenuItemListResponse> {
    const response = await apiClient.get<ApiSuccessResponse<MenuItemListResponse>>(
        `/restaurants/${restaurantId}/menu/items`,
        { params: query }
    );
    return unwrapResponseData(response);
}

export async function reorderMenuItems(
    restaurantId: string,
    categoryId: string,
    payload: ReorderCommandPayload
): Promise<{ reordered: boolean }> {
    const response = await apiClient.patch<ApiSuccessResponse<{ reordered: boolean }>>(
        `/restaurants/${restaurantId}/menu/items/reorder`,
        { category_id: categoryId, order: payload.order }
    );
    return unwrapResponseData(response);
}

export async function getMenuItemDetail(restaurantId: string, itemId: string): Promise<MenuItem> {
    const response = await apiClient.get<ApiSuccessResponse<MenuItem>>(
        `/restaurants/${restaurantId}/menu/items/${itemId}`
    );
    return unwrapResponseData(response);
}

export async function updateMenuItem(
    restaurantId: string,
    itemId: string,
    payload: UpdateMenuItemPayload
): Promise<{ updated: boolean; item: MenuItem }> {
    const response = await apiClient.patch<ApiSuccessResponse<{ updated: boolean; item: MenuItem }>>(
        `/restaurants/${restaurantId}/menu/items/${itemId}`,
        payload
    );
    return unwrapResponseData(response);
}

export async function toggleMenuItemAvailability(
    restaurantId: string,
    itemId: string,
    isAvailable: boolean
): Promise<{ is_available: boolean; message: string; warnings?: string[] }> {
    const response = await apiClient.patch<ApiSuccessResponse<{ is_available: boolean; message: string; warnings?: string[] }>>(
        `/restaurants/${restaurantId}/menu/items/${itemId}/availability`,
        { is_available: isAvailable }
    );
    return unwrapResponseData(response);
}

export async function toggleMenuItemFeatured(
    restaurantId: string,
    itemId: string,
    isFeatured: boolean
): Promise<{ is_featured: boolean; message: string }> {
    const response = await apiClient.patch<ApiSuccessResponse<{ is_featured: boolean; message: string }>>(
        `/restaurants/${restaurantId}/menu/items/${itemId}/featured`,
        { is_featured: isFeatured }
    );
    return unwrapResponseData(response);
}

export async function addMenuItemImage(
    restaurantId: string,
    itemId: string,
    payload: AddMenuItemImagePayload
): Promise<{ images: MenuImage[]; count: number }> {
    const response = await apiClient.post<ApiSuccessResponse<{ images: MenuImage[]; count: number }>>(
        `/restaurants/${restaurantId}/menu/items/${itemId}/images`,
        payload
    );
    return unwrapResponseData(response);
}

export async function removeMenuItemImage(
    restaurantId: string,
    itemId: string,
    index: number
): Promise<{ images: MenuImage[]; count: number }> {
    const response = await apiClient.delete<ApiSuccessResponse<{ images: MenuImage[]; count: number }>>(
        `/restaurants/${restaurantId}/menu/items/${itemId}/images/${index}`
    );
    return unwrapResponseData(response);
}

export async function deleteMenuItem(restaurantId: string, itemId: string): Promise<{ deleted: boolean }> {
    const response = await apiClient.delete<ApiSuccessResponse<{ deleted: boolean }>>(
        `/restaurants/${restaurantId}/menu/items/${itemId}`
    );
    return unwrapResponseData(response);
}

// -----------------------------------------------------------------------------
// Public Menu API
// -----------------------------------------------------------------------------

export async function getPublicMenu(slug: string): Promise<PublicMenuResponse> {
    const response = await apiClient.get<ApiSuccessResponse<PublicMenuResponse>>(
        `/public/restaurants/${slug}/menu`
    );
    return unwrapResponseData(response);
}

export async function searchPublicMenu(
    slug: string,
    q: string,
    page: number = 1,
    limit: number = 20
): Promise<PublicMenuSearchResponse> {
    const response = await apiClient.get<ApiSuccessResponse<PublicMenuSearchResponse>>(
        `/public/restaurants/${slug}/menu/search`,
        { params: { q, page, limit } }
    );
    return unwrapResponseData(response);
}
