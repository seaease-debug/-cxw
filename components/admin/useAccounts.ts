import { useState, useEffect, useRef } from 'react';
import { UserAccount } from '../../types';
import { useToast } from '../Toast';
import { useDialog } from '../ui/DialogContext';
import { decodeFile } from '../../utils/fileDecode';
import { logError } from '../../utils/logger';
import { API_BASE } from '../../services/api';

const PAGE_SIZE = 10;

/** 用户账号域：列表 / 新增 / 删除 / 改密 / 改权限 / CSV 导入导出 / 搜索分页。 */
export function useAccounts() {
  const { showToast } = useToast();
  const { confirm, prompt } = useDialog();

  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [newAvatar, setNewAvatar] = useState<string>('avatar_1');
  const [editAvatar, setEditAvatar] = useState<string>('avatar_1');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  useEffect(() => {
    if (editingAccount) {
      setEditAvatar(editingAccount.avatar || 'avatar_1');
    }
  }, [editingAccount]);

  const fetchAccounts = async () => {
    try {
      setAccountsLoading(true);
      const res = await fetch(`${API_BASE}/accounts`);
      const data = await res.json();
      setAccounts(data);
    } catch (e) { logError(e); }
    finally { setAccountsLoading(false); }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    data.avatar = newAvatar;
    try {
      const res = await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setIsAddingAccount(false);
        fetchAccounts();
        showToast('账号创建成功', 'success');
      } else {
        const err = await res.json();
        showToast(`失败: ${err.error || '用户名已存在'}`, 'error');
      }
    } catch { showToast('服务器连接异常', 'error'); }
  };

  const downloadTemplate = () => {
    const BOM = "\uFEFF";
    const csvHeader = "用户名,真实姓名,所属部门,权限(admin/user),初始密码\r\n";
    const csvExample = "wang_laoshi,王老师,语文,user,nbzx1898\r\n";
    const csvContent = BOM + csvHeader + csvExample;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "用户账号管理导入模板.csv";
    link.click();
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const csv = await decodeFile(file);
      const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '' && !line.startsWith('sep='));
      if (lines.length <= 1) { showToast("文件内容为空", 'warning'); return; }

      const parsedData = lines.slice(1).map(line => {
        const p = line.split(',');
        return { 
          username: p[0]?.trim(), 
          realName: p[1]?.trim(), 
          department: p[2]?.trim(), 
          role: (p[3]?.trim().toLowerCase() === 'admin' ? 'admin' : (p[3]?.trim().toLowerCase() === 'keeper' || p[3]?.trim() === '仓库管理员' ? 'keeper' : 'user')), 
          password: p[4]?.trim()
        };
      }).filter(u => u.username && u.realName && u.password);

      if (parsedData.length === 0) {
        showToast("未检测到有效的用户记录，请检查格式是否正确", 'warning');
        return;
      }

      // Conflict Confirmation Dialog
      const isOverwrite = await confirm({
        title: "批量导入冲突策略",
        message: "检测到导入请求。\n\n【覆盖导入】：如有用户名冲突，更新已有账号资料\n【增量导入】：如有用户名冲突，保持原样不导入",
        confirmText: "覆盖导入",
        cancelText: "增量导入",
        type: "warning"
      });
      const strategy = isOverwrite ? 'overwrite' : 'incremental';

      // Start import animation progress
      setIsImporting(true);
      setImportProgress(10);

      // Smoothly animate progress bar up to 85%
      const interval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + Math.floor(Math.random() * 8) + 4;
        });
      }, 100);

      const res = await fetch(`${API_BASE}/accounts/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: parsedData, strategy })
      });
      
      clearInterval(interval);

      if (res.ok) {
        // Smooth transition to 100%
        setImportProgress(100);
        await new Promise(resolve => setTimeout(resolve, 600));
        setIsImporting(false);
        setImportProgress(0);
        
        showToast(`成功导入 ${parsedData.length} 条用户数据`, 'success');
        fetchAccounts();
      } else {
        setIsImporting(false);
        setImportProgress(0);
        const err = await res.json();
        showToast(err.error || '导入失败', 'error');
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch { 
      setIsImporting(false);
      setImportProgress(0);
      showToast('导入失败，请检查CSV格式是否正确（逗号分隔）', 'error'); 
    }
  };

  const handleDeleteAccount = async (id: number) => {
    const isConfirmed = await confirm({
      title: "注销账号",
      message: "确定要注销此账号吗？注销后该用户将无法再次登录本平台。",
      type: "danger",
      confirmText: "确认注销",
      cancelText: "取消"
    });
    if (!isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE}/accounts/${id}`, { method: 'DELETE' });
      if (res.ok) { fetchAccounts(); }
    } catch { showToast('删除失败', 'error'); }
  };

  const handleUpdatePassword = async (id: number) => {
    const newPwd = await prompt({
      title: "修改登录密码",
      message: "请输入该账号的新登录密码（最少4位）:",
      inputType: "password",
      placeholder: "输入新密码"
    });
    if (!newPwd) return;
    try {
      await fetch(`${API_BASE}/accounts/${id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPwd }),
      });
      showToast('密码已更新', 'success');
    } catch { showToast('操作失败', 'error'); }
  };

  const handleUpdateRole = async (id: number, newRole: string) => {
    try {
      const res = await fetch(`${API_BASE}/accounts/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        showToast('系统权限更新成功', 'success');
        fetchAccounts();
      } else {
        const err = await res.json();
        showToast(`操作失败: ${err.error || '无法修改权限'}`, 'error');
      }
    } catch { showToast('修改失败', 'error'); }
  };

  const filtered = accounts.filter(a => 
    a.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return {
    accounts, accountsLoading, searchQuery, setSearchQuery,
    isAddingAccount, setIsAddingAccount, currentPage, setCurrentPage, fileInputRef,
    editingAccount, setEditingAccount, newAvatar, setNewAvatar, editAvatar, setEditAvatar,
    isImporting, importProgress, fetchAccounts, showToast,
    handleAddAccount, downloadTemplate, handleImportCSV,
    handleDeleteAccount, handleUpdatePassword, handleUpdateRole,
    filtered, totalPages, currentItems,
  };
}
