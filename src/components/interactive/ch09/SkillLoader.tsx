import { useState } from 'react';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

type Phase = 'startup' | 'registry' | 'user-invoke' | 'auto-recall' | 'loaded';

interface SkillEntry {
  name: string;
  description: string;
  zhDescription: string;
  fullContent: string;
  zhFullContent: string;
}

const SKILLS: SkillEntry[] = [
  {
    name: 'commit',
    description: 'Create git commits with conventional format',
    zhDescription: '使用规范格式创建 git commit',
    fullContent: '# commit\n\n1. Run git status\n2. Analyze staged changes\n3. Generate conventional commit message\n4. Create commit',
    zhFullContent: '# commit\n\n1. 运行 git status\n2. 分析暂存的更改\n3. 生成规范化的 commit message\n4. 创建 commit',
  },
  {
    name: 'deploy',
    description: 'Deploy project to production environment',
    zhDescription: '将项目部署到生产环境',
    fullContent: '# deploy\n\n1. Run tests\n2. Build project\n3. Execute deploy script\n4. Verify health check',
    zhFullContent: '# deploy\n\n1. 运行测试\n2. 构建项目\n3. 执行部署脚本\n4. 验证健康检查',
  },
  {
    name: 'review-pr',
    description: 'Review pull request for code quality and issues',
    zhDescription: '审查 PR 的代码质量与问题',
    fullContent: '# review-pr\n\n1. Fetch PR diff\n2. Check code style\n3. Identify bugs & security issues\n4. Output structured report',
    zhFullContent: '# review-pr\n\n1. 获取 PR diff\n2. 检查代码风格\n3. 识别 bug 和安全问题\n4. 输出结构化报告',
  },
  {
    name: 'test-gen',
    description: 'Generate unit tests for specified functions',
    zhDescription: '为指定函数生成单元测试',
    fullContent: '# test-gen\n\n1. Read target function\n2. Analyze input/output types\n3. Generate test cases\n4. Write test file',
    zhFullContent: '# test-gen\n\n1. 读取目标函数\n2. 分析输入/输出类型\n3. 生成测试用例\n4. 编写测试文件',
  },
];

export default function SkillLoader() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();
  const [phase, setPhase] = useState<Phase>('startup');
  const [highlightedSkill, setHighlightedSkill] = useState<string | null>(null);
  const [loadedSkill, setLoadedSkill] = useState<SkillEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchedSkill, setMatchedSkill] = useState<SkillEntry | null>(null);
  const [completedPaths, setCompletedPaths] = useState<Set<string>>(new Set());
  const [showParticle, setShowParticle] = useState(false);

  const handleStartup = () => {
    setPhase('registry');
  };

  const handleUserInvoke = () => {
    setPhase('user-invoke');
    setHighlightedSkill('commit');
    setShowParticle(false);
    setTimeout(() => {
      setShowParticle(true);
    }, 900);
    setTimeout(() => {
      const skill = SKILLS.find(s => s.name === 'commit')!;
      setLoadedSkill(skill);
      setShowParticle(false);
      markComplete('user-invoke');
    }, 1500);
  };

  const handleAutoRecall = () => {
    setPhase('auto-recall');
    setSearchQuery(t('帮我把这些改动提交一下', 'Help me commit these changes'));
    setHighlightedSkill(null);
    setLoadedSkill(null);
    setShowParticle(false);

    // Simulate semantic matching
    setTimeout(() => {
      setMatchedSkill(SKILLS[0]); // commit
      setHighlightedSkill('commit');
    }, 800);

    setTimeout(() => {
      setShowParticle(true);
    }, 1700);

    setTimeout(() => {
      const skill = SKILLS.find(s => s.name === 'commit')!;
      setLoadedSkill(skill);
      setShowParticle(false);
      markComplete('auto-recall');
    }, 2300);
  };

  const handleReset = () => {
    setPhase('registry');
    setHighlightedSkill(null);
    setLoadedSkill(null);
    setSearchQuery('');
    setMatchedSkill(null);
    setShowParticle(false);
  };

  const markComplete = (path: string) => {
    setCompletedPaths(prev => {
      const next = new Set(prev);
      next.add(path);
      if (next.size >= 2 && sceneComplete) {
        sceneComplete();
      }
      return next;
    });
  };

  return (
    <div className="skill-loader scene-dark-interactive" data-interactive style={styles.root}>
      <style>{`
        @keyframes skill-loader-particle-fall {
          0% { top: 0; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .skill-loader-particle {
          animation: skill-loader-particle-fall 0.6s ease-in-out forwards;
        }
      `}</style>
      {/* Phase: Startup */}
      {phase === 'startup' && (
        <div style={styles.startupContainer}>
          <div style={styles.title}>{t('Skill 的加载机制', 'How Skills Are Loaded')}</div>
          <div style={styles.desc}>
            {t(
              'Claude Code 启动时，不会把所有 Skill 的完整内容加载到 context 中——那太浪费 token 了。',
              'When Claude Code starts, it doesn\'t load all Skill content into context — that would waste too many tokens.'
            )}
          </div>
          <div style={styles.desc}>
            {t(
              '它只读取每个 Skill 的 name 和 description，建立一个轻量索引。',
              'It only reads each Skill\'s name and description, building a lightweight index.'
            )}
          </div>
          <button style={styles.primaryBtn} onClick={handleStartup}>
            {t('模拟启动 →', 'Simulate Startup →')}
          </button>
        </div>
      )}

      {/* Phase: Registry */}
      {phase !== 'startup' && (
        <>
          {/* Skill Registry */}
          <div style={styles.section}>
            <div style={styles.sectionLabel}>
              <span style={styles.labelBadge}>REGISTRY</span>
              {t('Skill 索引（仅 name + description）', 'Skill Index (name + description only)')}
            </div>
            <div style={styles.registry}>
              {SKILLS.map(skill => {
                const isHighlighted = highlightedSkill === skill.name;
                const isFlowActive = phase === 'user-invoke' || phase === 'auto-recall';
                const isDimmed = isFlowActive && !isHighlighted;
                return (
                  <div
                    key={skill.name}
                    style={{
                      ...styles.registryItem,
                      ...(isHighlighted ? styles.registryItemHighlighted : {}),
                      ...(isDimmed ? { opacity: 0.35, cursor: 'default' } : {}),
                    }}
                  >
                    <span style={{
                      ...styles.skillName,
                      ...(isHighlighted ? { color: '#7c3aed' } : {}),
                    }}>
                      /{skill.name}
                    </span>
                    <span style={styles.skillDesc}>
                      {t(skill.zhDescription, skill.description)}
                    </span>
                    {isHighlighted && (
                      <span style={styles.matchBadge}>
                        {phase === 'user-invoke' ? t('精确匹配', 'EXACT') : t('语义匹配', 'SEMANTIC')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trigger Buttons */}
          {phase === 'registry' && (
            <div style={styles.triggerSection}>
              <div style={styles.sectionLabel}>
                {t('选择触发方式：', 'Choose a trigger method:')}
              </div>
              <div style={styles.triggerBtns}>
                <button
                  style={{
                    ...styles.triggerBtn,
                    borderColor: completedPaths.has('user-invoke') ? 'rgba(34,197,94,0.5)' : 'rgba(59,130,246,0.4)',
                    backgroundColor: completedPaths.has('user-invoke') ? 'rgba(34,197,94,0.08)' : 'rgba(59,130,246,0.08)',
                  }}
                  onClick={handleUserInvoke}
                >
                  <span style={styles.triggerIcon}>⌨️</span>
                  <span style={styles.triggerLabel}>
                    {t('手动调用', 'Manual Invoke')}
                  </span>
                  <span style={styles.triggerDesc}>
                    {t('用户输入 /commit', 'User types /commit')}
                  </span>
                  {completedPaths.has('user-invoke') && <span style={styles.checkMark}>✓</span>}
                </button>
                <button
                  style={{
                    ...styles.triggerBtn,
                    borderColor: completedPaths.has('auto-recall') ? 'rgba(34,197,94,0.5)' : 'rgba(124,58,237,0.4)',
                    backgroundColor: completedPaths.has('auto-recall') ? 'rgba(34,197,94,0.08)' : 'rgba(124,58,237,0.08)',
                  }}
                  onClick={handleAutoRecall}
                >
                  <span style={styles.triggerIcon}>🧠</span>
                  <span style={styles.triggerLabel}>
                    {t('自动召回', 'Auto Recall')}
                  </span>
                  <span style={styles.triggerDesc}>
                    {t('AI 语义匹配任务', 'AI semantic-matches task')}
                  </span>
                  {completedPaths.has('auto-recall') && <span style={styles.checkMark}>✓</span>}
                </button>
              </div>
            </div>
          )}

          {/* User Invoke Flow */}
          {phase === 'user-invoke' && (
            <div style={styles.flowSection}>
              <div style={styles.flowStep}>
                <div style={styles.flowStepBadge}>1</div>
                <div style={styles.flowStepContent}>
                  <div style={styles.flowStepTitle}>{t('用户输入', 'User Input')}</div>
                  <div style={styles.codeBlock}>
                    <span style={{ color: '#888' }}>{'> '}</span>
                    <span style={{ color: '#3b82f6' }}>/commit</span>
                  </div>
                </div>
              </div>
              <div style={styles.flowArrow}>↓</div>
              <div style={styles.flowStep}>
                <div style={styles.flowStepBadge}>2</div>
                <div style={styles.flowStepContent}>
                  <div style={styles.flowStepTitle}>{t('精确匹配 name', 'Exact match on name')}</div>
                  <div style={styles.flowStepDesc}>
                    {t(
                      '在 Registry 中查找 name === "commit" 的 Skill',
                      'Find Skill with name === "commit" in Registry'
                    )}
                  </div>
                </div>
              </div>
              <div style={styles.flowArrow}>↓</div>
              <div style={styles.flowStep}>
                <div style={{ ...styles.flowStepBadge, backgroundColor: '#7c3aed' }}>3</div>
                <div style={styles.flowStepContent}>
                  <div style={styles.flowStepTitle}>
                    <span style={{ color: '#7c3aed' }}>ToolSearch</span>
                    {t(' 加载完整内容', ' loads full content')}
                  </div>
                  <div style={styles.flowStepDesc}>
                    {t(
                      '调用 ToolSearch 读取 SKILL.md 的完整 Markdown 内容，注入到 context',
                      'Calls ToolSearch to read the complete SKILL.md Markdown content, injecting into context'
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto Recall Flow */}
          {phase === 'auto-recall' && (
            <div style={styles.flowSection}>
              <div style={styles.flowStep}>
                <div style={styles.flowStepBadge}>1</div>
                <div style={styles.flowStepContent}>
                  <div style={styles.flowStepTitle}>{t('用户的自然语言请求', 'User\'s natural language request')}</div>
                  <div style={styles.codeBlock}>
                    <span style={{ color: '#888' }}>{'> '}</span>
                    <span style={{ color: '#e5e5e5' }}>{searchQuery}</span>
                  </div>
                </div>
              </div>
              <div style={styles.flowArrow}>↓</div>
              <div style={styles.flowStep}>
                <div style={styles.flowStepBadge}>2</div>
                <div style={styles.flowStepContent}>
                  <div style={styles.flowStepTitle}>{t('语义匹配 description', 'Semantic match on description')}</div>
                  <div style={styles.flowStepDesc}>
                    {matchedSkill ? (
                      <>
                        {t('"提交改动" ≈ "', '"commit changes" ≈ "')}
                        <span style={{ color: '#7c3aed' }}>{t(matchedSkill.zhDescription, matchedSkill.description)}</span>
                        {'" ✓'}
                      </>
                    ) : (
                      <span style={styles.scanning}>{t('正在匹配...', 'Matching...')}</span>
                    )}
                  </div>
                </div>
              </div>
              {matchedSkill && (
                <>
                  <div style={styles.flowArrow}>↓</div>
                  <div style={styles.flowStep}>
                    <div style={{ ...styles.flowStepBadge, backgroundColor: '#7c3aed' }}>3</div>
                    <div style={styles.flowStepContent}>
                      <div style={styles.flowStepTitle}>
                        <span style={{ color: '#7c3aed' }}>ToolSearch</span>
                        {t(' 自动加载', ' auto-loads')}
                      </div>
                      <div style={styles.flowStepDesc}>
                        {t(
                          'AI 判断 /commit 与当前任务匹配，自动通过 ToolSearch 加载完整内容',
                          'AI determines /commit matches the task, auto-loads full content via ToolSearch'
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Data flow particle animation */}
          {showParticle && (
            <div style={styles.particleTrack}>
              <div className="skill-loader-particle" style={styles.particle} />
            </div>
          )}

          {/* Loaded Content Preview */}
          {loadedSkill && (
            <div style={styles.loadedSection}>
              <div style={styles.sectionLabel}>
                <span style={{ ...styles.labelBadge, backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>LOADED</span>
                {t('完整内容已注入 Context', 'Full content injected into Context')}
              </div>
              <pre style={styles.loadedContent}>
                {t(loadedSkill.zhFullContent, loadedSkill.fullContent)}
              </pre>
              <button style={styles.resetBtn} onClick={handleReset}>
                {t('← 返回，试试另一种方式', '← Back, try the other method')}
              </button>
            </div>
          )}

          {/* Progress */}
          {completedPaths.size > 0 && completedPaths.size < 2 && phase === 'registry' && (
            <div style={styles.progress}>
              {t(
                `已体验 ${completedPaths.size}/2 种触发方式`,
                `Explored ${completedPaths.size}/2 trigger methods`
              )}
            </div>
          )}
          {completedPaths.size >= 2 && phase === 'registry' && (
            <div style={{ ...styles.progress, color: '#4ade80' }}>
              {t(
                '延迟加载 + 语义召回——用最少的 token 获得最需要的能力。',
                'Deferred loading + semantic recall — minimal tokens, maximum capability.'
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: 'var(--font-mono, "SF Mono", "Fira Code", monospace)',
    fontSize: '13px',
    backgroundColor: 'var(--color-bg-secondary, #1a1a2e)',
    border: '1px solid var(--color-border, #333)',
    borderRadius: '12px',
    padding: '20px',
    maxWidth: '680px',
    margin: '0 auto',
  },
  startupContainer: {
    textAlign: 'center' as const,
    padding: '16px 0',
  },
  title: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--color-text, #e5e5e5)',
    marginBottom: '12px',
  },
  desc: {
    color: 'var(--color-text-muted, #888)',
    marginBottom: '8px',
    lineHeight: '1.6',
  },
  primaryBtn: {
    marginTop: '16px',
    padding: '10px 28px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#7c3aed',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: 'var(--font-mono, monospace)',
    cursor: 'pointer',
    transition: 'transform 0.15s',
  },
  section: {
    marginBottom: '16px',
  },
  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-text-muted, #888)',
    marginBottom: '8px',
  },
  labelBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    color: '#a78bfa',
  },
  registry: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  registryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    transition: 'all 0.3s ease',
  },
  registryItemHighlighted: {
    borderColor: 'rgba(124, 58, 237, 0.5)',
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    boxShadow: '0 0 12px rgba(124, 58, 237, 0.15)',
  },
  skillName: {
    flexShrink: 0,
    fontWeight: 700,
    fontSize: '13px',
    color: 'var(--color-text, #e5e5e5)',
    minWidth: '100px',
  },
  skillDesc: {
    flex: 1,
    fontSize: '12px',
    color: 'var(--color-text-muted, #888)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  matchBadge: {
    flexShrink: 0,
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    color: '#a78bfa',
    letterSpacing: '0.05em',
  },
  triggerSection: {
    marginBottom: '12px',
  },
  triggerBtns: {
    display: 'flex',
    gap: '10px',
  },
  triggerBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    padding: '14px 12px',
    borderRadius: '10px',
    border: '1px solid',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono, monospace)',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
  },
  triggerIcon: {
    fontSize: '20px',
  },
  triggerLabel: {
    fontWeight: 700,
    fontSize: '13px',
    color: 'var(--color-text, #e5e5e5)',
  },
  triggerDesc: {
    fontSize: '11px',
    color: 'var(--color-text-muted, #888)',
  },
  checkMark: {
    position: 'absolute' as const,
    top: '8px',
    right: '10px',
    color: '#4ade80',
    fontWeight: 700,
    fontSize: '14px',
  },
  flowSection: {
    marginBottom: '16px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  flowStep: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  flowStepBadge: {
    flexShrink: 0,
    width: '24px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
  },
  flowStepContent: {
    flex: 1,
  },
  flowStepTitle: {
    fontWeight: 700,
    fontSize: '13px',
    color: 'var(--color-text, #e5e5e5)',
    marginBottom: '4px',
  },
  flowStepDesc: {
    fontSize: '12px',
    color: 'var(--color-text-muted, #888)',
    lineHeight: '1.5',
  },
  flowArrow: {
    textAlign: 'center' as const,
    color: 'var(--color-text-muted, #666)',
    fontSize: '14px',
    padding: '4px 0',
    paddingLeft: '6px',
  },
  codeBlock: {
    padding: '6px 10px',
    borderRadius: '6px',
    backgroundColor: 'rgba(0,0,0,0.3)',
    fontSize: '13px',
    fontFamily: 'var(--font-mono, monospace)',
    marginTop: '4px',
  },
  scanning: {
    color: '#fbbf24',
    fontStyle: 'italic',
  },
  loadedSection: {
    marginTop: '8px',
  },
  loadedContent: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    color: '#4ade80',
    fontSize: '12px',
    lineHeight: '1.6',
    margin: '8px 0',
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'var(--font-mono, monospace)',
  },
  resetBtn: {
    padding: '6px 16px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.15)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-muted, #888)',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'var(--font-mono, monospace)',
    cursor: 'pointer',
  },
  particleTrack: {
    position: 'relative' as const,
    height: '28px',
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute' as const,
    top: 0,
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#7c3aed',
    boxShadow: '0 0 8px 2px rgba(124, 58, 237, 0.6)',
  },
  progress: {
    marginTop: '12px',
    textAlign: 'center' as const,
    fontSize: '13px',
    color: 'var(--color-text-muted, #888)',
    fontWeight: 600,
  },
};
