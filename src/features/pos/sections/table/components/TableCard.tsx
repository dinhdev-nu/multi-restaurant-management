import React from 'react';
import Icon from '@/components/AppIcon';

type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'inactive';
type TableShape = 'rectangular' | 'circular';

export interface Table {
  _id: string;
  number: string | number;
  status: TableStatus;
  shape?: TableShape;
  name?: string | null;
  notes?: string | null;
  isActive?: boolean;
  hasQr?: boolean;
  qrCode?: string | null;
  capacity: number;
  currentOccupancy: number;
  assignedServer?: string;
  orderId?: string;
  x: number;
  y: number;
}

interface TableCardProps {
  table: Table;
  onTableClick: (table: Table) => void;
  isDragging?: boolean;
  isEditingMode?: boolean;
  hasChanged?: boolean;
}

// ── Style maps ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<TableStatus, string> = {
  available: 'bg-success text-success-foreground',
  occupied: 'bg-warning text-warning-foreground',
  reserved: 'bg-error text-error-foreground',
  cleaning: 'bg-primary text-primary-foreground',
  inactive: 'bg-muted text-muted-foreground',
};

const STATUS_ICON: Record<TableStatus, string> = {
  available: 'CheckCircle',
  occupied: 'Users',
  reserved: 'Clock',
  cleaning: 'Sparkles',
  inactive: 'PowerOff',
};

// ── Component ─────────────────────────────────────────────────────────────────

const TableCard: React.FC<TableCardProps> = ({
  table,
  onTableClick,
  isDragging = false,
  isEditingMode = false,
  hasChanged = false,
}) => {
  const isCircular = table.shape === 'circular';

  return (
    <div
      className={`
        relative bg-surface border-2 p-2 pt-3
        transition-all duration-200 hover:shadow-interactive
        ${isCircular ? 'rounded-full w-32 h-32' : 'rounded-lg w-36 min-h-[8rem] h-auto'}
        ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'}
        ${hasChanged && isEditingMode ? 'border-warning' : 'border-border'}
        flex flex-col items-center justify-center
      `}
      onClick={() => onTableClick(table)}
    >
      {/* Changed Indicator */}
      {hasChanged && isEditingMode && (
        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-warning text-warning-foreground flex items-center justify-center shadow-md">
          <Icon name="Move" size={12} />
        </div>
      )}

      {/* Table Number */}
      <div className="text-lg font-bold text-foreground mb-1">{table.number}</div>

      {/* Status Indicator */}
      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${STATUS_COLOR[table.status] ?? 'bg-muted text-muted-foreground'}`}>
        <Icon name={STATUS_ICON[table.status] ?? 'Circle'} size={12} />
      </div>

      {/* Capacity */}
      <div className="text-xs text-muted-foreground flex items-center">
        <Icon name="Users" size={10} className="mr-1" />
        {table.currentOccupancy}/{table.capacity}
      </div>

      {/* Server Info */}
      {table.assignedServer && (
        <div className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
          {table.assignedServer}
        </div>
      )}

      {/* Order Info */}
      {table.orderId && (
        <div className="text-xs text-primary mt-1">#{table.orderId}</div>
      )}
    </div>
  );
};

export default TableCard;
