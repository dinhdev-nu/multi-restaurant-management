import React, { useState } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, DragOverlay, type DragEndEvent } from '@dnd-kit/core';
import TableCard, { type Table } from './TableCard';
import DraggableTable from './DraggableTable';
import Icon from '@/components/AppIcon';
import Button from '../../../components/Button';

interface TableLayoutProps {
  tables: Table[];
  selectedTable?: Table | null;
  isEditingPositions?: boolean;
  changedTableIds?: Set<string>;
  onTableSelect: (table: Table | null) => void;
  onTableClick: (table: Table) => void;
  onTableMove: (id: string, pos: { x: number; y: number }) => void;
  onSavePositionChanges: () => void;
  onCancelEditingPositions: () => void;
}

const TableLayout: React.FC<TableLayoutProps> = ({
  tables,
  selectedTable,
  isEditingPositions = false,
  changedTableIds = new Set(),
  onTableSelect,
  onTableClick,
  onTableMove,
  onSavePositionChanges,
  onCancelEditingPositions,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (delta.x !== 0 || delta.y !== 0) {
      const table = tables.find((t) => t._id === active.id);
      if (table) {
        onTableMove(String(active.id), {
          x: Math.round(table.x + delta.x),
          y: Math.round(table.y + delta.y),
        });
      }
    }
    setActiveId(null);
  };

  const handleLayoutClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingPositions && (e.target as HTMLElement).classList.contains('table-layout')) {
      onTableSelect(null);
    }
  };

  const activeTable = activeId ? tables.find((t) => t._id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex-1 bg-muted/30 relative overflow-hidden">
        {/* Editing Mode Banner */}
        {isEditingPositions && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-warning/90 backdrop-blur-sm border-b-2 border-warning px-4 py-3">
            <div className="flex items-center justify-between max-w-full">
              <div className="flex items-center space-x-3">
                <div className="bg-warning text-warning-foreground rounded-full p-2">
                  <Icon name="Move" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-warning-foreground">Chế độ chỉnh sửa vị trí bàn</h3>
                  <p className="text-sm text-warning-foreground/80">
                    Kéo thả các bàn để thay đổi vị trí.
                    {changedTableIds.size > 0 && ` Đã thay đổi: ${changedTableIds.size} bàn`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancelEditingPositions}
                  iconName="X"
                  iconPosition="left"
                  className="bg-surface text-foreground border-border hover:bg-muted"
                >
                  Hủy
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSavePositionChanges}
                  iconName="Check"
                  iconPosition="left"
                  className="bg-success text-success-foreground hover:bg-success/90"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Layout Grid */}
        <div
          className={`table-layout absolute inset-0 ${isEditingPositions ? 'pt-20' : 'pt-4'} pb-4 px-4 transition-all duration-300`}
          onClick={handleLayoutClick}
          style={{
            backgroundImage: `
              linear-gradient(rgba(148,163,184,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        >
          {tables.map((table) => (
            <DraggableTable
              key={table._id}
              table={table}
              isSelected={selectedTable?._id === table._id}
              isActive={activeId === table._id}
              onTableClick={onTableClick}
              isEditingMode={isEditingPositions}
              hasChanged={changedTableIds.has(table._id)}
            />
          ))}

          {tables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Icon name="Table" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">Chưa có bàn nào</h3>
                <p className="text-muted-foreground">Thêm bàn mới từ bảng điều khiển bên phải</p>
              </div>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTable ? (
            <div className="opacity-80">
              <TableCard table={activeTable} onTableClick={() => { }} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default TableLayout;
