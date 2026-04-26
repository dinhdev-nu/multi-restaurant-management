import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';
import Image from '@/components/AppImage';

type ItemStatus = 'available' | 'unavailable';
type FeaturedStatus = 'normal' | 'featured';

export interface MenuItemFormData {
  name: string;
  description: string;
  price: string;
  sortOrder: string;
  category: string;
  imageUrls: string[];
  status: ItemStatus;
  featured: FeaturedStatus;
}

interface Category {
  id: string;
  name: string;
}

interface MenuItemModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  isEditing?: boolean;
  item?: MenuItemFormData | null;
  imagePreviewUrls?: string[];
  categories?: Category[];
  errors?: Partial<Record<keyof MenuItemFormData, string>>;
  onClose: () => void;
  onSave: (data: MenuItemFormData) => void;
  onFieldChange: (field: keyof MenuItemFormData, value: string) => void;
  onImageFileChange: (files: File[]) => void;
  onAddImageUrl: (url: string) => void;
  onRemoveImageAt: (index: number) => void;
}

type UploadMethod = 'upload' | 'url';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Có sẵn' },
  { value: 'unavailable', label: 'Hết hàng' },
];

const FEATURED_OPTIONS = [
  { value: 'normal', label: 'Bình thường' },
  { value: 'featured', label: 'Nổi bật' },
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=200',
  'https://images.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
];

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

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  isLoading = false,
  isEditing = false,
  item = null,
  imagePreviewUrls = [],
  categories = [],
  errors = {},
  onClose,
  onSave,
  onFieldChange,
  onImageFileChange,
  onAddImageUrl,
  onRemoveImageAt,
}) => {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('upload');
  const [pendingImageUrl, setPendingImageUrl] = useState('');

  if (!isOpen) return null;

  const formData = item ?? DEFAULT_MENU_ITEM;
  const categoryOptions = categories.map((cat) => ({ value: cat.id, label: cat.name }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    onImageFileChange(files);
    e.currentTarget.value = '';
  };

  const imagePreviews = imagePreviewUrls;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Icon name={isEditing ? "Edit" : "Plus"} size={20} color="white" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {isEditing ? 'Chỉnh sửa món ăn' : 'Thêm món mới'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover-scale">
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <Input
                label="Tên món ăn"
                type="text"
                value={formData.name}
                onChange={(e) => onFieldChange('name', e.target.value)}
                error={errors.name}
                required
                placeholder="Nhập tên món ăn"
              />

              <Input
                label="Mô tả"
                type="text"
                value={formData.description}
                onChange={(e) => onFieldChange('description', e.target.value)}
                placeholder="Mô tả ngắn về món ăn"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Giá (VNĐ)"
                  type="text"
                  value={formData.price}
                  onChange={(e) => onFieldChange('price', e.target.value)}
                  error={errors.price}
                  required
                  placeholder="0"
                />

                <Select
                  label="Danh mục"
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(event) => onFieldChange('category', event.target.value)}
                  error={errors.category}
                  required
                  placeholder="Chọn danh mục"
                />
              </div>

              {!isEditing && (
                <Input
                  label="Thứ tự hiển thị"
                  type="number"
                  min={0}
                  step={1}
                  value={formData.sortOrder}
                  onChange={(e) => onFieldChange('sortOrder', e.target.value)}
                  placeholder="Để trống để hệ thống tự sắp xếp"
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Trạng thái"
                  options={STATUS_OPTIONS}
                  value={formData.status}
                  onChange={(event) => onFieldChange('status', event.target.value)}
                  placeholder="Chọn trạng thái"
                />

                <Select
                  label="Hiển thị"
                  options={FEATURED_OPTIONS}
                  value={formData.featured}
                  onChange={(event) => onFieldChange('featured', event.target.value)}
                  placeholder="Chọn hiển thị"
                />
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hình ảnh món ăn
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('upload')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${uploadMethod === 'upload'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    <Icon name="Upload" size={16} className="inline mr-2" />
                    Tải ảnh lên
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${uploadMethod === 'url'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    <Icon name="Link" size={16} className="inline mr-2" />
                    URL
                  </button>
                </div>
              </div>

              {uploadMethod === 'upload' ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="block w-full h-48 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors group"
                  >
                    {imagePreviews.length > 0 ? (
                      <div className="relative w-full h-full">
                        <Image src={imagePreviews[0]} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white text-center">
                            <Icon name="Upload" size={32} className="mx-auto mb-2" />
                            <p className="text-sm font-medium">Thêm ảnh</p>
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                          {imagePreviews.length} ảnh
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Icon name="ImagePlus" size={48} className="mx-auto mb-3 text-primary/50 group-hover:text-primary transition-colors" />
                        <p className="text-sm font-medium mb-1">Nhấn để chọn nhiều ảnh</p>
                        <p className="text-xs">PNG, JPG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                  </label>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {imagePreviews.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative h-16 overflow-hidden rounded border border-border">
                          <Image src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => onRemoveImageAt(index)}
                            className="absolute right-1 top-1 rounded bg-black/70 p-1 text-white"
                            aria-label="Xóa ảnh"
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  <div className="flex gap-2">
                    <Input
                      label="URL hình ảnh"
                      type="url"
                      value={pendingImageUrl}
                      onChange={(e) => setPendingImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="self-end"
                      onClick={() => {
                        const url = pendingImageUrl.trim();
                        if (!url) return;
                        onAddImageUrl(url);
                        setPendingImageUrl('');
                      }}
                    >
                      Thêm
                    </Button>
                  </div>

                  <div className="w-full h-40 flex-shrink-0 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {imagePreviews.length > 0 ? (
                      <Image src={imagePreviews[0]} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Icon name="ImagePlus" size={24} className="mx-auto mb-2" />
                        <p className="text-xs">Nhập URL để thêm ảnh</p>
                      </div>
                    )}
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {imagePreviews.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative h-16 overflow-hidden rounded border border-border">
                          <Image src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => onRemoveImageAt(index)}
                            className="absolute right-1 top-1 rounded bg-black/70 p-1 text-white"
                            aria-label="Xóa ảnh"
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Hoặc chọn ảnh mẫu
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {SAMPLE_IMAGES.map((url, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => onAddImageUrl(url)}
                          className="w-full h-16 rounded border border-border overflow-hidden hover:ring-2 hover:ring-primary transition-smooth"
                        >
                          <Image src={url} alt={`Sample ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={() => onSave(formData)}
            disabled={isLoading}
            iconName="Save"
            iconPosition="left"
          >
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemModal;
