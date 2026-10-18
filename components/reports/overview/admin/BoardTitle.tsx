// admin/BoardTitle.tsx — 看板区域大标题（自 OverviewAdminBoard.tsx 原样搬出）
import { ShieldAlert } from 'lucide-react';
import { Badge } from '../../../ui';

export const renderBoardTitle = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-teal-900/10 via-slate-900/5 to-transparent dark:from-teal-950/40 dark:via-slate-900/40 p-5 rounded-xl border border-teal-200/50 dark:border-teal-900/40">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-teal-600 text-white rounded-xl shadow-xs shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Keeper 资产持有与风险管控看板</h3>
            <Badge tone="teal" className="uppercase font-bold">
              管理员视角
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            全校各专职 Keeper 名下资产持有量、总估值、设备服役率及风险隐患（长期闲置&gt;180天、在修、待报废）实时排查
          </p>
        </div>
      </div>
    </div>
  );
};
