import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { useToast } from './Toast';
import { useDialog } from './ui/DialogContext';
import { Badge } from './ui/Badge';
import { SearchBar } from './ui/SearchBar';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Supplier } from '../types';
import { Skeleton } from './ui/Skeleton';
import { API_BASE } from '../services/api';

const Suppliers: React.FC = () => {
  const { showToast } = useToast();
  const { confirm } = useDialog();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/suppliers`);
      if (res.ok) {
        setSuppliers(await res.json());
      }
    } catch {
      showToast('加载服务商列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${API_BASE}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast('服务商登记成功', 'success');
        setIsAdding(false);
        fetchSuppliers();
      } else {
        const errData = await res.json();
        showToast(errData.error || '添加失败', 'error');
      }
    } catch {
      showToast('登记失败，请检查网络连接', 'error');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${API_BASE}/suppliers/${editingSupplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast('服务商档案更新成功', 'success');
        setEditingSupplier(null);
        fetchSuppliers();
      } else {
        const errData = await res.json();
        showToast(errData.error || '更新失败', 'error');
      }
    } catch {
      showToast('更新服务商信息失败', 'error');
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    const isConfirmed = await confirm({
      title: "删除服务商",
      message: `确定要删除服务商「${supplier.name}」吗？该操作无法恢复，且会影响资产关联的展示。`,
      type: "danger",
      confirmText: "确认删除",
      cancelText: "取消"
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/suppliers/${supplier.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('服务商档案已成功移除', 'success');
        fetchSuppliers();
      } else {
        const errData = await res.json();
        showToast(errData.error || '删除失败', 'error');
      }
    } catch {
      showToast('删除服务商失败，请重试', 'error');
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.contact_person || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.remarks || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Suppliers List & Filters */}
        <div className="flex-1 p-8 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">合作服务商档案</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5 font-mono">Vendor & Supplier Records</p>
            </div>
            {/* Search Input */}
            <div className="w-full sm:w-64">
              <SearchBar
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索服务商、联系人、电话..."
              />
            </div>
          </div>

          <div className="flex-1 mt-6 overflow-y-auto max-h-[550px] pr-2 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse space-y-4 sm:space-y-0">
                    <div className="flex items-start space-x-4 w-full">
                      <Skeleton height="2.5rem" width="2.5rem" className="rounded-xl shrink-0" />
                      <div className="space-y-2.5 w-full max-w-md">
                        <div className="flex items-center space-x-2">
                          <Skeleton height="1.125rem" width="40%" className="rounded" />
                          <Skeleton height="1.125rem" width="60px" className="rounded-full" />
                        </div>
                        <div className="flex items-center space-x-4">
                          <Skeleton height="0.875rem" width="70px" className="rounded" />
                          <Skeleton height="0.875rem" width="90px" className="rounded" />
                          <Skeleton height="0.875rem" width="90px" className="rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:space-x-1 shrink-0 justify-end">
                      <Skeleton height="2rem" width="32px" className="rounded-lg" />
                      <Skeleton height="2rem" width="32px" className="rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <EmptyState
                icon={<Lucide.Inbox size={32} className="stroke-1 text-slate-300 dark:text-slate-600" />}
                title="暂无匹配的服务商档案记录"
                description={searchQuery ? '没有找到符合搜索条件的服务商，请调整搜索关键词。' : '当前系统中暂无服务商档案，可点击左侧表单新增服务商。'}
              />
            ) : (
              filteredSuppliers.map(supplier => (
                <div 
                  key={supplier.id} 
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border transition-all ${
                    editingSupplier?.id === supplier.id 
                      ? 'bg-teal-50/35 dark:bg-teal-950/10 border-teal-200 dark:border-teal-900 shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm shrink-0 border border-teal-100/30 dark:border-teal-900/10">
                      {supplier.name ? supplier.name[0] : '商'}
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{supplier.name}</h4>
                        <Badge tone="slate" className="font-mono">
                          ID: {supplier.id}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs font-medium text-slate-600 dark:text-slate-300 flex-wrap gap-y-1">
                        <span className="flex items-center space-x-1">
                          <Lucide.User size={13} className="text-slate-400 dark:text-slate-500" />
                          <span>{supplier.contact_person}</span>
                        </span>
                        <span className="flex items-center space-x-1 font-mono text-teal-600 dark:text-teal-400 font-bold">
                          <Lucide.PhoneCall size={13} className="text-teal-500 dark:text-teal-400" />
                          <span>{supplier.phone}</span>
                        </span>
                        {supplier.maintenance_phone && (
                          <span className="flex items-center space-x-1 font-mono text-slate-700 dark:text-slate-200 font-bold">
                            <Lucide.Wrench size={13} className="text-slate-400 dark:text-slate-500" />
                            <span>{supplier.maintenance_phone}</span>
                          </span>
                        )}
                      </div>
                      {supplier.remarks && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50/50 dark:bg-slate-800/20 px-2.5 py-1 rounded-lg border border-slate-200/30 dark:border-slate-800/10 max-w-lg mt-1">
                          服务备注：{supplier.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons on Hover */}
                  <div className="flex sm:space-x-1 mt-4 sm:mt-0 justify-end sm:opacity-0 group-hover:opacity-100 transition-all">
                    <Button 
                      onClick={() => { setEditingSupplier(supplier); setIsAdding(false); }} 
                      title="编辑服务商信息" aria-label="编辑服务商信息"
                      variant="ghost"
                      size="sm"
                    >
                      <Lucide.Edit2 size={14} />
                    </Button>
                    <Button 
                      onClick={() => handleDelete(supplier)} 
                      title="删除服务商档案" aria-label="删除服务商档案"
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
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
        <div className="w-full md:w-85 bg-slate-50/30 dark:bg-slate-950/10 p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <span className={`w-2.5 h-2.5 rounded-full ${editingSupplier ? 'bg-teal-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-widest font-mono">
                {editingSupplier ? '编辑服务商档案' : '录入新服务商'}
              </h4>
            </div>

            <form 
              key={editingSupplier ? `edit-${editingSupplier.id}` : 'add'}
              onSubmit={editingSupplier ? handleEdit : handleAdd} 
              className="space-y-5"
            >
              <Input 
                label="服务商名称 *"
                required 
                name="name"
                defaultValue={editingSupplier?.name || ''}
                placeholder="如: 戴尔中国有限公司, 联想服务中心" 
              />

              <Input 
                label="主要联系人 *"
                required 
                name="contact_person"
                defaultValue={editingSupplier?.contact_person || ''}
                placeholder="如: 张经理, 售后部李工" 
              />

              <Input 
                label="业务/销售电话 *"
                required 
                name="phone"
                defaultValue={editingSupplier?.phone || ''}
                className="font-mono font-bold"
                placeholder="手机或座机均可" 
              />

              <Input 
                label="特约维修站/售后热线"
                name="maintenance_phone"
                defaultValue={editingSupplier?.maintenance_phone || ''}
                className="font-mono font-bold"
                placeholder="如: 400-810-8888" 
              />

              <Input 
                as="textarea"
                label="服务约定与备注"
                name="remarks"
                defaultValue={editingSupplier?.remarks || ''}
                className="h-24 resize-none font-medium"
                placeholder="填写该商家的质保服务约定、特约保障内容、合作评级等..." 
              />

              <div className="pt-4 space-y-3">
                <Button 
                  type="submit" 
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {editingSupplier ? (
                    <>
                      <Lucide.Save size={14} />
                      <span>保存服务商修改</span>
                    </>
                  ) : (
                    <>
                      <Lucide.Plus size={14} />
                      <span>立即登记新服务商</span>
                    </>
                  )}
                </Button>
                {(editingSupplier || isAdding) && (
                  <Button 
                    type="button" 
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={() => { 
                      setEditingSupplier(null); 
                      setIsAdding(false);
                    }} 
                  >
                    取消操作
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

export default Suppliers;
