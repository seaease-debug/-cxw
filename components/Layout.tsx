
import React, { useState, useEffect } from 'react';
import { UserRole, AVATAR_PRESETS, UserAccount } from '../types';
import { Package, BarChart3, Settings, LogOut, Moon, Sun, Smartphone, Menu, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { IconButton } from './ui/IconButton';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserAccount;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const [dark, setDark] = useState(() => localStorage.getItem('eduasset_dark') === 'true');
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('eduasset_sidebar_collapsed') === 'true');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('eduasset_dark', String(dark));
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('eduasset_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const iconMap: Record<string, React.ReactNode> = {
    warehouse: <Package size={20} />,
    maintenance: <Wrench size={20} />,
    reports: <BarChart3 size={20} />,
    admin: <Settings size={20} />,
    mobile_portal: <Smartphone size={20} />,
  };

  const allItems = [
    { id: 'warehouse', label: '资产管理', roles: [UserRole.ADMIN, UserRole.KEEPER, UserRole.USER] },
    { id: 'maintenance', label: '维修管理', roles: [UserRole.ADMIN, UserRole.KEEPER, UserRole.USER] },
    // 扫码门户（mobile_portal）：App.tsx 早有路由、iconMap 早有图标，唯独菜单里没有 ⇒
    // 侧边栏永远不显示入口，功能只能靠改代码才到得了。它对全部角色开放
    // （游客扫码查资产本身就不需要登录），与 warehouse / maintenance 同权限面。
    { id: 'mobile_portal', label: '扫码门户', roles: [UserRole.ADMIN, UserRole.KEEPER, UserRole.USER] },
    // Suppliers moved to Admin module
    { id: 'reports', label: '统计报表', roles: [UserRole.ADMIN, UserRole.KEEPER] },
    { id: 'admin', label: '系统管理', roles: [UserRole.ADMIN] },
  ];

  const menuItems = allItems.filter(item => item.roles.includes(user.role as UserRole));

  const avatarElement = (() => {
    const avatarId = user.avatar || (user.role === UserRole.ADMIN ? 'avatar_10' : user.role === UserRole.KEEPER ? 'avatar_9' : 'avatar_1');
    const preset = AVATAR_PRESETS.find(p => p.id === avatarId);
    if (preset) {
      return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shadow-sm border border-black/15 shrink-0" style={{ backgroundColor: preset.color }} title={user.realName}>
          {preset.emoji}
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300 border border-slate-700 shrink-0 select-none" title={user.realName}>
        👤
      </div>
    );
  })();

  return (
    <div className="flex h-dvh bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Skip to content link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-tooltip)] focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-lg focus:text-sm">
        跳到主内容
      </a>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-[var(--z-drawer-overlay)] md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        style={{
          fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          textRendering: 'auto',
        }}
        className={`fixed md:relative inset-y-0 left-0 z-[var(--z-drawer)] md:z-auto bg-slate-900 text-white flex flex-col shadow-xl transition-[width] duration-200 ease-in-out h-full ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${
        isCollapsed ? 'md:w-16' : 'md:w-64'
      } w-64`}>
        <div className={`p-4 ${isCollapsed ? 'md:px-3 md:py-6' : 'md:p-6'} border-b border-slate-800 flex items-center justify-between overflow-hidden shrink-0`}>
          <div className="flex items-center space-x-3 w-full">
            <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain shrink-0 rounded-full" />
            <div className={`${isCollapsed ? 'md:hidden' : 'flex-1'} overflow-hidden flex flex-col justify-center min-w-0`}>
              <h1 className="text-sm font-bold leading-tight tracking-normal whitespace-nowrap truncate text-white">固定资产登记平台</h1>
              <p className="text-[11px] text-slate-300 mt-0.5 tracking-normal font-medium leading-tight whitespace-nowrap truncate">Fixed Asset Registration Platform</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false);
              }}
              aria-label={item.label}
              className={`w-full flex items-center justify-start py-3 rounded-lg border-none cursor-pointer outline-none select-none transition-colors duration-150 ${
                isCollapsed ? 'md:justify-center md:space-x-0 md:px-0' : 'space-x-3 px-4'
              } ${
                activeTab === item.id
                  ? 'text-white font-bold bg-teal-600 shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800 font-medium'
              }`}
              style={activeTab === item.id ? { backgroundColor: 'var(--color-brand)' } : {}}
            >
              <span className="text-xl shrink-0" aria-hidden="true">{iconMap[item.id]}</span>
              <span className={`font-semibold text-sm leading-normal tracking-wide ${isCollapsed ? 'md:hidden' : 'inline-block'} whitespace-nowrap overflow-hidden select-none`}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
          {isCollapsed ? (
            <div className="flex flex-col items-center space-y-4">
              {avatarElement}
              <IconButton 
                icon={<ChevronRight size={18} />}
                label="展开侧边栏"
                onClick={() => setIsCollapsed(false)}
                shape="rounded"
                tone="onDark"
                className="shrink-0"
              />
              <IconButton
                icon={<LogOut size={18} />}
                label="退出登录"
                onClick={onLogout}
                tone="onDarkDanger"
                className="shrink-0"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-3">
                {avatarElement}
                <div className="text-xs flex-1 whitespace-nowrap overflow-hidden">
                   <p className="font-bold truncate text-white leading-tight">{user.realName}</p>
                   <p className="text-slate-300 text-xs font-medium leading-tight mt-0.5">{user.department}</p>
                </div>
                <IconButton
                  icon={<LogOut size={18} />}
                  label="退出登录"
                  onClick={onLogout}
                  tone="onDarkDanger"
                  className="shrink-0"
                />
              </div>
              
              <div className="hidden md:flex justify-end mt-4">
                <button 
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  aria-label="折叠侧边栏"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1 text-xs font-medium cursor-pointer transition-colors duration-150 border-none outline-none"
                >
                  <ChevronLeft size={14} />
                  <span>折叠侧边栏</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-[var(--z-sticky)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <IconButton
              icon={<Menu size={20} />}
              label="打开菜单"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
            />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate">
              科技信息中心固定资产登记平台
            </h2>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
             <IconButton
               icon={dark ? <Sun size={16} /> : <Moon size={16} />}
               label={dark ? '切换到亮色模式' : '切换到暗色模式'}
               onClick={() => setDark(prev => !prev)}
               className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
             />
             <div className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300">
                {user.role === UserRole.ADMIN ? '超级管理员' : user.role === UserRole.KEEPER ? '仓库管理员' : '普通用户'}
             </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <div className="max-w-[1440px] mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
