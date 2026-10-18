import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { useToast } from './Toast';
import { useDialog } from './ui/DialogContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { EmptyState } from './ui/EmptyState';
import { API_BASE } from '../services/api';

interface Department {
  id: number;
  name: string;
  code: string;
}

export const DepartmentManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [depts, setDepts] = useState<Department[]>([]);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchDepts(); }, []);

  const fetchDepts = async () => {
    try {
      const res = await fetch(`${API_BASE}/departments`);
      setDepts(await res.json());
    } catch { showToast('加载部门列表失败', 'error'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editing ? `${API_BASE}/departments/${editing.id}` : `${API_BASE}/departments`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed');
      await fetchDepts();
      setEditing(null);
      setFormData({ name: '', code: '' });
    } catch { showToast('保存失败', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: '删除部门',
      message: '确定删除该部门吗？',
      type: 'danger',
      confirmText: '确认删除',
      cancelText: '取消'
    });
    if (!isConfirmed) return;
    await fetch(`${API_BASE}/departments/${id}`, { method: 'DELETE' });
    fetchDepts();
  };

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
        className="relative z-[var(--z-modal)] bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">部门架构管理</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">DEPARTMENT CONFIGURATION</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="关闭" className="w-8 h-8 rounded-full p-0">
            <Lucide.X size={18} />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 border-r border-slate-200 dark:border-slate-800">
            {depts.length === 0 ? (
              <EmptyState
                icon={<Lucide.Building size={28} className="text-slate-400" />}
                title="暂无部门架构"
                description="请在右侧表单添加新的部门。"
              />
            ) : (
              <div className="space-y-3">
                {depts.map(d => (
                  <div key={d.id} className="group flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-700 transition-all">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{d.name}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">CODE: {d.code}</div>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(d); setFormData(d); }} aria-label="编辑">
                        <Lucide.Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(d.id)}
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

          <div className="w-80 bg-slate-50/50 dark:bg-slate-800/30 p-6 flex flex-col">
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-4">{editing ? '编辑部门' : '新增部门'}</h4>
            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              <Input 
                label="部门名称" 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="例如: 语文组" 
              />
              <Input 
                label="部门代码 (可选)" 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                className="font-mono font-bold" 
                placeholder="例如: CHN" 
              />
              <div className="pt-4 mt-auto space-y-2">
                <Button type="submit" disabled={isSubmitting} variant="primary" size="md" className="w-full">
                  {editing ? '保存修改' : '立即添加'}
                </Button>
                {editing && (
                  <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => { setEditing(null); setFormData({ name: '', code: '' }); }}>
                    取消编辑
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
