import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PosLayout from '@/layouts/pos/PosLayout';
import MainPosSection from '@/features/pos/sections/main-pos/MainPosSection';
import TableSection from '@/features/pos/sections/table/TableSection';
import { POS_BASE_PATH } from '@/routes/pos-route';
import { PosProvider } from '@/features/pos/contexts/PosContext';
import { usePosContext } from '@/features/pos/contexts/usePosContext';
import RejectToPreviousPage from '@/components/navigation/RejectToPreviousPage';

import type { POSSection } from '@/stores/pos-store';
import {
  demoNotifications,
  getRelativeTime,
} from '@/features/pos/pos-mock';
import PaymentSection from '@/features/pos/sections/payment/PaymentSection';
import OrderSection from '@/features/pos/sections/order/OrderSection';
import MenuSection from '@/features/pos/sections/menu/MenuSection';
import StaffSection from '@/features/pos/sections/staff/StaffSection';

const ROUTE_TO_SECTION: Record<string, POSSection> = {
  '': 'main-pos',
  '/': 'main-pos',
  '/tables': 'table',
  '/table': 'table',
  '/payments': 'payment',
  '/payment': 'payment',
  '/orders': 'order',
  '/order': 'order',
  '/menu': 'menu',
  '/staff': 'staff',
};

const SECTION_TO_ROUTE_SUFFIX: Record<POSSection, string> = {
  'main-pos': '',
  table: '/tables',
  payment: '/payments',
  order: '/orders',
  menu: '/menu',
  staff: '/staff',
};

const getPosSubPath = (pathname: string, slug: string) => {
  const posPrefix = `${POS_BASE_PATH}/${slug}`;

  if (!pathname.startsWith(posPrefix)) {
    return pathname;
  }

  const subPath = pathname.slice(posPrefix.length);
  return subPath || '/';
};

const PosPageContent: React.FC<{ slug: string }> = ({ slug }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, error } = usePosContext();

  const [isOperational, setIsOperational] = useState(true);
  const subPath = getPosSubPath(location.pathname, slug);
  const activeSection = ROUTE_TO_SECTION[subPath] ?? 'main-pos';

  useEffect(() => {
    if (!ROUTE_TO_SECTION[subPath]) {
      navigate(`${POS_BASE_PATH}/${slug}`, { replace: true });
    }
  }, [navigate, slug, subPath]);

  const handleToggleOperational = React.useCallback(() => {
    setIsOperational(prev => !prev);
  }, []);

  const handleSectionChange = React.useCallback((section: string) => {
    const normalizedSection = section as POSSection;

    const targetSuffix = SECTION_TO_ROUTE_SUFFIX[normalizedSection] ?? '';
    const targetPath = `${POS_BASE_PATH}/${slug}${targetSuffix}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  }, [navigate, slug, location.pathname]);

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'main-pos':
        return <MainPosSection />;
      case 'table':
        return <TableSection />;
      case 'payment':
        return <PaymentSection />;
      case 'order':
        return <OrderSection />;
      case 'menu':
        return <MenuSection />;
      case 'staff':
        return <StaffSection />;
      default:
        return <MainPosSection />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading POS data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <RejectToPreviousPage />;
  }

  return (
    <PosLayout
      notifications={demoNotifications}
      isOperational={isOperational}
      onToggleOperational={handleToggleOperational}
      getRelativeTime={getRelativeTime}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {renderSectionContent()}
    </PosLayout>
  );
};

const PosPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const currentSlug = slug?.trim() ?? '';

  if (!currentSlug) {
    return <RejectToPreviousPage />;
  }

  return (
    <PosProvider slug={currentSlug}>
      <PosPageContent slug={currentSlug} />
    </PosProvider>
  );
};

export default PosPage;
