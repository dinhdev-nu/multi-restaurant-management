import { useContext } from 'react';
import { PosContext, type PosContextType } from './pos-context';
import type { PosInitData } from '@/types/pos-init-type';

/**
 * Hook to use POS context
 * Must be used inside a PosProvider
 */
export const usePosContext = (): PosContextType => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePosContext must be used inside PosProvider');
  }
  return context;
};

/**
 * Returns non-null POS init data.
 * Use this in child sections that are rendered only after POS loading/error guards.
 */
export const useRequiredPosData = (): PosInitData => {
  const { data } = usePosContext();
  if (!data) {
    throw new Error('POS data is required. Render this component only after POS init succeeds.');
  }
  return data;
};
