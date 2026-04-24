import React from 'react';
import Button from '../../../components/Button';

interface StaffHeaderProps {
    onAddStaff: () => void;
}

const StaffHeader: React.FC<StaffHeaderProps> = ({ onAddStaff }) => {
    return (
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
                    variant="default"
                    onClick={onAddStaff}
                    iconName="UserPlus"
                    iconPosition="left"
                    className="hover-scale"
                >
                    Thêm nhân viên
                </Button>
            </div>
        </div>
    );
};

export default StaffHeader;
