import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { useToast } from './Toast';
import { useDialog } from './ui/DialogContext';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Input } from './ui/Input';
import { EmptyState } from './ui/EmptyState';
import { API_BASE } from '../services/api';

interface AssetType {
  id: number;
  name: string;
  code_prefix: string;
  sort_order: number;
}

export const AssetTypeManager: React.FC<{ onClose?: () => void; isInline?: boolean }> = ({ onClose, isInline = false }) => {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [types, setTypes] = useState<AssetType[]>([]);
  const [editingType, setEditingType] = useState<AssetType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: '', code_prefix: '', sort_order: 0 });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await fetch(`${API_BASE}/asset-types`);
      const data = await res.json();
      setTypes(data);
    } catch {
      showToast('加载资产类型失败', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingType ? `${API_BASE}/asset-types/${editingType.id}` : `${API_BASE}/asset-types`;
      const method = editingType ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          codePrefix: formData.code_prefix,
          sortOrder: formData.sort_order
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || '操作失败');
      }
      
      showToast(editingType ? '保存修改成功' : '新增类型成功', 'success');
      await fetchTypes();
      setEditingType(null);
      setFormData({ name: '', code_prefix: '', sort_order: 0 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '保存失败，请检查名称或前缀从重复项';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: '删除资产类型',
      message: '确定删除该类型吗？这将影响新资产录入。',
      type: 'danger',
      confirmText: '确认删除',
      cancelText: '取消'
    });
    if (!isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE}/asset-types/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast('删除类型成功', 'success');
        fetchTypes();
      } else {
        showToast(data.error || '删除失败', 'error');
      }
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const startEdit = (t: AssetType) => {
    setEditingType(t);
    setFormData({ name: t.name, code_prefix: t.code_prefix, sort_order: t.sort_order });
  };

  const content = (
    <div className={`${isInline ? 'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl'} overflow-hidden flex flex-col ${isInline ? 'min-h-[500px]' : 'max-h-[85vh]'}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">资产类型管理</h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">SYSTEM CONFIGURATION</p>
        </div>
        {!isInline && onClose && (
          <IconButton
            icon={<Lucide.X size={18} />}
            label="关闭"
            onClick={onClose}
            size="md"
            tone="danger"
          />
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 border-r border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-4">现有类型 ({types.length})</h4>
          {types.length === 0 ? (
            <EmptyState
              icon={<Lucide.Tag size={28} className="text-slate-400" />}
              title="暂无类型配置"
              description="请在右侧表单添加新的资产类型。"
            />
          ) : (
            <div className="space-y-3">
              {types.map(t => (
                <div key={t.id} className="group flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-700 hover:shadow-sm transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
                      {t.code_prefix}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t.name}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">排序: {t.sort_order}</div>
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(t)} aria-label="编辑">
                      <Lucide.Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(t.id)}
                      aria-label="删除"
                      className="hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Lucide.Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="w-80 bg-slate-50/50 dark:bg-slate-800 p-6 flex flex-col">
          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-4">{editingType ? '编辑类型' : '新增类型'}</h4>
          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            <Input 
              label="类型名称"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="例如: 无人机"
            />
            <Input 
              label="编码前缀 (2-3位字母)"
              required
              value={formData.code_prefix}
              onChange={e => setFormData({...formData, code_prefix: e.target.value.toUpperCase()})}
              className="font-mono font-bold"
              placeholder="例如: UAV"
              maxLength={4}
            />
            <Input 
              label="排序权重 (越小越前)"
              type="number"
              value={formData.sort_order}
              onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
            />

            <div className="pt-4 mt-auto space-y-2">
              <Button 
                type="submit" 
                variant="primary"
                size="md"
                className="w-full"
                disabled={isSubmitting}
              >
                {editingType ? '保存修改' : '立即添加'}
              </Button>
              {editingType && (
                <Button 
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => { setEditingType(null); setFormData({ name: '', code_prefix: '', sort_order: 0 }); }}
                >
                  取消编辑
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal-overlay)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative z-[var(--z-modal)] w-full max-w-2xl"
      >
        {content}
      </motion.div>
    </div>
  );
};
