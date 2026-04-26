import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { demoRestaurant } from '@/features/pos/pos-mock';
import {
    listTables,
    getTableDetail,
    createTable,
    updateTable,
    toggleTableActive,
    regenerateTableQrCode,
    deleteTable,
    updateTableStatus,
    toTableEndpointError,
} from '@/services/tables';
import { INITIAL_TABLES, AVAILABLE_SERVERS } from '../constants';
import { clamp, randomOrderCode, toTableFromListItem, toTableFromRecord } from '../utils';
import type { Table } from '../components/TableCard';
import type { UpdateTableForm } from '../components/TableControlPanel';
import type { NewTableForm } from '../components/TableAddModal';

export const useTableManagement = () => {
    const restaurantId = demoRestaurant.id;

    const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [isEditingPositions, setIsEditingPositions] = useState(false);
    const [changedTableIds, setChangedTableIds] = useState<Set<string>>(new Set());
    const [positionSnapshot, setPositionSnapshot] = useState<Record<string, { x: number; y: number }>>({});
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Status states
    const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
    const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
    const [isTogglingActive, setIsTogglingActive] = useState(false);
    const [isRegeneratingQr, setIsRegeneratingQr] = useState(false);

    const tablesRef = useRef<Table[]>(tables);
    useEffect(() => {
        tablesRef.current = tables;
    }, [tables]);

    const resetPositionEditingState = useCallback(() => {
        setIsEditingPositions(false);
        setChangedTableIds(new Set());
        setPositionSnapshot({});
    }, []);

    // Initial Fetch
    useEffect(() => {
        let alive = true;
        const fetchTables = async () => {
            try {
                const response = await listTables(restaurantId);
                if (!alive) return;
                const mapped = response.data
                    .map((item, index) => toTableFromListItem(item, index))
                    .filter((item): item is Table => item !== null);

                setTables(mapped);
            } catch (error) {
                toast.error(`${toTableEndpointError('list', error).message}. Đang hiển thị dữ liệu mẫu.`);
            }
        };
        void fetchTables();
        return () => { alive = false; };
    }, [restaurantId]);

    const selectedTable = useMemo(
        () => tables.find(table => table._id === selectedTableId) ?? null,
        [tables, selectedTableId],
    );

    // Detail Fetch
    useEffect(() => {
        if (!selectedTableId) return;
        let alive = true;
        const fetchDetail = async () => {
            try {
                const detail = await getTableDetail(restaurantId, selectedTableId);
                if (!alive) return;

                setTables(prev => prev.map((table) => {
                    if (table._id !== selectedTableId) return table;
                    const nextHasQr = 'has_qr' in detail ? detail.has_qr : Boolean(detail.qr_code);
                    const nextQrCode = 'qr_code' in detail ? detail.qr_code : table.qrCode ?? null;
                    const nextNotes = 'notes' in detail ? detail.notes : table.notes ?? null;
                    return {
                        ...table,
                        number: detail.table_number,
                        name: detail.name,
                        notes: nextNotes,
                        capacity: detail.capacity,
                        status: detail.status,
                        isActive: detail.is_active,
                        hasQr: nextHasQr,
                        qrCode: nextQrCode,
                    };
                }));
            } catch {
                // Ignore silent fetch detail fail
            }
        };
        void fetchDetail();
        return () => { alive = false; };
    }, [restaurantId, selectedTableId]);

    const stats = useMemo(() => {
        let available = 0;
        let occupied = 0;
        let reserved = 0;
        let cleaning = 0;
        for (const table of tables) {
            if (table.status === 'available') available++;
            else if (table.status === 'occupied') occupied++;
            else if (table.status === 'reserved') reserved++;
            else if (table.status === 'cleaning') cleaning++;
        }
        return { total: tables.length, available, occupied, reserved, cleaning };
    }, [tables]);

    const syncTableSelection = useCallback((table: Table | null) => {
        setSelectedTableId(table?._id ?? null);
    }, []);

    const updateTableById = useCallback((id: string, updater: (table: Table) => Table) => {
        setTables(prev => prev.map(table => (table._id === id ? updater(table) : table)));
    }, []);

    const handleTableMove = useCallback((id: string, position: { x: number; y: number }) => {
        updateTableById(id, table => ({ ...table, x: position.x, y: position.y }));
        setChangedTableIds(prev => {
            const next = new Set(prev);
            const snapshot = positionSnapshot[id];
            if (!snapshot) {
                next.add(id);
                return next;
            }
            if (snapshot.x === position.x && snapshot.y === position.y) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, [updateTableById, positionSnapshot]);

    const handleStartEditingPositions = useCallback(() => {
        const snapshot = Object.fromEntries(
            tables.map(table => [table._id, { x: table.x, y: table.y }])
        );
        setPositionSnapshot(snapshot);
        setChangedTableIds(new Set());
        setIsEditingPositions(true);
    }, [tables]);

    const handleCancelEditingPositions = useCallback(() => {
        setTables(prev => prev.map(table => {
            const originalPosition = positionSnapshot[table._id];
            if (!originalPosition) return table;
            return { ...table, x: originalPosition.x, y: originalPosition.y };
        }));
        resetPositionEditingState();
    }, [positionSnapshot, resetPositionEditingState]);

    const handleSavePositionChanges = useCallback(() => {
        resetPositionEditingState();
    }, [resetPositionEditingState]);

    const submitStatusChange = useCallback(async (
        id: string,
        status: Table['status'],
        mode: 'normal' | 'create-order' | 'print-bill' = 'normal'
    ) => {
        const target = tablesRef.current.find(table => table._id === id);
        if (!target) return false;
        if (mode === 'normal' && target.status === status) return true;
        if (target.isActive === false) {
            toast.error('Bàn đang ngưng hoạt động, không thể đổi trạng thái.');
            return false;
        }

        try {
            await updateTableStatus(restaurantId, id, { status });
            updateTableById(id, table => {
                const nextOccupancy = status === 'occupied'
                    ? clamp(table.currentOccupancy || (mode === 'create-order' ? 2 : 1), 1, table.capacity)
                    : 0;
                const nextOrderId = status === 'occupied' ? (table.orderId ?? randomOrderCode()) : undefined;
                return {
                    ...table,
                    status,
                    currentOccupancy: nextOccupancy,
                    orderId: mode === 'print-bill' ? undefined : nextOrderId,
                };
            });
            return true;
        } catch (error) {
            toast.error(toTableEndpointError('update-status', error).message);
            return false;
        }
    }, [restaurantId, updateTableById]);

    const handleTableStatusChange = useCallback((id: string, status: Table['status']) => {
        void submitStatusChange(id, status);
    }, [submitStatusChange]);

    const handleServerAssign = useCallback((id: string, serverLabel: string | null) => {
        updateTableById(id, table => ({ ...table, assignedServer: serverLabel ?? undefined }));
    }, [updateTableById]);

    const handleAddTable = useCallback((form: NewTableForm) => {
        if (isSubmittingAdd) return;
        void (async () => {
            setIsSubmittingAdd(true);
            try {
                const created = await createTable(restaurantId, {
                    table_number: form.number.trim(),
                    capacity: clamp(form.capacity, 1, 99),
                    name: form.name.trim() || null,
                    notes: form.notes.trim() || null,
                });

                const mapped = toTableFromRecord(created, tables.length);
                if (!mapped) return;

                const fallbackX = 90 + (tables.length % 4) * 170;
                const fallbackY = 60 + Math.floor(tables.length / 4) * 160;

                const newTable: Table = {
                    ...mapped,
                    shape: form.shape,
                    x: fallbackX,
                    y: fallbackY,
                };

                setTables(prev => [...prev, newTable]);
                syncTableSelection(newTable);
                setShowAddModal(false);
                toast.success('Đã tạo bàn mới thành công');
            } catch (error) {
                toast.error(toTableEndpointError('create', error).message);
            } finally {
                setIsSubmittingAdd(false);
            }
        })();
    }, [isSubmittingAdd, restaurantId, syncTableSelection, tables.length]);

    const handleUpdateTable = useCallback((id: string, form: UpdateTableForm) => {
        if (isSubmittingUpdate) return;
        void (async () => {
            setIsSubmittingUpdate(true);
            try {
                const response = await updateTable(restaurantId, id, {
                    table_number: form.number.trim(),
                    capacity: clamp(form.capacity, 1, 99),
                    name: form.name.trim() || null,
                    notes: form.notes.trim() || null,
                });

                setTables(prev => prev.map((table) => {
                    if (table._id !== id) return table;
                    const nextStatus = response.table.status;
                    const nextCapacity = response.table.capacity;
                    return {
                        ...table,
                        number: response.table.table_number,
                        name: response.table.name,
                        notes: response.table.notes,
                        capacity: nextCapacity,
                        status: nextStatus,
                        isActive: response.table.is_active,
                        hasQr: Boolean(response.table.qr_code),
                        qrCode: response.table.qr_code,
                        currentOccupancy: nextStatus === 'occupied' ? clamp(table.currentOccupancy || 1, 1, nextCapacity) : 0,
                        orderId: nextStatus === 'occupied' ? table.orderId : undefined,
                    };
                }));
                toast.success('Đã cập nhật thông tin bàn');
            } catch (error) {
                toast.error(toTableEndpointError('update', error).message);
            } finally {
                setIsSubmittingUpdate(false);
            }
        })();
    }, [isSubmittingUpdate, restaurantId]);

    const handleToggleTableActive = useCallback((id: string) => {
        if (isTogglingActive) return;
        void (async () => {
            setIsTogglingActive(true);
            try {
                const result = await toggleTableActive(restaurantId, id);
                setTables(prev => prev.map((table) => {
                    if (table._id !== id) return table;
                    const nextStatus = result.is_active ? (table.status === 'inactive' ? 'available' : table.status) : 'inactive';
                    return {
                        ...table,
                        isActive: result.is_active,
                        status: nextStatus,
                        currentOccupancy: result.is_active ? table.currentOccupancy : 0,
                        orderId: result.is_active ? table.orderId : undefined,
                    };
                }));
                toast.success(result.is_active ? 'Đã kích hoạt bàn' : 'Đã ngưng hoạt động bàn');
            } catch (error) {
                toast.error(toTableEndpointError('toggle-active', error).message);
            } finally {
                setIsTogglingActive(false);
            }
        })();
    }, [isTogglingActive, restaurantId]);

    const handleRegenerateTableQr = useCallback((id: string) => {
        if (isRegeneratingQr) return;
        void (async () => {
            setIsRegeneratingQr(true);
            try {
                const result = await regenerateTableQrCode(restaurantId, id);
                setTables(prev => prev.map((table) => {
                    if (table._id !== id) return table;
                    return { ...table, hasQr: true, qrCode: result.qr_code };
                }));
                toast.success('Đã tạo lại QR cho bàn');
            } catch (error) {
                toast.error(toTableEndpointError('regenerate-qr', error).message);
            } finally {
                setIsRegeneratingQr(false);
            }
        })();
    }, [isRegeneratingQr, restaurantId]);

    const handleDeleteTable = useCallback((id: string) => {
        void (async () => {
            try {
                const result = await deleteTable(restaurantId, id);
                setTables(prev => prev.filter(table => table._id !== id));
                if (selectedTableId === id) syncTableSelection(null);
                toast.success(result.message || 'Đã xóa bàn');
            } catch (error) {
                toast.error(toTableEndpointError('delete', error).message);
            }
        })();
    }, [restaurantId, selectedTableId, syncTableSelection]);

    const handleCreateOrder = useCallback((id: string) => {
        void submitStatusChange(id, 'occupied', 'create-order');
    }, [submitStatusChange]);

    const handleViewOrder = useCallback((orderId?: string) => {
        if (!orderId) return;
        const targetTable = tables.find(table => table.orderId === orderId);
        if (targetTable) syncTableSelection(targetTable);
    }, [tables, syncTableSelection]);

    const handlePrintBill = useCallback((id: string) => {
        void submitStatusChange(id, 'cleaning', 'print-bill');
    }, [submitStatusChange]);

    const handleCallWaiter = useCallback((id: string) => {
        updateTableById(id, table => ({
            ...table,
            assignedServer: table.assignedServer ?? AVAILABLE_SERVERS[0].label,
        }));
    }, [updateTableById]);

    const handleAutoArrange = useCallback(() => {
        if (isEditingPositions) return;

        setTables(prev => {
            const fixedTables = prev.filter(t => t.status !== 'available');
            const movingTables = prev.filter(t => t.status === 'available');

            const gridWidth = 170;
            const gridHeight = 160;
            const startX = 90;
            const startY = 60;

            const isOccupied = (x: number, y: number) => {
                return fixedTables.some(t => {
                   return Math.abs(t.x - x) < gridWidth * 0.8 &&
                          Math.abs(t.y - y) < gridHeight * 0.8;
                });
            };

            let currentRow = 0;
            let currentCol = 0;

            const nextTables = [...prev];

            for (const table of movingTables) {
                let found = false;
                while (!found) {
                    const testX = startX + currentCol * gridWidth;
                    const testY = startY + currentRow * gridHeight;
                    
                    if (!isOccupied(testX, testY)) {
                        const index = nextTables.findIndex(t => t._id === table._id);
                        if (index !== -1) {
                            nextTables[index] = { ...table, x: testX, y: testY };
                        }
                        found = true;
                    }
                    
                    currentCol++;
                    if (currentCol >= 5) {
                        currentCol = 0;
                        currentRow++;
                    }
                }
            }
            return nextTables;
        });
    }, [isEditingPositions]);

    return {
        // State
        tables,
        selectedTable,
        stats,
        // Statuses
        isEditingPositions,
        changedTableIds,
        showAddModal,
        setShowAddModal,
        isSubmittingAdd,
        isSubmittingUpdate,
        isTogglingActive,
        isRegeneratingQr,
        // Handlers
        handleStartEditingPositions,
        handleCancelEditingPositions,
        handleSavePositionChanges,
        handleAutoArrange,
        handleTableMove,
        syncTableSelection,
        handleTableStatusChange,
        handleServerAssign,
        handleAddTable,
        handleUpdateTable,
        handleToggleTableActive,
        handleRegenerateTableQr,
        handleDeleteTable,
        handleCreateOrder,
        handleViewOrder,
        handlePrintBill,
        handleCallWaiter,
    };
};
