import React from 'react';
import Icon from '@/components/AppIcon';

interface MenuStatsData {
  total: number;
  available: number;
  lowStock: number;
  unavailable: number;
}

interface MenuStatsProps {
  stats: MenuStatsData;
}

const formatNumber = (num: number): string =>
  new Intl.NumberFormat('vi-VN').format(num);

const MenuStats: React.FC<MenuStatsProps> = ({ stats }) => {
  const statusItems = [
    { label: 'Sẵn sàng', value: stats.available, dotColor: 'bg-emerald-500' },
    { label: 'Sắp hết', value: stats.lowStock, dotColor: 'bg-amber-500' },
    { label: 'Hết hàng', value: stats.unavailable, dotColor: 'bg-rose-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="group relative overflow-hidden rounded-lg border border-blue-500/20 bg-white dark:bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
        <div className="relative p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent ring-1 ring-inset border-blue-500/20">
              <Icon name="Utensils" size={18} className="text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-600 dark:text-muted-foreground">Tổng món ăn</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground">
                {formatNumber(stats.total)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-cyan-500/20 bg-white dark:bg-card backdrop-blur-sm">
        <div className="relative p-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 ring-1 ring-inset ring-cyan-200 dark:ring-cyan-500/20">
              <Icon name="Package" size={16} className="text-cyan-600 dark:text-cyan-500" />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-muted-foreground">Trạng thái món</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusItems.map((status) => (
              <span
                key={status.label}
                className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 dark:bg-muted/50 px-2 py-1"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                <span className="text-[11px] text-gray-600 dark:text-muted-foreground">{status.label}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-foreground">
                  {formatNumber(status.value)}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuStats;
