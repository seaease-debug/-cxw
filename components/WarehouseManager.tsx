import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { useToast } from './Toast';
import { useDialog } from './ui/DialogContext';
import { SearchBar } from './ui/SearchBar';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { API_BASE } from '../services/api';

interface Warehouse {
  id: number;
  name: string;
  code: string;
  location_desc: string;
}

export const WarehouseManager: React.FC = () => {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', location_desc: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await fetch(`${API_BASE}/warehouses`);
      if (res.ok) {
        setWarehouses(await res.json());
      }
    } catch {
      showToast('加载仓库列表失败', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      showToast('请输入完整的仓库名称和仓库编码', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editing ? `${API_BASE}/warehouses/${editing.id}` : `${API_BASE}/warehouses`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          code: formData.code.toUpperCase().trim(),
          location_desc: formData.location_desc.trim()
        })
      });
      
      const responseData = await res.json();
      if (!res.ok) {
        showToast(responseData.error || '保存仓库失败', 'error');
        return;
      }

      showToast(editing ? '仓库信息修改成功' : '新增仓库成功', 'success');
      await fetchWarehouses();
      setEditing(null);
      setFormData({ name: '', code: '', location_desc: '' });
    } catch {
      showToast('连接服务器失败，保存操作未完成', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = await confirm({
      title: '删除仓库',
      message: `确定删除仓库「${name}」吗？`,
      type: 'danger',
      confirmText: '确认删除',
      cancelText: '取消'
    });
    if (!isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE}/warehouses/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (!res.ok) {
        // If delete fails due to dependencies, show detailed error
        setErrorDetails(data.error || '删除失败');
        return;
      }

      showToast(`仓库「${name}」已成功移除`, 'success');
      fetchWarehouses();
    } catch {
      showToast('由于网络原因无法完成删除操作', 'error');
    }
  };

  const filteredWarehouses = warehouses.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.location_desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Detail validation modal warning when deletion is restricted */}
      {errorDetails && (
        <div className="fixed inset-0 z-[var(--z-modal-overlay)] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setErrorDetails(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-[var(--z-modal)] bg-white dark:bg-slate-900 rounded-xl p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mb-6">
              <Lucide.AlertCircle size={24} />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">无法删除仓库</h4>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed bg-rose-50/50 dark:bg-rose-950/30 p-4 rounded-xl border border-rose-100/50 dark:border-rose-900/50 font-mono">
              {errorDetails}
            </p>
            <div className="flex justify-end mt-6 space-x-3">
              <Button 
                variant="primary"
                size="md"
                onClick={() => setErrorDetails(null)}
                className="bg-teal-600 hover:bg-teal-500 text-white"
              >
                我知道了
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Left Side: Warehouse List & Filters */}
        <div className="flex-1 p-8 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">仓库位置档案</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Warehouse Location List</p>
            </div>
            {/* Search Input */}
            <div className="w-full sm:w-64">
              <SearchBar
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索仓库名称或编码..."
              />
            </div>
          </div>

          <div className="flex-1 mt-6 overflow-y-auto max-h-[500px] pr-2 space-y-4">
            {filteredWarehouses.length === 0 ? (
              <EmptyState
                icon={<Lucide.Inbox size={32} className="stroke-1 text-slate-300 dark:text-slate-600" />}
                title="暂无匹配的仓库位置记录"
                description={searchQuery ? '没有找到符合搜索条件的仓库，请调整搜索关键词。' : '当前系统中暂无仓库记录，可点击左侧表单新增仓库位置。'}
              />
            ) : (
              filteredWarehouses.map(w => (
                <div 
                  key={w.id} 
                  className={`group flex items-center justify-between p-5 rounded-xl border transition-all ${
                    editing?.id === w.id 
                      ? 'bg-teal-50/40 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 shadow-sm' 
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-semibold">
                        {w.code}
                      </span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{w.name}</h4>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium pl-1">
                      {w.location_desc || '暂无位置描述信息'}
                    </div>
                  </div>
                  <div className="flex space-x-1 sm:opacity-0 group-hover:opacity-100 transition-all">
                    <Button 
                      onClick={() => { setEditing(w); setFormData(w); }} 
                      title="编辑仓库" aria-label="编辑仓库"
                      variant="ghost"
                      size="sm"
                    >
                      <Lucide.Edit2 size={14} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(w.id, w.name)}
                      title="删除仓库" aria-label="删除仓库"
                      variant="ghost"
                      size="sm"
                      className="hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700"
                    >
                      <Lucide.Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Add or Edit Form */}
        <div className="w-full md:w-80 bg-slate-50/30 dark:bg-slate-800/30 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <span className={`w-2.5 h-2.5 rounded-full ${editing ? 'bg-teal-500' : 'bg-emerald-500'}`}></span>
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-widest font-mono">
                {editing ? '编辑仓库档案' : '新增仓库位置'}
              </h4>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input 
                label="仓库名称 *" 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="如: 1楼小仓库, 电商周转仓" 
              />

              <Input 
                label="字母编码 (4位唯一英文/数字) *" 
                required 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                className="font-mono font-bold uppercase" 
                placeholder="例如: 1FSM" 
                maxLength={4} 
              />

              <Input 
                as="textarea"
                label="位置物理描述"
                value={formData.location_desc} 
                onChange={e => setFormData({...formData, location_desc: e.target.value})} 
                className="h-24 resize-none" 
                placeholder="描述其所在的具体门牌、楼层 or 区域" 
              />

              <div className="pt-4 space-y-3">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {isSubmitting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white" />
                  ) : editing ? (
                    '保存仓库修改'
                  ) : (
                    '立即创建新仓库'
                  )}
                </Button>
                {editing && (
                  <Button 
                    type="button" 
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={() => { 
                      setEditing(null); 
                      setFormData({ name: '', code: '', location_desc: '' }); 
                    }} 
                  >
                    取消编辑
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
