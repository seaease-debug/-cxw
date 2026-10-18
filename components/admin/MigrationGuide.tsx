import React from 'react';
import { FileArchive, ShieldAlert } from 'lucide-react';

// B3 拆分：Admin「系统全局参数」右卡（跨服务器无损迁移指南）原样搬出，无 props。
export const MigrationGuide: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FileArchive className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          跨服务器无损迁移指南
        </h4>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
        当您需要将本平台迁移到新的云服务器、物理机或 Docker 容器中时，只需按以下步骤操作，即可保证全部设备台账与实物照片完整不丢失：
      </p>

      <div className="space-y-3.5">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold shrink-0 mt-0.5">
            1
          </span>
          <div>
            <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              导出全量备份包
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              在原服务器点击「立即全量打包备份」，下载生成的 <code className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">eduasset_full_backup_*.tar.gz</code> 归档文件。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold shrink-0 mt-0.5">
            2
          </span>
          <div>
            <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              新服务器在线一键还原（推荐）
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              在新服务器启动部署好的 EduAsset Pro，进入本页面点击「选择备份包导入恢复」直接上传该备份包，系统将自动完成解压和图片回填。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold shrink-0 mt-0.5">
            3
          </span>
          <div>
            <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              或新服务器离线解压命令（可选）
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              若离线维护，将压缩包拷贝至新服务器项目根目录，停止服务后执行：<br />
              <code className="inline-block mt-1 text-[11px] font-mono bg-slate-900 text-teal-300 dark:bg-slate-950 px-2 py-1 rounded">
                tar -zxf eduasset_full_backup_*.tar.gz
              </code><br />
              确认根目录生成 <code className="font-mono text-[10px]">assets.db</code> 与 <code className="font-mono text-[10px]">uploads/</code> 后启动服务即可。
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
      {/* 字号与颜色均继承父级 text-xs / text-slate-400 —— 不在子级重复声明 */}
      <span className="flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        执行恢复前系统会自动留存一份当前快照以防意外
      </span>
      <span className="font-mono">v2.5.0 Pro</span>
    </div>
  </div>
);
