/**
 * 资产批量导入相关的纯函数（B2 拆分：从 useWarehouseActions 原样搬出）。
 * 抽出后无 React 依赖，可单独调用/测试。
 */

export interface CsvAssetRow {
  school_code: string;
  serial_no: string;
  mac_address: string;
  type: string;
  brand_model: string;
  purchase_date: string;
  purchase_price: number;
  supplier: string;
  warehouse_location: string;
  remarks: string;
  warranty_period: string;
  retirement_years: number;
  audit_code: string;
  asset_image: string | null;
}

/**
 * 解析资产导入 CSV 文本 → 后端 bulk 接口所需的行数组。
 * 返回空数组表示「文件为空（只有表头或全空行）」。
 */
export function parseAssetCsv(csv: string): CsvAssetRow[] {
  const lines = csv.split(/\r?\n/).filter((line) => {
    const trimmed = line.trim();
    return (
      trimmed !== "" &&
      !trimmed.startsWith("sep=") &&
      trimmed.replace(/,/g, "").trim() !== ""
    );
  });
  if (lines.length <= 1) return [];

  const parseCsvLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseCsvLine(lines[0]).map((h) =>
    h.replace(/["\ufeff\r\n]/g, "").trim(),
  );
  const findCol = (keywords: string[], fallbackIdx: number): number => {
    const found = headers.findIndex((h) =>
      keywords.some((k) => h.includes(k)),
    );
    return found !== -1 ? found : fallbackIdx;
  };

  const colSchool = findCol(["校区", "所属校区"], 0);
  const colSn = findCol(["序列号", "S/N", "SN"], 1);
  const colMac = findCol(["MAC", "mac"], 2);
  const colType = findCol(["类型", "资产类型"], 3);
  const colModel = findCol(["型号", "品牌型号", "规格"], 4);
  const colDate = findCol(["日期", "入库日期", "采购日期"], 5);
  const colPrice = findCol(["价格", "单价", "金额", "原值", "价值", "采购价格"], 6);
  const colSupplier = findCol(["供应商", "供货商", "商家"], 7);
  const colWh = findCol(["仓库", "仓库位置", "存放地点"], 8);
  const colRemarks = findCol(["备注", "说明"], 9);
  const colWarranty = findCol(["维保", "质保", "保修"], 10);
  const colYears = findCol(["年限", "报废年限", "折旧年限"], 11);
  const colAudit = findCol(["编号", "资产编号"], 12);
  const colImg = findCol(["照片", "图片", "设备照片"], 13);

  return lines.slice(1).map((line) => {
    const v = parseCsvLine(line);
    const clean = (s?: string) => (s ? s.trim() : "");

    let pDate = clean(v[colDate]);
    if (pDate) {
      const chineseMatch = pDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
      if (chineseMatch) {
        const year = chineseMatch[1];
        const month = chineseMatch[2].padStart(2, "0");
        const day = chineseMatch[3].padStart(2, "0");
        pDate = `${year}-${month}-${day}`;
      } else {
        pDate = pDate.replace(/\//g, "-");
        const parts = pDate.split("-");
        if (parts.length === 3 && parseInt(parts[0]) > 1000) {
          pDate = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
        }
      }
    }

    // 深度清洗价格：去除货币符号(¥,￥,$)、千分位逗号及前后多余字符
    const rawPriceStr = clean(v[colPrice]);
    const sanitizedPrice = rawPriceStr.replace(/[¥￥$\s,]/g, "");
    const parsedPrice = parseFloat(sanitizedPrice);
    const validPrice = (!isNaN(parsedPrice) && parsedPrice > 0) ? parsedPrice : 0;

    return {
      school_code: clean(v[colSchool]),
      serial_no: clean(v[colSn]),
      mac_address: clean(v[colMac]),
      type: clean(v[colType]),
      brand_model: clean(v[colModel]),
      purchase_date: pDate,
      purchase_price: validPrice,
      supplier: clean(v[colSupplier]),
      warehouse_location: clean(v[colWh]),
      remarks: clean(v[colRemarks]),
      warranty_period: clean(v[colWarranty]) || "3年",
      retirement_years: parseInt(clean(v[colYears]) || "8"),
      audit_code: clean(v[colAudit]),
      asset_image: clean(v[colImg]) || null,
    };
  });
}

/** 下载「资产入库批量导入模板.csv」。 */
export function downloadAssetTemplateCsv(): void {
  const BOM = "\uFEFF";
  const csvHeader =
    "所属校区(NB/XN),序列号(S/N),MAC地址,资产类型,品牌型号,入库日期,采购价格,供应商,仓库位置,备注,维保期限,报废年限(年),资产编号,设备照片\r\n";
  const csvContent = BOM + csvHeader;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "资产入库批量导入模板.csv";
  link.click();
}
