import { useState } from 'react';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

type ViewMode = 'isolation' | 'topology';

export default function SubagentIsolation() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();
  const [mode, setMode] = useState<ViewMode>('isolation');
  const [isolationStep, setIsolationStep] = useState(0);
  const [topologyView, setTopologyView] = useState<'star' | 'mesh' | null>(null);
  const [viewedModes, setViewedModes] = useState<Set<string>>(new Set());

  const markViewed = (key: string) => {
    setViewedModes(prev => {
      const next = new Set(prev);
      next.add(key);
      if (next.size >= 2 && sceneComplete) sceneComplete();
      return next;
    });
  };

  const handleIsolationAnimate = () => {
    setIsolationStep(1);
    setTimeout(() => setIsolationStep(2), 1000);
    setTimeout(() => setIsolationStep(3), 2000);
    setTimeout(() => {
      setIsolationStep(4);
      markViewed('isolation');
    }, 3000);
  };

  const handleTopologySelect = (view: 'star' | 'mesh') => {
    setTopologyView(view);
    if (view === 'mesh') markViewed('topology');
  };

  return (
    <div className="subagent-iso scene-dark-interactive" data-interactive style={styles.root}>
      {/* Tab Switch */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(mode === 'isolation' ? styles.tabActive : {}),
          }}
          onClick={() => setMode('isolation')}
        >
          {t('🔒 Context 隔离', '🔒 Context Isolation')}
          {viewedModes.has('isolation') && <span style={styles.tabCheck}> ✓</span>}
        </button>
        <button
          style={{
            ...styles.tab,
            ...(mode === 'topology' ? styles.tabActive : {}),
          }}
          onClick={() => setMode('topology')}
        >
          {t('🌐 拓扑结构对比', '🌐 Topology Comparison')}
          {viewedModes.has('topology') && <span style={styles.tabCheck}> ✓</span>}
        </button>
      </div>

      {/* Context Isolation View */}
      {mode === 'isolation' && (
        <div style={styles.panel}>
          <div style={styles.panelTitle}>
            {t('单向通信模型', 'One-Way Communication Model')}
          </div>
          <div style={styles.panelDesc}>
            {t(
              '子智能体与主智能体之间是严格的单向通信：prompt 进，result 出。没有双向对话，没有共享状态。',
              'Subagents communicate with the main agent via strict one-way flow: prompt in, result out. No bidirectional dialogue, no shared state.'
            )}
          </div>

          {/* Isolation Diagram */}
          <div style={styles.diagram}>
            {/* Main Agent */}
            <div style={styles.mainAgent}>
              <div style={styles.agentBox}>
                <div style={styles.agentIcon}>🧠</div>
                <div style={styles.agentLabel}>{t('主 Agent', 'Main Agent')}</div>
                <div style={styles.agentContext}>
                  <div style={styles.contextLabel}>Context</div>
                  <div style={styles.contextItems}>
                    <span style={styles.contextItem}>{t('完整对话历史', 'Full chat history')}</span>
                    <span style={styles.contextItem}>{t('所有工具权限', 'All tool access')}</span>
                    <span style={styles.contextItem}>{t('全局状态', 'Global state')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow Section */}
            <div style={styles.arrowSection}>
              <div style={styles.arrowDown}>
                <div style={{
                  ...styles.arrowLine,
                  backgroundColor: isolationStep >= 1 ? '#3b82f6' : 'rgba(255,255,255,0.15)',
                  transition: 'background-color 0.5s ease',
                }} />
                <div style={{
                  ...styles.arrowLabel,
                  color: isolationStep >= 1 ? '#3b82f6' : 'rgba(255,255,255,0.3)',
                }}>
                  {t('Prompt（唯一输入）', 'Prompt (only input)')}
                </div>
              </div>
              <div style={styles.arrowUp}>
                <div style={{
                  ...styles.arrowLine,
                  backgroundColor: isolationStep >= 3 ? '#22c55e' : 'rgba(255,255,255,0.15)',
                  transition: 'background-color 0.5s ease',
                }} />
                <div style={{
                  ...styles.arrowLabel,
                  color: isolationStep >= 3 ? '#22c55e' : 'rgba(255,255,255,0.3)',
                }}>
                  {t('Result（唯一输出）', 'Result (only output)')}
                </div>
              </div>
            </div>

            {/* Subagents */}
            <div style={styles.subagents}>
              <div style={{
                ...styles.subagentBox,
                borderColor: isolationStep >= 2 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255,255,255,0.1)',
                backgroundColor: isolationStep >= 2 ? 'rgba(59, 130, 246, 0.06)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.5s ease',
              }}>
                <div style={styles.subagentLabel}>{t('子 Agent A', 'Subagent A')}</div>
                <div style={styles.subagentContext}>
                  <span style={styles.subContextItem}>{t('独立 Context', 'Own Context')}</span>
                  <span style={styles.subContextItem}>{t('限定工具', 'Limited Tools')}</span>
                </div>
                {isolationStep >= 2 && (
                  <div style={styles.workingIndicator}>
                    {isolationStep < 3 ?
                      t('⚙️ 处理中...', '⚙️ Processing...') :
                      t('✅ 完成', '✅ Done')
                    }
                  </div>
                )}
              </div>
              <div style={styles.wallLabel}>
                <div style={styles.wallLine} />
                <span style={styles.wallText}>{t('🚫 无法互相通信', '🚫 Cannot communicate')}</span>
                <div style={styles.wallLine} />
              </div>
              <div style={{
                ...styles.subagentBox,
                borderColor: 'rgba(255,255,255,0.1)',
                opacity: isolationStep >= 1 ? 0.4 : 1,
                transition: 'all 0.5s ease',
              }}>
                <div style={styles.subagentLabel}>{t('子 Agent B', 'Subagent B')}</div>
                <div style={styles.subagentContext}>
                  <span style={styles.subContextItem}>{t('独立 Context', 'Own Context')}</span>
                  <span style={styles.subContextItem}>{t('限定工具', 'Limited Tools')}</span>
                </div>
                <div style={{ ...styles.workingIndicator, color: 'var(--color-text-muted, #666)' }}>
                  {t('💤 未激活', '💤 Idle')}
                </div>
              </div>
            </div>
          </div>

          {/* Action */}
          {isolationStep === 0 && (
            <button style={styles.primaryBtn} onClick={handleIsolationAnimate}>
              {t('▶ 演示通信流程', '▶ Animate Communication Flow')}
            </button>
          )}
          {isolationStep === 4 && (
            <div style={styles.conclusion}>
              <div style={styles.conclusionItem}>
                <span style={{ color: '#3b82f6' }}>Prompt</span>
                {t(' 是子 Agent 的唯一输入——它看不到主 Agent 的完整 context', ' is the subagent\'s only input — it can\'t see the main agent\'s full context')}
              </div>
              <div style={styles.conclusionItem}>
                <span style={{ color: '#22c55e' }}>Result</span>
                {t(' 是子 Agent 的唯一输出——中间的文件读取、推理过程全部丢弃', ' is the subagent\'s only output — all intermediate file reads and reasoning are discarded')}
              </div>
              <div style={styles.conclusionItem}>
                {t('子 Agent 之间彼此', 'Subagents are ')}
                <span style={{ color: '#ef4444' }}>{t('完全隔离', 'completely isolated')}</span>
                {t('——无法共享状态或直接通信', ' from each other — no shared state or direct communication')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Topology Comparison View */}
      {mode === 'topology' && (
        <div style={styles.panel}>
          <div style={styles.panelTitle}>
            {t('Subagent 模式 vs Multi-Agent Team', 'Subagent Pattern vs Multi-Agent Team')}
          </div>
          <div style={styles.panelDesc}>
            {t(
              '两种不同的多 Agent 架构，适用于不同的场景。点击查看对比：',
              'Two different multi-agent architectures for different scenarios. Click to compare:'
            )}
          </div>

          <div style={styles.topologyBtns}>
            <button
              style={{
                ...styles.topoBtn,
                borderColor: topologyView === 'star' ? '#3b82f6' : 'rgba(255,255,255,0.15)',
                backgroundColor: topologyView === 'star' ? 'rgba(59,130,246,0.08)' : 'transparent',
              }}
              onClick={() => handleTopologySelect('star')}
            >
              <div style={styles.topoBtnTitle}>
                ⭐ {t('星型拓扑', 'Star Topology')}
              </div>
              <div style={styles.topoBtnSub}>
                {t('Claude Code 的 Subagent 模式', 'Claude Code\'s Subagent pattern')}
              </div>
            </button>
            <button
              style={{
                ...styles.topoBtn,
                borderColor: topologyView === 'mesh' ? '#7c3aed' : 'rgba(255,255,255,0.15)',
                backgroundColor: topologyView === 'mesh' ? 'rgba(124,58,237,0.08)' : 'transparent',
              }}
              onClick={() => handleTopologySelect('mesh')}
            >
              <div style={styles.topoBtnTitle}>
                🕸️ {t('网状拓扑', 'Mesh Topology')}
              </div>
              <div style={styles.topoBtnSub}>
                {t('Multi-Agent Team 模式', 'Multi-Agent Team pattern')}
              </div>
            </button>
          </div>

          {topologyView === 'star' && (
            <div style={styles.topoDetail}>
              <pre style={styles.topoAscii}>{`
        ┌───────────┐
        │  Main     │
        │  Agent    │
        └─────┬─────┘
        ╱     │     ╲
       ╱      │      ╲
      ▼       ▼       ▼
   ┌─────┐ ┌─────┐ ┌─────┐
   │  A  │ │  B  │ │  C  │
   └─────┘ └─────┘ └─────┘
      ╳       ╳       ╳
   ${t('A↔B↔C 不可通信', 'A↔B↔C cannot talk')}
`}</pre>
              <div style={styles.topoTraits}>
                <div style={styles.traitItem}>
                  <span style={styles.traitGood}>✓</span>
                  {t('所有通信经过主 Agent——信息流清晰', 'All communication goes through main agent — clear info flow')}
                </div>
                <div style={styles.traitItem}>
                  <span style={styles.traitGood}>✓</span>
                  {t('Context 隔离防止"污染"', 'Context isolation prevents "pollution"')}
                </div>
                <div style={styles.traitItem}>
                  <span style={styles.traitGood}>✓</span>
                  {t('出错时责任链清晰，易于调试', 'Clear responsibility chain, easy to debug')}
                </div>
                <div style={styles.traitItem}>
                  <span style={styles.traitBad}>✗</span>
                  {t('子 Agent 之间无法直接协作', 'Subagents cannot collaborate directly')}
                </div>
              </div>
            </div>
          )}

          {topologyView === 'mesh' && (
            <div style={styles.topoDetail}>
              <pre style={styles.topoAscii}>{`
   ┌─────┐ ←──→ ┌─────┐
   │  A  │       │  B  │
   └──┬──┘       └──┬──┘
      │    ╲   ╱    │
      │     ╲ ╱     │
      │      ╳      │
      │     ╱ ╲     │
      │   ╱    ╲    │
   ┌──┴──┐       ┌──┴──┐
   │  C  │ ←──→ │  D  │
   └─────┘       └─────┘
   ${t('所有 Agent 互相通信', 'All agents talk to each other')}
`}</pre>
              <div style={styles.topoTraits}>
                <div style={styles.traitItem}>
                  <span style={styles.traitGood}>✓</span>
                  {t('Agent 之间可以直接协作和共享信息', 'Agents can collaborate and share info directly')}
                </div>
                <div style={styles.traitItem}>
                  <span style={styles.traitGood}>✓</span>
                  {t('适合需要持续协商的复杂任务', 'Suited for complex tasks needing ongoing negotiation')}
                </div>
                <div style={styles.traitItem}>
                  <span style={styles.traitBad}>✗</span>
                  {t('通信路径指数增长（N×(N-1)/2）', 'Communication paths grow exponentially (N×(N-1)/2)')}
                </div>
                <div style={styles.traitItem}>
                  <span style={styles.traitBad}>✗</span>
                  {t('容易出现"电话游戏"——信息在传递中失真', 'Prone to "telephone game" — info distorts as it propagates')}
                </div>
                <div style={styles.traitItem}>
                  <span style={styles.traitBad}>✗</span>
                  {t('调试困难——谁导致了错误？', 'Hard to debug — who caused the error?')}
                </div>
              </div>
            </div>
          )}

          {topologyView && (
            <div style={styles.topoConclusion}>
              {t(
                'Claude Code 选择星型拓扑——简单、可靠、可控。对于可拆分为独立子任务的编程任务，这是最优解。',
                'Claude Code chose star topology — simple, reliable, controllable. For coding tasks that decompose into independent subtasks, this is optimal.'
              )}
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      {viewedModes.size > 0 && viewedModes.size < 2 && (
        <div style={styles.progress}>
          {t(`已探索 ${viewedModes.size}/2`, `Explored ${viewedModes.size}/2`)}
        </div>
      )}
      {viewedModes.size >= 2 && (
        <div style={{ ...styles.progress, color: '#4ade80' }}>
          {t(
            '单向通信 + 星型拓扑 = 简单可靠的多 Agent 架构',
            'One-way communication + star topology = simple, reliable multi-agent architecture'
          )}
        </div>
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
    maxWidth: '720px',
    margin: '0 auto',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '4px',
  },
  tab: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '8px 8px 0 0',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-muted, #888)',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'var(--font-mono, monospace)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: 'var(--color-text, #e5e5e5)',
    borderBottom: '2px solid #7c3aed',
  },
  tabCheck: {
    color: '#4ade80',
    fontSize: '12px',
  },
  panel: {
    minHeight: '300px',
  },
  panelTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--color-text, #e5e5e5)',
    marginBottom: '8px',
  },
  panelDesc: {
    fontSize: '12px',
    color: 'var(--color-text-muted, #888)',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  diagram: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  mainAgent: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  agentBox: {
    padding: '12px 20px',
    borderRadius: '10px',
    border: '2px solid rgba(124, 58, 237, 0.4)',
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    textAlign: 'center' as const,
    minWidth: '200px',
  },
  agentIcon: {
    fontSize: '24px',
    marginBottom: '4px',
  },
  agentLabel: {
    fontWeight: 700,
    fontSize: '14px',
    color: '#a78bfa',
    marginBottom: '8px',
  },
  agentContext: {
    padding: '6px 10px',
    borderRadius: '6px',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  contextLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#a78bfa',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  contextItems: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '4px',
    justifyContent: 'center',
  },
  contextItem: {
    padding: '1px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    color: '#c4b5fd',
  },
  arrowSection: {
    display: 'flex',
    gap: '40px',
    padding: '4px 0',
  },
  arrowDown: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
  },
  arrowUp: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
  },
  arrowLine: {
    width: '3px',
    height: '30px',
    borderRadius: '2px',
    transition: 'background-color 0.5s ease',
  },
  arrowLabel: {
    fontSize: '10px',
    fontWeight: 600,
    transition: 'color 0.5s ease',
  },
  subagents: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  subagentBox: {
    flex: '0 1 200px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    textAlign: 'center' as const,
    transition: 'all 0.5s ease',
  },
  subagentLabel: {
    fontWeight: 700,
    fontSize: '13px',
    color: 'var(--color-text, #e5e5e5)',
    marginBottom: '6px',
  },
  subagentContext: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    marginBottom: '6px',
  },
  subContextItem: {
    padding: '1px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: 'var(--color-text-muted, #888)',
  },
  workingIndicator: {
    fontSize: '11px',
    color: '#3b82f6',
    fontWeight: 600,
  },
  wallLabel: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
  },
  wallLine: {
    width: '1px',
    height: '16px',
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  wallText: {
    fontSize: '9px',
    color: '#f87171',
    whiteSpace: 'nowrap' as const,
    fontWeight: 600,
  },
  primaryBtn: {
    display: 'block',
    margin: '0 auto',
    padding: '10px 28px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: 'var(--font-mono, monospace)',
    cursor: 'pointer',
  },
  conclusion: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  conclusionItem: {
    fontSize: '12px',
    color: 'var(--color-text-muted, #aaa)',
    lineHeight: '1.5',
  },
  topologyBtns: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
  },
  topoBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono, monospace)',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const,
  },
  topoBtnTitle: {
    fontWeight: 700,
    fontSize: '14px',
    color: 'var(--color-text, #e5e5e5)',
    marginBottom: '4px',
  },
  topoBtnSub: {
    fontSize: '11px',
    color: 'var(--color-text-muted, #888)',
  },
  topoDetail: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '12px',
  },
  topoAscii: {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '12px',
    lineHeight: '1.4',
    color: 'var(--color-text, #e5e5e5)',
    textAlign: 'center' as const,
    margin: '0 0 12px',
    whiteSpace: 'pre' as const,
  },
  topoTraits: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  traitItem: {
    display: 'flex',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--color-text-muted, #aaa)',
    lineHeight: '1.4',
  },
  traitGood: {
    color: '#4ade80',
    fontWeight: 700,
    flexShrink: 0,
  },
  traitBad: {
    color: '#f87171',
    fontWeight: 700,
    flexShrink: 0,
  },
  topoConclusion: {
    fontSize: '13px',
    color: 'var(--color-text, #e5e5e5)',
    lineHeight: '1.6',
    fontWeight: 600,
    textAlign: 'center' as const,
    padding: '8px 0',
  },
  progress: {
    marginTop: '12px',
    textAlign: 'center' as const,
    fontSize: '13px',
    color: 'var(--color-text-muted, #888)',
    fontWeight: 600,
  },
};
