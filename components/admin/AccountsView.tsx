import React from 'react';
import { Download, Upload, Plus, Key, Trash2, User, Edit } from 'lucide-react';
import { DEPT_CODES, AVATAR_PRESETS } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { CustomSelect } from '../CustomSelect';
import { Badge } from '../ui/Badge';
import { SearchBar } from '../ui/SearchBar';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';
import { Skeleton } from '../ui/Skeleton';
import { API_BASE } from '../../services/api';
import { useAccounts } from './useAccounts';

type AccountsApi = ReturnType<typeof useAccounts>;

/** 账号面板：控制栏 + 新增表单 + 表格 + 分页 + 空态。 */
const renderPanel = (a: AccountsApi) => {
  const {
    searchQuery, setSearchQuery, isAddingAccount, setIsAddingAccount,
    downloadTemplate, fileInputRef, handleImportCSV, handleAddAccount,
    newAvatar, setNewAvatar, accountsLoading, currentItems, handleUpdateRole,
    setEditingAccount, handleUpdatePassword, handleDeleteAccount,
    totalPages, currentPage, setCurrentPage,
  } = a;
  return (

    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full md:max-w-md">
                <SearchBar
                  placeholder="搜索用户名、姓名或部门..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                  <Button onClick={downloadTemplate} variant="secondary" size="sm">
                    <Download className="w-3.5 h-3.5" /> 模版
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="sm">
                    <Upload className="w-3.5 h-3.5" /> 导入
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImportCSV} />
                  <Button onClick={() => setIsAddingAccount(!isAddingAccount)} variant="primary" size="sm">
                    {isAddingAccount ? '取消' : <><Plus className="w-3.5 h-3.5" /> 新增账号</>}
                  </Button>
              </div>
           </div>
        </div>

        {isAddingAccount && (
          <form onSubmit={handleAddAccount} className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 flex flex-col space-y-4 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Input 
                label="用户名 ✅" 
                name="username" 
                required 
                placeholder="登录ID" 
              />
              <Input 
                label="初始密码 ✅" 
                name="password" 
                type="password" 
                required 
                placeholder="建议6位以上" 
              />
              <Input 
                label="真实姓名 ✅" 
                name="realName" 
                required 
                placeholder="输入真实姓名" 
              />
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">所属部门</label>
                <CustomSelect
                  name="department"
                  options={Object.keys(DEPT_CODES).map(d => ({ value: d, label: d }))}
                  size="sm" className="bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">系统权限</label>
                <CustomSelect
                  name="role"
                  options={[
                    { value: 'user', label: 'User (普通)' },
                    { value: 'keeper', label: 'Keeper (仓库管理员)' },
                    { value: 'admin', label: 'Admin (管理)' },
                  ]}
                  size="sm" className="bg-white dark:bg-slate-800"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="primary" size="md" className="w-full">保存</Button>
              </div>
            </div>

            <div className="border bg-white dark:bg-slate-800 p-4 rounded-xl border-slate-200 dark:border-slate-700 flex flex-col space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase">选择用户预设头像</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setNewAvatar(preset.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-base relative cursor-pointer border-2 transition-all ${newAvatar === preset.id ? 'scale-110 shadow-md ring-2 ring-slate-200 dark:ring-slate-700' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'}`}
                    style={newAvatar === preset.id ? { backgroundColor: preset.color, borderColor: 'var(--color-brand)' } : { backgroundColor: preset.color }}
                    title={preset.name}
                  >
                    {preset.emoji}
                    {newAvatar === preset.id && (
                      <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border border-white font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* Compact Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 sticky top-0 z-[var(--z-sticky)]">
              <tr>
                <th className="px-4 py-3">登录ID</th>
                <th className="px-4 py-3">真实姓名</th>
                <th className="px-4 py-3">所属部门</th>
                <th className="px-4 py-3">权限级别</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {accountsLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="border-b border-slate-200 dark:border-slate-800/50">
                    <td className="px-4 py-3.5"><Skeleton height="1.125rem" width="60%" className="rounded" /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-2 animate-pulse">
                        <Skeleton height="1.5rem" width="1.5rem" className="rounded-full shrink-0" />
                        <Skeleton height="1.125rem" width="70px" className="rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><Skeleton height="1.125rem" width="50%" className="rounded" /></td>
                    <td className="px-4 py-3.5"><Skeleton height="1.375rem" width="65px" className="rounded" /></td>
                    <td className="px-4 py-3.5 text-right flex justify-end items-center space-x-1.5">
                      <Skeleton height="1.5rem" width="24px" className="rounded" />
                      <Skeleton height="1.5rem" width="24px" className="rounded" />
                      <Skeleton height="1.5rem" width="24px" className="rounded" />
                    </td>
                  </tr>
                ))
              ) : currentItems.length > 0 ? currentItems.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">{acc.username}</p>
                  </td>
                  <td className="px-4 py-2.5">
                     <div className="flex items-center space-x-2">
                       {(() => {
                         const preset = AVATAR_PRESETS.find(p => p.id === acc.avatar);
                         return (
                           <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm border border-black/10 shrink-0 select-none" style={{ backgroundColor: preset?.color || '#cbd5e1' }}>
                             {preset?.emoji || '👤'}
                           </div>
                         );
                       })()}
                       <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">{acc.realName}</p>
                     </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium">{acc.department}</td>
                  <td className="px-4 py-2.5">
                    {acc.username === 'admin' ? (
                      <Badge tone="amber" className="uppercase font-bold">
                        Admin
                      </Badge>
                    ) : (
                      <select
                        value={acc.role}
                        onChange={(e) => handleUpdateRole(acc.id, e.target.value)}
                        className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase border outline-none cursor-pointer transition-all ${
                          acc.role === 'admin'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-hover'
                            : acc.role === 'keeper'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-field hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <option value="user" className="text-slate-500 bg-white dark:bg-slate-800 font-bold select-option">User</option>
                        <option value="keeper" className="text-emerald-700 bg-white dark:bg-slate-800 font-bold select-option">Keeper</option>
                        <option value="admin" className="text-amber-700 bg-white dark:bg-slate-800 font-bold select-option">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right flex justify-end items-center space-x-1.5">
                    <Button variant="secondary" size="sm" iconOnly onClick={() => setEditingAccount(acc)} className="text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400" title="编辑资料" aria-label="编辑资料"><Edit size={13} /></Button>
                    <Button variant="secondary" size="sm" iconOnly onClick={() => handleUpdatePassword(acc.id)} className="text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400" title="重置密码" aria-label="重置密码"><Key size={13} /></Button>
                    {acc.username !== 'admin' && (
                      <Button variant="secondary" size="sm" iconOnly onClick={() => handleDeleteAccount(acc.id)} className="text-slate-400 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-800" title="删除" aria-label="删除"><Trash2 size={13} /></Button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<User className="w-8 h-8" />}
                      title={searchQuery ? '未找到匹配的账号' : '暂无账号数据'}
                      description={searchQuery
                        ? '没有账号符合当前搜索条件，请尝试其他关键词。'
                        : '系统中还没有用户账号。您可以点击右上方的「新增账号」或使用导入功能批量添加。'
                      }
                      actionText={!searchQuery ? "新增账号" : undefined}
                      onAction={() => setIsAddingAccount(true)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">页码: {currentPage} / {totalPages}</span>
            <div className="flex space-x-2">
              <Button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                variant="secondary"
                size="sm"
              >
                上一页
              </Button>
              <Button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                variant="secondary"
                size="sm"
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/** 编辑用户资料弹窗。 */
const renderEditModal = (a: AccountsApi) => {
  const { editingAccount, setEditingAccount, editAvatar, setEditAvatar, fetchAccounts, showToast } = a;
  if (!editingAccount) return null;
  return (

    <div className="fixed inset-0 z-[var(--z-modal-overlay)] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs animate-in fade-in" role="dialog" aria-modal="true">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
           <div>
             <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">修改用户资料</h3>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Edit User Profile</p>
           </div>
           <IconButton
             icon={<span className="text-xs">✕</span>}
             label="关闭"
             onClick={() => setEditingAccount(null)}
             className="w-7 h-7 p-0 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 text-xs"
           />
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const rawPayload = Object.fromEntries(formData.entries());
          const payload = {
            realName: rawPayload.realName,
            department: rawPayload.department,
            avatar: editAvatar,
            role: rawPayload.role || editingAccount.role
          };
          try {
            const res = await fetch(`${API_BASE}/accounts/${editingAccount.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (res.ok) {
              showToast('用户资料更新成功', 'success');
              setEditingAccount(null);
              fetchAccounts();
            } else {
              showToast('更新失败', 'error');
            }
          } catch {
            showToast('连接服务器异常', 'error');
          }
        }} className="space-y-4">
          <Input 
            label="用户名 (登录ID)" 
            type="text" 
            disabled 
            value={editingAccount.username} 
          />

          <Input 
            label="真实姓名 ✅" 
            name="realName" 
            defaultValue={editingAccount.realName} 
            required 
          />

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">所属学科 / 部门</label>
            <CustomSelect
              name="department"
              defaultValue={editingAccount.department}
              options={Object.keys(DEPT_CODES).map(d => ({ value: d, label: d }))}
              size="sm" className="bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">系统权限</label>
            {editingAccount.username === 'admin' ? (
              <Input 
                type="text" 
                disabled 
                value="Admin (系统管理员)" 
              />
            ) : (
              <CustomSelect
                name="role"
                defaultValue={editingAccount.role}
                options={[
                  { value: 'user', label: 'User (普通)' },
                  { value: 'keeper', label: 'Keeper (仓库管理员)' },
                  { value: 'admin', label: 'Admin (管理)' },
                ]}
                size="sm" className="bg-white dark:bg-slate-800"
              />
            )}
          </div>

          <div className="flex flex-col space-y-2 pt-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase">选择用户预设头像</label>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setEditAvatar(preset.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-base relative cursor-pointer border-2 transition-all ${editAvatar === preset.id ? 'scale-110 shadow-md ring-2 ring-slate-200 dark:ring-slate-700' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'}`}
                  style={editAvatar === preset.id ? { backgroundColor: preset.color, borderColor: 'var(--color-brand)' } : { backgroundColor: preset.color }}
                  title={preset.name}
                >
                  {preset.emoji}
                  {editAvatar === preset.id && (
                    <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border border-white font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="secondary" size="md" className="flex-1" onClick={() => setEditingAccount(null)}>取消</Button>
            <Button type="submit" variant="primary" size="md" className="flex-1">保存修改</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/** CSV 批量导入进度弹窗。 */
const renderImportModal = (a: AccountsApi) => {
  const { importProgress } = a;
  return (

    <div className="fixed inset-0 z-[var(--z-modal-overlay)] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs animate-in fade-in" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 animate-bounce">
          <Upload className="w-6 h-6 text-teal-600 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">正在导入用户数据...</h3>
          <p className="text-xs text-slate-400 mt-1">请勿关闭或刷新页面</p>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
          <div 
            className="bg-teal-600 h-full rounded-full transition-all duration-150 ease-out" 
            style={{ width: `${importProgress}%` }}
          />
        </div>
        <span className="text-xs font-semibold font-mono text-teal-600">{importProgress}%</span>
      </div>
    </div>
  );
};

const AccountsView: React.FC = () => {
  const acc = useAccounts();

  return (
    <>
      {renderPanel(acc)}
      {acc.editingAccount && renderEditModal(acc)}
      {acc.isImporting && renderImportModal(acc)}
    </>
  );
};

export default AccountsView;
