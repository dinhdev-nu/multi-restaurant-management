import React from 'react';
import { toast } from 'sonner';
import {
    createRestaurantStaff,
    getRestaurantStaffDetail,
    linkRestaurantStaffAccount,
    toStaffEndpointError,
    updateRestaurantStaffAvatar,
    updateRestaurantStaffInfo,
    updateRestaurantStaffPermissions,
    updateRestaurantStaffStatus,
} from '@/services/staff';
import type { StaffPosition, StaffStatus, StaffDetail, StaffApiEndpoint } from '@/types/staff-type';
import type { StaffFormData, StaffFormMode, StaffSubmitSection } from '../components/StaffFormModal';
import type { Staff } from '../components/StaffCard';

const DEFAULT_FORM_DATA: StaffFormData = {
    userId: '',
    employeeCode: '',
    name: '',
    phone: '',
    email: '',
    role: '',
    status: 'active',
    startDate: '',
    avatar: '',
    permissions: {
        can_discount: false,
        can_cancel_order: false,
        can_process_payment: false,
        can_refund: false,
        can_view_reports: false,
        can_manage_tables: false,
        can_manage_menu: false,
    },
};

const arePermissionsEqual = (
    left: StaffFormData['permissions'],
    right: StaffFormData['permissions'],
) => (
    left.can_discount === right.can_discount
    && left.can_cancel_order === right.can_cancel_order
    && left.can_process_payment === right.can_process_payment
    && left.can_refund === right.can_refund
    && left.can_view_reports === right.can_view_reports
    && left.can_manage_tables === right.can_manage_tables
    && left.can_manage_menu === right.can_manage_menu
);

export function useStaffForm(restaurantId: string, onSuccess: () => void) {
    const [showStaffModal, setShowStaffModal] = React.useState(false);
    const [staffModalMode, setStaffModalMode] = React.useState<StaffFormMode>('add');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [editingStaffId, setEditingStaffId] = React.useState<string | null>(null);
    const [staffFormData, setStaffFormData] = React.useState<StaffFormData>(DEFAULT_FORM_DATA);
    
    // Track the original detail to compare diffs (like avatar/status changes)
    const [originalDetail, setOriginalDetail] = React.useState<StaffDetail | null>(null);

    const resetForm = React.useCallback(() => {
        setStaffFormData(DEFAULT_FORM_DATA);
        setOriginalDetail(null);
    }, []);

    const openAddModal = React.useCallback(() => {
        setStaffModalMode('add');
        setEditingStaffId(null);
        resetForm();
        setShowStaffModal(true);
    }, [resetForm]);

    const openEditModal = React.useCallback(async (
        staff: Staff,
        externalDetailSetter?: (detail: StaffDetail) => void,
        knownDetail?: StaffDetail | null,
    ) => {
        setStaffModalMode('edit');
        setEditingStaffId(staff._id);
        setShowStaffModal(true);

        try {
            const detail = knownDetail ?? await getRestaurantStaffDetail(restaurantId, staff._id);
            if (externalDetailSetter) externalDetailSetter(detail);
            setOriginalDetail(detail);

            setStaffFormData({
                userId: detail.user_id,
                employeeCode: detail.employee_code,
                name: detail.full_name,
                phone: detail.phone ?? '',
                email: detail.email ?? '',
                role: detail.position,
                status: detail.status,
                startDate: detail.hire_date ? detail.hire_date.slice(0, 10) : '',
                avatar: detail.avatar_url ?? '',
                permissions: detail.permissions ? {
                    can_discount: detail.permissions.can_discount,
                    can_cancel_order: detail.permissions.can_cancel_order,
                    can_process_payment: detail.permissions.can_process_payment,
                    can_refund: detail.permissions.can_refund,
                    can_view_reports: detail.permissions.can_view_reports,
                    can_manage_tables: detail.permissions.can_manage_tables,
                    can_manage_menu: detail.permissions.can_manage_menu,
                } : DEFAULT_FORM_DATA.permissions,
            });
        } catch (error) {
            toast.error(toStaffEndpointError('detail', error).message);
        }
    }, [restaurantId]);

    const handleFieldChange = React.useCallback((field: keyof StaffFormData, value: string | boolean | typeof DEFAULT_FORM_DATA.permissions) => {
        setStaffFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = async (
        section: StaffSubmitSection = 'all',
        payload?: { avatarUrl?: string },
    ) => {
        if (!staffFormData.name || !staffFormData.role) {
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
            return;
        }

        setIsSubmitting(true);
        try {
            if (staffModalMode === 'add') {
                if (!staffFormData.userId || !staffFormData.employeeCode || !staffFormData.startDate) {
                    toast.error('Vui lòng nhập user ID, mã nhân viên và ngày bắt đầu');
                    setIsSubmitting(false);
                    return;
                }

                const createResult = await createRestaurantStaff(restaurantId, {
                    user_id: staffFormData.userId.trim(),
                    employee_code: staffFormData.employeeCode.trim(),
                    full_name: staffFormData.name.trim(),
                    position: staffFormData.role as StaffPosition,
                    hire_date: staffFormData.startDate,
                    phone: staffFormData.phone.trim() || undefined,
                    email: staffFormData.email.trim() || undefined,
                    status: (staffFormData.status || 'active') as StaffStatus,
                    avatar_url: staffFormData.avatar.trim() || undefined,
                });
                
                if (staffFormData.permissions) {
                    await updateRestaurantStaffPermissions(restaurantId, createResult.id, staffFormData.permissions);
                }

                toast.success('Tạo nhân viên thành công');
                setShowStaffModal(false);
                resetForm();
                onSuccess();
                return;
            } else if (editingStaffId) {
                const runStep = async (endpoint: StaffApiEndpoint, action: () => Promise<unknown>) => {
                    try {
                        await action();
                    } catch (error) {
                        throw toStaffEndpointError(endpoint, error);
                    }
                };

                const normalizedName = staffFormData.name.trim();
                const normalizedRole = staffFormData.role as StaffPosition;
                const normalizedHireDate = staffFormData.startDate || '';
                const normalizedPhone = staffFormData.phone.trim();
                const normalizedEmail = staffFormData.email.trim();
                const normalizedUserId = staffFormData.userId.trim();
                const normalizedAvatar = (payload?.avatarUrl ?? staffFormData.avatar).trim();

                const originalPermissions: StaffFormData['permissions'] = originalDetail?.permissions
                    ? {
                        can_discount: originalDetail.permissions.can_discount,
                        can_cancel_order: originalDetail.permissions.can_cancel_order,
                        can_process_payment: originalDetail.permissions.can_process_payment,
                        can_refund: originalDetail.permissions.can_refund,
                        can_view_reports: originalDetail.permissions.can_view_reports,
                        can_manage_tables: originalDetail.permissions.can_manage_tables,
                        can_manage_menu: originalDetail.permissions.can_manage_menu,
                    }
                    : DEFAULT_FORM_DATA.permissions;

                const shouldUpdateInfo = (
                    normalizedName !== (originalDetail?.full_name ?? '').trim()
                    || normalizedRole !== originalDetail?.position
                    || normalizedHireDate !== (originalDetail?.hire_date?.slice(0, 10) ?? '')
                    || normalizedPhone !== (originalDetail?.phone ?? '').trim()
                    || normalizedEmail !== (originalDetail?.email ?? '').trim()
                );

                const shouldLinkAccount = Boolean(
                    normalizedUserId && normalizedUserId !== (originalDetail?.user_id ?? '')
                );

                const shouldUpdateStatus = Boolean(
                    staffFormData.status && staffFormData.status !== originalDetail?.status
                );

                const shouldUpdateAvatar = Boolean(
                    normalizedAvatar
                    && normalizedAvatar !== (originalDetail?.avatar_url ?? '')
                    && /^https?:\/\//.test(normalizedAvatar)
                );

                const shouldUpdatePermissions = !arePermissionsEqual(
                    staffFormData.permissions,
                    originalPermissions,
                );

                const updateInfo = async () => {
                    if (!shouldUpdateInfo) {
                        toast.success('Không có thay đổi ở phần thông tin hồ sơ');
                        return false;
                    }

                    await runStep('update-info', () => updateRestaurantStaffInfo(restaurantId, editingStaffId, {
                        full_name: normalizedName || undefined,
                        position: normalizedRole || undefined,
                        hire_date: normalizedHireDate || undefined,
                        phone: normalizedPhone || undefined,
                        email: normalizedEmail || undefined,
                    }));
                    toast.success('Đã cập nhật thông tin hồ sơ');
                    return true;
                };

                const updateAccount = async () => {
                    if (!shouldLinkAccount) {
                        toast.success('Không có thay đổi ở phần liên kết tài khoản');
                        return false;
                    }

                    await runStep('link-account', () => linkRestaurantStaffAccount(restaurantId, editingStaffId, {
                        user_id: normalizedUserId,
                    }));
                    toast.success('Đã cập nhật liên kết tài khoản');
                    return true;
                };

                const updateStatus = async () => {
                    if (!shouldUpdateStatus) {
                        toast.success('Không có thay đổi ở phần trạng thái');
                        return false;
                    }

                    await runStep('update-status', () => updateRestaurantStaffStatus(restaurantId, editingStaffId, {
                        status: staffFormData.status as StaffStatus,
                    }));
                    toast.success('Đã cập nhật trạng thái');
                    return true;
                };

                const updateAvatar = async () => {
                    if (!shouldUpdateAvatar) {
                        toast.success('Không có thay đổi ở phần ảnh đại diện');
                        return false;
                    }

                    await runStep('update-avatar', () => updateRestaurantStaffAvatar(restaurantId, editingStaffId, {
                        avatar_url: normalizedAvatar,
                    }));
                    toast.success('Đã cập nhật ảnh đại diện');
                    return true;
                };

                const updatePermissions = async () => {
                    if (!shouldUpdatePermissions) {
                        toast.success('Không có thay đổi ở phần quyền truy cập');
                        return false;
                    }

                    await runStep('update-permissions', () => updateRestaurantStaffPermissions(
                        restaurantId,
                        editingStaffId,
                        staffFormData.permissions,
                    ));
                    toast.success('Đã cập nhật quyền truy cập');
                    return true;
                };

                if (section === 'info') {
                    const didUpdate = await updateInfo();
                    if (didUpdate) await onSuccess();
                    return;
                }

                if (section === 'account') {
                    const didUpdate = await updateAccount();
                    if (didUpdate) await onSuccess();
                    return;
                }

                if (section === 'status') {
                    const didUpdate = await updateStatus();
                    if (didUpdate) await onSuccess();
                    return;
                }

                if (section === 'avatar') {
                    const didUpdate = await updateAvatar();
                    if (didUpdate) await onSuccess();
                    return;
                }

                if (section === 'permissions') {
                    const didUpdate = await updatePermissions();
                    if (didUpdate) await onSuccess();
                    return;
                }

                let hasAnyUpdate = false;
                hasAnyUpdate = (await updateInfo()) || hasAnyUpdate;
                hasAnyUpdate = (await updateAccount()) || hasAnyUpdate;
                hasAnyUpdate = (await updateStatus()) || hasAnyUpdate;
                hasAnyUpdate = (await updateAvatar()) || hasAnyUpdate;
                hasAnyUpdate = (await updatePermissions()) || hasAnyUpdate;

                if (hasAnyUpdate) {
                    toast.success('Cập nhật nhân viên thành công');
                    setShowStaffModal(false);
                    resetForm();
                    onSuccess();
                }
                return;
            }
        } catch (error) {
            const fallbackEndpoint: StaffApiEndpoint = staffModalMode === 'add' ? 'create' : 'update-info';
            toast.error(toStaffEndpointError(fallbackEndpoint, error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        showStaffModal,
        setShowStaffModal,
        staffModalMode,
        isSubmitting,
        staffFormData,
        handleFieldChange,
        handleSubmit,
        openAddModal,
        openEditModal,
        resetForm
    };
}
