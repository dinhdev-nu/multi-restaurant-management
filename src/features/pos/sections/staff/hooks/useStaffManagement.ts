import React from 'react';
import { toast } from 'sonner';
import {
    deleteRestaurantStaff,
    listRestaurantStaff,
    toStaffEndpointError,
    updateRestaurantStaffStatus,
} from '@/services/staff';
import type { StaffPosition, StaffStatus, StaffDetail } from '@/types/staff-type';
import type { Staff } from '../components/StaffCard';

const ROLE_LABEL: Record<StaffPosition, string> = {
    manager: 'Quản lý',
    cashier: 'Thu ngân',
    waiter: 'Phục vụ',
    kitchen: 'Nhân viên bếp',
    delivery: 'Giao hàng',
};

const STATUS_LABEL: Record<StaffStatus, string> = {
    active: 'Đang làm việc',
    inactive: 'Không hoạt động',
    on_leave: 'Đang nghỉ',
    terminated: 'Đã nghỉ việc',
};

function mapDetailToCard(detail: StaffDetail): Staff {
    const position = detail.position;
    const status = detail.status;

    return {
        _id: detail._id,
        restaurantId: detail.restaurant_id,
        userId: detail.user_id,
        name: detail.full_name,
        avatar: detail.avatar_url ?? '',
        employeeId: detail.employee_code,
        phone: detail.phone ?? '---',
        email: detail.email ?? '---',
        joinDate: detail.hire_date,
        role: position,
        roleDisplay: ROLE_LABEL[position] ?? position,
        status,
        statusDisplay: STATUS_LABEL[status] ?? status,
    };
}

export function useStaffManagement(restaurantId: string) {
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [filterRole, setFilterRole] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [limit] = React.useState(20);
    const [total, setTotal] = React.useState(0);
    const [staffData, setStaffData] = React.useState<Staff[]>([]);

    const fetchStaffData = React.useCallback(async (silent = false) => {
        if (!silent) setIsLoadingData(true);
        try {
            const result = await listRestaurantStaff(restaurantId, {
                page,
                limit,
                position: (filterRole || undefined) as StaffPosition | undefined,
                status: (filterStatus || undefined) as StaffStatus | undefined,
            });

            setStaffData(result.data.map((item) => mapDetailToCard({
                _id: item.id,
                restaurant_id: restaurantId,
                user_id: item.user_id,
                employee_code: item.employee_code,
                full_name: item.full_name,
                phone: item.phone ?? null,
                email: item.email ?? null,
                position: item.position,
                hire_date: item.hire_date,
                avatar_url: item.avatar_url,
                status: item.status,
                deleted_at: null,
                created_at: item.created_at,
                updated_at: item.created_at,
            })));
            setTotal(result.pagination.total);
        } catch (error) {
            setStaffData([]);
            setTotal(0);
            const normalized = toStaffEndpointError('list', error);
            console.warn('[StaffManagement] list API failed:', normalized.errorCode, normalized.message);
        } finally {
            if (!silent) setIsLoadingData(false);
        }
    }, [restaurantId, page, limit, filterRole, filterStatus]);

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

    const toggleStatus = async (staff: Staff): Promise<void> => {
        try {
            const nextStatus: StaffStatus = staff.status === 'active' ? 'inactive' : 'active';
            await updateRestaurantStaffStatus(restaurantId, staff._id, { status: nextStatus });
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

    const handleRoleChange = (role: string) => {
        setFilterRole(role);
        setPage(1);
    };

    const handleStatusChange = (status: string) => {
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

export { mapDetailToCard };
