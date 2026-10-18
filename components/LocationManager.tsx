import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Building, Info } from 'lucide-react';
import { useToast } from './Toast';
import { useDialog } from './ui/DialogContext';
import { EmptyState } from './ui/EmptyState';
import { Badge } from './ui/Badge';
import { SearchBar } from './ui/SearchBar';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { API_BASE } from '../services/api';

export interface LocationItem {
  id: number;
  name: string;
  description: string;
  created_at?: string;
}

export const LocationManager: React.FC = () => {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<LocationItem | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_BASE}/locations`);
      if (res.ok) {
        const data = await res.json();
        setLocations(data);
      }
    } catch {
      showToast('获取位置数据失败', 'error');
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('固定位置名称不能为空', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem ? `${API_BASE}/locations/${editingItem.id}` : `${API_BASE}/locations`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim()
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        showToast(resData.error || '保存失败', 'error');
        return;
      }

      showToast(editingItem ? '修改位置成功' : '新增固定位置成功', 'success');
      setFormData({ name: '', description: '' });
      setIsAdding(false);
      setEditingItem(null);
      fetchLocations();
    } catch {
      showToast('连接服务器异常', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const isConfirmed = await confirm({
      title: '删除受控固定位置',
      message: `确定要删除受控位置「${name}」吗？\n删除后，已关联该位置的设备记录不受影响，但该位置将不再列入受控固定场所统计。`,
      type: 'danger',
      confirmText: '确认删除',
      cancelText: '取消'
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/locations/${id}`, { method: 'DELETE' });
      const resData = await res.json();
      if (res.ok) {
        showToast('位置信息已删除', 'success');
        fetchLocations();
      } else {
        showToast(resData.error || '删除失败', 'error');
      }
    } catch {
      showToast('删除请求异常', 'error');
    }
  };

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* 业务规则指引说明 */}
      <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 text-xs flex gap-3 items-start">
        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          <span className="font-semibold text-emerald-950 dark:text-emerald-300">💡 受控固定场所判定标准：</span>
          在下方添加的物理位置将被系统认定为<strong className="text-emerald-700 dark:text-emerald-400">“下发后位置相对固定”</strong>的专用场地（如多功能教室、微格教室、中心机房等）。
          只有存放在此类位置的设备才会纳入【数据统计与分析】中的“固定场所资产稳定矩阵”。如果 Keeper 在出库时自行填写了散乱/临时位置，则自动划归为个人保管流转项，不混入固定场所统计。
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* 控制顶栏 */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex-1 w-full sm:max-w-md">
            <SearchBar
              placeholder="搜索位置名称或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            onClick={() => {
              if (isAdding) {
                setIsAdding(false);
              } else {
                setEditingItem(null);
                setFormData({ name: '', description: '' });
                setIsAdding(true);
              }
            }}
            className="w-full sm:w-auto"
            variant="primary"
            size="md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? '取消新增' : '新增受控位置'}</span>
          </Button>
        </div>

        {/* 新增 / 编辑 表单框 */}
        {(isAdding || editingItem) && (
          <form onSubmit={handleSubmit} className="p-5 bg-slate-50/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-1">
              <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                {editingItem ? `编辑位置信息: ${editingItem.name}` : '添加新的受控固定场所'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="物理位置名称 (必填) ✅"
                type="text"
                required
                placeholder="例如: 微格教室 / 302实验室 / 行政楼301会议室"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Input
                label="场所详细描述 / 功能说明 (可选)"
                type="text"
                placeholder="例如: 教学楼一楼综合多媒体教学场所"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setIsAdding(false);
                  setEditingItem(null);
                  setFormData({ name: '', description: '' });
                }}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
              >
                {isSubmitting ? '保存中...' : '保存位置'}
              </Button>
            </div>
          </form>
        )}

        {/* 列表渲染 */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
              {filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-600/50 transition-all shadow-sm flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {loc.name}
                      </span>
                      <Badge tone="emerald">
                        受控固定场所
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed pl-5 font-normal">
                      {loc.description || '暂无详细补充说明'}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAdding(false);
                        setEditingItem(loc);
                        setFormData({ name: loc.name, description: loc.description || '' });
                      }}
                      title="编辑"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>编辑</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(loc.id, loc.name)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>删除</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<MapPin className="w-8 h-8 text-slate-300" />}
                title="未搜索到匹配的固定物理位置"
                description="管理员可以在上方添加学校固定场所名调配字典"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
