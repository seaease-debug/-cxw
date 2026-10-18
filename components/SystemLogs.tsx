import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useToast } from './Toast';
import { logError } from '../utils/logger';
import { Badge } from './ui/Badge';
import { SearchBar } from './ui/SearchBar';
import { EmptyState } from './ui/EmptyState';
import { DateRange } from './ui/DateRange';
import { Button } from './ui/Button';
import { CustomSelect } from './CustomSelect';
import { API_BASE } from '../services/api';

interface SystemLog {
  id: number;
  action_type: string;
  description: string;
  operator: string;
  created_at: string;
}

const getBeijingDateString = () => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const nd = new Date(utc + (3600000 * 8));
  const year = nd.getFullYear();
  const month = String(nd.getMonth() + 1).padStart(2, '0');
  const day = String(nd.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterType, setFilterType] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filterType, startDate, endDate]); // Auto-refresh on filter change

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.append('type', filterType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${API_BASE}/system/logs?${params.toString()}`);
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (e) {
      logError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const { showToast } = useToast();

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (filterType !== 'ALL') params.append('type', filterType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (searchQuery) params.append('search', searchQuery);
    
    try {
      showToast("正在准备系统日志导出数据...", "info");
      const res = await fetch(`${API_BASE}/export/system-logs?${params.toString()}`);
      if (!res.ok) throw new Error('Export failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `系统操作日志_${getBeijingDateString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("系统日志导出成功", "success");
    } catch {
      showToast("导出日志失败，请稍后重试", "error");
    }
  };

  const logTypes = [
    'ALL', '资产入库', '批量导入', '资产出库', '资产退库', '资产处置', 
    '位置变更', '删除资产', '新增仓库', '修改仓库', '删除仓库', 
    '新增部门', '修改部门', '删除部门', '新增资产类型', '修改资产类型', '删除资产类型'
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">系统操作日志</h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">SYSTEM AUDIT LOGS</p>
        </div>
        <div className="flex space-x-2">
           <Button onClick={fetchLogs} variant="secondary" size="sm" title="刷新" aria-label="刷新">
             <Lucide.RefreshCw size={16} />
           </Button>
           <Button onClick={handleExport} variant="primary" size="sm">
             <Lucide.Download size={14} />
             <span>导出日志</span>
           </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-4 flex flex-wrap gap-3 items-center">
         <div className="w-48">
           <CustomSelect 
              value={filterType} 
              onChange={setFilterType}
              options={logTypes.map(t => ({ value: t, label: t === 'ALL' ? '所有类型' : t }))}
              size="sm"
              className="h-8 bg-white"
           />
         </div>
         
          <DateRange
            start={startDate}
            end={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onClear={() => { setStartDate(''); setEndDate(''); }}
          />

         <form onSubmit={handleSearch} className="flex-1 min-w-[150px]">
            <SearchBar
              placeholder="搜索描述或操作人..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </form>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 sticky top-0">
            <tr>
              <th className="px-4 py-3">时间</th>
              <th className="px-4 py-3">操作类型</th>
              <th className="px-4 py-3">操作描述</th>
              <th className="px-4 py-3">操作人</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">加载中...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4}>
                <EmptyState
                  icon={<Lucide.ClipboardList size={28} className="text-slate-400" />}
                  title={searchQuery || filterType !== 'ALL' || startDate || endDate ? '未找到匹配的日志' : '暂无操作日志'}
                  description={
                    searchQuery || filterType !== 'ALL' || startDate || endDate
                      ? '没有日志符合当前的筛选条件，试试调整搜索条件或日期范围。'
                      : '系统中还没有操作记录。当用户执行入库、出库、退库等操作后，日志将自动记录在此处供追溯审计。'
                  }
                />
              </td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        log.action_type.includes('删除') || log.action_type.includes('报废') ? 'rose' :
                        log.action_type.includes('修改') || log.action_type.includes('变更') ? 'amber' :
                        log.action_type.includes('出库') ? 'emerald' :
                        'teal'
                      }
                      className="uppercase font-semibold"
                    >
                      {log.action_type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200">{log.description}</td>
                  <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-200">{log.operator}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
