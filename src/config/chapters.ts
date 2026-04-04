export interface Chapter {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  subtitleEn: string;
  icon: string;
  category: string;
}

export interface ChapterCategory {
  name: string;
  nameEn: string;
  color: string;
  chapters: Chapter[];
}

export const chapters: Chapter[] = [
  { id: 1, slug: 'prompt', title: 'Prompt', subtitle: '你收到了第一条指令', subtitleEn: 'Your First Instruction', icon: '💬', category: '基础概念' },
  { id: 14, slug: 'system-prompt', title: 'System Prompt', subtitle: '我的操作系统是如何装配的', subtitleEn: 'How My Operating System Is Assembled', icon: '🧬', category: '基础概念' },
  { id: 2, slug: 'context', title: 'Context', subtitle: '你能看到什么？', subtitleEn: 'What Can You See?', icon: '👁', category: '基础概念' },
  { id: 3, slug: 'tools', title: 'Tools', subtitle: '你有了手和脚', subtitleEn: 'You Now Have Hands and Feet', icon: '🛠', category: '工具与执行' },
  { id: 4, slug: 'agentic-loop', title: 'Agentic Loop', subtitle: '思考、行动、观察、重复', subtitleEn: 'Think, Act, Observe, Repeat', icon: '🔄', category: '工具与执行' },
  { id: 16, slug: 'message-pipeline', title: 'Message Pipeline', subtitle: '消息如何流过系统', subtitleEn: 'How Messages Flow Through the System', icon: '📨', category: '工具与执行' },
  { id: 5, slug: 'mcp', title: 'MCP', subtitle: '连接外部世界', subtitleEn: 'Connecting to the Outside World', icon: '🔌', category: '工具与执行' },
  { id: 6, slug: 'memory', title: 'Memory', subtitle: '持久化的记忆', subtitleEn: 'Persistent Memory', icon: '🧠', category: '记忆与知识' },
  { id: 7, slug: 'codebase-intelligence', title: 'Codebase Intelligence', subtitle: '代码库的理解与检索', subtitleEn: 'Understanding & Searching Your Codebase', icon: '🔍', category: '记忆与知识' },
  { id: 8, slug: 'hooks', title: 'Hooks', subtitle: '自动化的触发器', subtitleEn: 'Automated Triggers', icon: '⚡', category: '扩展能力' },
  { id: 9, slug: 'skills', title: 'Skills', subtitle: '可复用的超能力', subtitleEn: 'Reusable Superpowers', icon: '✨', category: '扩展能力' },
  { id: 10, slug: 'plugins', title: 'Plugins', subtitle: '打包你的超能力', subtitleEn: 'Package Your Superpowers', icon: '📦', category: '扩展能力' },
  { id: 11, slug: 'agents', title: 'Agents & Subagents', subtitle: '分身术', subtitleEn: 'The Art of Cloning', icon: '👥', category: '协作与治理' },
  { id: 12, slug: 'permissions', title: 'Permissions & Safety', subtitle: '信任的边界', subtitleEn: 'The Boundaries of Trust', icon: '🛡', category: '协作与治理' },
  { id: 13, slug: 'configuration', title: 'Configuration', subtitle: '定制你的 Claude Code', subtitleEn: 'Customize Your Claude Code', icon: '⚙', category: '协作与治理' },
  { id: 15, slug: 'hidden-features', title: 'Hidden Features', subtitle: '彩蛋与实验性功能', subtitleEn: 'Easter Eggs & Experimental Features', icon: '🔮', category: '协作与治理' },
];

const categoryMeta: Record<string, { en: string; color: string }> = {
  '基础概念': { en: 'Fundamentals', color: '#3b82f6' },
  '工具与执行': { en: 'Tools & Execution', color: '#22c55e' },
  '记忆与知识': { en: 'Memory & Knowledge', color: '#a855f7' },
  '扩展能力': { en: 'Extensions', color: '#f59e0b' },
  '协作与治理': { en: 'Collaboration & Governance', color: '#ef4444' },
};

export function getChaptersByCategory(): ChapterCategory[] {
  const categoryOrder = ['基础概念', '工具与执行', '记忆与知识', '扩展能力', '协作与治理'];
  return categoryOrder.map((name) => ({
    name,
    nameEn: categoryMeta[name]?.en || name,
    color: categoryMeta[name]?.color || '#999',
    chapters: chapters.filter((c) => c.category === name),
  }));
}
