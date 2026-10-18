import React, { useState } from 'react';
import Suppliers from './Suppliers';
import { SystemLogs } from './SystemLogs';
import { WarehouseManager } from './WarehouseManager';
import { AssetTypeManager } from './AssetTypeManager';
import { LocationManager } from './LocationManager';
import { FaultTypeManager } from './FaultTypeManager';
import AccountsView from './admin/AccountsView';
import { AdminTabs, type AdminView } from './admin/AdminTabs';
import { BackupPanel } from './admin/BackupPanel';

// B3 拆分：原 428 行（单一箭头函数 354 行 / 复杂度 15）→ 薄入口。
//   ① 顶部 tab 条 → ./admin/AdminTabs；
//   ② 「系统全局参数」整块 → ./admin/BackupPanel（逻辑在 useSystemBackup）；
//   ③ tab 内容分发由 8 个 `activeView === 'x' && …` 分支改为查表（复杂度归 0）。
//      表里是惰性 React 元素描述（创建 ≠ 渲染、≠ 挂载），只有被选中的一项进渲染树；
//      每项 JSX 与原分支**逐字一致**（由 dispatch-equiv.mjs 机械校验）。
const VIEW_CONTENT: Record<AdminView, React.ReactNode> = {
  accounts: <AccountsView />,
  warehouses: (
    <div className="animate-in fade-in slide-in-from-right-2">
      <WarehouseManager />
    </div>
  ),
  suppliers: (
    <div className="animate-in fade-in slide-in-from-right-2">
      <Suppliers />
    </div>
  ),
  types: (
    <div className="animate-in fade-in slide-in-from-right-2">
      <AssetTypeManager isInline={true} />
    </div>
  ),
  locations: (
    <div className="animate-in fade-in slide-in-from-right-2">
      <LocationManager />
    </div>
  ),
  faultTypes: (
    <div className="animate-in fade-in slide-in-from-right-2">
      <FaultTypeManager />
    </div>
  ),
  logs: (
    <div className="animate-in fade-in slide-in-from-right-2">
      <SystemLogs />
    </div>
  ),
  settings: <BackupPanel />,
};

const Admin: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>('accounts');

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminTabs activeView={activeView} onChange={setActiveView} />

      {VIEW_CONTENT[activeView]}
    </div>
  );
};

export default Admin;
