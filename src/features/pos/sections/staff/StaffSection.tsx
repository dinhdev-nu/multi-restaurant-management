import React from 'react';
import Icon from '@/components/AppIcon';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import {
    createRestaurantStaff,
    deleteRestaurantStaff,
    getRestaurantStaffDetail,
    linkRestaurantStaffAccount,
    listRestaurantStaff,
    toStaffEndpointError,
    updateRestaurantStaffAvatar,
    updateRestaurantStaffInfo,
    updateRestaurantStaffPermissions,
    updateRestaurantStaffStatus,
} from '@/services/staff';
import { demoRestaurant } from '@/features/pos/pos-mock';
import type {
    StaffDetail,
    StaffPermissions,
    StaffPosition,
    StaffStatus,
} from '@/types/staff-type';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import StaffCard, { type Staff } from './components/StaffCard';
import StaffTable from './components/StaffTable';
import StaffFormModal, { type StaffFormData, type StaffFormMode } from './components/StaffFormModal';
import StaffDetailsModal from './components/StaffDetailsModal';
import BulkActionsBar, { type BulkAction } from './components/BulkActionsBar';

// Options
const roleOptions = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'manager', label: 'Quản lý' },
    { value: 'cashier', label: 'Thu ngân' },
    { value: 'kitchen', label: 'Nhân viên bếp' },
    { value: 'waiter', label: 'Phục vụ' },
    { value: 'delivery', label: 'Giao hàng' },
];

const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang làm việc' },
    { value: 'inactive', label: 'Không hoạt động' },
    { value: 'on_leave', label: 'Đang nghỉ' },
    { value: 'terminated', label: 'Đã nghỉ việc' },
];

const sortOptions = [
    { value: 'name', label: 'Tên A-Z' },
    { value: 'name-desc', label: 'Tên Z-A' },
    { value: 'role', label: 'Vai trò' },
    { value: 'status', label: 'Trạng thái' },
    { value: 'join-date', label: 'Ngày vào làm' },
];

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
};

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

const MOCK_STAFF_FALLBACK: Staff[] = [
    {
        _id: 'mock-staff-001',
        restaurantId: demoRestaurant.id,
        userId: 'mock-user-001',
        name: 'Nguyen Van An',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        employeeId: 'NV001',
        phone: '0901234567',
        email: 'an.staff@example.com',
        joinDate: '2024-08-15T00:00:00.000Z',
        role: 'manager',
        roleDisplay: ROLE_LABEL.manager,
        status: 'active',
        statusDisplay: STATUS_LABEL.active,
    },
    {
        _id: 'mock-staff-002',
        restaurantId: demoRestaurant.id,
        userId: 'mock-user-002',
        name: 'Tran Thi Binh',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        employeeId: 'NV002',
        phone: '0912345678',
        email: 'binh.staff@example.com',
        joinDate: '2024-10-20T00:00:00.000Z',
        role: 'cashier',
        roleDisplay: ROLE_LABEL.cashier,
        status: 'on_leave',
        statusDisplay: STATUS_LABEL.on_leave,
    },
];

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
        roleDisplay: ROLE_LABEL[position],
        status,
        statusDisplay: STATUS_LABEL[status],
    };
}

function buildPermissionsPatch(raw: string): Partial<StaffPermissions> | null {
    try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const keys: Array<keyof StaffPermissions> = [
            'can_discount',
            'can_cancel_order',
            'can_process_payment',
            'can_refund',
            'can_view_reports',
            'can_manage_tables',
            'can_manage_menu',
        ];

        const output: Partial<StaffPermissions> = {};
        keys.forEach((key) => {
            if (typeof parsed[key] === 'boolean') {
                output[key] = parsed[key] as boolean;
            }
        });

        return Object.keys(output).length > 0 ? output : null;
    } catch {
        return null;
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

const StaffSection: React.FC = () => {
    const restaurantId = demoRestaurant.id;
    const hasAnnouncedMockFallbackRef = React.useRef(false);
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<'cards' | 'table'>('cards');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterRole, setFilterRole] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('');
    const [sortBy, setSortBy] = React.useState('name');
    const [page, setPage] = React.useState(1);
    const [limit] = React.useState(20);
    const [total, setTotal] = React.useState(0);

    const [staffData, setStaffData] = React.useState<Staff[]>([]);
    const [selectedStaff, setSelectedStaff] = React.useState<string[]>([]);

    const [showStaffModal, setShowStaffModal] = React.useState(false);
    const [staffModalMode, setStaffModalMode] = React.useState<StaffFormMode>('add');
    const [showDetailsModal, setShowDetailsModal] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [selectedStaffForDetails, setSelectedStaffForDetails] = React.useState<Staff | null>(null);
    const [selectedStaffDetail, setSelectedStaffDetail] = React.useState<StaffDetail | null>(null);
    const [staffToDelete, setStaffToDelete] = React.useState<Staff | null>(null);
    const [editingStaffId, setEditingStaffId] = React.useState<string | null>(null);

    const [staffFormData, setStaffFormData] = React.useState<StaffFormData>(DEFAULT_FORM_DATA);
    const isCardsView = viewMode === 'cards';

    const fetchStaffData = React.useCallback(async () => {
        setIsLoadingData(true);
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
                phone: null,
                email: null,
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
            setStaffData(MOCK_STAFF_FALLBACK);
            setTotal(MOCK_STAFF_FALLBACK.length);

            if (!hasAnnouncedMockFallbackRef.current) {
                toast.warning('Server Staff chua san sang, dang dung du lieu mock 2 nhan vien de test UI');
                hasAnnouncedMockFallbackRef.current = true;
            }

            const normalized = toStaffEndpointError('list', error);
            console.warn('[StaffSection] list API failed, fallback to mock data:', normalized.errorCode, normalized.message);
        } finally {
            setIsLoadingData(false);
        }
    }, [restaurantId, page, limit, filterRole, filterStatus]);

    React.useEffect(() => {
        void fetchStaffData();
    }, [fetchStaffData]);

    const filteredAndSortedStaff = React.useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        const filtered = staffData.filter((staff) => {
            if (!keyword) {
                return true;
            }

            return (
                staff.name.toLowerCase().includes(keyword) ||
                (staff.email || '').toLowerCase().includes(keyword) ||
                (staff.employeeId || '').toLowerCase().includes(keyword)
            );
        });

        return [...filtered].sort((a, b) => {
            if (sortBy === 'name-desc') {
                return b.name.localeCompare(a.name, 'vi');
            }
            if (sortBy === 'role') {
                return a.roleDisplay.localeCompare(b.roleDisplay, 'vi');
            }
            if (sortBy === 'status') {
                return a.statusDisplay.localeCompare(b.statusDisplay, 'vi');
            }
            if (sortBy === 'join-date') {
                return new Date(b.joinDate ?? 0).getTime() - new Date(a.joinDate ?? 0).getTime();
            }
            return a.name.localeCompare(b.name, 'vi');
        });
    }, [staffData, searchTerm, sortBy]);

    const isAllSelected = selectedStaff.length > 0 && selectedStaff.length === filteredAndSortedStaff.length;

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

    const resetForm = () => setStaffFormData(DEFAULT_FORM_DATA);

    const openAddModal = () => {
        setStaffModalMode('add');
        setEditingStaffId(null);
        resetForm();
        setShowStaffModal(true);
    };

    const openEditModal = async (staff: Staff) => {
        setStaffModalMode('edit');
        setEditingStaffId(staff._id);
        setShowStaffModal(true);

        try {
            const detail = await getRestaurantStaffDetail(restaurantId, staff._id);
            setSelectedStaffDetail(detail);
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
            });
        } catch (error) {
            toast.error(toStaffEndpointError('detail', error).message);
        }
    };

    const handleFieldChange = (field: keyof StaffFormData, value: string) => {
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
                    return;
                }

                await createRestaurantStaff(restaurantId, {
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

                toast.success('Tạo nhân viên thành công');
            } else if (editingStaffId) {
                await updateRestaurantStaffInfo(restaurantId, editingStaffId, {
                    full_name: staffFormData.name.trim() || undefined,
                    position: (staffFormData.role as StaffPosition) || undefined,
                    hire_date: staffFormData.startDate || undefined,
                    phone: staffFormData.phone.trim() || undefined,
                    email: staffFormData.email.trim() || undefined,
                });

                if (staffFormData.userId.trim()) {
                    await linkRestaurantStaffAccount(restaurantId, editingStaffId, {
                        user_id: staffFormData.userId.trim(),
                    });
                }

                if (staffFormData.status && selectedStaffDetail?.status !== staffFormData.status) {
                    await updateRestaurantStaffStatus(restaurantId, editingStaffId, {
                        status: staffFormData.status as StaffStatus,
                    });
                }

                if (staffFormData.avatar && /^https?:\/\//.test(staffFormData.avatar)) {
                    await updateRestaurantStaffAvatar(restaurantId, editingStaffId, { avatar_url: staffFormData.avatar });
                }

                toast.success('Cập nhật nhân viên thành công');
            }

            setShowStaffModal(false);
            resetForm();
            await fetchStaffData();
        } catch (error) {
            const endpoint = staffModalMode === 'add' ? 'create' : 'update-info';
            toast.error(toStaffEndpointError(endpoint, error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewDetails = async (staff: Staff) => {
        setSelectedStaffForDetails(staff);
        setShowDetailsModal(true);

        try {
            const detail = await getRestaurantStaffDetail(restaurantId, staff._id);
            setSelectedStaffDetail(detail);
            setSelectedStaffForDetails(mapDetailToCard(detail));
        } catch (error) {
            toast.error(toStaffEndpointError('detail', error).message);
        }
    };

    const handleToggleStatus = async (staff: Staff) => {
        try {
            const nextStatus: StaffStatus = staff.status === 'active' ? 'inactive' : 'active';
            await updateRestaurantStaffStatus(restaurantId, staff._id, { status: nextStatus });
            toast.success('Cập nhật trạng thái thành công');
            await fetchStaffData();
        } catch (error) {
            toast.error(toStaffEndpointError('update-status', error).message);
        }
    };

    const handleDeleteRequest = (staff: Staff) => {
        setStaffToDelete(staff);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!staffToDelete) return;
        try {
            await deleteRestaurantStaff(restaurantId, staffToDelete._id);
            toast.success('Đã xóa nhân viên');
            setShowDeleteConfirm(false);
            setStaffToDelete(null);
            await fetchStaffData();
        } catch (error) {
            toast.error(toStaffEndpointError('delete', error).message);
        }
    };

    const handleSelectStaff = (id: string) => {
        setSelectedStaff((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedStaff(filteredAndSortedStaff.map((s) => s._id));
            return;
        }
        setSelectedStaff([]);
    };

    const handleBulkRoleChange = async (role: string) => {
        if (!role || selectedStaff.length === 0) return;
        try {
            await Promise.all(selectedStaff.map((id) => updateRestaurantStaffInfo(restaurantId, id, { position: role as StaffPosition })));
            toast.success('Đã cập nhật vai trò hàng loạt');
            setSelectedStaff([]);
            await fetchStaffData();
        } catch (error) {
            toast.error(toStaffEndpointError('update-info', error).message);
        }
    };

    const handleBulkStatusChange = async (status: string) => {
        if (!status || selectedStaff.length === 0) return;
        try {
            await Promise.all(selectedStaff.map((id) => updateRestaurantStaffStatus(restaurantId, id, { status: status as StaffStatus })));
            toast.success('Đã cập nhật trạng thái hàng loạt');
            setSelectedStaff([]);
            await fetchStaffData();
        } catch (error) {
            toast.error(toStaffEndpointError('update-status', error).message);
        }
    };

    const handleBulkAction = (action: BulkAction) => {
        if (action === 'delete') {
            toast.info('Hãy xóa từng nhân viên để đảm bảo an toàn dữ liệu');
            return;
        }
        toast.info('Tính năng đang được cập nhật');
    };

    const handleLinkAccount = async (staff: Staff) => {
        const nextUserId = window.prompt('Nhập user_id mới để liên kết tài khoản:', selectedStaffDetail?.user_id ?? '');
        if (!nextUserId) return;
        try {
            await linkRestaurantStaffAccount(restaurantId, staff._id, { user_id: nextUserId.trim() });
            toast.success('Đổi tài khoản liên kết thành công');
            await fetchStaffData();
        } catch (error) {
            toast.error(toStaffEndpointError('link-account', error).message);
        }
    };

    const handleUpdatePermissions = async (staff: Staff) => {
        const raw = window.prompt(
            'Nhập JSON permissions (vd: {"can_discount":true,"can_manage_menu":false}):',
            '{"can_discount":true}'
        );
        if (!raw) return;

        const patch = buildPermissionsPatch(raw);
        if (!patch) {
            toast.error('JSON permissions không hợp lệ');
            return;
        }

        try {
            await updateRestaurantStaffPermissions(restaurantId, staff._id, patch);
            toast.success('Cập nhật quyền thành công');
        } catch (error) {
            toast.error(toStaffEndpointError('update-permissions', error).message);
        }
    };

    const handleUpdateAvatar = async (staff: Staff) => {
        const avatarUrl = window.prompt('Nhập URL avatar mới (https://...):', staff.avatar ?? '');
        if (!avatarUrl) return;
        try {
            await updateRestaurantStaffAvatar(restaurantId, staff._id, { avatar_url: avatarUrl.trim() });
            toast.success('Cập nhật avatar thành công');
            await fetchStaffData();
        } catch (error) {
            toast.error(toStaffEndpointError('update-avatar', error).message);
        }
    };

    return (
        <div>
            {isLoadingData ? (
                <div className="flex items-center justify-center gap-3 p-6 text-muted-foreground">
                    <Spinner className="size-5" />
                    <span className="text-sm">Đang tải danh sách nhân viên...</span>
                </div>
            ) : (
                <div className="p-6">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="flex items-center gap-3 text-2xl font-semibold text-foreground">
                                    <span>Quản lý nhân viên</span>
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Quản lý thông tin và quyền truy cập của nhân viên trong hệ thống POS
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    iconName="Download"
                                    iconPosition="left"
                                    className="hover-scale"
                                >
                                    Xuất Excel
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={openAddModal}
                                    iconName="UserPlus"
                                    iconPosition="left"
                                    className="hover-scale"
                                >
                                    Thêm nhân viên
                                </Button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-card border border-border rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Icon name="Users" size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-card-foreground">{staffStats.total}</p>
                                        <p className="text-sm text-muted-foreground">Tổng nhân viên</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                                        <Icon name="UserCheck" size={20} className="text-success" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-card-foreground">{staffStats.active}</p>
                                        <p className="text-sm text-muted-foreground">Đang làm việc</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-warning/10">
                                        <Icon name="UserX" size={20} className="text-warning" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-card-foreground">{staffStats.onLeave}</p>
                                        <p className="text-sm text-muted-foreground">Đang nghỉ</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-error/10">
                                        <Icon name="UserMinus" size={20} className="text-error" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-card-foreground">{staffStats.terminated}</p>
                                        <p className="text-sm text-muted-foreground">Đã nghỉ việc</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Controls */}
                    <div className="bg-card border border-border rounded-lg p-6 mb-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
                            {/* Search and Filters */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                <div className="relative">
                                    <Input
                                        type="search"
                                        placeholder="Tìm kiếm nhân viên..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-full sm:w-64"
                                    />
                                    <Icon
                                        name="Search"
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    />
                                </div>

                                <Select
                                    placeholder="Vai trò"
                                    options={roleOptions}
                                    value={filterRole}
                                    onChange={(e) => {
                                        setFilterRole(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full sm:w-40"
                                />

                                <Select
                                    placeholder="Trạng thái"
                                    options={statusOptions}
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full sm:w-40"
                                />

                                <Select
                                    placeholder="Sắp xếp"
                                    options={sortOptions}
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full sm:w-40"
                                />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={isCardsView ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('cards')}
                                    className="hover-scale"
                                >
                                    <Icon name="Grid3X3" size={18} />
                                </Button>
                                <Button
                                    variant={isCardsView ? 'outline' : 'default'}
                                    size="icon"
                                    onClick={() => setViewMode('table')}
                                    className="hover-scale"
                                >
                                    <Icon name="List" size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    <BulkActionsBar
                        selectedCount={selectedStaff.length}
                        onClearSelection={() => setSelectedStaff([])}
                        onBulkAction={handleBulkAction}
                        onBulkRoleChange={handleBulkRoleChange}
                        onBulkStatusChange={handleBulkStatusChange}
                    />

                    {/* Staff List */}
                    {isCardsView ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredAndSortedStaff.map((staff) => (
                                <StaffCard
                                    key={staff._id}
                                    staff={staff}
                                    onEdit={openEditModal}
                                    onToggleStatus={handleToggleStatus}
                                    onViewDetails={handleViewDetails}
                                    onDelete={handleDeleteRequest}
                                />
                            ))}
                        </div>
                    ) : (
                        <StaffTable
                            staff={filteredAndSortedStaff}
                            onEdit={openEditModal}
                            onToggleStatus={handleToggleStatus}
                            onViewDetails={handleViewDetails}
                            onDelete={handleDeleteRequest}
                            selectedStaff={selectedStaff}
                            onSelectStaff={handleSelectStaff}
                            onSelectAll={handleSelectAll}
                            isAllSelected={isAllSelected}
                        />
                    )}

                    {total > limit && (
                        <div className="mt-6 flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                Trước
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Trang {page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page * limit >= total}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Sau
                            </Button>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredAndSortedStaff.length === 0 && (
                        <div className="text-center py-12">
                            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                                <Icon name="Users" size={32} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                {searchTerm || filterRole || filterStatus ? 'Không tìm thấy nhân viên' : 'Chưa có nhân viên nào'}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {searchTerm || filterRole || filterStatus
                                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                                    : 'Thêm nhân viên đầu tiên để bắt đầu quản lý'
                                }
                            </p>
                            {!searchTerm && !filterRole && !filterStatus && (
                                <Button
                                    variant="default"
                                    onClick={openAddModal}
                                    iconName="UserPlus"
                                    iconPosition="left"
                                    className="hover-scale"
                                >
                                    Thêm nhân viên đầu tiên
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <StaffFormModal
                isOpen={showStaffModal}
                onClose={() => {
                    setShowStaffModal(false);
                    resetForm();
                }}
                onSubmit={handleSubmit}
                onFieldChange={handleFieldChange}
                formData={staffFormData}
                mode={staffModalMode}
                isLoading={isSubmitting}
            />
            <StaffDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                staff={selectedStaffForDetails}
                detail={selectedStaffDetail}
                onEdit={openEditModal}
                onLinkAccount={handleLinkAccount}
                onUpdatePermissions={handleUpdatePermissions}
                onUpdateAvatar={handleUpdateAvatar}
            />
            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setStaffToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Xóa nhân viên"
                message={`Bạn có chắc chắn muốn xóa nhân viên "${staffToDelete?.name ?? ''}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
                icon="Trash2"
            />
        </div>
    );
};

export default StaffSection;