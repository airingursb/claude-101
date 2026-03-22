import { useState } from 'react';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

interface SearchTool {
  id: string;
  name: string;
  icon: string;
  color: string;
  zhDescription: string;
  enDescription: string;
  zhQuery: string;
  enQuery: string;
  zhResults: string[];
  enResults: string[];
  zhExplanation: string;
  enExplanation: string;
}

const searchToolsData: SearchTool[] = [
  {
    id: 'glob',
    name: 'Glob',
    icon: '📁',
    color: '#f59e0b',
    zhDescription: '按文件名模式查找文件',
    enDescription: 'Find files by name pattern',
    zhQuery: 'Glob("**/UserService*.ts")',
    enQuery: 'Glob("**/UserService*.ts")',
    zhResults: [
      'src/services/UserService.ts',
      'src/services/UserServiceImpl.ts',
      'src/__tests__/UserService.test.ts',
    ],
    enResults: [
      'src/services/UserService.ts',
      'src/services/UserServiceImpl.ts',
      'src/__tests__/UserService.test.ts',
    ],
    zhExplanation: '不读文件内容，只看文件名。速度极快，适合定位文件位置。',
    enExplanation: 'Doesn\'t read file contents, only matches file names. Extremely fast, ideal for locating files.',
  },
  {
    id: 'grep',
    name: 'Grep',
    icon: '🔎',
    color: '#3b82f6',
    zhDescription: '在代码内容中搜索关键词',
    enDescription: 'Search for keywords in code content',
    zhQuery: 'Grep("deleteUser|removeUser")',
    enQuery: 'Grep("deleteUser|removeUser")',
    zhResults: [
      'src/services/UserService.ts:45  async deleteUser(id: string)',
      'src/routes/admin.ts:88  router.delete("/user/:id", ...)',
      'src/repositories/UserRepo.ts:32  removeUser(id: string)',
    ],
    enResults: [
      'src/services/UserService.ts:45  async deleteUser(id: string)',
      'src/routes/admin.ts:88  router.delete("/user/:id", ...)',
      'src/repositories/UserRepo.ts:32  removeUser(id: string)',
    ],
    zhExplanation: '搜索文件内容，支持正则表达式。找到相关代码的精确位置和上下文。',
    enExplanation: 'Searches file contents with regex support. Finds the exact location and context of relevant code.',
  },
  {
    id: 'read',
    name: 'Read',
    icon: '📖',
    color: '#10b981',
    zhDescription: '读取特定文件的完整内容',
    enDescription: 'Read the full content of a specific file',
    zhQuery: 'Read("src/services/UserService.ts")',
    enQuery: 'Read("src/services/UserService.ts")',
    zhResults: [
      'export class UserService {',
      '  constructor(private repo: UserRepo) {}',
      '  async getUser(id: string) { ... }',
      '  async createUser(data: CreateUserDto) { ... }',
      '  // TODO: add deleteUser method',
      '}',
    ],
    enResults: [
      'export class UserService {',
      '  constructor(private repo: UserRepo) {}',
      '  async getUser(id: string) { ... }',
      '  async createUser(data: CreateUserDto) { ... }',
      '  // TODO: add deleteUser method',
      '}',
    ],
    zhExplanation: '精确读取一个文件，获取完整代码。在知道目标文件后使用，深入理解实现细节。',
    enExplanation: 'Reads a specific file to get the full code. Used after identifying the target file, for deep understanding of implementation details.',
  },
];

export default function CodeSearch() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [exploredTools, setExploredTools] = useState<Set<string>>(new Set());
  const [animatingResults, setAnimatingResults] = useState(false);

  const handleSelect = (toolId: string) => {
    setSelectedTool(selectedTool === toolId ? null : toolId);
    setAnimatingResults(true);
    setTimeout(() => setAnimatingResults(false), 300);

    setExploredTools((prev) => {
      const next = new Set(prev);
      next.add(toolId);
      if (next.size >= 3 && sceneComplete) {
        sceneComplete();
      }
      return next;
    });
  };

  const selected = searchToolsData.find((tool) => tool.id === selectedTool);

  return (
    <div className="code-search scene-dark-interactive" data-interactive>
      <div className="code-search__hint">
        {t('点击每个搜索工具，看看它是怎么工作的', 'Click each search tool to see how it works')}
      </div>

      <div className="code-search__tools">
        {searchToolsData.map((tool) => {
          const isActive = selectedTool === tool.id;
          const isExplored = exploredTools.has(tool.id);
          return (
            <div
              key={tool.id}
              className={`code-search__tool ${isActive ? 'code-search__tool--active' : ''}`}
              style={{
                borderColor: isActive ? tool.color : isExplored ? tool.color + '60' : 'var(--color-border)',
                background: isActive ? `${tool.color}12` : 'var(--color-bg-secondary)',
                cursor: 'pointer',
              }}
              onClick={() => handleSelect(tool.id)}
            >
              <div className="code-search__tool-icon">{tool.icon}</div>
              <div className="code-search__tool-name" style={{ color: isActive ? tool.color : 'var(--color-text)' }}>
                {tool.name}
              </div>
              <div className="code-search__tool-desc">{t(tool.zhDescription, tool.enDescription)}</div>
              {isExplored && !isActive && (
                <div className="code-search__tool-check" style={{ color: tool.color }}>✓</div>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <div
          className="code-search__detail"
          style={{ borderColor: selected.color + '40' }}
        >
          <div className="code-search__query">
            <div className="code-search__query-label" style={{ color: selected.color }}>
              {t('查询', 'Query')}
            </div>
            <code className="code-search__query-code">{t(selected.zhQuery, selected.enQuery)}</code>
          </div>

          <div className="code-search__results">
            <div className="code-search__results-label" style={{ color: selected.color }}>
              {t('结果', 'Results')}
            </div>
            <div className={`code-search__results-list ${animatingResults ? 'code-search__results-list--animating' : ''}`}>
              {(t(selected.zhResults, selected.enResults) as string[]).map((result, i) => (
                <div
                  key={i}
                  className="code-search__result-line"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="code-search__result-prefix">{'>'}</span>
                  <code>{result}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="code-search__explanation">
            {t(selected.zhExplanation, selected.enExplanation)}
          </div>
        </div>
      )}

      {exploredTools.size > 0 && exploredTools.size < 3 && (
        <div className="code-search__progress">
          {t(
            `已探索 ${exploredTools.size}/3 个搜索工具`,
            `Explored ${exploredTools.size}/3 search tools`
          )}
        </div>
      )}
      {exploredTools.size >= 3 && (
        <div className="code-search__progress code-search__progress--done">
          {t(
            'Glob 定位文件，Grep 搜索内容，Read 深入代码——三步精准定位，不浪费一点 context。',
            'Glob locates files, Grep searches content, Read dives into code — three steps to pinpoint, wasting no context.'
          )}
        </div>
      )}
    </div>
  );
}
