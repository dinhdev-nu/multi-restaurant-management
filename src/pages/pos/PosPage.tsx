import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PosLayout from '@/layouts/pos/PosLayout';
import MainPosSection from '@/features/pos/sections/main-pos/MainPosSection';
import TableSection from '@/features/pos/sections/table/TableSection';
import { POS_BASE_PATH, POS_DEFAULT_SLUG } from '@/routes/pos-route';

import { usePOSStore, type POSSection } from '@/stores/pos-store';
import {
  demoNotifications,
  demoRestaurant,
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

const PosPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const currentSlug = slug ?? POS_DEFAULT_SLUG;

  const isOperational = usePOSStore(state => state.isOperational);
  const activeSection = usePOSStore(state => state.activeSection);
  const toggleOperational = usePOSStore(state => state.toggleOperational);
  const setActiveSection = usePOSStore(state => state.setActiveSection);

  useEffect(() => {
    if (!slug) {
      navigate(`${POS_BASE_PATH}/${POS_DEFAULT_SLUG}`, { replace: true });
      return;
    }

    const subPath = getPosSubPath(location.pathname, currentSlug);
    const nextSection = ROUTE_TO_SECTION[subPath];

    if (!nextSection) {
      navigate(`${POS_BASE_PATH}/${currentSlug}`, { replace: true });
      return;
    }

    if (activeSection !== nextSection) {
      setActiveSection(nextSection);
    }
  }, [slug, currentSlug, location.pathname, activeSection, setActiveSection, navigate]);

  const handleToggleOperational = React.useCallback(() => {
    toggleOperational();
  }, [toggleOperational]);

  const handleSectionChange = React.useCallback((section: string) => {
    const normalizedSection = section as POSSection;
    setActiveSection(normalizedSection);

    const targetSuffix = SECTION_TO_ROUTE_SUFFIX[normalizedSection] ?? '';
    const targetPath = `${POS_BASE_PATH}/${currentSlug}${targetSuffix}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  }, [setActiveSection, navigate, currentSlug, location.pathname]);

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
