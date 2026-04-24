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
  category: string;
  imageUrl: string;
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
  imagePreviewUrl?: string;
  categories?: Category[];
  errors?: Partial<Record<keyof MenuItemFormData, string>>;
  onClose: () => void;
  onSave: (data: MenuItemFormData) => void;
  onFieldChange: (field: keyof MenuItemFormData, value: string) => void;
  onImageFileChange: (file: File | null) => void;
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
  category: '',
  imageUrl: '',
  status: 'available',
  featured: 'normal',
};

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  isLoading = false,
  isEditing = false,
  item = null,
  imagePreviewUrl = '',
  categories = [],
  errors = {},
  onClose,
  onSave,
  onFieldChange,
  onImageFileChange,
}) => {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('upload');

  if (!isOpen) return null;

  const formData = item ?? DEFAULT_MENU_ITEM;
  const categoryOptions = categories.map((cat) => ({ value: cat.id, label: cat.name }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageFileChange(file);
  };

  const imagePreview = imagePreviewUrl;

  return (
    <div className="fixed inset-0 z-1200 flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? 'Chỉnh sửa món ăn' : 'Thêm món mới'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
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
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="block w-full h-48 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors group"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <Image src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white text-center">
                            <Icon name="Upload" size={32} className="mx-auto mb-2" />
                            <p className="text-sm font-medium">Thay đổi ảnh</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Icon name="ImagePlus" size={48} className="mx-auto mb-3 text-primary/50 group-hover:text-primary transition-colors" />
                        <p className="text-sm font-medium mb-1">Nhấn để chọn ảnh</p>
                        <p className="text-xs">PNG, JPG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                  </label>

                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onImageFileChange(null);
                        onFieldChange('imageUrl', '');
                      }}
                      iconName="Trash2"
                      iconPosition="left"
                      className="w-full"
                    >
                      Xóa ảnh
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  <Input
                    label="URL hình ảnh"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => onFieldChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />

                  <div className="w-full h-40 flex-shrink-0 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {imagePreview ? (
                      <Image src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Icon name="ImagePlus" size={24} className="mx-auto mb-2" />
                        <p className="text-xs">Nhập URL để xem trước</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Hoặc chọn ảnh mẫu
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {SAMPLE_IMAGES.map((url, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => onFieldChange('imageUrl', url)}
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
