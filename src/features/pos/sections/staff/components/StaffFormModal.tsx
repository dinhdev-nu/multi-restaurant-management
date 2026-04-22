import React from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';

export type StaffFormMode = 'add' | 'edit';

export interface StaffFormData {
  name: string;
  phone: string;
  email: string;
  role: string;
  shift: string;
  workingHours: string;
  salary: string;
  startDate: string;
  address: string;
  notes: string;
  avatar: string;
}

interface StaffFormModalProps {
  isOpen: boolean;
  mode?: StaffFormMode;
  formData: StaffFormData;
  errors?: Partial<Record<keyof StaffFormData | 'avatar', string>>;
  isLoading?: boolean;
  onClose: () => void;
  onFieldChange: (field: keyof StaffFormData, value: string) => void;
  onSubmit: () => void;
}

// ── Static options ────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Chủ cửa hàng' },
  { value: 'manager', label: 'Quản lý' },
  { value: 'cashier', label: 'Thu ngân' },
  { value: 'kitchen', label: 'Nhân viên bếp' },
  { value: 'waiter', label: 'Phục vụ' },
  { value: 'cleaner', label: 'Vệ sinh' },
];

const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Ca sáng (6:00 - 14:00)' },
  { value: 'afternoon', label: 'Ca chiều (14:00 - 22:00)' },
  { value: 'night', label: 'Ca đêm (22:00 - 6:00)' },
  { value: 'full-time', label: 'Toàn thời gian' },
  { value: 'part-time', label: 'Bán thời gian' },
];

const WORKING_HOURS_OPTIONS = [
  { value: '4h', label: '4 giờ/ngày' },
  { value: '6h', label: '6 giờ/ngày' },
  { value: '8h', label: '8 giờ/ngày' },
  { value: '10h', label: '10 giờ/ngày' },
  { value: '12h', label: '12 giờ/ngày' },
];

// ── Component ─────────────────────────────────────────────────────────────────

const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  mode = 'add',
  formData,
  errors = {},
  isLoading = false,
  onClose,
  onFieldChange,
  onSubmit,
}) => {
  const imagePreview = formData.avatar ?? '';

  if (!isOpen) return null;

  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới';
  const icon = isEditMode ? 'Edit' : 'UserPlus';
  const submitText = isEditMode ? 'Lưu thay đổi' : 'Thêm nhân viên';
  const submitIcon = isEditMode ? 'Save' : 'UserPlus';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      onFieldChange('avatar', result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onFieldChange('avatar', '');
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Icon name={icon} size={20} color="white" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover-scale">
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Avatar Upload */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-medium text-foreground">
              <Icon name="Image" size={18} />
              <span>Ảnh đại diện</span>
            </h3>

            <div className="flex items-center gap-6">
              {/* Preview */}
              <div className="relative">
                <div className="size-24 overflow-hidden rounded-full border-2 border-border bg-muted">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="User" size={40} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-error transition-colors hover:bg-error/80"
                  >
                    <Icon name="X" size={14} color="white" />
                  </button>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Icon name="Upload" size={18} className="mr-2" />
                  <span className="text-sm font-medium">Chọn ảnh</span>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG, GIF tối đa 5MB</p>
                {errors.avatar && <p className="text-xs text-error mt-1">{errors.avatar}</p>}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-medium text-foreground">
              <Icon name="User" size={18} />
              <span>Thông tin cơ bản</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Họ và tên"
                type="text"
                placeholder="Nhập họ tên đầy đủ"
                value={formData.name}
                onChange={(e) => onFieldChange('name', e.target.value)}
                error={errors.name}
                required
              />
              <Input
                label="Số điện thoại"
                type="tel"
                placeholder="0123 456 789"
                value={formData.phone}
                onChange={(e) => onFieldChange('phone', e.target.value)}
                error={errors.phone}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => onFieldChange('email', e.target.value)}
                error={errors.email}
                required
                className="md:col-span-2"
              />
              <Input
                label="Địa chỉ"
                type="text"
                placeholder="Nhập địa chỉ"
                value={formData.address}
                onChange={(e) => onFieldChange('address', e.target.value)}
                className="md:col-span-2"
              />
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-medium text-foreground">
              <Icon name="Briefcase" size={18} />
              <span>Thông tin công việc</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Vai trò"
                placeholder="Chọn vai trò"
                options={ROLE_OPTIONS}
                value={formData.role}
                onChange={(event) => onFieldChange('role', event.target.value)}
                error={errors.role}
                required
              />
              <Select
                label="Ca làm việc"
                placeholder="Chọn ca làm việc"
                options={SHIFT_OPTIONS}
                value={formData.shift}
                onChange={(event) => onFieldChange('shift', event.target.value)}
                error={errors.shift}
                required
              />
              <Select
                label="Số giờ làm việc"
                placeholder="Chọn số giờ"
                options={WORKING_HOURS_OPTIONS}
                value={formData.workingHours}
                onChange={(event) => onFieldChange('workingHours', event.target.value)}
                error={errors.workingHours}
                required
              />
              <Input
                label="Mức lương"
                type="text"
                placeholder="VD: 8.000.000"
                value={formData.salary}
                onChange={(e) => onFieldChange('salary', e.target.value)}
                error={errors.salary}
                required={!isEditMode}
              />
              {!isEditMode && (
                <Input
                  label="Ngày bắt đầu"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => onFieldChange('startDate', e.target.value)}
                  error={errors.startDate}
                  required
                  className="md:col-span-2"
                />
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-medium text-foreground">
              <Icon name="FileText" size={18} />
              <span>Ghi chú</span>
            </h3>
            <textarea
              placeholder="Ghi chú thêm về nhân viên..."
              value={formData.notes}
              onChange={(e) => onFieldChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={onSubmit}
            disabled={isLoading}
            iconName={submitIcon}
            iconPosition="left"
          >
            {submitText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaffFormModal;
