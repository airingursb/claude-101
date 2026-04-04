import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

type ToolStatus = 'available' | 'feature-flag' | 'unreleased' | 'internal';

interface ToolDef {
  name: string;
  desc: string;
  source: string;
  status: ToolStatus;
  flagName?: string;
  props?: string[];
}

interface Category {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  tools: ToolDef[];
}

const CATEGORIES: Category[] = [
  {
    id: 'file',
    label: '文件操作',
    labelEn: 'File Ops',
    icon: '📁',
    tools: [
      { name: 'Read', desc: '读取文件内容', source: 'src/tools/FileReadTool/', status: 'available' },
      { name: 'Write', desc: '创建或重写文件', source: 'src/tools/FileWriteTool/', status: 'available' },
      { name: 'Edit', desc: '精确编辑文件', source: 'src/tools/FileEditTool/', status: 'available' },
      { name: 'Bash', desc: '执行 shell 命令', source: 'src/tools/BashTool/', status: 'available' },
      { name: 'NotebookEdit', desc: '编辑 Jupyter Notebook', source: 'src/tools/NotebookEditTool/', status: 'available' },
    ],
  },
  {
    id: 'search',
    label: '搜索',
    labelEn: 'Search',
    icon: '🔍',
    tools: [
      { name: 'Glob', desc: '按模式查找文件', source: 'src/tools/GlobTool/', status: 'available' },
      { name: 'Grep', desc: '搜索文件内容', source: 'src/tools/GrepTool/', status: 'available' },
      { name: 'ToolSearch', desc: '搜索延迟加载的工具', source: 'src/tools/ToolSearchTool/', status: 'available', props: ['shouldDefer'] },
    ],
  },
  {
    id: 'web',
    label: '网络',
    labelEn: 'Web',
    icon: '🌐',
    tools: [
      { name: 'WebFetch', desc: '获取 URL 内容', source: 'src/tools/WebFetchTool/', status: 'available' },
      { name: 'WebSearch', desc: '搜索网络', source: 'src/tools/WebSearchTool/', status: 'available' },
    ],
  },
  {
    id: 'agents',
    label: '智能体',
    labelEn: 'Agents',
    icon: '🤖',
    tools: [
      { name: 'Agent', desc: '生成子智能体', source: 'src/tools/AgentTool/ (233KB)', status: 'available' },
      { name: 'Skill', desc: '调用斜杠命令', source: 'src/tools/SkillTool/', status: 'available' },
      { name: 'AskUserQuestion', desc: '向用户提问', source: 'src/tools/AskUserQuestionTool/', status: 'available' },
      { name: 'TaskCreate', desc: '创建任务', source: 'src/tools/TaskCreateTool/', status: 'feature-flag', flagName: 'Feature flag' },
      { name: 'TaskUpdate', desc: '更新任务', source: 'src/tools/TaskUpdateTool/', status: 'feature-flag', flagName: 'Feature flag' },
      { name: 'TaskList', desc: '列出任务', source: 'src/tools/TaskListTool/', status: 'feature-flag', flagName: 'Feature flag' },
      { name: 'TaskGet', desc: '获取任务', source: 'src/tools/TaskGetTool/', status: 'feature-flag', flagName: 'Feature flag' },
      { name: 'TaskOutput', desc: '读取任务输出', source: 'src/tools/TaskOutputTool/', status: 'available' },
    ],
  },
  {
    id: 'planning',
    label: '规划',
    labelEn: 'Planning',
    icon: '📋',
    tools: [
      { name: 'TodoWrite', desc: '管理待办清单', source: 'src/tools/TodoWriteTool/', status: 'available' },
      { name: 'EnterPlanMode', desc: '进入规划模式', source: 'src/tools/EnterPlanModeTool/', status: 'available' },
      { name: 'ExitPlanMode', desc: '退出规划模式', source: 'src/tools/ExitPlanModeTool/', status: 'available' },
    ],
  },
  {
    id: 'mcp',
    label: 'MCP',
    labelEn: 'MCP',
    icon: '🔌',
    tools: [
      { name: 'ListMcpResources', desc: '列出 MCP 资源', source: 'src/tools/ListMcpResourcesTool/', status: 'available' },
      { name: 'ReadMcpResource', desc: '读取 MCP 资源', source: 'src/tools/ReadMcpResourceTool/', status: 'available', props: ['shouldDefer'] },
    ],
  },
  {
    id: 'system',
    label: '系统',
    labelEn: 'System',
    icon: '⚙️',
    tools: [
      { name: 'EnterWorktree', desc: '创建 Git Worktree', source: 'src/tools/EnterWorktreeTool/', status: 'feature-flag', flagName: 'Feature flag' },
      { name: 'ExitWorktree', desc: '退出 Worktree', source: 'src/tools/ExitWorktreeTool/', status: 'feature-flag', flagName: 'Feature flag' },
      { name: 'SendUserMessage', desc: '发送消息给用户', source: 'src/tools/BriefTool/', status: 'available' },
      { name: 'Config', desc: '获取/设置配置', source: 'src/tools/ConfigTool/', status: 'internal', flagName: 'Internal' },
      { name: 'TaskStop', desc: '停止后台任务', source: 'src/tools/TaskStopTool/', status: 'available' },
    ],
  },
  {
    id: 'experimental',
    label: '实验性',
    labelEn: 'Experimental',
    icon: '🧪',
    tools: [
      { name: 'WebBrowser', desc: '网页浏览器', source: '', status: 'unreleased', flagName: 'WEB_BROWSER_TOOL' },
      { name: 'REPL', desc: 'REPL 环境', source: '', status: 'unreleased', flagName: 'Internal only' },
      { name: 'CronCreate', desc: '创建定时任务', source: '', status: 'unreleased', flagName: 'AGENT_TRIGGERS' },
      { name: 'CronDelete', desc: '删除定时任务', source: '', status: 'unreleased', flagName: 'AGENT_TRIGGERS' },
      { name: 'CronList', desc: '列出定时任务', source: '', status: 'unreleased', flagName: 'AGENT_TRIGGERS' },
      { name: 'RemoteTrigger', desc: '远程触发器', source: '', status: 'unreleased', flagName: 'AGENT_TRIGGERS_REMOTE' },
      { name: 'Monitor', desc: '监控工具', source: '', status: 'unreleased', flagName: 'MONITOR_TOOL' },
      { name: 'LSP', desc: '语言服务器', source: '', status: 'unreleased', flagName: 'ENABLE_LSP_TOOL' },
      { name: 'TeamCreate', desc: '创建团队', source: '', status: 'unreleased', flagName: 'Swarm' },
      { name: 'TeamDelete', desc: '删除团队', source: '', status: 'unreleased', flagName: 'Swarm' },
      { name: 'Snip', desc: '消息裁剪', source: '', status: 'unreleased', flagName: 'HISTORY_SNIP' },
    ],
  },
];

const ALL_TOOLS = CATEGORIES.flatMap((c) => c.tools);
const TOTAL_COUNT = ALL_TOOLS.length;

function statusBadge(status: ToolStatus, t: (zh: string, en: string) => string) {
  switch (status) {
    case 'available':
      return <span className="tool-catalog__badge tool-catalog__badge--available">{t('可用', 'Available')}</span>;
    case 'feature-flag':
      return <span className="tool-catalog__badge tool-catalog__badge--flag">{t('功能开关', 'Feature Flag')}</span>;
    case 'unreleased':
      return <span className="tool-catalog__badge tool-catalog__badge--unreleased">{t('未发布', 'Unreleased')}</span>;
    case 'internal':
      return <span className="tool-catalog__badge tool-catalog__badge--internal">{t('内部', 'Internal')}</span>;
  }
}

export default function ToolCatalog() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  const displayTools =
    activeCategory === 'all'
      ? ALL_TOOLS
      : CATEGORIES.find((c) => c.id === activeCategory)?.tools ?? [];

  useEffect(() => {
    if (!hasCompleted && expandedTool) {
      setHasCompleted(true);
      sceneComplete?.();
    }
  }, [expandedTool, hasCompleted, sceneComplete]);

  return (
    <div className="tool-catalog">
      {/* Category tabs */}
      <div className="tool-catalog__tabs">
        <button
          className={`tool-catalog__tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => { setActiveCategory('all'); setExpandedTool(null); }}
        >
          {t('全部', 'All')}
          <span className="tool-catalog__tab-count">{TOTAL_COUNT}</span>
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`tool-catalog__tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => { setActiveCategory(cat.id); setExpandedTool(null); }}
          >
            <span className="tool-catalog__tab-icon">{cat.icon}</span>
            {t(cat.label, cat.labelEn)}
            <span className="tool-catalog__tab-count">{cat.tools.length}</span>
          </button>
        ))}
      </div>

      {/* Tool list */}
      <motion.div
        className="tool-catalog__list"
        key={activeCategory}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <AnimatePresence mode="sync">
          {displayTools.map((tool) => {
            const isExpanded = expandedTool === tool.name;
            return (
              <motion.div
                key={tool.name}
                className={`tool-catalog__item ${isExpanded ? 'expanded' : ''}`}
                layout
                onClick={() => setExpandedTool(isExpanded ? null : tool.name)}
              >
                <div className="tool-catalog__item-row">
                  <span className="tool-catalog__item-name">{tool.name}</span>
                  <span className="tool-catalog__item-desc">{tool.desc}</span>
                  <span className="tool-catalog__item-spacer" />
                  {statusBadge(tool.status, t)}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="tool-catalog__detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {tool.source && (
                        <div className="tool-catalog__detail-row">
                          <span className="tool-catalog__detail-label">{t('源码', 'Source')}</span>
                          <code className="tool-catalog__detail-value">{tool.source}</code>
                        </div>
                      )}
                      {tool.flagName && (
                        <div className="tool-catalog__detail-row">
                          <span className="tool-catalog__detail-label">{t('开关', 'Flag')}</span>
                          <code className="tool-catalog__detail-value">{tool.flagName}</code>
                        </div>
                      )}
                      {tool.props && tool.props.length > 0 && (
                        <div className="tool-catalog__detail-row">
                          <span className="tool-catalog__detail-label">{t('属性', 'Properties')}</span>
                          <span className="tool-catalog__detail-value">
                            {tool.props.map((p) => (
                              <code key={p} className="tool-catalog__prop-tag">{p}</code>
                            ))}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <div className="tool-catalog__footer">
        {t(
          `${TOTAL_COUNT} 个工具注册于 src/tools.ts`,
          `${TOTAL_COUNT} tools registered in src/tools.ts`
        )}
      </div>
    </div>
  );
}
