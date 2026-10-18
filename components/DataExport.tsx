import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useToast } from './Toast';
import { Button } from './ui/Button';
import { API_BASE } from '../services/api';

const getBeijingDateString = () => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const nd = new Date(utc + (3600000 * 8));
  const year = nd.getFullYear();
  const month = String(nd.getMonth() + 1).padStart(2, '0');
  const day = String(nd.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DataExport: React.FC = () => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'assets' | 'history') => {
    setIsExporting(true);
    try {
      const res = await fetch(`${API_BASE}/export/${type}`);
      if (!res.ok) throw new Error('Export failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type === 'assets' ? '资产台账' : '流转记录'}_${getBeijingDateString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      showToast('导出失败，请稍后重试', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">数据备份与导出</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">导出系统内的核心数据用于线下备份或报表统计。</p>

      <div className="space-y-4">
        <Button 
          variant="secondary"
          size="lg"
          onClick={() => handleExport('assets')}
          disabled={isExporting}
          className="w-full h-auto group justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-800 rounded-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm group-hover:scale-110 transition-transform">
              <Lucide.Database size={20} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-teal-700 dark:group-hover:text-teal-300">导出资产台账 (Inventory)</div>
              <div className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">包含所有在库、在用、报废资产的完整信息</div>
            </div>
          </div>
          <Lucide.Download size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-teal-500" />
        </Button>

        <Button 
          variant="secondary"
          size="lg"
          onClick={() => handleExport('history')}
          disabled={isExporting}
          className="w-full h-auto group justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 rounded-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
              <Lucide.History size={20} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-300">导出流转记录 (History)</div>
              <div className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">包含所有入库、出库、退库、报废的操作日志</div>
            </div>
          </div>
          <Lucide.Download size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500" />
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-800 flex items-start space-x-3">
        <Lucide.AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-300 font-bold leading-relaxed">
          注意：导出的 CSV 文件默认使用 UTF-8 编码。如果在 Excel 中打开出现乱码，请使用“数据 -&gt; 自文本/CSV”功能导入，并选择 UTF-8 编码格式。
        </p>
      </div>
    </div>
  );
};
