import { createContext } from 'react';
import type { PosInitData } from '@/types/pos-init-type';
import type { AppError } from '@/services/types';

export interface PosContextType {
  data: PosInitData | null;
  loading: boolean;
  error: AppError | null;
}

export const PosContext = createContext<PosContextType | undefined>(undefined);
