import { useState } from 'react';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

type ItemFate = 'kept' | 'trimmed' | 'summarized';
type ItemPhase = 'normal' | 'compacting' | 'done';

interface ContextItem {
  id: string;
  type: string;
  label: string;
  labelEn: string;
  tokens: number;
  fate: ItemFate;
}

const ITEMS: ContextItem[] = [
  { id: 'sys', type: 'system', label: 'System Prompt', labelEn: 'System Prompt', tokens: 1200, fate: 'kept' },
  { id: 'claude-md', type: 'config', label: 'CLAUDE.md', labelEn: 'CLAUDE.md', tokens: 800, fate: 'kept' },
  { id: 'msg1', type: 'user', label: '用户: "帮我重构 auth 模块"', labelEn: 'User: "Refactor the auth module"', tokens: 120, fate: 'summarized' },
  { id: 'msg2', type: 'assistant', label: '助手: "好的，让我先看看代码"', labelEn: 'Assistant: "Sure, let me look at the code"', tokens: 350, fate: 'summarized' },
  { id: 'tool1', type: 'tool', label: 'Read(src/auth.ts) → 2400 行代码', labelEn: 'Read(src/auth.ts) → 2400 lines', tokens: 8500, fate: 'trimmed' },
  { id: 'msg3', type: 'assistant', label: '助手: 分析了代码结构，提出方案', labelEn: 'Assistant: Analyzed code, proposed plan', tokens: 1800, fate: 'summarized' },
  { id: 'tool2', type: 'tool', label: 'Read(src/db.ts) → 1800 行代码', labelEn: 'Read(src/db.ts) → 1800 lines', tokens: 6200, fate: 'trimmed' },
  { id: 'msg4', type: 'assistant', label: '助手: 中间推理过程...', labelEn: 'Assistant: Intermediate reasoning...', tokens: 2400, fate: 'trimmed' },
  { id: 'tool3', type: 'tool', label: 'Edit(src/auth.ts) → 重构完成', labelEn: 'Edit(src/auth.ts) → Refactored', tokens: 3200, fate: 'kept' },
  { id: 'msg5', type: 'user', label: '用户: "测试也更新一下"', labelEn: 'User: "Update the tests too"', tokens: 80, fate: 'kept' },
  { id: 'msg6', type: 'assistant', label: '助手: "正在更新测试..."', labelEn: 'Assistant: "Updating tests..."', tokens: 600, fate: 'kept' },
];

const MAX_TOKENS = 28000;

const TYPE_ICONS: Record<string, string> = {
  system: 'SYS',
  config: 'CFG',
  user: 'USR',
  assistant: 'AST',
  tool: 'TOOL',
};

const FATE_COLORS: Record<ItemFate, { bg: string; border: string; text: string }> = {
  kept: { bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.5)', text: '#4ade80' },
  trimmed: { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.5)', text: '#f87171' },
  summarized: { bg: 'rgba(250, 204, 21, 0.12)', border: 'rgba(250, 204, 21, 0.5)', text: '#fbbf24' },
};

export default function CompactSimulator() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();
  const [phase, setPhase] = useState<ItemPhase>('normal');
  const [hasCompleted, setHasCompleted] = useState(false);

  const totalTokensBefore = ITEMS.reduce((s, i) => s + i.tokens, 0);
  const summaryTokens = 1200;
  const totalTokensAfter =
    ITEMS.filter((i) => i.fate === 'kept').reduce((s, i) => s + i.tokens, 0) + summaryTokens;

  const percentBefore = Math.round((totalTokensBefore / MAX_TOKENS) * 100);
  const percentAfter = Math.round((totalTokensAfter / MAX_TOKENS) * 100);

  const currentPercent = phase === 'done' ? percentAfter : percentBefore;
  const currentTokens = phase === 'done' ? totalTokensAfter : totalTokensBefore;

  const handleCompact = () => {
    if (phase !== 'normal') return;
    setPhase('compacting');
    setTimeout(() => {
      setPhase('done');
      if (!hasCompleted) {
        setHasCompleted(true);
        if (sceneComplete) sceneComplete();
      }
    }, 1500);
  };

  const handleReset = () => {
    setPhase('normal');
  };

  return (
    <div className="compact-sim scene-dark-interactive" data-interactive style={styles.root}>
      {/* Header */}
      <div className="compact-sim__header" style={styles.header}>
        <span style={styles.headerTitle}>
          {t('Context Window 压缩模拟', 'Context Window Compaction Simulator')}
        </span>
        <span style={styles.headerTokens}>
          {currentTokens.toLocaleString()} / {MAX_TOKENS.toLocaleString()} tokens
        </span>
      </div>

      {/* Progress bar */}
      <div className="compact-sim__bar" style={styles.barOuter}>
        <div
          className="compact-sim__bar-fill"
          style={{
            ...styles.barFill,
            width: `${currentPercent}%`,
            backgroundColor: currentPercent > 80 ? '#ef4444' : currentPercent > 50 ? '#f59e0b' : '#22c55e',
            transition: phase === 'done' ? 'width 0.8s ease, background-color 0.8s ease' : 'none',
          }}
        />
        <span style={styles.barLabel}>{currentPercent}%</span>
      </div>

      {/* Legend */}
      <div className="compact-sim__legend" style={styles.legend}>
        <span style={{ ...styles.legendItem, color: FATE_COLORS.kept.text }}>
          {t('● 保留', '● Kept')}
        </span>
        <span style={{ ...styles.legendItem, color: FATE_COLORS.trimmed.text }}>
          {t('● 丢弃', '● Trimmed')}
        </span>
        <span style={{ ...styles.legendItem, color: FATE_COLORS.summarized.text }}>
          {t('● 压缩为摘要', '● Summarized')}
        </span>
      </div>

      {/* Items list */}
      <div className="compact-sim__list" style={styles.list}>
        {phase === 'done' && (
          <div className="compact-sim__item compact-sim__item--summarized" style={{
            ...styles.item,
            ...styles.summaryBlock,
            animation: 'compact-sim-fade-in 0.5s ease',
          }}>
            <span className="compact-sim__item-badge" style={{
              ...styles.badge,
              backgroundColor: 'rgba(250, 204, 21, 0.2)',
              color: '#fbbf24',
            }}>
              SUM
            </span>
            <span className="compact-sim__item-label" style={styles.itemLabel}>
              {t(
                '压缩摘要: 用户要求重构 auth 模块，助手读取了 auth.ts 和 db.ts，分析后完成了重构',
                'Summary: User asked to refactor auth module. Assistant read auth.ts and db.ts, analyzed and completed refactoring.'
              )}
            </span>
            <span className="compact-sim__item-tokens" style={{ ...styles.itemTokens, color: '#fbbf24' }}>
              {summaryTokens.toLocaleString()}t
            </span>
          </div>
        )}

        {ITEMS.map((item) => {
          const fate = item.fate;
          const isTrimmed = fate === 'trimmed';
          const isSummarized = fate === 'summarized';
          const isCompacting = phase === 'compacting';
          const isDone = phase === 'done';
          const shouldHide = isDone && (isTrimmed || isSummarized);
          const shouldShrink = isCompacting && (isTrimmed || isSummarized);

          const fateColor = phase === 'normal' ? null : FATE_COLORS[fate];

          const itemStyle: React.CSSProperties = {
            ...styles.item,
            ...(fateColor ? {
              backgroundColor: fateColor.bg,
              borderColor: fateColor.border,
            } : {}),
            ...(shouldShrink ? {
              opacity: 0.4,
              transform: 'scaleY(0.6)',
              maxHeight: '30px',
              transition: 'all 0.8s ease',
            } : {}),
            ...(shouldHide ? {
              opacity: 0,
              maxHeight: 0,
              padding: 0,
              margin: 0,
              borderWidth: 0,
              overflow: 'hidden',
              transition: 'all 0.5s ease',
            } : {}),
          };

          const modifierClass = phase !== 'normal'
            ? `compact-sim__item--${fate}`
            : '';

          return (
            <div
              key={item.id}
              className={`compact-sim__item ${modifierClass}`}
              style={itemStyle}
            >
              <span
                className="compact-sim__item-badge"
                style={{
                  ...styles.badge,
                  backgroundColor: fateColor ? fateColor.bg : 'rgba(255,255,255,0.06)',
                  color: fateColor ? fateColor.text : 'var(--color-text-muted, #888)',
                }}
              >
                {TYPE_ICONS[item.type] || item.type}
              </span>
              <span
                className="compact-sim__item-label"
                style={{
                  ...styles.itemLabel,
                  textDecoration: (isCompacting || isDone) && isTrimmed ? 'line-through' : 'none',
                  color: fateColor ? fateColor.text : 'var(--color-text, #e5e5e5)',
                }}
              >
                {t(item.label, item.labelEn)}
              </span>
              <span
                className="compact-sim__item-tokens"
                style={{
                  ...styles.itemTokens,
                  color: fateColor ? fateColor.text : 'var(--color-text-muted, #888)',
                }}
              >
                {item.tokens.toLocaleString()}t
              </span>
              {phase !== 'normal' && (
                <span className="compact-sim__item-fate" style={{
                  ...styles.fateTag,
                  color: fateColor!.text,
                  backgroundColor: fateColor!.bg,
                }}>
                  {fate === 'kept' && t('保留', 'KEPT')}
                  {fate === 'trimmed' && t('丢弃', 'TRIMMED')}
                  {fate === 'summarized' && t('压缩', 'SUMMARIZED')}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Action button */}
      <div className="compact-sim__actions" style={styles.actions}>
        {phase === 'normal' && (
          <button
            className="compact-sim__btn"
            style={styles.compactBtn}
            onClick={handleCompact}
          >
            {t('执行 Compact', 'Run Compact')}
          </button>
        )}
        {phase === 'compacting' && (
          <div className="compact-sim__status" style={styles.statusText}>
            {t('正在压缩上下文...', 'Compacting context...')}
          </div>
        )}
        {phase === 'done' && (
          <div style={styles.doneRow}>
            <div className="compact-sim__status" style={styles.statusDone}>
              {t(
                `压缩完成! ${percentBefore}% → ${percentAfter}%，节省了 ${(totalTokensBefore - totalTokensAfter).toLocaleString()} tokens`,
                `Compaction done! ${percentBefore}% → ${percentAfter}%, saved ${(totalTokensBefore - totalTokensAfter).toLocaleString()} tokens`
              )}
            </div>
            <button
              className="compact-sim__btn compact-sim__btn--reset"
              style={styles.resetBtn}
              onClick={handleReset}
            >
              {t('重置', 'Reset')}
            </button>
          </div>
        )}
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes compact-sim-fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: '14px',
    color: 'var(--color-text, #e5e5e5)',
  },
  headerTokens: {
    fontSize: '12px',
    color: 'var(--color-text-muted, #888)',
  },
  barOuter: {
    position: 'relative',
    height: '20px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '10px',
  },
  barLabel: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '11px',
    fontWeight: 700,
    color: '#fff',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  legend: {
    display: 'flex',
    gap: '16px',
    marginBottom: '14px',
    fontSize: '12px',
  },
  legendItem: {
    fontWeight: 600,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    transition: 'all 0.4s ease',
    maxHeight: '60px',
    overflow: 'hidden',
    transformOrigin: 'top',
  },
  summaryBlock: {
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
    border: '1px dashed rgba(250, 204, 21, 0.4)',
    padding: '10px',
  },
  badge: {
    flexShrink: 0,
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  itemLabel: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'var(--color-text, #e5e5e5)',
  },
  itemTokens: {
    flexShrink: 0,
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--color-text-muted, #888)',
  },
  fateTag: {
    flexShrink: 0,
    padding: '1px 6px',
    borderRadius: '3px',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
  },
  compactBtn: {
    padding: '10px 28px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: 'var(--font-mono, monospace)',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
  },
  statusText: {
    color: '#fbbf24',
    fontWeight: 600,
    fontSize: '13px',
    animation: 'compact-sim-fade-in 0.3s ease',
  },
  doneRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  statusDone: {
    color: '#4ade80',
    fontWeight: 600,
    fontSize: '13px',
    textAlign: 'center',
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
};
