// components/assetDetail/CategoryIcon.tsx
// 按「类型 + 名称」关键字挑一个设备图标（原为 AssetDetail.tsx 内的模块级函数，原样搬出）。
import React from "react";
import {
  Cpu,
  HardDrive,
  Laptop,
  Monitor,
  Package,
  Printer,
  Smartphone,
  Wifi,
} from "lucide-react";

export const categoryIconFor = (type: string = "", name: string = "") => {
  const str = `${type} ${name}`.toLowerCase();
  if (
    str.includes("电脑") ||
    str.includes("笔记本") ||
    str.includes("主机") ||
    str.includes("macbook") ||
    str.includes("dell") ||
    str.includes("optiplex")
  ) {
    return <Laptop className="w-8 h-8 text-teal-600 dark:text-teal-400" />;
  }
  if (str.includes("显示器") || str.includes("屏幕") || str.includes("电视")) {
    return <Monitor className="w-8 h-8 text-teal-600 dark:text-teal-400" />;
  }
  if (str.includes("打印") || str.includes("扫描")) {
    return <Printer className="w-8 h-8 text-teal-600 dark:text-teal-400" />;
  }
  if (
    str.includes("网络") ||
    str.includes("路由") ||
    str.includes("交换机") ||
    str.includes("wifi")
  ) {
    return <Wifi className="w-8 h-8 text-teal-600 dark:text-teal-400" />;
  }
  if (
    str.includes("存储") ||
    str.includes("u盘") ||
    str.includes("闪存") ||
    str.includes("硬盘") ||
    str.includes("闪迪") ||
    str.includes("sandisk")
  ) {
    return <HardDrive className="w-8 h-8 text-teal-600 dark:text-teal-400" />;
  }
  if (str.includes("手机") || str.includes("平板") || str.includes("pad")) {
    return <Smartphone className="w-8 h-8 text-teal-600 dark:text-teal-400" />;
  }
  if (str.includes("芯片") || str.includes("耗材") || str.includes("配件")) {
    return <Cpu className="w-8 h-8 text-teal-600 dark:text-teal-400" />;
  }
  return <Package className="w-8 h-8 text-teal-600 dark:text-teal-400" />;
};
