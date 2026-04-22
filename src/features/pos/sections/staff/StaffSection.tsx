import React from 'react';
import Icon from '@/components/AppIcon';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { Spinner } from '@/components/ui/spinner';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import StaffCard, { type Staff } from './components/StaffCard';
import StaffTable, { type StaffDynamicData } from './components/StaffTable';
import StaffFormModal, { type StaffFormData, type StaffFormMode } from './components/StaffFormModal';
import StaffDetailsModal from './components/StaffDetailsModal';
import BulkActionsBar, { type BulkAction } from './components/BulkActionsBar';

// ─── Static mock data ────────────────────────────────────────────────────────

const isLoadingData = false;
const viewMode: 'cards' | 'table' = 'cards';
const isCardsView = viewMode === 'cards';

// Filter / sort states
const searchTerm = '';
const filterRole = '';
const filterStatus = '';
const sortBy = 'name';
const noop = () => { };
const noopStaffAction: (staff: Staff) => void = () => { };
const noopSelectStaff: (id: string) => void = () => { };
const noopSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void = () => { };
const noopBulkAction: (action: BulkAction) => void = () => { };
const noopStringAction: (value: string) => void = () => { };
const noopFieldChange: (field: keyof StaffFormData, value: string) => void = () => { };

// Modal states
const showStaffModal = false;
const staffModalMode: StaffFormMode = 'add';
const showDetailsModal = false;
const showDeleteConfirm = false;
const selectedStaffForDetails: Staff | null = null;
const selectedStaffForDeleteName = '';
const selectedStaff: string[] = [];

const staffFormData: StaffFormData = {
    name: '',
    phone: '',
    email: '',
    role: '',
    shift: '',
    workingHours: '',
    salary: '',
    startDate: '',
    address: '',
    notes: '',
    avatar: '',
};

// Options
const roleOptions = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'owner', label: 'Chủ cửa hàng' },
    { value: 'manager', label: 'Quản lý' },
    { value: 'cashier', label: 'Thu ngân' },
    { value: 'kitchen', label: 'Nhân viên bếp' },
    { value: 'waiter', label: 'Phục vụ' },
    { value: 'cleaner', label: 'Vệ sinh' }
];

const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang làm việc' },
    { value: 'on-break', label: 'Đang nghỉ' },
    { value: 'inactive', label: 'Nghỉ phép' }
];

const sortOptions = [
    { value: 'name', label: 'Tên A-Z' },
    { value: 'name-desc', label: 'Tên Z-A' },
    { value: 'role', label: 'Vai trò' },
    { value: 'status', label: 'Trạng thái' },
    { value: 'join-date', label: 'Ngày vào làm' },
    { value: 'performance', label: 'Hiệu suất' }
];

// Mock staff list
const staffData: Staff[] = [
    {
        _id: 'staff001', name: 'Nguyễn Văn An', employeeId: 'NV001',
        phone: '0901234567', email: 'an@pos.vn',
        role: 'manager', roleDisplay: 'Quản lý',
        status: 'active', statusDisplay: 'Đang làm việc',
        shift: 'Ca sáng', workingHours: '8h 0p',
        joinDate: '2023-01-15', ordersToday: 24,
        avatar: '', address: 'Hà Nội', notes: ''
    },
    {
        _id: 'staff002', name: 'Trần Thị Bình', employeeId: 'NV002',
        phone: '0912345678', email: 'binh@pos.vn',
        role: 'cashier', roleDisplay: 'Thu ngân',
        status: 'active', statusDisplay: 'Đang làm việc',
        shift: 'Ca chiều', workingHours: '7h 30p',
        joinDate: '2023-03-20', ordersToday: 18,
        avatar: '', address: 'TP.HCM', notes: ''
    },
    {
        _id: 'staff003', name: 'Lê Minh Cường', employeeId: 'NV003',
        phone: '0923456789', email: 'cuong@pos.vn',
        role: 'kitchen', roleDisplay: 'Nhân viên bếp',
        status: 'on-break', statusDisplay: 'Đang nghỉ',
        shift: 'Ca đêm', workingHours: '6h 45p',
        joinDate: '2023-06-10', ordersToday: 0,
        avatar: '', address: 'Đà Nẵng', notes: ''
    },
    {
        _id: 'staff004', name: 'Phạm Thị Dung', employeeId: 'NV004',
        phone: '0934567890', email: 'dung@pos.vn',
        role: 'waiter', roleDisplay: 'Phục vụ',
        status: 'inactive', statusDisplay: 'Nghỉ phép',
        shift: 'Ca sáng', workingHours: '0h 0p',
        joinDate: '2023-08-05', ordersToday: 0,
        avatar: '', address: 'TP.HCM', notes: ''
    }
];

const filteredAndSortedStaff: Staff[] = staffData;

const dynamicData = new Map<string, StaffDynamicData>(
    staffData.map((staff) => [
        staff._id,
        {
            ordersToday: staff.ordersToday ?? 0,
            workedDisplay: staff.workingHours ?? '0h 0p',
        },
    ])
);

const isAllSelected = selectedStaff.length === filteredAndSortedStaff.length && filteredAndSortedStaff.length > 0;

// Mock staff stats
const staffStats = {
    total: staffData.length,
    active: staffData.filter((s) => s.status === 'active').length,
    onBreak: staffData.filter((s) => s.status === 'on-break').length,
    averageOrders: Math.round(
        staffData.reduce((sum, s) => sum + (s.ordersToday ?? 0), 0) / staffData.length
    )
};

// ─── Component ────────────────────────────────────────────────────────────────

const StaffSection: React.FC = () => {
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
                                    onClick={noop}
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
                                        <p className="text-lg font-semibold text-card-foreground">{staffStats.onBreak}</p>
                                        <p className="text-sm text-muted-foreground">Đang nghỉ</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                                        <Icon name="TrendingUp" size={20} className="text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-card-foreground">{staffStats.averageOrders}</p>
                                        <p className="text-sm text-muted-foreground">Đơn TB/người</p>
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
                                        onChange={noop}
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
                                    onChange={noop}
                                    className="w-full sm:w-40"
                                />

                                <Select
                                    placeholder="Trạng thái"
                                    options={statusOptions}
                                    value={filterStatus}
                                    onChange={noop}
                                    className="w-full sm:w-40"
                                />

                                <Select
                                    placeholder="Sắp xếp"
                                    options={sortOptions}
                                    value={sortBy}
                                    onChange={noop}
                                    className="w-full sm:w-40"
                                />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={isCardsView ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={noop}
                                    className="hover-scale"
                                >
                                    <Icon name="Grid3X3" size={18} />
                                </Button>
                                <Button
                                    variant={isCardsView ? 'outline' : 'default'}
                                    size="icon"
                                    onClick={noop}
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
                        onClearSelection={noop}
                        onBulkAction={noopBulkAction}
                        onBulkRoleChange={noopStringAction}
                        onBulkStatusChange={noopStringAction}
                    />

                    {/* Staff List */}
                    {isCardsView ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredAndSortedStaff.map((staff) => (
                                <StaffCard
                                    key={staff._id}
                                    staff={staff}
                                    ordersToday={dynamicData.get(staff._id)?.ordersToday ?? 0}
                                    workedDisplay={dynamicData.get(staff._id)?.workedDisplay ?? '0h 0p'}
                                    onEdit={noopStaffAction}
                                    onToggleStatus={noopStaffAction}
                                    onViewDetails={noopStaffAction}
                                    onDelete={noopStaffAction}
                                />
                            ))}
                        </div>
                    ) : (
                        <StaffTable
                            staff={filteredAndSortedStaff}
                            dynamicData={dynamicData}
                            onEdit={noopStaffAction}
                            onToggleStatus={noopStaffAction}
                            onViewDetails={noopStaffAction}
                            onDelete={noopStaffAction}
                            selectedStaff={selectedStaff}
                            onSelectStaff={noopSelectStaff}
                            onSelectAll={noopSelectAll}
                            isAllSelected={isAllSelected}
                        />
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
                                    onClick={noop}
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
                onClose={noop}
                onSubmit={noop}
                onFieldChange={noopFieldChange}
                formData={staffFormData}
                mode={staffModalMode}
            />
            <StaffDetailsModal
                isOpen={showDetailsModal}
                onClose={noop}
                staff={selectedStaffForDetails}
                onEdit={noopStaffAction}
            />
            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={noop}
                onConfirm={noop}
                title="Xóa nhân viên"
                message={`Bạn có chắc chắn muốn xóa nhân viên "${selectedStaffForDeleteName}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
                icon="Trash2"
            />
        </div>
    );
};

export default StaffSection;