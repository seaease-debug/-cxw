// components/Maintenance.tsx —— 维修模块入口（拆分为壳，逻辑见 maintenance/）
import React from 'react';
import { UserAccount } from '../types';
import MaintenanceView from './maintenance/MaintenanceView';

interface MaintenanceProps {
  user: UserAccount;
}

const Maintenance: React.FC<MaintenanceProps> = ({ user }) => <MaintenanceView user={user} />;

export default Maintenance;
