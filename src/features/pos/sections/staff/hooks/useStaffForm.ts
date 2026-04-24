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
import type { StaffPosition, StaffStatus, StaffDetail } from '@/types/staff-type';
import type { StaffFormData, StaffFormMode } from '../components/StaffFormModal';
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

export function useStaffForm(restaurantId: string, onSuccess: () => void) {
    const [showStaffModal, setShowStaffModal] = React.useState(false);
    const [staffModalMode, setStaffModalMode] = React.useState<StaffFormMode>('add');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [editingStaffId, setEditingStaffId] = React.useState<string | null>(null);
    const [staffFormData, setStaffFormData] = React.useState<StaffFormData>(DEFAULT_FORM_DATA);
    
    // Track the original detail to compare diffs (like avatar/status changes)
    const [originalDetail, setOriginalDetail] = React.useState<StaffDetail | null>(null);

    const resetForm = () => {
        setStaffFormData(DEFAULT_FORM_DATA);
        setOriginalDetail(null);
    };

    const openAddModal = () => {
        setStaffModalMode('add');
        setEditingStaffId(null);
        resetForm();
        setShowStaffModal(true);
    };

    const openEditModal = async (staff: Staff, externalDetailSetter?: (detail: StaffDetail) => void) => {
        setStaffModalMode('edit');
        setEditingStaffId(staff._id);
        setShowStaffModal(true);

        try {
            const detail = await getRestaurantStaffDetail(restaurantId, staff._id);
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
    };

    const handleFieldChange = (field: keyof StaffFormData, value: string | boolean | typeof DEFAULT_FORM_DATA.permissions) => {
        setStaffFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
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
            } else if (editingStaffId) {
                await updateRestaurantStaffInfo(restaurantId, editingStaffId, {
                    full_name: staffFormData.name.trim() || undefined,
                    position: (staffFormData.role as StaffPosition) || undefined,
                    hire_date: staffFormData.startDate || undefined,
                    phone: staffFormData.phone.trim() || undefined,
                    email: staffFormData.email.trim() || undefined,
                });

                if (staffFormData.userId.trim() && staffFormData.userId.trim() !== originalDetail?.user_id) {
                    await linkRestaurantStaffAccount(restaurantId, editingStaffId, {
                        user_id: staffFormData.userId.trim(),
                    });
                }

                if (staffFormData.status && originalDetail?.status !== staffFormData.status) {
                    await updateRestaurantStaffStatus(restaurantId, editingStaffId, {
                        status: staffFormData.status as StaffStatus,
                    });
                }

                if (staffFormData.avatar && staffFormData.avatar !== originalDetail?.avatar_url && /^https?:\/\//.test(staffFormData.avatar)) {
                    await updateRestaurantStaffAvatar(restaurantId, editingStaffId, { avatar_url: staffFormData.avatar });
                }
                
                if (staffFormData.permissions) {
                    await updateRestaurantStaffPermissions(restaurantId, editingStaffId, staffFormData.permissions);
                }

                toast.success('Cập nhật nhân viên thành công');
            }

            setShowStaffModal(false);
            resetForm();
            onSuccess();
        } catch (error) {
            const endpoint = staffModalMode === 'add' ? 'create' : 'update-info';
            toast.error(toStaffEndpointError(endpoint, error).message);
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
