import type { TableListItem, TableRecord } from '@/types/table-type';
import type { Table } from './components/TableCard';

export const clamp = (value: number, min: number, max: number) => {
    if (value < min) return min;
    if (value > max) return max;
    return value;
};

export const randomOrderCode = () => `OD${Math.floor(1000 + Math.random() * 9000)}`;

export const normalizeTableId = (table: { id?: string; _id?: string }) => table.id ?? table._id ?? '';

export const getDefaultPosition = (index: number) => {
    const column = index % 4;
    const row = Math.floor(index / 4);
    return {
        x: 90 + column * 170,
        y: 60 + row * 160,
    };
};

export const inferShape = (capacity: number, index: number): 'rectangular' | 'circular' => {
    if (capacity >= 6) return 'circular';
    return index % 3 === 0 ? 'circular' : 'rectangular';
};

export const toTableFromListItem = (item: TableListItem, index: number): Table | null => {
    const id = normalizeTableId(item);
    if (!id) return null;

    const position = getDefaultPosition(index);

    return {
        _id: id,
        number: item.table_number,
        name: item.name,
        notes: item.notes ?? null,
        status: item.status,
        shape: inferShape(item.capacity, index),
        capacity: item.capacity,
        currentOccupancy: item.status === 'occupied' ? 1 : 0,
        isActive: item.is_active,
        hasQr: item.has_qr,
        qrCode: null,
        x: position.x,
        y: position.y,
    };
};

export const toTableFromRecord = (item: TableRecord, index: number): Table | null => {
    const id = normalizeTableId(item);
    if (!id) return null;

    const position = getDefaultPosition(index);

    return {
        _id: id,
        number: item.table_number,
        name: item.name,
        notes: item.notes,
        status: item.status,
        shape: inferShape(item.capacity, index),
        capacity: item.capacity,
        currentOccupancy: item.status === 'occupied' ? 1 : 0,
        isActive: item.is_active,
        hasQr: Boolean(item.qr_code),
        qrCode: item.qr_code,
        x: position.x,
        y: position.y,
    };
};
