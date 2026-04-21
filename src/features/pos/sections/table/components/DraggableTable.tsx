import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TableCard, { type Table } from './TableCard';

interface DraggableTableProps {
  table: Table;
  isSelected?: boolean;
  isActive?: boolean;
  isEditingMode?: boolean;
  hasChanged?: boolean;
  onTableClick: (table: Table) => void;
}

const DraggableTable: React.FC<DraggableTableProps> = ({
  table,
  isSelected    = false,
  isActive      = false,
  isEditingMode = false,
  hasChanged    = false,
  onTableClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table._id,
  });

  const style: React.CSSProperties = {
    position:  'absolute',
    left:      `${table.x}px`,
    top:       `${table.y}px`,
    transform: CSS.Translate.toString(transform),
    zIndex:    isDragging || isActive ? 50 : 10,
    cursor:    isDragging ? 'grabbing' : 'grab',
    opacity:   isDragging ? 0 : 1,
    transition: 'none',
  };

  const handleClick = (clickedTable: Table) => {
    if (!isEditingMode) onTableClick(clickedTable);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        select-none !cursor-grab active:!cursor-grabbing
        ${isSelected && !isEditingMode ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${hasChanged && isEditingMode  ? 'ring-2 ring-warning ring-offset-2' : ''}
      `}
      {...listeners}
      {...attributes}
    >
      <TableCard
        table={table}
        onTableClick={handleClick}
        isDragging={isDragging || isActive}
        isEditingMode={isEditingMode}
        hasChanged={hasChanged}
      />
    </div>
  );
};

export default DraggableTable;
