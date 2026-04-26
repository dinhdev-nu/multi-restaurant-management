import React, { useEffect, useState, useCallback } from 'react';
import { fetchPosInit } from '@/services/pos';
import { toAppError } from '@/services/error';
import { PosContext, type PosContextType } from './pos-context';
import type { PosInitData } from '@/types/pos-init-type';
import type { AppError } from '@/services/types';
import { usePOSStore } from '@/stores/pos-store';

interface PosProviderProps {
    slug: string;
    children: React.ReactNode;
}

export const PosProvider: React.FC<PosProviderProps> = ({ slug, children }) => {
    const [data, setData] = useState<PosInitData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AppError | null>(null);

    const fetchData = useCallback(async () => {
        if (!slug?.trim()) {
            const slugError: AppError = {
                message: 'POS slug is required',
            };
            usePOSStore.getState().setTables({
                total: [],
                available: [],
                occupied: [],
                reserved: [],
                cleaning: [],
                inactive: [],
            });
            setData(null);
            setError(slugError);
            setLoading(false);
            return Promise.reject(slugError);
        }

        try {
            setLoading(true);
            setError(null);
            const result = await fetchPosInit(slug);
            // Requirement: when /pos/init succeeds, save tables to store first.
            usePOSStore.getState().setTables(result.tables);
            setData(result);
            return;
        } catch (err) {
            const appError = toAppError(err, 'Failed to fetch POS init data');
            usePOSStore.getState().setTables({
                total: [],
                available: [],
                occupied: [],
                reserved: [],
                cleaning: [],
                inactive: [],
            });
            setData(null);
            setError(appError);
            return Promise.reject(appError);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchData().catch(() => undefined);
    }, [fetchData]);

    const value: PosContextType = {
        data,
        loading,
        error,
    };

    return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
};
