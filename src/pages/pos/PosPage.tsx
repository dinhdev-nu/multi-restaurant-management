import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PosLayout from '@/layouts/pos/PosLayout';
import MainPosSection from '@/features/pos/sections/main-pos/MainPosSection';
import TableSection from '@/features/pos/sections/table/TableSection';

import { usePOSStore, type POSSection } from '@/stores/pos-store';
import {
  demoNotifications,
  demoRestaurant,
  getRelativeTime,
} from '@/features/pos/pos-mock';
import PaymentSection from '@/features/pos/sections/payment/PaymentSection';

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

const SECTION_TO_ROUTE: Record<POSSection, string> = {
  'main-pos': '/pos',
  table: '/pos/tables',
  payment: '/pos/payments',
  order: '/pos/orders',
  menu: '/pos/menu',
  staff: '/pos/staff',
};

const getPosSubPath = (pathname: string) => {
  if (!pathname.startsWith('/pos')) {
    return pathname;
  }

  return pathname.slice(4);
};

const PosPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isOperational = usePOSStore(state => state.isOperational);
  const activeSection = usePOSStore(state => state.activeSection);
  const toggleOperational = usePOSStore(state => state.toggleOperational);
  const setActiveSection = usePOSStore(state => state.setActiveSection);

  useEffect(() => {
    const subPath = getPosSubPath(location.pathname);
    const nextSection = ROUTE_TO_SECTION[subPath];

    if (!nextSection) {
      navigate('/pos', { replace: true });
      return;
    }

    if (activeSection !== nextSection) {
      setActiveSection(nextSection);
    }
  }, [location.pathname, activeSection, setActiveSection, navigate]);

  const handleToggleOperational = React.useCallback(() => {
    toggleOperational();
  }, [toggleOperational]);

  const handleSectionChange = React.useCallback((section: string) => {
    const normalizedSection = section as POSSection;
    setActiveSection(normalizedSection);

    const targetPath = SECTION_TO_ROUTE[normalizedSection] ?? '/pos';
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  }, [setActiveSection, navigate, location.pathname]);

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'main-pos':
        return <MainPosSection />;
      case 'table':
        return <TableSection />;
      case 'payment':
        return <PaymentSection />;
      case 'order':
        return <div className="p-6 text-foreground">Section Lịch sử đang phát triển.</div>;
      case 'menu':
        return <div className="p-6 text-foreground">Section Thực đơn đang phát triển.</div>;
      case 'staff':
        return <div className="p-6 text-foreground">Section Nhân viên đang phát triển.</div>;
      default:
        return <MainPosSection />;
    }
  };

  return (
    <PosLayout
      storeName="POS Manager"
      restaurant={demoRestaurant}
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

export default PosPage;
