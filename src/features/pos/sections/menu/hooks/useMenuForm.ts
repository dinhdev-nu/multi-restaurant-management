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
    category: '',
    imageUrl: '',
    status: 'available',
    featured: 'normal',
};

export function useMenuForm(restaurantId: string, onSuccess: () => void) {
    const [showItemModal, setShowItemModal] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
    const [formData, setFormData] = React.useState<MenuItemFormData>(DEFAULT_MENU_ITEM);
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState('');

    const resetForm = () => {
        setFormData(DEFAULT_MENU_ITEM);
        setEditingItemId(null);
        setImageFile(null);
        setImagePreviewUrl('');
    };

    const openAddItem = () => {
        resetForm();
        setShowItemModal(true);
    };

    const openEditItem = async (item: MenuItem) => {
        setIsSubmitting(true);
        try {
            const detail = await getMenuItemDetail(restaurantId, item._id);
            const firstImage = detail.images?.[0]?.url || '';

            setEditingItemId(detail._id);
            setFormData({
                name: detail.name,
                description: detail.description || '',
                price: detail.base_price.toString(),
                category: detail.category_id,
                imageUrl: firstImage,
                status: detail.is_available ? 'available' : 'unavailable',
                featured: detail.is_featured ? 'featured' : 'normal',
            });
            setImageFile(null);
            setImagePreviewUrl(firstImage);
            setShowItemModal(true);
        } catch (error) {
            toast.error(toMenuEndpointError('detail', error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFieldChange = (field: keyof MenuItemFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'imageUrl') {
            setImagePreviewUrl(value.trim());
            setImageFile(null);
        }
    };

    const handleImageFileChange = (file: File | null) => {
        setImageFile(file);
        if (!file) {
            setImagePreviewUrl(formData.imageUrl.trim());
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setImagePreviewUrl(objectUrl);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.price || !formData.category) {
            toast.error('Vui lòng nhập đầy đủ Tên, Giá và Chọn danh mục');
            return;
        }

        setIsSubmitting(true);
        try {
            const price = parseFloat(formData.price) || 0;
            const is_available = formData.status === 'available';
            const is_featured = formData.featured === 'featured';
            const imageUrlFromInput = formData.imageUrl.trim();

            let finalImageUrl = imageUrlFromInput;
            if (imageFile) {
                const uploaded = await uploadSingleFile(imageFile);
                finalImageUrl = uploaded.url;
            }

            if (editingItemId) {
                const current = await getMenuItemDetail(restaurantId, editingItemId);
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

                const currentImageUrl = current.images?.[0]?.url || '';
                if (finalImageUrl !== currentImageUrl) {
                    if (current.images?.length) {
                        await removeMenuItemImage(restaurantId, editingItemId, 0);
                    }
                    if (finalImageUrl) {
                        await addMenuItemImage(restaurantId, editingItemId, {
                            url: finalImageUrl,
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
                });

                if (finalImageUrl) {
                    await addMenuItemImage(restaurantId, created._id, {
                        url: finalImageUrl,
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
        formData,
        imagePreviewUrl,
        handleFieldChange,
        handleImageFileChange,
        handleSubmit,
        openAddItem,
        openEditItem,
        resetForm,
    };
}
