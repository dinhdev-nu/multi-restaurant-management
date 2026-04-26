import React from 'react';
import Icon from '@/components/AppIcon';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { Spinner } from '@/components/ui/spinner';
import { useRequiredPosData } from '@/features/pos/contexts/usePosContext';
import type { StaffDetail, StaffPosition } from '@/types/staff-type';
import type { Staff } from './components/StaffCard';
import Button from '../../components/Button';
import StaffCard from './components/StaffCard';
import StaffTable from './components/StaffTable';
import StaffFormModal from './components/StaffFormModal';
import StaffDetailsModal from './components/StaffDetailsModal';
import StaffStatsCards from './components/StaffStatsCards';
import StaffFilters from './components/StaffFilters';
import StaffHeader from './components/StaffHeader';
import { useStaffManagement, mapDetailToCard } from './hooks/useStaffManagement';
import { useStaffForm } from './hooks/useStaffForm';
import { getRestaurantStaffDetail, toStaffEndpointError } from '@/services/staff';
import { toast } from 'sonner';

const StaffSection: React.FC = () => {
    const posData = useRequiredPosData();
    const restaurantId = posData.restaurant._id;
    const [viewMode, setViewMode] = React.useState<'cards' | 'table'>('cards');
    const [showDetailsModal, setShowDetailsModal] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [selectedStaffDetail, setSelectedStaffDetail] = React.useState<StaffDetail | null>(null);
    const [staffToDelete, setStaffToDelete] = React.useState<Staff | null>(null);

    const {
        staffData,
        isLoadingData,
        total,
        page, setPage, limit,
        filterRole, handleRoleChange,
        filterStatus, handleStatusChange,
        staffStats,
        refetch,
        toggleStatus,
        deleteStaff,
    } = useStaffManagement(restaurantId);

    const {
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
    } = useStaffForm(restaurantId, refetch);

    const isCardsView = viewMode === 'cards';

    const showStaffDetails = React.useCallback((detail: StaffDetail) => {
        setSelectedStaffDetail(detail);
        setShowDetailsModal(true);
    }, []);

    const handleViewDetails = React.useCallback(async (staff: Staff) => {
        const fallbackDetail: StaffDetail = {
            _id: staff._id,
            restaurant_id: staff.restaurantId || restaurantId,
            user_id: staff.userId || '',
            employee_code: staff.employeeId || '',
            full_name: staff.name,
            phone: staff.phone,
            email: staff.email,
            position: staff.role as StaffPosition,
            hire_date: staff.joinDate || '',
            avatar_url: staff.avatar || '',
            status: staff.status,
            permissions: undefined,
            deleted_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        showStaffDetails(fallbackDetail);

        try {
            const detail = await getRestaurantStaffDetail(restaurantId, staff._id);
            showStaffDetails(detail);
        } catch (error) {
            toast.error(toStaffEndpointError('detail', error).message);
        }
    }, [restaurantId, showStaffDetails]);

    const handleEditStaff = React.useCallback((staff: Staff) => {
        void openEditModal(staff, setSelectedStaffDetail);
    }, [openEditModal]);

    const handleEditStaffFromDetails = React.useCallback((staff: Staff, detail?: StaffDetail | null) => {
        setShowDetailsModal(false);
        void openEditModal(staff, setSelectedStaffDetail, detail ?? selectedStaffDetail);
    }, [openEditModal, selectedStaffDetail]);

    const handleDeleteRequest = React.useCallback((staff: Staff) => {
        setStaffToDelete(staff);
        setShowDeleteConfirm(true);
    }, []);

    const handleDeleteConfirm = React.useCallback(async () => {
        if (!staffToDelete) return;
        try {
            await deleteStaff(staffToDelete._id);
        } finally {
            setShowDeleteConfirm(false);
            setStaffToDelete(null);
        }
    }, [deleteStaff, staffToDelete]);

    const selectedStaffCard = React.useMemo(() => (
        selectedStaffDetail ? mapDetailToCard(selectedStaffDetail) : null
    ), [selectedStaffDetail]);

    return (
        <div>
            {isLoadingData ? (
                <div className="flex items-center justify-center gap-3 p-6 text-muted-foreground">
                    <Spinner className="size-5" />
                    <span className="text-sm">Đang tải danh sách nhân viên...</span>
                </div>
            ) : (
                <div className="p-6">
                    <div className="mb-8">
                        <StaffHeader onAddStaff={openAddModal} />
                        <StaffStatsCards stats={staffStats} />
                    </div>

                    <StaffFilters
                        filterRole={filterRole}
                        filterStatus={filterStatus}
                        viewMode={viewMode}
                        onRoleChange={handleRoleChange}
                        onStatusChange={handleStatusChange}
                        onViewModeChange={setViewMode}
                    />

                    {isCardsView ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {staffData.map((staff) => (
                                <StaffCard
                                    key={staff._id}
                                    staff={staff}
                                    onEdit={handleEditStaff}
                                    onToggleStatus={toggleStatus}
                                    onViewDetails={handleViewDetails}
                                    onDelete={handleDeleteRequest}
                                />
                            ))}
                        </div>
                    ) : (
                        <StaffTable
                            staff={staffData}
                            onEdit={handleEditStaff}
                            onToggleStatus={toggleStatus}
                            onViewDetails={handleViewDetails}
                            onDelete={handleDeleteRequest}
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

                    {staffData.length === 0 && (
                        <div className="text-center py-12">
                            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                                <Icon name="Users" size={32} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                {filterRole || filterStatus ? 'Không tìm thấy kết quả tìm kiếm' : 'Chưa có nhân viên nào'}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {filterRole || filterStatus
                                    ? 'Thử thay đổi bộ lọc hoặc bỏ lọc để xem toàn bộ'
                                    : 'Thêm nhân viên đầu tiên để bắt đầu quản lý'
                                }
                            </p>
                            {!filterRole && !filterStatus && (
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
                staff={selectedStaffCard}
                detail={selectedStaffDetail}
                onEdit={handleEditStaffFromDetails}
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