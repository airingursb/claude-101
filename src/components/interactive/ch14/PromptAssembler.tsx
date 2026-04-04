import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

/* ------------------------------------------------------------------ */
/*  Layer data — 6 layers of System Prompt assembly                    */
/* ------------------------------------------------------------------ */

interface Layer {
  id: number;
  name: string;
  enName: string;
  tokens: number;
  desc: string;
  enDesc: string;
  source: string;
  color: string;
}

const LAYERS: Layer[] = [
  {
    id: 1,
    name: '核心指令',
    enName: 'Core Instructions',
    tokens: 2000,
    desc: '身份、行为准则、输出规范',
    enDesc: 'Identity, behavioral rules, output format',
    source: 'src/constants/prompts.ts',
    color: '#3b82f6',
  },
  {
    id: 2,
    name: '工具提示词',
    enName: 'Tool Prompts',
    tokens: 4000,
    desc: '50+ 工具的 JSON Schema 和使用说明',
    enDesc: '50+ tools with JSON Schema and usage instructions',
    source: 'src/tools.ts → .description()',
    color: '#22c55e',
  },
  {
    id: 3,
    name: 'Skill 指令',
    enName: 'Skill Instructions',
    tokens: 1000,
    desc: '已注册 Skills 的名称和描述',
    enDesc: 'Registered skill names and descriptions',
    source: 'src/skills/',
    color: '#f59e0b',
  },
  {
    id: 4,
    name: 'CLAUDE.md',
    enName: 'CLAUDE.md',
    tokens: 2000,
    desc: '项目指令、技术栈、编码规范',
    enDesc: 'Project instructions, tech stack, coding standards',
    source: 'src/utils/claudemd.ts',
    color: '#a855f7',
  },
  {
    id: 5,
    name: 'Memory',
    enName: 'Memory',
    tokens: 1000,
    desc: 'MEMORY.md 跨会话记忆',
    enDesc: 'MEMORY.md cross-session memory',
    source: 'src/memdir/memdir.ts',
    color: '#ec4899',
  },
  {
    id: 6,
    name: '用户上下文',
    enName: 'User Context',
    tokens: 500,
    desc: 'Git 分支、最近提交、工作状态',
    enDesc: 'Git branch, recent commits, working status',
    source: 'src/utils/api.ts',
    color: '#06b6d4',
  },
];

const TOTAL_TOKENS = LAYERS.reduce((sum, l) => sum + l.tokens, 0);
const DELAY_MS = 800;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PromptAssembler() {
  const { t } = useLanguage();
  const onComplete = useSceneComplete();

  const [visibleCount, setVisibleCount] = useState(0);
  const [displayTokens, setDisplayTokens] = useState(0);
  const [done, setDone] = useState(false);

  // Auto-play: reveal layers one by one
  useEffect(() => {
    if (visibleCount >= LAYERS.length) {
      setDone(true);
      return;
    }

    const timer = setTimeout(() => {
      setVisibleCount((prev) => prev + 1);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [visibleCount]);

  // Animate token counter
  useEffect(() => {
    const target = LAYERS.slice(0, visibleCount).reduce((sum, l) => sum + l.tokens, 0);
    if (displayTokens === target) return;

    const step = Math.max(1, Math.floor(Math.abs(target - displayTokens) / 15));
    const timer = setInterval(() => {
      setDisplayTokens((prev) => {
        if (prev < target) return Math.min(prev + step, target);
        return target;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [visibleCount, displayTokens]);

  // Signal completion when done
  const handleComplete = useCallback(() => {
    if (done && onComplete) {
      onComplete();
    }
  }, [done, onComplete]);

  useEffect(() => {
    if (done) {
      const timer = setTimeout(handleComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [done, handleComplete]);

  const visibleLayers = LAYERS.slice(0, visibleCount);

  return (
    <div className="prompt-assembler">
      {/* Token counter */}
      <div className="prompt-assembler__counter">
        <span className="prompt-assembler__counter-value">
          ~{displayTokens.toLocaleString()}
        </span>{' '}
        <span>tokens</span>
        {done && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prompt-assembler__done"
          >
            {t('装配完成 ✓', 'Assembly complete ✓')}
          </motion.span>
        )}
      </div>

      {/* Layer stack */}
      <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '8px' }}>
        <AnimatePresence>
          {visibleLayers.map((layer) => (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="prompt-assembler__layer"
              style={{
                background: `linear-gradient(135deg, ${layer.color}20, ${layer.color}0a)`,
                borderColor: `${layer.color}50`,
              }}
            >
              {/* Accent bar */}
              <div
                className="prompt-assembler__accent"
                style={{ background: layer.color }}
              />

              {/* Header row */}
              <div className="prompt-assembler__header">
                <span className="prompt-assembler__name">
                  {t(layer.name, layer.enName)}
                </span>
                <span
                  className="prompt-assembler__tokens"
                  style={{ color: layer.color }}
                >
                  ~{layer.tokens.toLocaleString()} tokens
                </span>
              </div>

              {/* Description */}
              <div className="prompt-assembler__desc">
                {t(layer.desc, layer.enDesc)}
              </div>

              {/* Source reference */}
              <div className="prompt-assembler__source">
                {layer.source}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Total bar */}
      {done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="prompt-assembler__total"
        >
          {t('总计', 'Total')}: <strong>~{TOTAL_TOKENS.toLocaleString()} tokens</strong>
          {' → '}
          <span className="prompt-assembler__cache">
            {t('通过 cache_control 在用户间共享缓存', 'Shared across users via cache_control')}
          </span>
        </motion.div>
      )}
    </div>
  );
}
