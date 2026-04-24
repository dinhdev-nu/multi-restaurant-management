import React from 'react';
import Icon from '@/components/AppIcon';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Spinner } from '@/components/ui/spinner';

interface CategoryFormModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    isEditing: boolean;
    categoryName: string;
    categoryDescription: string;
    categoryImageUrl: string;
    onClose: () => void;
    onSubmit: () => void;
    onCategoryNameChange: (value: string) => void;
    onCategoryDescriptionChange: (value: string) => void;
    onCategoryImageUrlChange: (value: string) => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
    isOpen,
    isSubmitting,
    isEditing,
    categoryName,
    categoryDescription,
    categoryImageUrl,
    onClose,
    onSubmit,
    onCategoryNameChange,
    onCategoryDescriptionChange,
    onCategoryImageUrlChange,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                            <Icon name={isEditing ? 'Edit' : 'Plus'} size={20} color="white" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">
                            {isEditing ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                        </h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting} className="hover-scale">
                        <Icon name="X" size={20} />
                    </Button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                    <Input
                        label="Tên danh mục"
                        type="text"
                        value={categoryName}
                        onChange={(e) => onCategoryNameChange(e.target.value)}
                        placeholder="Nhập tên danh mục"
                        required
                    />
                    <Input
                        label="Mô tả"
                        type="text"
                        value={categoryDescription}
                        onChange={(e) => onCategoryDescriptionChange(e.target.value)}
                        placeholder="Mô tả danh mục"
                    />
                    <Input
                        label="Ảnh danh mục (URL)"
                        type="url"
                        value={categoryImageUrl}
                        onChange={(e) => onCategoryImageUrlChange(e.target.value)}
                        placeholder="https://example.com/category.jpg"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button
                        variant="default"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        iconName={isSubmitting ? undefined : isEditing ? 'Save' : 'Plus'}
                        iconPosition="left"
                    >
                        {isSubmitting ? (
                            <span className="inline-flex items-center gap-2">
                                <Spinner className="size-4" />
                                Đang lưu...
                            </span>
                        ) : isEditing ? 'Cập nhật' : 'Thêm danh mục'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CategoryFormModal;
