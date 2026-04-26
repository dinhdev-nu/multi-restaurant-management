import React from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { Spinner } from '@/components/ui/spinner';
import { uploadSingleFile } from '@/services/uploads';
import { toast } from 'sonner';

interface CategoryFormModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    isEditing: boolean;
    categoryName: string;
    categoryDescription: string;
    categoryImageUrl: string;
    categorySortOrder: string;
    onClose: () => void;
    onSubmit: () => void;
    onCategoryNameChange: (value: string) => void;
    onCategoryDescriptionChange: (value: string) => void;
    onCategoryImageUrlChange: (value: string) => void;
    onCategorySortOrderChange: (value: string) => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
    isOpen,
    isSubmitting,
    isEditing,
    categoryName,
    categoryDescription,
    categoryImageUrl,
    categorySortOrder,
    onClose,
    onSubmit,
    onCategoryNameChange,
    onCategoryDescriptionChange,
    onCategoryImageUrlChange,
    onCategorySortOrderChange,
}) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = React.useState(false);

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const uploaded = await uploadSingleFile(file);
            onCategoryImageUrlChange(uploaded.url);
            toast.success('Tải ảnh danh mục thành công');
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || 'Không thể tải ảnh danh mục');
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

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
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting || isUploadingImage} className="hover-scale">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <Input
                            label="Thứ tự hiển thị"
                            type="number"
                            min={0}
                            step={1}
                            value={categorySortOrder}
                            onChange={(e) => onCategorySortOrderChange(e.target.value)}
                            placeholder="Ví dụ: 0"
                            disabled={isEditing}
                        />
                        {isEditing && (
                            <p className="text-xs text-muted-foreground md:col-span-2">
                                API cập nhật danh mục không nhận trường thứ tự hiển thị. Dùng chức năng sắp xếp danh mục để thay đổi thứ tự.
                            </p>
                        )}

                        <div className="space-y-3">
                            <p className="text-sm font-medium text-foreground">Ảnh danh mục</p>

                            <div className="flex items-center gap-4">
                                <div className="size-20 overflow-hidden rounded-lg border border-border bg-muted">
                                    {categoryImageUrl ? (
                                        <Image src={categoryImageUrl} alt="Category preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Icon name="Image" size={20} className="text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleUploadImage}
                                    />
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isSubmitting || isUploadingImage}
                                        iconName={isUploadingImage ? undefined : 'Upload'}
                                        iconPosition="left"
                                    >
                                        {isUploadingImage ? (
                                            <span className="inline-flex items-center gap-2">
                                                <Spinner className="size-4" />
                                                Đang tải ảnh...
                                            </span>
                                        ) : 'Tải ảnh từ máy'}
                                    </Button>

                                    {categoryImageUrl && (
                                        <Button
                                            variant="ghost"
                                            type="button"
                                            onClick={() => onCategoryImageUrlChange('')}
                                            disabled={isSubmitting || isUploadingImage}
                                            className="justify-start px-0 text-muted-foreground"
                                        >
                                            Xóa ảnh
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Input
                        label="Hoặc nhập URL ảnh"
                        type="url"
                        value={categoryImageUrl}
                        onChange={(e) => onCategoryImageUrlChange(e.target.value)}
                        placeholder="https://example.com/category.jpg"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting || isUploadingImage}>
                        Hủy
                    </Button>
                    <Button
                        variant="default"
                        onClick={onSubmit}
                        disabled={isSubmitting || isUploadingImage}
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
