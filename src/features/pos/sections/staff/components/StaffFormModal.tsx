import React from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
import { toast } from 'sonner';
import { uploadSingleFile } from '@/services/uploads';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Select from '../../../components/Select';

export type StaffFormMode = 'add' | 'edit';
export type StaffSubmitSection = 'all' | 'info' | 'account' | 'status' | 'avatar' | 'permissions';

export interface StaffPermissionsData {
  can_discount: boolean;
  can_cancel_order: boolean;
  can_process_payment: boolean;
  can_refund: boolean;
  can_view_reports: boolean;
  can_manage_tables: boolean;
  can_manage_menu: boolean;
}

export interface StaffFormData {
  userId: string;
  employeeCode: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  startDate: string;
  avatar: string;
  permissions: StaffPermissionsData;
}

const PERMISSIONS_CONFIG = [
  { key: 'can_discount', label: 'Giảm giá' },
  { key: 'can_cancel_order', label: 'Hủy đơn' },
  { key: 'can_process_payment', label: 'Thanh toán' },
  { key: 'can_refund', label: 'Hoàn tiền' },
  { key: 'can_view_reports', label: 'Xem báo cáo' },
  { key: 'can_manage_tables', label: 'Quản lý bàn' },
  { key: 'can_manage_menu', label: 'Quản lý menu' },
] as const;

interface StaffFormModalProps {
  isOpen: boolean;
  mode?: StaffFormMode;
  formData: StaffFormData;
  errors?: Partial<Record<keyof StaffFormData | 'avatar', string>>;
  isLoading?: boolean;
  onClose: () => void;
  onFieldChange: (field: keyof StaffFormData, value: string | boolean | StaffPermissionsData) => void;
  onSubmit: (section?: StaffSubmitSection, payload?: { avatarUrl?: string }) => void;
}

// ── Static options ────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: 'manager', label: 'Quản lý' },
  { value: 'cashier', label: 'Thu ngân' },
  { value: 'kitchen', label: 'Nhân viên bếp' },
  { value: 'waiter', label: 'Phục vụ' },
  { value: 'delivery', label: 'Giao hàng' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang làm việc' },
  { value: 'inactive', label: 'Không hoạt động' },
  { value: 'on_leave', label: 'Đang nghỉ' },
  { value: 'terminated', label: 'Đã nghỉ việc' },
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const imagePreview = formData.avatar ?? '';

  if (!isOpen) return null;

  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới';
  const icon = isEditMode ? 'Edit' : 'UserPlus';
  const submitText = isEditMode ? 'Lưu thay đổi' : 'Thêm nhân viên';
  const submitIcon = isEditMode ? 'Save' : 'UserPlus';

  const renderSectionSaveButton = (section: Exclude<StaffSubmitSection, 'all'>) => {
    if (!isEditMode) return null;

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSubmit(section)}
        disabled={isLoading || isUploading}
        iconName="Save"
        iconPosition="left"
      >
        Lưu phần này
      </Button>
    );
  };

  const handleRemoveImage = () => {
    onFieldChange('avatar', '');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedInfo = await uploadSingleFile(file);
      onFieldChange('avatar', uploadedInfo.url);

      if (isEditMode) {
        onSubmit('avatar', { avatarUrl: uploadedInfo.url });
      }

      toast.success('Tải ảnh lên thành công');
    } catch (error: Error | unknown) {
      const err = error as Error;
      toast.error(err.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const togglePermission = (key: keyof StaffPermissionsData) => {
    onFieldChange('permissions', {
      ...formData.permissions,
      [key]: !formData.permissions[key],
    });
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
          {/* Section: update-info */}
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Icon name="User" size={18} />
                  <span>Thông tin hồ sơ</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Cập nhật qua API: update-info</p>
              </div>
              {renderSectionSaveButton('info')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Mã nhân viên"
                type="text"
                placeholder="VD: NV001"
                value={formData.employeeCode}
                onChange={(e) => onFieldChange('employeeCode', e.target.value)}
                error={errors.employeeCode}
                required
                disabled={isEditMode}
              />
              <Input
                label="Họ và tên"
                type="text"
                placeholder="Nhập họ tên đầy đủ"
                value={formData.name}
                onChange={(e) => onFieldChange('name', e.target.value)}
                error={errors.name}
                required
              />
              <Select
                label="Vai trò"
                placeholder="Chọn vai trò"
                options={ROLE_OPTIONS}
                value={formData.role}
                onChange={(event) => onFieldChange('role', event.target.value)}
                error={errors.role}
                required
              />
              <Input
                label="Ngày bắt đầu"
                type="date"
                value={formData.startDate}
                onChange={(e) => onFieldChange('startDate', e.target.value)}
                error={errors.startDate}
                required={!isEditMode}
              />
              <Input
                label="Số điện thoại"
                type="tel"
                placeholder="0123 456 789"
                value={formData.phone}
                onChange={(e) => onFieldChange('phone', e.target.value)}
                error={errors.phone}
              />
              <Input
                label="Email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => onFieldChange('email', e.target.value)}
                error={errors.email}
              />
            </div>
          </div>

          {/* Section: link-account */}
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Icon name="Link" size={18} />
                  <span>Liên kết tài khoản</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Cập nhật qua API: link-account</p>
              </div>
              {renderSectionSaveButton('account')}
            </div>

            <Input
              label="User ID liên kết"
              type="text"
              placeholder="Nhập user_id"
              value={formData.userId}
              onChange={(e) => onFieldChange('userId', e.target.value)}
              error={errors.userId}
              required
            />
          </div>

          {/* Section: update-status */}
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Icon name="Activity" size={18} />
                  <span>Trạng thái làm việc</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Cập nhật qua API: update-status</p>
              </div>
              {renderSectionSaveButton('status')}
            </div>

            <Select
              label="Trạng thái"
              placeholder="Chọn trạng thái"
              options={STATUS_OPTIONS}
              value={formData.status}
              onChange={(event) => onFieldChange('status', event.target.value)}
              error={errors.status}
            />
          </div>

          {/* Section: update-avatar */}
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Icon name="Image" size={18} />
                  <span>Ảnh đại diện</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Upload thành công sẽ tự cập nhật avatar</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
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

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  iconName={isUploading ? 'Loader' : 'Upload'}
                  iconPosition="left"
                  className="w-full sm:w-auto"
                >
                  {isUploading ? 'Đang tải lên...' : 'Chọn ảnh từ máy...'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Hỗ trợ định dạng JPG, PNG, WEBP.
                </p>
                {errors.avatar && <p className="text-xs text-error mt-1">{errors.avatar}</p>}
              </div>
            </div>
          </div>

          {/* Section: update-permissions */}
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Icon name="Shield" size={18} />
                  <span>Quyền truy cập</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Cập nhật qua API: update-permissions</p>
              </div>
              {renderSectionSaveButton('permissions')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-muted/20 rounded-lg p-4">
              {PERMISSIONS_CONFIG.map((perm) => {
                const isChecked = !!formData.permissions?.[perm.key as keyof StaffPermissionsData];
                return (
                  <label key={perm.key} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`flex size-5 items-center justify-center rounded border transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-input bg-background group-hover:border-primary/50'}`}>
                      {isChecked && <Icon name="Check" size={14} className="text-primary-foreground" />}
                    </div>
                    <span className="text-sm font-medium text-card-foreground select-none">
                      {perm.label}
                    </span>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isChecked}
                      onChange={() => togglePermission(perm.key as keyof StaffPermissionsData)}
                    />
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          {!isEditMode && (
            <Button
              variant="default"
              onClick={() => onSubmit('all')}
              disabled={isLoading}
              iconName={submitIcon}
              iconPosition="left"
            >
              {submitText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffFormModal;
