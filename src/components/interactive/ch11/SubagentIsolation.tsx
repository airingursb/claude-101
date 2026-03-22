import { useState, useEffect, useRef } from 'react';
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
  const [starAnimStep, setStarAnimStep] = useState(0);
  const [meshAnimating, setMeshAnimating] = useState(false);
  const meshTimersRef = useRef<number[]>([]);

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
    setTimeout(() => setIsolationStep(2), 1200);
    setTimeout(() => setIsolationStep(3), 2200);
    setTimeout(() => {
      setIsolationStep(4);
      markViewed('isolation');
    }, 3400);
  };

  const handleTopologySelect = (view: 'star' | 'mesh') => {
    setTopologyView(view);
    if (view === 'star') {
      setStarAnimStep(0);
      setTimeout(() => setStarAnimStep(1), 300);
      setTimeout(() => setStarAnimStep(2), 900);
      setTimeout(() => setStarAnimStep(3), 1500);
    }
    if (view === 'mesh') {
      setMeshAnimating(true);
      meshTimersRef.current.forEach(clearTimeout);
      meshTimersRef.current = [];
      const t1 = window.setTimeout(() => setMeshAnimating(false), 3000);
      meshTimersRef.current.push(t1);
      markViewed('topology');
    }
  };

  useEffect(() => {
    return () => {
      meshTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="subagent-iso scene-dark-interactive" data-interactive style={styles.root}>
      <style>{keyframesCSS}</style>

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

          {/* Animated Isolation Diagram */}
          <div style={styles.isoContainer}>
            {/* Main Agent */}
            <div style={styles.isoMainAgent}>
              <div style={{
                ...styles.isoAgentBox,
                border: '2px solid rgba(124, 58, 237, 0.5)',
                backgroundColor: 'rgba(124, 58, 237, 0.08)',
                boxShadow: isolationStep >= 3 ? '0 0 16px rgba(124, 58, 237, 0.3)' : 'none',
                transition: 'box-shadow 0.5s ease',
              }}>
                <div style={{ fontSize: '22px' }}>🧠</div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#a78bfa' }}>
                  {t('主 Agent', 'Main Agent')}
                </div>
                <div style={styles.isoContextBar}>
                  <span style={styles.isoContextTag}>{t('完整对话历史', 'Full chat history')}</span>
                  <span style={styles.isoContextTag}>{t('全局状态', 'Global state')}</span>
                </div>
              </div>
            </div>

            {/* Connection lines & particles */}
            <svg style={styles.isoSvg} viewBox="0 0 400 100" preserveAspectRatio="xMidYMid meet">
              {/* Line from Main Agent down to Subagent A */}
              <line
                x1="200" y1="0" x2="120" y2="100"
                stroke={isolationStep >= 1 ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}
                strokeWidth="1.5"
                style={{ transition: 'stroke 0.4s ease' }}
              />
              {/* Return line from Subagent A up to Main Agent (offset slightly) */}
              <line
                x1="120" y1="100" x2="200" y2="0"
                stroke={isolationStep >= 3 ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}
                strokeWidth="1.5"
                strokeDasharray={isolationStep >= 3 ? 'none' : 'none'}
                style={{ transition: 'stroke 0.4s ease' }}
              />
              {/* Prompt particle: blue dot going down */}
              {isolationStep >= 1 && isolationStep < 4 && (
                <circle r="4" fill="#3b82f6" filter="url(#glowBlue)">
                  <animate
                    attributeName="cx" from="200" to="120"
                    dur="1s" begin="0s" fill="freeze"
                    repeatCount="1"
                  />
                  <animate
                    attributeName="cy" from="0" to="100"
                    dur="1s" begin="0s" fill="freeze"
                    repeatCount="1"
                  />
                  <animate
                    attributeName="opacity" from="1" to="0"
                    dur="0.2s" begin="0.9s" fill="freeze"
                  />
                </circle>
              )}
              {/* Result particle: green dot going up */}
              {isolationStep >= 3 && (
                <circle r="4" fill="#22c55e" filter="url(#glowGreen)">
                  <animate
                    attributeName="cx" from="120" to="200"
                    dur="1s" begin="0s" fill="freeze"
                    repeatCount="1"
                  />
                  <animate
                    attributeName="cy" from="100" to="0"
                    dur="1s" begin="0s" fill="freeze"
                    repeatCount="1"
                  />
                  <animate
                    attributeName="opacity" from="1" to="0"
                    dur="0.2s" begin="0.9s" fill="freeze"
                  />
                </circle>
              )}
              {/* Labels on lines */}
              {isolationStep >= 1 && (
                <text x="145" y="40" fill="#3b82f6" fontSize="10" fontWeight="600" textAnchor="middle"
                  style={{ animation: 'fadeIn 0.4s ease' }}>
                  {t('Prompt ↓', 'Prompt ↓')}
                </text>
              )}
              {isolationStep >= 3 && (
                <text x="175" y="75" fill="#22c55e" fontSize="10" fontWeight="600" textAnchor="middle"
                  style={{ animation: 'fadeIn 0.4s ease' }}>
                  {t('Result ↑', 'Result ↑')}
                </text>
              )}
              {/* Glow filters */}
              <defs>
                <filter id="glowBlue" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feFlood floodColor="#3b82f6" floodOpacity="0.6" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feFlood floodColor="#22c55e" floodOpacity="0.6" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>

            {/* Subagent Row */}
            <div style={styles.isoSubRow}>
              {/* Subagent A */}
              <div style={{
                ...styles.isoSubBox,
                borderColor: isolationStep >= 2 ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.12)',
                backgroundColor: isolationStep >= 2 ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
                boxShadow: isolationStep === 2 ? '0 0 12px rgba(59,130,246,0.2)' : 'none',
                transition: 'all 0.4s ease',
              }}>
                <div style={{ fontSize: '18px' }}>🤖</div>
                <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text, #e5e5e5)' }}>
                  {t('子 Agent A', 'Subagent A')}
                </div>
                <div style={styles.isoSubMeta}>
                  <span style={styles.isoSubTag}>{t('独立 Context', 'Own Context')}</span>
                  <span style={styles.isoSubTag}>{t('限定工具', 'Limited Tools')}</span>
                </div>
                {isolationStep >= 2 && (
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isolationStep === 2 ? '#3b82f6' : '#22c55e',
                    marginTop: '4px',
                    animation: 'fadeIn 0.3s ease',
                  }}>
                    {isolationStep === 2
                      ? t('⚙️ 处理中...', '⚙️ Processing...')
                      : t('✅ 完成', '✅ Done')}
                  </div>
                )}
              </div>

              {/* No-comm wall between A and B */}
              <div style={styles.isoWall}>
                <div style={styles.isoWallDash} />
                <span style={styles.isoWallIcon}>🚫</span>
                <div style={styles.isoWallDash} />
                <span style={styles.isoWallText}>{t('无法通信', 'No comm')}</span>
              </div>

              {/* Subagent B */}
              <div style={{
                ...styles.isoSubBox,
                opacity: isolationStep >= 1 ? 0.4 : 1,
                transition: 'all 0.5s ease',
              }}>
                <div style={{ fontSize: '18px' }}>🤖</div>
                <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text, #e5e5e5)' }}>
                  {t('子 Agent B', 'Subagent B')}
                </div>
                <div style={styles.isoSubMeta}>
                  <span style={styles.isoSubTag}>{t('独立 Context', 'Own Context')}</span>
                  <span style={styles.isoSubTag}>{t('限定工具', 'Limited Tools')}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #666)', marginTop: '4px' }}>
                  {t('💤 未激活', '💤 Idle')}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {isolationStep === 0 && (
            <button style={styles.primaryBtn} onClick={handleIsolationAnimate}>
              {t('▶ 演示通信流程', '▶ Animate Communication Flow')}
            </button>
          )}

          {/* Conclusion */}
          {isolationStep === 4 && (
            <div style={{ ...styles.conclusion, animation: 'fadeIn 0.5s ease' }}>
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

          {/* Star Topology Diagram */}
          {topologyView === 'star' && (
            <div style={styles.topoDetail}>
              <div style={styles.topoDiagramWrap}>
                <svg style={styles.topoSvg} viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <filter id="glowBlueTopo" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feFlood floodColor="#3b82f6" floodOpacity="0.5" />
                      <feComposite in2="blur" operator="in" />
                      <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  {/* Lines from center to subs */}
                  <line x1="150" y1="50" x2="60" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="150" y1="50" x2="150" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="150" y1="50" x2="240" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  {/* Animated particles */}
                  {starAnimStep >= 1 && (
                    <circle r="4" fill="#3b82f6" filter="url(#glowBlueTopo)">
                      <animate attributeName="cx" from="150" to="60" dur="0.5s" fill="freeze" />
                      <animate attributeName="cy" from="50" to="160" dur="0.5s" fill="freeze" />
                      <animate attributeName="opacity" from="1" to="0" dur="0.15s" begin="0.45s" fill="freeze" />
                    </circle>
                  )}
                  {starAnimStep >= 2 && (
                    <circle r="4" fill="#3b82f6" filter="url(#glowBlueTopo)">
                      <animate attributeName="cx" from="150" to="150" dur="0.5s" fill="freeze" />
                      <animate attributeName="cy" from="50" to="160" dur="0.5s" fill="freeze" />
                      <animate attributeName="opacity" from="1" to="0" dur="0.15s" begin="0.45s" fill="freeze" />
                    </circle>
                  )}
                  {starAnimStep >= 3 && (
                    <circle r="4" fill="#3b82f6" filter="url(#glowBlueTopo)">
                      <animate attributeName="cx" from="150" to="240" dur="0.5s" fill="freeze" />
                      <animate attributeName="cy" from="50" to="160" dur="0.5s" fill="freeze" />
                      <animate attributeName="opacity" from="1" to="0" dur="0.15s" begin="0.45s" fill="freeze" />
                    </circle>
                  )}
                  {/* Main node */}
                  <circle cx="150" cy="50" r="24" fill="rgba(124,58,237,0.15)" stroke="rgba(124,58,237,0.6)" strokeWidth="2" />
                  <text x="150" y="46" textAnchor="middle" fill="#a78bfa" fontSize="16">🧠</text>
                  <text x="150" y="62" textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="700">Main</text>
                  {/* Sub nodes */}
                  {[[60, 160, 'A'], [150, 160, 'B'], [240, 160, 'C']].map(([cx, cy, label], i) => (
                    <g key={i}>
                      <circle cx={cx as number} cy={cy as number} r="20" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.4)" strokeWidth="1.5" />
                      <text x={cx as number} y={(cy as number) - 2} textAnchor="middle" fill="#60a5fa" fontSize="12">🤖</text>
                      <text x={cx as number} y={(cy as number) + 12} textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="600">{label as string}</text>
                    </g>
                  ))}
                  {/* Red X lines between subs */}
                  <line x1="85" y1="160" x2="125" y2="160" stroke="rgba(239,68,68,0.3)" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="105" y="155" textAnchor="middle" fill="#f87171" fontSize="10">✕</text>
                  <line x1="175" y1="160" x2="215" y2="160" stroke="rgba(239,68,68,0.3)" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="195" y="155" textAnchor="middle" fill="#f87171" fontSize="10">✕</text>
                </svg>
              </div>
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

          {/* Mesh Topology Diagram */}
          {topologyView === 'mesh' && (
            <div style={styles.topoDetail}>
              <div style={styles.topoDiagramWrap}>
                <svg style={styles.topoSvg} viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <filter id="glowPurpleTopo" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feFlood floodColor="#7c3aed" floodOpacity="0.5" />
                      <feComposite in2="blur" operator="in" />
                      <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  {/* 6 connection lines for 2x2 grid: positions A(90,55) B(210,55) C(90,145) D(210,145) */}
                  {/* AB */ }
                  <line x1="90" y1="55" x2="210" y2="55" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  {/* CD */}
                  <line x1="90" y1="145" x2="210" y2="145" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  {/* AC */}
                  <line x1="90" y1="55" x2="90" y2="145" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  {/* BD */}
                  <line x1="210" y1="55" x2="210" y2="145" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  {/* AD diagonal */}
                  <line x1="90" y1="55" x2="210" y2="145" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  {/* BC diagonal */}
                  <line x1="210" y1="55" x2="90" y2="145" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                  {/* Chaotic mesh particles */}
                  {meshAnimating && (
                    <>
                      {/* AB */}
                      <circle r="3" fill="#7c3aed" filter="url(#glowPurpleTopo)" opacity="0.9">
                        <animate attributeName="cx" values="90;210;90" dur="1.2s" repeatCount="indefinite" />
                        <animate attributeName="cy" values="55;55;55" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                      {/* BA */}
                      <circle r="3" fill="#a78bfa" filter="url(#glowPurpleTopo)" opacity="0.8">
                        <animate attributeName="cx" values="210;90;210" dur="1.4s" repeatCount="indefinite" />
                        <animate attributeName="cy" values="55;55;55" dur="1.4s" repeatCount="indefinite" />
                      </circle>
                      {/* AC */}
                      <circle r="3" fill="#7c3aed" filter="url(#glowPurpleTopo)" opacity="0.9">
                        <animate attributeName="cx" values="90;90;90" dur="1.0s" repeatCount="indefinite" />
                        <animate attributeName="cy" values="55;145;55" dur="1.0s" repeatCount="indefinite" />
                      </circle>
                      {/* BD */}
                      <circle r="3" fill="#a78bfa" filter="url(#glowPurpleTopo)" opacity="0.8">
                        <animate attributeName="cx" values="210;210;210" dur="1.3s" repeatCount="indefinite" />
                        <animate attributeName="cy" values="55;145;55" dur="1.3s" repeatCount="indefinite" />
                      </circle>
                      {/* AD diagonal */}
                      <circle r="3" fill="#c084fc" filter="url(#glowPurpleTopo)" opacity="0.7">
                        <animate attributeName="cx" values="90;210;90" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="cy" values="55;145;55" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                      {/* BC diagonal */}
                      <circle r="3" fill="#c084fc" filter="url(#glowPurpleTopo)" opacity="0.7">
                        <animate attributeName="cx" values="210;90;210" dur="1.1s" repeatCount="indefinite" />
                        <animate attributeName="cy" values="55;145;55" dur="1.1s" repeatCount="indefinite" />
                      </circle>
                      {/* CD */}
                      <circle r="3" fill="#7c3aed" filter="url(#glowPurpleTopo)" opacity="0.8">
                        <animate attributeName="cx" values="90;210;90" dur="0.9s" repeatCount="indefinite" />
                        <animate attributeName="cy" values="145;145;145" dur="0.9s" repeatCount="indefinite" />
                      </circle>
                      {/* DC */}
                      <circle r="3" fill="#a78bfa" filter="url(#glowPurpleTopo)" opacity="0.8">
                        <animate attributeName="cx" values="210;90;210" dur="1.6s" repeatCount="indefinite" />
                        <animate attributeName="cy" values="145;145;145" dur="1.6s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}

                  {/* 4 agent nodes */}
                  {([[90, 55, 'A'], [210, 55, 'B'], [90, 145, 'C'], [210, 145, 'D']] as [number, number, string][]).map(([cx, cy, label], i) => (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="24" fill="rgba(124,58,237,0.12)" stroke="rgba(124,58,237,0.5)" strokeWidth="1.5" />
                      <text x={cx} y={cy - 3} textAnchor="middle" fill="#c4b5fd" fontSize="13">🤖</text>
                      <text x={cx} y={cy + 13} textAnchor="middle" fill="#c4b5fd" fontSize="9" fontWeight="600">{label}</text>
                    </g>
                  ))}

                  {/* Complexity label */}
                  <text x="150" y="195" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">
                    N=4 → {t('6 条通信路径', '6 communication paths')}
                  </text>
                </svg>
              </div>
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

const keyframesCSS = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

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

  // === Isolation diagram ===
  isoContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '16px',
  },
  isoMainAgent: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    marginBottom: '0',
  },
  isoAgentBox: {
    padding: '10px 20px',
    borderRadius: '10px',
    textAlign: 'center' as const,
    minWidth: '180px',
    transition: 'all 0.5s ease',
  },
  isoContextBar: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    marginTop: '6px',
    flexWrap: 'wrap' as const,
  },
  isoContextTag: {
    padding: '1px 6px',
    borderRadius: '3px',
    fontSize: '9px',
    backgroundColor: 'rgba(124,58,237,0.15)',
    color: '#c4b5fd',
  },
  isoSvg: {
    width: '100%',
    maxWidth: '400px',
    height: '100px',
    overflow: 'visible' as const,
  },
  isoSubRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  isoSubBox: {
    flex: '0 1 170px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    textAlign: 'center' as const,
    transition: 'all 0.5s ease',
  },
  isoSubMeta: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    marginTop: '4px',
  },
  isoSubTag: {
    padding: '1px 5px',
    borderRadius: '3px',
    fontSize: '9px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: 'var(--color-text-muted, #888)',
  },
  isoWall: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    flexShrink: 0,
  },
  isoWallDash: {
    width: '1px',
    height: '20px',
    background: 'repeating-linear-gradient(to bottom, rgba(239,68,68,0.4) 0px, rgba(239,68,68,0.4) 3px, transparent 3px, transparent 6px)',
  },
  isoWallIcon: {
    fontSize: '14px',
  },
  isoWallText: {
    fontSize: '8px',
    color: '#f87171',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },

  // === Shared ===
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

  // === Topology ===
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
  topoDiagramWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  topoSvg: {
    width: '100%',
    maxWidth: '300px',
    height: '200px',
    overflow: 'visible' as const,
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
