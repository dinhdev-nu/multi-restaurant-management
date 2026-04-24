import React from 'react';
import { toast } from 'sonner';
import {
    createMenuCategory,
    updateMenuCategory,
    toMenuEndpointError,
} from '@/services/menu';
import type { MenuCategoryWithCount } from '@/types/menu-type';

export function useCategoryForm(restaurantId: string, onSuccess: () => void) {
    const [showCategoryModal, setShowCategoryModal] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null);
    const [categoryName, setCategoryName] = React.useState('');
    const [categoryDescription, setCategoryDescription] = React.useState('');
    const [categoryImageUrl, setCategoryImageUrl] = React.useState('');

    const resetForm = () => {
        setEditingCategoryId(null);
        setCategoryName('');
        setCategoryDescription('');
        setCategoryImageUrl('');
    };

    const openAddCategory = () => {
        resetForm();
        setShowCategoryModal(true);
    };

    const openEditCategory = (category: MenuCategoryWithCount) => {
        setEditingCategoryId(category._id);
        setCategoryName(category.name);
        setCategoryDescription(category.description || '');
        setCategoryImageUrl(category.image_url || '');
        setShowCategoryModal(true);
    };

    const handleSubmitCategory = async () => {
        if (!categoryName.trim()) {
            toast.error('Vui lòng nhập tên danh mục');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingCategoryId) {
                await updateMenuCategory(restaurantId, editingCategoryId, {
                    name: categoryName.trim(),
                    description: categoryDescription.trim() || undefined,
                    image_url: categoryImageUrl.trim() || undefined,
                });
                toast.success('Cập nhật danh mục thành công');
            } else {
                await createMenuCategory(restaurantId, {
                    name: categoryName.trim(),
                    description: categoryDescription.trim() || undefined,
                    image_url: categoryImageUrl.trim() || undefined,
                });
                toast.success('Thêm danh mục thành công');
            }

            setShowCategoryModal(false);
            resetForm();
            onSuccess();
        } catch (error) {
            toast.error(toMenuEndpointError(editingCategoryId ? 'update category' : 'create category', error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        showCategoryModal,
        setShowCategoryModal,
        isSubmitting,
        editingCategoryId,
        openAddCategory,
        openEditCategory,
        categoryName,
        setCategoryName,
        categoryDescription,
        setCategoryDescription,
        categoryImageUrl,
        setCategoryImageUrl,
        handleSubmitCategory,
        resetForm,
    };
}
