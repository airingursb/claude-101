import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Language helper (standalone, no LanguageProvider needed)            */
/* ------------------------------------------------------------------ */

type Lang = 'zh' | 'en';

function useLang(): { lang: Lang; t: <T>(zh: T, en: T) => T } {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'zh';
    const stored = localStorage.getItem('claude101-lang');
    return stored === 'en' ? 'en' : 'zh';
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent<Lang>).detail;
      if (next === 'zh' || next === 'en') setLang(next);
    };
    window.addEventListener('claude101-lang-change', handler);
    return () => window.removeEventListener('claude101-lang-change', handler);
  }, []);

  const t = useCallback(<T,>(zh: T, en: T): T => (lang === 'zh' ? zh : en), [lang]);
  return { lang, t };
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface FileEntry {
  name: string;
  size: string;
  role: string;
  roleEn: string;
}

interface Category {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  desc: string;
  descEn: string;
  weight: number; // relative visual weight (1-5)
  files: FileEntry[];
}

const CATEGORIES: Category[] = [
  {
    id: 'core',
    name: '核心处理',
    nameEn: 'Core Processing',
    color: '#3b82f6',
    desc: 'Agent Loop、查询生命周期、CLI 入口',
    descEn: 'Agent Loop, query lifecycle, CLI entry',
    weight: 5,
    files: [
      { name: 'main.tsx', size: '803KB', role: 'CLI 入口与主进程', roleEn: 'CLI entry & main process' },
      { name: 'query.ts', size: '68KB', role: '查询生命周期管理', roleEn: 'Query lifecycle management' },
      { name: 'QueryEngine.ts', size: '46KB', role: '核心查询引擎', roleEn: 'Core query engine' },
      { name: 'messages.ts', size: '32KB', role: '消息处理与转换', roleEn: 'Message processing & transformation' },
    ],
  },
  {
    id: 'tools',
    name: '工具系统',
    nameEn: 'Tools',
    color: '#22c55e',
    desc: '50+ 内置工具 + 实验性工具',
    descEn: '50+ built-in tools + experimental',
    weight: 5,
    files: [
      { name: 'AgentTool.ts', size: '233KB', role: '子 Agent 工具（最大文件）', roleEn: 'Sub-agent tool (largest file)' },
      { name: 'BashTool.ts', size: '45KB', role: '命令行执行', roleEn: 'Shell command execution' },
      { name: 'FileEditTool.ts', size: '38KB', role: '文件编辑与差异', roleEn: 'File editing & diffs' },
      { name: 'GrepTool.ts', size: '12KB', role: '代码搜索', roleEn: 'Code search' },
      { name: 'ReadTool.ts', size: '15KB', role: '文件读取', roleEn: 'File reading' },
      { name: 'WriteTool.ts', size: '10KB', role: '文件写入', roleEn: 'File writing' },
    ],
  },
  {
    id: 'mcp',
    name: 'MCP 协议',
    nameEn: 'MCP',
    color: '#a855f7',
    desc: 'MCP 客户端、认证、配置',
    descEn: 'MCP client, auth, config',
    weight: 4,
    files: [
      { name: 'client.ts', size: '119KB', role: 'MCP 客户端核心', roleEn: 'MCP client core' },
      { name: 'auth.ts', size: '88KB', role: 'OAuth 认证流程', roleEn: 'OAuth auth flow' },
      { name: 'config.ts', size: '51KB', role: 'MCP 服务器配置', roleEn: 'MCP server config' },
      { name: 'transport.ts', size: '28KB', role: '传输层（stdio/SSE）', roleEn: 'Transport layer (stdio/SSE)' },
    ],
  },
  {
    id: 'ui',
    name: '用户界面',
    nameEn: 'UI Layer',
    color: '#f59e0b',
    desc: '终端 UI、消息渲染、差异视图',
    descEn: 'Terminal UI, message rendering, diff views',
    weight: 3,
    files: [
      { name: 'MessageRender.tsx', size: '42KB', role: '消息渲染组件', roleEn: 'Message render component' },
      { name: 'DiffView.tsx', size: '35KB', role: '文件差异视图', roleEn: 'File diff view' },
      { name: 'Markdown.tsx', size: '22KB', role: 'Markdown 渲染', roleEn: 'Markdown rendering' },
      { name: 'PermissionUI.tsx', size: '18KB', role: '权限确认弹窗', roleEn: 'Permission confirmation dialog' },
    ],
  },
  {
    id: 'permissions',
    name: '权限系统',
    nameEn: 'Permissions',
    color: '#ef4444',
    desc: '权限瀑布、规则引擎、沙箱',
    descEn: 'Permission waterfall, rule engine, sandbox',
    weight: 2,
    files: [
      { name: 'permissions.ts', size: '24KB', role: '权限瀑布核心', roleEn: 'Permission waterfall core' },
      { name: 'denialTracking.ts', size: '8KB', role: '拒绝追踪', roleEn: 'Denial tracking' },
      { name: 'sandbox.ts', size: '15KB', role: '沙箱执行环境', roleEn: 'Sandbox execution env' },
      { name: 'ruleEngine.ts', size: '12KB', role: '规则匹配引擎', roleEn: 'Rule matching engine' },
    ],
  },
  {
    id: 'memory',
    name: '记忆系统',
    nameEn: 'Memory',
    color: '#ec4899',
    desc: 'CLAUDE.md、Auto Memory、AutoDream',
    descEn: 'CLAUDE.md, Auto Memory, AutoDream',
    weight: 2,
    files: [
      { name: 'memdir.ts', size: '21KB', role: '记忆目录管理', roleEn: 'Memory directory management' },
      { name: 'claudemd.ts', size: '14KB', role: 'CLAUDE.md 解析', roleEn: 'CLAUDE.md parsing' },
      { name: 'autoDream/', size: '—', role: '自动记忆生成', roleEn: 'Auto memory generation' },
    ],
  },
  {
    id: 'bridge',
    name: '远程控制',
    nameEn: 'Bridge & Remote',
    color: '#06b6d4',
    desc: '远程控制、Bridge 协议、传输层',
    descEn: 'Remote control, Bridge protocol, transports',
    weight: 3,
    files: [
      { name: 'bridgeMain.ts', size: '2800+ 行', role: 'Bridge 主进程', roleEn: 'Bridge main process' },
      { name: 'transports/', size: '—', role: '多种传输实现', roleEn: 'Multiple transport implementations' },
      { name: 'bridgeClient.ts', size: '18KB', role: 'Bridge 客户端', roleEn: 'Bridge client' },
    ],
  },
  {
    id: 'swarm',
    name: '多智能体',
    nameEn: 'Swarm & Agents',
    color: '#f97316',
    desc: '团队协调、Tmux/iTerm 后端、收件箱',
    descEn: 'Team coordination, Tmux/iTerm backends, mailbox',
    weight: 3,
    files: [
      { name: 'coordinator/', size: '—', role: '团队协调器', roleEn: 'Team coordinator' },
      { name: 'backends/', size: '—', role: 'Tmux / iTerm 后端', roleEn: 'Tmux / iTerm backends' },
      { name: 'mailbox.ts', size: '16KB', role: '队友收件箱', roleEn: 'Teammate mailbox' },
      { name: 'swarmConfig.ts', size: '11KB', role: 'Swarm 配置', roleEn: 'Swarm configuration' },
    ],
  },
];

const STATS = {
  zh: '565+ 文件 · 200K+ 行代码 · 54 工具 · 72+ 命令',
  en: '565+ files · 200K+ lines · 54 tools · 72+ commands',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ArchitectureTreemap() {
  const { t } = useLang();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedCat = CATEGORIES.find((c) => c.id === selected) ?? null;

  return (
    <div className="arch-treemap">
      {/* Header */}
      <div className="arch-treemap__header">
        <h2 className="arch-treemap__title">
          {t('Claude Code 源码架构', 'Claude Code Source Architecture')}
        </h2>
        <p className="arch-treemap__stats">{t(STATS.zh, STATS.en)}</p>
      </div>

      {/* Body */}
      <div className="arch-treemap__body">
        <AnimatePresence mode="wait">
          {!selectedCat ? (
            <motion.div
              key="grid"
              className="arch-treemap__grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.id}
                  className="arch-block"
                  style={{
                    '--block-color': cat.color,
                    gridColumn: cat.weight >= 5 ? 'span 2' : 'span 1',
                  } as React.CSSProperties}
                  onClick={() => setSelected(cat.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <span className="arch-block__dot" style={{ background: cat.color }} />
                  <span className="arch-block__name">{t(cat.name, cat.nameEn)}</span>
                  <span className="arch-block__desc">{t(cat.desc, cat.descEn)}</span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`detail-${selectedCat.id}`}
              className="arch-detail"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {/* Detail header */}
              <div className="arch-detail__header">
                <button
                  className="arch-detail__back"
                  onClick={() => setSelected(null)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="10 2 4 8 10 14" />
                  </svg>
                  {t('返回', 'Back')}
                </button>
                <div className="arch-detail__titlerow">
                  <span className="arch-detail__dot" style={{ background: selectedCat.color }} />
                  <span className="arch-detail__name">{t(selectedCat.name, selectedCat.nameEn)}</span>
                </div>
                <p className="arch-detail__desc">{t(selectedCat.desc, selectedCat.descEn)}</p>
              </div>

              {/* Files list */}
              <div className="arch-detail__files">
                {selectedCat.files.map((file, i) => (
                  <motion.div
                    key={file.name}
                    className="arch-file"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    style={{ '--block-color': selectedCat.color } as React.CSSProperties}
                  >
                    <span className="arch-file__name">{file.name}</span>
                    <span className="arch-file__size">{file.size}</span>
                    <span className="arch-file__role">{t(file.role, file.roleEn)}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
