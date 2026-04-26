import React from 'react';
import { toast } from 'sonner';
import {
    addMenuItemImage,
    createMenuItem,
    getMenuItemDetail,
    removeMenuItemImage,
    toggleMenuItemAvailability,
    toggleMenuItemFeatured,
    updateMenuItem,
    toMenuEndpointError,
} from '@/services/menu';
import { uploadSingleFile } from '@/services/uploads';
import type { MenuItem } from '@/types/menu-type';
import type { MenuItemFormData } from '../components/MenuItemModal';

const DEFAULT_MENU_ITEM: MenuItemFormData = {
    name: '',
    description: '',
    price: '',
    sortOrder: '',
    category: '',
    imageUrls: [],
    status: 'available',
    featured: 'normal',
};

export function useMenuForm(restaurantId: string, onSuccess: () => void) {
    const [showItemModal, setShowItemModal] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isUploadingImage, setIsUploadingImage] = React.useState(false);
    const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
    const [editingItemDetail, setEditingItemDetail] = React.useState<MenuItem | null>(null);
    const [formData, setFormData] = React.useState<MenuItemFormData>(DEFAULT_MENU_ITEM);
    const uploadRequestIdRef = React.useRef(0);

    const areImageListsEqual = React.useCallback((a: string[], b: string[]) => {
        if (a.length !== b.length) return false;
        return a.every((value, index) => value === b[index]);
    }, []);

    const resetForm = React.useCallback(() => {
        setFormData(DEFAULT_MENU_ITEM);
        setEditingItemId(null);
        setEditingItemDetail(null);
        setIsUploadingImage(false);
    }, []);

    const openAddItem = React.useCallback(() => {
        resetForm();
        setShowItemModal(true);
    }, [resetForm]);

    const openEditItem = React.useCallback(async (item: MenuItem) => {
        setIsSubmitting(true);
        try {
            const detail = await getMenuItemDetail(restaurantId, item._id);
            const imageUrls = detail.images?.map((img) => img.url) ?? [];

            setEditingItemId(detail._id);
            setEditingItemDetail(detail);
            setFormData({
                name: detail.name,
                description: detail.description || '',
                price: detail.base_price.toString(),
                sortOrder: detail.sort_order.toString(),
                category: detail.category_id,
                imageUrls,
                status: detail.is_available ? 'available' : 'unavailable',
                featured: detail.is_featured ? 'featured' : 'normal',
            });
            setShowItemModal(true);
        } catch (error) {
            toast.error(toMenuEndpointError('detail', error).message);
        } finally {
            setIsSubmitting(false);
        }
    }, [restaurantId]);

    const handleFieldChange = React.useCallback((field: keyof MenuItemFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleImageFileChange = React.useCallback((files: File[]) => {
        if (!files.length) {
            return;
        }

        const requestId = uploadRequestIdRef.current + 1;
        uploadRequestIdRef.current = requestId;
        setIsUploadingImage(true);

        void (async () => {
            try {
                const uploadedFiles = await Promise.all(files.map((file) => uploadSingleFile(file)));
                if (uploadRequestIdRef.current !== requestId) return;

                const uploadedUrls = uploadedFiles.map((uploaded) => uploaded.url);
                setFormData((prev) => ({
                    ...prev,
                    imageUrls: [...prev.imageUrls, ...uploadedUrls],
                }));
                toast.success('Tải ảnh món ăn thành công');
            } catch (error) {
                if (uploadRequestIdRef.current === requestId) {
                    toast.error('Không thể tải ảnh món ăn');
                }
            } finally {
                if (uploadRequestIdRef.current === requestId) {
                    setIsUploadingImage(false);
                }
            }
        })();
    }, []);

    const handleAddImageUrl = React.useCallback((url: string) => {
        const normalized = url.trim();
        if (!normalized) return;
        setFormData((prev) => ({
            ...prev,
            imageUrls: [...prev.imageUrls, normalized],
        }));
    }, []);

    const handleRemoveImageAt = React.useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, i) => i !== index),
        }));
    }, []);

    const handleSubmit = async () => {
        if (!formData.name || !formData.price || !formData.category) {
            toast.error('Vui lòng nhập đầy đủ Tên, Giá và Chọn danh mục');
            return;
        }

        const normalizedSortOrder = formData.sortOrder.trim();
        if (normalizedSortOrder) {
            const parsed = Number(normalizedSortOrder);
            if (!Number.isInteger(parsed) || parsed < 0) {
                toast.error('Thứ tự hiển thị phải là số nguyên >= 0');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const price = parseFloat(formData.price) || 0;
            const is_available = formData.status === 'available';
            const is_featured = formData.featured === 'featured';
            const normalizedImageUrls = formData.imageUrls
                .map((url) => url.trim())
                .filter(Boolean);

            if (isUploadingImage) {
                toast.error('Đang tải ảnh, vui lòng chờ trong giây lát');
                setIsSubmitting(false);
                return;
            }

            if (editingItemId) {
                const current = editingItemDetail ?? await getMenuItemDetail(restaurantId, editingItemId);
                await updateMenuItem(restaurantId, editingItemId, {
                    name: formData.name.trim(),
                    description: formData.description.trim() || undefined,
                    base_price: price,
                    category_id: formData.category,
                });

                if (current.is_available !== is_available) {
                    await toggleMenuItemAvailability(restaurantId, editingItemId, is_available);
                }
                if (current.is_featured !== is_featured) {
                    await toggleMenuItemFeatured(restaurantId, editingItemId, is_featured);
                }

                const currentImageUrls = current.images?.map((img) => img.url) ?? [];
                if (!areImageListsEqual(normalizedImageUrls, currentImageUrls)) {
                    for (let index = current.images.length - 1; index >= 0; index -= 1) {
                        await removeMenuItemImage(restaurantId, editingItemId, index);
                    }

                    for (const url of normalizedImageUrls) {
                        await addMenuItemImage(restaurantId, editingItemId, {
                            url,
                            alt: formData.name.trim(),
                        });
                    }
                }

                toast.success('Cập nhật món thành công');
            } else {
                const created = await createMenuItem(restaurantId, {
                    name: formData.name.trim(),
                    description: formData.description.trim() || undefined,
                    base_price: price,
                    category_id: formData.category,
                    is_available,
                    is_featured,
                    sort_order: normalizedSortOrder ? Number(normalizedSortOrder) : undefined,
                });

                for (const url of normalizedImageUrls) {
                    await addMenuItemImage(restaurantId, created._id, {
                        url,
                        alt: formData.name.trim(),
                    });
                }

                toast.success('Thêm món thành công');
            }

            setShowItemModal(false);
            resetForm();
            onSuccess();
        } catch (error) {
            toast.error(toMenuEndpointError(editingItemId ? 'update' : 'create', error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        showItemModal,
        setShowItemModal,
        isSubmitting,
        isEditing: Boolean(editingItemId),
        isUploadingImage,
        formData,
        imagePreviewUrls: formData.imageUrls,
        handleFieldChange,
        handleImageFileChange,
        handleAddImageUrl,
        handleRemoveImageAt,
        handleSubmit,
        openAddItem,
        openEditItem,
        resetForm,
    };
}
