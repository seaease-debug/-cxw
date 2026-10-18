
export enum AssetStatus {
  NEW_IN_WAREHOUSE = '新设备在库',
  IN_USE = '服役中',
  IN_REPAIR = '维修中',
  RECYCLED_PENDING = '待周转',
  SCRAP_PENDING = '待报废',
  SCRAPPED = '已报废'
}

export enum AssetType {
  NB = '笔记本电脑',
  PC = '台式电脑',
  MON = '显示器',
  PROJ = '投影仪',
  PRT = '打印机',
  SCAN = '扫描仪',
  SWITCH = '交换机',
  ROUTER = '路由器',
  SRV = '服务器',
  MC = '多媒体中控',
  AUDIO = '音响设备',
  CAM = '摄像头',
  AIO = '一体机',
  TAB = '平板电脑',
  DC = '数码相机',
  UPS = 'UPS电源',
  CAB = '机柜',
  AC = '空调'
}

export enum UserRole {
  ADMIN = 'admin',
  KEEPER = 'keeper',
  USER = 'user'
}

export const TYPE_CODES: Record<string, string> = {
  '笔记本电脑': 'NB', '台式电脑': 'PC', '显示器': 'MON', '投影仪': 'PROJ',
  '打印机': 'PRT', '扫描仪': 'SCAN', '交换机': 'SWITCH', '路由器': 'ROUTER',
  '服务器': 'SRV', '多媒体中控': 'MC', '音响设备': 'AUDIO', '摄像头': 'CAM',
  '一体机': 'AIO', '平板电脑': 'TAB', '数码相机': 'DC', 'UPS电源': 'UPS',
  '机柜': 'CAB', '空调': 'AC'
};

export const WAREHOUSE_CODES: Record<string, string> = {
  '1楼小仓库': '1FSM',
  '1楼办公室仓库': '1FOF',
  '4楼大仓库': '4FBG',
  '3楼中心机房': '3FCR'
};

export const DEPT_CODES: Record<string, string> = {
  '语文': 'CHN', '数学': 'MATH', '英语': 'ENG', '政治': 'POL', '历史': 'HIST',
  '地理': 'GEO', '物理': 'PHYS', '化学': 'CHEM', '生物': 'BIO', '体育': 'PE',
  '校办': 'OFF', '教学服务中心': 'TSC', '学生发展中心': 'SDC', '后勤保障中心': 'LSC',
  '科技信息中心': 'TIC', '艺术中心': 'ART', '信息技术': 'INFO', '实验中心': 'LC',
  '新疆部': 'XJ', '兴宁语文': 'XN-CH', '兴宁数学': 'XN-MA', '兴宁英语': 'XN-EN',
  '兴宁科学': 'XN-SCI', '兴宁社会': 'XN-SOC', '兴宁综合': 'XN-COM'
};

export interface Asset {
  id: string; 
  no: string; 
  name: string;
  type: AssetType;
  brandModel: string; 
  specification: string;
  serialNo: string; 
  purchaseDate: string;
  purchasePrice: number;
  supplierId: string;
  warrantyPeriod: string;
  currentStatus: AssetStatus;
  departmentId: string;
  currentKeeperId: string;
  currentLocationId: string;
  warehouseLocation: string;
  warehouseZone?: string;
  shelfNo?: string;
  macAddress?: string;
  remarks?: string;
  remainingDays: number;
  qrCodeInfo: string;
  voucherImage?: string;
  assetImage?: string;
  outboundDate?: string;
  retirementYears?: number;
  uploader?: string;
  auditCode?: string;

  // ─── API snake_case fallback fields ─────────────────────────
  // These mirror the backend raw response so that consumers can
  // access them directly without `as any` while frontend-only
  // code still prefers the camelCase equivalents above.
  location?: string;
  warehouse_location?: string;
  warehouse_name?: string;
  warehouseName?: string;
  status?: string;
  current_status?: string;
  department?: string;
  dept?: string;
  asset_no?: string;
  brand_model?: string;
  category?: string;
  price?: number;
  purchase_price?: number;
  purchase_date?: string;
  warranty_expire?: string;
  useful_life_years?: number;
  inbound_date?: string;
  outbound_date?: string;
  created_at?: string;
  keeper?: string;
  current_keeper?: string;
  warehouse_id?: string | number;
  warehouse_code?: string;
}

export type User = UserAccount;

export interface UserAccount {
  id: number;
  username: string;
  realName: string;
  department: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  token?: string;
  real_name?: string;
  name?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  location_desc: string;
}

export interface AssetTypeItem {
  id: number;
  name: string;
  code_prefix: string;
  sort_order: number;
}

export interface SystemLog {
  id: number;
  action_type: string;
  description: string;
  operator: string;
  created_at: string;
}

export interface AssetHistory {
  id: number;
  asset_id: string;
  action_type: string;
  description: string;
  operator: string;
  created_at: string;
  asset_no?: string;
  brand_model?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  maintenance_phone?: string;
  remarks?: string;
}

export enum MaintenanceStatus {
  PENDING = '待维修',
  IN_PROGRESS = '维修中',
  COMPLETED = '已完修',
  UNREPAIRABLE = '无法修复'
}

export interface MaintenanceRecord {
  id: number;
  record_no: string;
  asset_id: string | number;
  asset_no: string;
  asset_name: string;
  reporter_name: string;
  reporter_contact?: string;
  fault_type: string;
  fault_description: string;
  repair_status: string;
  cost: number;
  repair_vendor?: string;
  repair_date?: string;
  finish_date?: string;
  notes?: string;
  result_action?: string;
  target_warehouse?: string;
  created_at: string;
}

export const AVATAR_PRESETS = [
  { id: 'avatar_1', name: '🐱 趴趴猫', emoji: '🐱', color: '#fed7aa' },
  { id: 'avatar_2', name: '🐰 乖乖兔', emoji: '🐰', color: '#fbcfe8' },
  { id: 'avatar_3', name: '🐼 胖熊猫', emoji: '🐼', color: '#e2e8f0' },
  { id: 'avatar_4', name: '🦊 聪慧狐', emoji: '🦊', color: '#ffedd5' },
  { id: 'avatar_5', name: '🦁 小狮王', emoji: '🦁', color: '#fef08a' },
  { id: 'avatar_6', name: '🧑‍🚀 宇航员', emoji: '🧑‍🚀', color: '#bfdbfe' },
  { id: 'avatar_7', name: '🧙 小法师', emoji: '🧙', color: '#ddd6fe' },
  { id: 'avatar_8', name: '🧚 蓝仙子', emoji: '🧚', color: '#ccfbf1' },
  { id: 'avatar_9', name: '🦖 小恐龙', emoji: '🦖', color: '#bbf7d0' },
  { id: 'avatar_10', name: '🤖 机器人', emoji: '🤖', color: '#cbd5e1' },
];
