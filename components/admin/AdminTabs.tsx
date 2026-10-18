import React from 'react';
import {
  Users,
  Warehouse,
  Tag,
  Handshake,
  ClipboardList,
  Settings,
  MapPin,
  Wrench,
} from 'lucide-react';

// B3 拆分：Admin.tsx 顶部 tab 条原样搬出。
export type AdminView =
  | 'accounts'
  | 'suppliers'
  | 'settings'
  | 'logs'
  | 'warehouses'
  | 'types'
  | 'locations'
  | 'faultTypes';

const TABS: Array<{ id: AdminView; label: string; icon: React.ReactNode }> = [
  { id: 'accounts', label: '用户账号管理', icon: <Users className="w-4 h-4" /> },
  { id: 'warehouses', label: '仓库管理', icon: <Warehouse className="w-4 h-4" /> },
  { id: 'types', label: '资产类型管理', icon: <Tag className="w-4 h-4" /> },
  { id: 'locations', label: '位置信息管理', icon: <MapPin className="w-4 h-4" /> },
  { id: 'faultTypes', label: '故障类型管理', icon: <Wrench className="w-4 h-4" /> },
  { id: 'suppliers', label: '供应商档案', icon: <Handshake className="w-4 h-4" /> },
  { id: 'logs', label: '系统日志', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'settings', label: '系统全局参数', icon: <Settings className="w-4 h-4" /> },
];

interface AdminTabsProps {
  activeView: AdminView;
  onChange: (view: AdminView) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ activeView, onChange }) => (
  <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 pb-4 gap-2">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ${
          activeView === tab.id
            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm font-bold'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80'
        }`}
      >
        {tab.icon} <span>{tab.label}</span>
      </button>
    ))}
  </div>
);
