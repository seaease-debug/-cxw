import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Tag, Check, X } from 'lucide-react';
import { useToast } from './Toast';
import { useDialog } from './ui/DialogContext';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { EmptyState } from './ui/EmptyState';
import { logError } from '../utils/logger';

export interface FaultTypeItem {
  id: number;
  name: string;
  description?: string;
  enabled: boolean;
}

export const FaultTypeManager: React.FC = () => {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [faultTypes, setFaultTypes] = useState<FaultTypeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingDesc, setEditingDesc] = useState('');

  const fetchFaultTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fault-types');
      if (res.ok) {
        const data = await res.json();
        setFaultTypes(data);
      }
    } catch (e) {
      logError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaultTypes();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    try {
      const res = await fetch('/api/fault-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTypeName.trim(), description: newTypeDesc.trim() })
      });

      if (res.ok) {
        showToast('新增故障类型成功', 'success');
        setNewTypeName('');
        setNewTypeDesc('');
        fetchFaultTypes();
      } else {
        const err = await res.json();
        showToast(err.error || '添加失败', 'error');
      }
    } catch {
      showToast('网络开小差了，请重试', 'error');
    }
  };

  const handleToggleEnable = async (type: FaultTypeItem) => {
    try {
      const res = await fetch(`/api/fault-types/${type.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !type.enabled })
      });

      if (res.ok) {
        showToast(`已${!type.enabled ? '启用' : '禁用'}该故障类型`, 'info');
        fetchFaultTypes();
      }
    } catch {
      showToast('操作失败', 'error');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      const res = await fetch(`/api/fault-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim(), description: editingDesc.trim() })
      });

      if (res.ok) {
        showToast('更新成功', 'success');
        setEditingId(null);
        fetchFaultTypes();
      } else {
        showToast('更新失败', 'error');
      }
    } catch {
      showToast('网络错误', 'error');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = await confirm({
      title: '删除故障类型',
      message: `确定要删除“${name}”故障分类吗？`,
      confirmText: '确认删除',
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/fault-types/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showToast('分类已删除', 'success');
        fetchFaultTypes();
      } else {
        showToast('删除失败', 'error');
      }
    } catch {
      showToast('网络错误', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            报修故障类型管理
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">设置全校教职工提交故障报修时的分类下拉选项</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <Input
            label="故障类型名称 *"
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="如: 网络/通信异常"
            required
          />
        </div>
        <div className="flex-1 w-full">
          <Input
            label="描述说明（选填）"
            type="text"
            value={newTypeDesc}
            onChange={(e) => setNewTypeDesc(e.target.value)}
            placeholder="如: 端口无信号、网线损坏或网卡故障"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          新增类型
        </Button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
              <th className="py-3 px-4">序号</th>
              <th className="py-3 px-4">故障分类名称</th>
              <th className="py-3 px-4">说明描述</th>
              <th className="py-3 px-4">状态</th>
              <th className="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200">
            {faultTypes.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td className="py-4 px-4 text-slate-400 dark:text-slate-500 font-mono">{idx + 1}</td>
                <td className="py-4 px-4 font-bold text-sm text-slate-800 dark:text-slate-100">
                  {editingId === item.id ? (
                    <Input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td className="py-4 px-4 text-slate-700 dark:text-slate-200">
                  {editingId === item.id ? (
                    <Input
                      type="text"
                      value={editingDesc}
                      onChange={(e) => setEditingDesc(e.target.value)}
                    />
                  ) : (
                    item.description || '-'
                  )}
                </td>
                <td className="py-4 px-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleEnable(item)}
                    aria-label={item.enabled ? '点击禁用故障类型' : '点击启用故障类型'}
                    className="p-0 h-auto hover:bg-transparent"
                  >
                    <Badge tone={item.enabled ? 'emerald' : 'slate'}>
                      {item.enabled ? '已启用' : '已禁用'}
                    </Badge>
                  </Button>
                </td>
                <td className="py-4 px-4 text-right space-x-1">
                  {editingId === item.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdate(item.id)}
                        title="保存" aria-label="保存"
                        className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        title="取消" aria-label="取消"
                        className="p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditingName(item.name);
                          setEditingDesc(item.description || '');
                        }}
                        title="编辑" aria-label="编辑"
                        className="p-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.name)}
                        title="删除" aria-label="删除"
                        className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {faultTypes.length === 0 && !loading && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={<Tag size={28} className="text-slate-400" />}
                    title="暂无故障类型配置"
                    description="请在上方表单添加新的故障类型定义。"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
