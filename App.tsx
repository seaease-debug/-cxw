
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import AssetDetail from './components/AssetDetail';
import Warehouse from './components/Warehouse';
import Maintenance from './components/Maintenance';
import Reports from './components/Reports';
import Admin from './components/Admin';
import Login from './components/Login';
import MobileScanner from './components/MobileScanner';
import { Asset, UserRole, UserAccount } from './types';
import { NotFound } from './components/ui/NotFound';

// Global fetch interceptor to append JWT Authorization token
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let token = localStorage.getItem('eduasset_token');
  if (!token) {
    const savedUser = localStorage.getItem('eduasset_user');
    if (savedUser) {
      try {
        token = JSON.parse(savedUser).token;
      } catch {}
    }
  }

  let headers: Record<string, string> = {};
  if (init && init.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      headers = { ...init.headers } as Record<string, string>;
    }
  }

  const urlString = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
  if (token && (urlString.startsWith('/api/') || urlString.includes('/api/'))) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const newInit: RequestInit = {
    ...init,
    headers,
  };

  const response = await originalFetch(input, newInit);

  // Exclude login requests from auto logout logic to avoid blocking original login flow
  if (response.status === 401 && !urlString.endsWith('/api/login')) {
    localStorage.removeItem('eduasset_token');
    localStorage.removeItem('eduasset_user');
    window.dispatchEvent(new Event('eduasset_unauthorized'));
  }

  return response;
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState('warehouse');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [guestAssetNo, setGuestAssetNo] = useState<string | null>(null);

  // Listen for global unauthorized events to log out
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('eduasset_user');
      localStorage.removeItem('eduasset_token');
    };
    window.addEventListener('eduasset_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('eduasset_unauthorized', handleUnauthorized);
  }, []);

  // Load user from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('eduasset_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setActiveTab('warehouse');
    }

    // Check URL parameters for QR scanning
    const params = new URLSearchParams(window.location.search);
    const assetNo = params.get('asset_no') || params.get('q');
    if (assetNo) {
      setGuestAssetNo(assetNo);
    }
  }, []);

  // ESC: Close asset detail view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedAsset) {
        setSelectedAsset(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAsset]);

  const handleLogin = (userData: UserAccount) => {
    setUser(userData);
    localStorage.setItem('eduasset_user', JSON.stringify(userData));
    if (userData && userData.token) {
      localStorage.setItem('eduasset_token', userData.token);
    }
    setActiveTab('warehouse');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('eduasset_user');
    localStorage.removeItem('eduasset_token');
  };

  if (guestAssetNo) {
    return (
      <div className="min-h-dvh bg-slate-50 flex flex-col sm:items-center sm:justify-center">
        <div className="w-full min-h-dvh sm:min-h-0 sm:h-auto sm:max-w-md bg-white sm:rounded-3xl sm:shadow-2xl overflow-hidden sm:border border-slate-200 flex flex-col">
          <MobileScanner 
            initialAssetNo={guestAssetNo} 
            user={user} 
            hideSimulatorContainer={true}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (selectedAsset) {
      return (
        <AssetDetail 
          asset={selectedAsset} 
          onBack={() => setSelectedAsset(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'warehouse':
        return <Warehouse user={user} />;
      case 'maintenance':
        return <Maintenance user={user} />;
      case 'mobile_portal':
        return <MobileScanner user={user} />;
      case 'reports':
        return (user.role === UserRole.ADMIN || user.role === UserRole.KEEPER) ? <Reports user={user} /> : null;
      case 'admin':
        return user.role === UserRole.ADMIN ? <Admin /> : null;
      default:
        return <NotFound onBackToHome={() => { setActiveTab('warehouse'); setSelectedAsset(null); }} />;
    }
  };

  return (
    <Layout 
      user={user} 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        setActiveTab(tab);
        setSelectedAsset(null);
      }}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
