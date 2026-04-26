import React from 'react';
import { toast } from 'sonner';
import {
    deleteRestaurantStaff,
    listRestaurantStaff,
    toStaffEndpointError,
    updateRestaurantStaffStatus,
} from '@/services/staff';
import { usePOSStore } from '@/stores/pos-store';
import type { StaffPosition, StaffStatus, StaffDetail, StaffSummary } from '@/types/staff-type';

function mapDetailToSummary(detail: StaffDetail): StaffSummary {
    return {
        id: detail._id,
        employee_code: detail.employee_code,
        full_name: detail.full_name,
        phone: detail.phone,
        email: detail.email,
        position: detail.position,
        status: detail.status,
        hire_date: detail.hire_date,
        avatar_url: detail.avatar_url,
        user_id: detail.user_id,
        created_at: detail.created_at,
    };
}

export function useStaffManagement(restaurantId: string) {
    const setStaffs = usePOSStore((state) => state.setStaffs);
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [filterRole, setFilterRole] = React.useState<StaffPosition | ''>('');
    const [filterStatus, setFilterStatus] = React.useState<StaffStatus | ''>('');
    const [page, setPage] = React.useState(1);
    const [limit] = React.useState(20);
    const [total, setTotal] = React.useState(0);
    const [staffData, setStaffData] = React.useState<StaffSummary[]>([]);

    const fetchStaffData = React.useCallback(async (silent = false) => {
        if (!silent) setIsLoadingData(true);
        try {
            const result = await listRestaurantStaff(restaurantId, {
                page,
                limit,
                position: filterRole || undefined,
                status: filterStatus || undefined,
            });

            setStaffData(result.data);
            setStaffs(result.data);
            setTotal(result.pagination.total);
        } catch (error) {
            setStaffData([]);
            setStaffs([]);
            setTotal(0);
            const normalized = toStaffEndpointError('list', error);
            console.warn('[StaffManagement] list API failed:', normalized.errorCode, normalized.message);
        } finally {
            if (!silent) setIsLoadingData(false);
        }
    }, [restaurantId, page, limit, filterRole, filterStatus, setStaffs]);

    React.useEffect(() => {
        void fetchStaffData();
    }, [fetchStaffData]);

    const staffStats = React.useMemo(() => {
        const active = staffData.filter((s) => s.status === 'active').length;
        const onLeave = staffData.filter((s) => s.status === 'on_leave').length;
        const terminated = staffData.filter((s) => s.status === 'terminated').length;
        return {
            total: total || staffData.length,
            active,
            onLeave,
            terminated,
        };
    }, [staffData, total]);

    const toggleStatus = async (staff: StaffSummary): Promise<void> => {
        try {
            const nextStatus: StaffStatus = staff.status === 'active' ? 'inactive' : 'active';
            await updateRestaurantStaffStatus(restaurantId, staff.id, { status: nextStatus });
            toast.success('Cập nhật trạng thái thành công');
            await fetchStaffData(true);
        } catch (error) {
            toast.error(toStaffEndpointError('update-status', error).message);
            throw error;
        }
    };

    const deleteStaff = async (staffId: string): Promise<void> => {
        try {
            await deleteRestaurantStaff(restaurantId, staffId);
            toast.success('Đã xóa nhân viên');
            await fetchStaffData(true);
        } catch (error) {
            toast.error(toStaffEndpointError('delete', error).message);
            throw error;
        }
    };

    const handleRoleChange = (role: StaffPosition | '') => {
        setFilterRole(role);
        setPage(1);
    };

    const handleStatusChange = (status: StaffStatus | '') => {
        setFilterStatus(status);
        setPage(1);
    };

    const refetch = () => fetchStaffData(true);

    return {
        staffData,
        isLoadingData,
        total,
        page,
        setPage,
        limit,
        filterRole,
        handleRoleChange,
        filterStatus,
        handleStatusChange,
        staffStats,
        refetch,
        toggleStatus,
        deleteStaff,
    };
}

export { mapDetailToSummary };
