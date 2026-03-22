import { useState } from 'react';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

interface MemoryLayer {
  id: string;
  name: string;
  icon: string;
  color: string;
  zhDescription: string;
  enDescription: string;
  zhHowItWorks: string;
  enHowItWorks: string;
  zhWhatItStores: string;
  enWhatItStores: string;
  zhWhenItLoads: string;
  enWhenItLoads: string;
  zhExample: string;
  enExample: string;
}

const memoryLayersData: MemoryLayer[] = [
  {
    id: 'claude-md',
    name: 'CLAUDE.md',
    icon: '📄',
    color: '#3b82f6',
    zhDescription: '手动记忆——由用户编写的项目说明书',
    enDescription: 'Manual memory — a project guide written by the user',
    zhHowItWorks: '用户在项目根目录创建 CLAUDE.md 文件，写入项目约定、技术栈、编码风格等信息。Claude Code 每次启动时自动读取。',
    enHowItWorks: 'The user creates a CLAUDE.md file in the project root with project conventions, tech stack, coding style, etc. Claude Code auto-reads it on every startup.',
    zhWhatItStores: '项目结构、开发命令、编码规范、团队约定、常见陷阱',
    enWhatItStores: 'Project structure, dev commands, coding conventions, team agreements, common pitfalls',
    zhWhenItLoads: '每次对话开始时自动加载。支持三层覆盖：组织级 → 用户级 → 项目级',
    enWhenItLoads: 'Auto-loaded at the start of every conversation. Supports three-layer overrides: organization → user → project',
    zhExample: `# My Project\n## 技术栈\n- React + TypeScript\n- Tailwind CSS\n\n## 约定\n- 使用函数式组件\n- 组件放在 src/components/`,
    enExample: `# My Project\n## Tech Stack\n- React + TypeScript\n- Tailwind CSS\n\n## Conventions\n- Use functional components\n- Components go in src/components/`,
  },
  {
    id: 'auto-memory',
    name: 'Auto Memory',
    icon: '🧠',
    color: '#7c3aed',
    zhDescription: '自动记忆——AI 在工作中自动记录的笔记',
    enDescription: 'Automatic memory — notes the AI records while working',
    zhHowItWorks: 'AI 在工作过程中发现有价值的信息（如项目特殊配置、用户偏好），自动写入 ~/.claude/projects/ 下的 MEMORY.md 文件。',
    enHowItWorks: 'When the AI discovers valuable information (e.g., special project configs, user preferences), it automatically writes to a MEMORY.md file under ~/.claude/projects/.',
    zhWhatItStores: 'AI 发现的项目特点、用户偏好、debug 经验、工作流程',
    enWhatItStores: 'Project traits discovered by AI, user preferences, debug experience, workflows',
    zhWhenItLoads: '每次对话开始时自动加载前 200 行。按项目路径隔离。',
    enWhenItLoads: 'Auto-loads the first 200 lines at the start of every conversation. Isolated by project path.',
    zhExample: `# Memory\n- 用户偏好 tabs 而非 spaces\n- 项目使用 pnpm，不要用 npm\n- 测试框架是 vitest，不是 jest`,
    enExample: `# Memory\n- User prefers tabs over spaces\n- Project uses pnpm, not npm\n- Test framework is vitest, not jest`,
  },
];

export default function MemorySystem() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [viewedLayers, setViewedLayers] = useState<Set<string>>(new Set());

  const handleSelect = (layerId: string) => {
    setSelectedLayer(selectedLayer === layerId ? null : layerId);
    setViewedLayers((prev) => {
      const next = new Set(prev);
      next.add(layerId);
      if (next.size >= 2 && sceneComplete) {
        sceneComplete();
      }
      return next;
    });
  };

  const selected = memoryLayersData.find((l) => l.id === selectedLayer);

  return (
    <div className="memory-sys scene-dark-interactive" data-interactive>
      <div className="memory-sys__hint">{t('点击每一层，了解它如何帮助 AI 记忆', 'Click each layer to learn how it helps AI remember')}</div>

      <div className="memory-sys__layers">
        {memoryLayersData.map((layer) => {
          const isActive = selectedLayer === layer.id;
          const isViewed = viewedLayers.has(layer.id);
          return (
            <div
              key={layer.id}
              className={`memory-sys__layer ${isActive ? 'memory-sys__layer--active' : ''}`}
              style={{
                borderColor: isActive ? layer.color : isViewed ? layer.color + '60' : 'var(--color-border)',
                background: isActive ? `${layer.color}12` : 'var(--color-bg-secondary)',
                cursor: 'pointer',
              }}
              onClick={() => handleSelect(layer.id)}
            >
              <div className="memory-sys__layer-icon">{layer.icon}</div>
              <div className="memory-sys__layer-name" style={{ color: isActive ? layer.color : 'var(--color-text)' }}>
                {layer.name}
              </div>
              <div className="memory-sys__layer-desc">{t(layer.zhDescription, layer.enDescription)}</div>
              {isViewed && !isActive && (
                <div className="memory-sys__layer-check" style={{ color: layer.color }}>✓</div>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <div
          className="memory-sys__detail"
          style={{ borderColor: selected.color + '40' }}
        >
          <div className="memory-sys__detail-grid">
            <div className="memory-sys__detail-item">
              <div className="memory-sys__detail-label" style={{ color: selected.color }}>
                {t('工作原理', 'How it works')}
              </div>
              <div className="memory-sys__detail-text">{t(selected.zhHowItWorks, selected.enHowItWorks)}</div>
            </div>
            <div className="memory-sys__detail-item">
              <div className="memory-sys__detail-label" style={{ color: selected.color }}>
                {t('存储内容', 'What it stores')}
              </div>
              <div className="memory-sys__detail-text">{t(selected.zhWhatItStores, selected.enWhatItStores)}</div>
            </div>
            <div className="memory-sys__detail-item">
              <div className="memory-sys__detail-label" style={{ color: selected.color }}>
                {t('加载时机', 'When it loads')}
              </div>
              <div className="memory-sys__detail-text">{t(selected.zhWhenItLoads, selected.enWhenItLoads)}</div>
            </div>
          </div>

          <div className="memory-sys__example">
            <div className="memory-sys__example-label">{t('示例', 'Example')}</div>
            <pre className="memory-sys__example-code">{t(selected.zhExample, selected.enExample)}</pre>
          </div>
        </div>
      )}

      {viewedLayers.size > 0 && viewedLayers.size < 2 && (
        <div className="memory-sys__progress">
          {t(
            `已探索 ${viewedLayers.size}/2 层记忆系统`,
            `Explored ${viewedLayers.size}/2 memory layers`
          )}
        </div>
      )}
      {viewedLayers.size >= 2 && (
        <div className="memory-sys__progress memory-sys__progress--done">
          {t(
            '两层记忆系统——手动 + 自动，AI 不再是金鱼了。',
            'Two layers of memory — manual + automatic. AI is no longer a goldfish.'
          )}
        </div>
      )}
    </div>
  );
}
