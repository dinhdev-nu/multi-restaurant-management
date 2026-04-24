import React, { memo } from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
import { cn } from '@/lib/utils';
import Button from '../../../components/Button';
import type { Staff } from './StaffCard';

interface StaffTableProps {
  staff: Staff[];
  selectedStaff: string[];
  isAllSelected: boolean;
  onSelectStaff: (id: string) => void;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (staff: Staff) => void;
  onToggleStatus: (staff: Staff) => void;
  onViewDetails: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

// ── Style maps ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<Staff['status'], string> = {
  'active': 'text-success',
  'inactive': 'text-muted-foreground',
  'on_leave': 'text-warning',
  'terminated': 'text-error',
};

const STATUS_BG: Record<Staff['status'], string> = {
  'active': 'bg-success/10',
  'inactive': 'bg-muted',
  'on_leave': 'bg-warning/10',
  'terminated': 'bg-error/10',
};

const STATUS_DOT: Record<Staff['status'], string> = {
  'active': 'bg-success',
  'inactive': 'bg-muted-foreground',
  'on_leave': 'bg-warning',
  'terminated': 'bg-error',
};

const ROLE_COLOR: Record<string, string> = {
  manager: 'bg-accent text-accent-foreground',
  cashier: 'bg-secondary text-secondary-foreground',
  kitchen: 'bg-success text-success-foreground',
  delivery: 'bg-primary text-primary-foreground',
};

const getRoleColor = (role: string): string =>
  ROLE_COLOR[role] ?? 'bg-muted text-muted-foreground';

// ── Component ─────────────────────────────────────────────────────────────────

const StaffTable = memo<StaffTableProps>(({
  staff,
  selectedStaff,
  isAllSelected,
  onSelectStaff,
  onSelectAll,
  onEdit,
  onToggleStatus,
  onViewDetails,
  onDelete,
}) => (
  <div className="bg-card border border-border rounded-lg overflow-hidden">
    {/* Mobile warning */}
    <div className="md:hidden flex items-center gap-2 border-b border-warning/20 bg-warning/10 p-3">
      <Icon name="Info" size={16} className="text-warning" />
      <p className="text-sm text-warning">Cuộn sang ngang để xem đầy đủ thông tin</p>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead className="bg-muted/30 border-b border-border">
          <tr>
            <th className="text-left p-4 font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onSelectAll}
                className="rounded border-border"
              />
            </th>
            <th className="text-left p-4 font-medium text-muted-foreground">Nhân viên</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Vai trò</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Trạng thái</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Liên hệ</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Ngày vào làm</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member, index) => {
            return (
              <tr
                key={member._id}
                className={cn(
                  'border-b border-border transition-colors duration-200 hover:bg-muted/20',
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/5'
                )}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedStaff.includes(member._id)}
                    onChange={() => onSelectStaff(member._id)}
                    className="rounded border-border"
                  />
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="size-10 rounded-full overflow-hidden bg-muted">
                        <Image src={member.avatar ?? ''} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <div className={cn('absolute -bottom-0.5 -right-0.5 size-3 rounded-full border border-card', STATUS_DOT[member.status])} />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.employeeId}</p>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <span className={cn('rounded-full px-2 py-1 text-xs font-medium', getRoleColor(member.role))}>
                    {member.roleDisplay}
                  </span>
                </td>

                <td className="p-4">
                  <span className={cn('rounded-full px-2 py-1 text-xs font-medium', STATUS_BG[member.status], STATUS_COLOR[member.status])}>
                    {member.statusDisplay}
                  </span>
                </td>

                <td className="p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Icon name="Phone" size={12} />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Icon name="Mail" size={12} />
                      <span className="truncate max-w-32">{member.email}</span>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <div className="text-sm">
                    <p className="text-card-foreground font-medium">
                      {member.joinDate ? new Date(member.joinDate).toLocaleDateString('vi-VN') : '---'}
                    </p>
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails(member)} className="hover-scale">
                      <Icon name="Eye" size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(member)} className="hover-scale">
                      <Icon name="Edit" size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onToggleStatus(member)} className="hover-scale">
                      <Icon name={member.status === 'active' ? 'Pause' : 'Play'} size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(member)}
                      className="hover-scale text-error hover:text-error"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
));

StaffTable.displayName = 'StaffTable';

export default StaffTable;
