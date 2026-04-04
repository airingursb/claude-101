import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

/* ------------------------------------------------------------------ */
/*  Step data — 11 steps matching the real query.ts flow               */
/* ------------------------------------------------------------------ */

interface LoopStep {
  id: number;
  icon: string;
  title: string;
  enTitle: string;
  desc: string;
  enDesc: string;
  codeHint: string;
  /** 'branch' steps show a Yes/No fork */
  type: 'normal' | 'branch';
  branchYes?: string;
  enBranchYes?: string;
  branchNo?: string;
  enBranchNo?: string;
  /** Colour accent for the step */
  color: string;
}

const STEPS: LoopStep[] = [
  {
    id: 1,
    icon: '⌨️',
    title: '用户输入',
    enTitle: 'Input',
    desc: '用户输入通过 CLI 发送，调用 submitMessage() 启动一轮新的 query。',
    enDesc: 'User input is sent via the CLI, calling submitMessage() to start a new query turn.',
    codeHint: 'submitMessage()',
    type: 'normal',
    color: '#3b82f6',
  },
  {
    id: 2,
    icon: '📝',
    title: '构建消息数组',
    enTitle: 'Messages',
    desc: '将对话历史与新输入合并为 messages 数组，包含所有 user / assistant / tool_result 消息。',
    enDesc: 'Merge conversation history with new input into the messages array, containing all user / assistant / tool_result messages.',
    codeHint: 'messages: Message[]',
    type: 'normal',
    color: '#6366f1',
  },
  {
    id: 3,
    icon: '🧩',
    title: '装配系统提示词',
    enTitle: 'System Prompt',
    desc: '组装 system prompt：注入可用工具列表、CLAUDE.md 内容、memory 上下文和用户自定义指令。',
    enDesc: 'Assemble the system prompt: inject available tools list, CLAUDE.md contents, memory context, and user custom instructions.',
    codeHint: 'systemPrompt + tools + CLAUDE.md',
    type: 'normal',
    color: '#8b5cf6',
  },
  {
    id: 4,
    icon: '📡',
    title: 'API 请求',
    enTitle: 'API Call',
    desc: '将 messages + system prompt 发送到 Claude API，调用 createResponse() 发起流式请求。',
    enDesc: 'Send messages + system prompt to Claude API, calling createResponse() to initiate a streaming request.',
    codeHint: 'createResponse()',
    type: 'normal',
    color: '#a855f7',
  },
  {
    id: 5,
    icon: '⚡',
    title: '流式接收',
    enTitle: 'Streaming',
    desc: '通过 SSE 流式接收响应 tokens，逐步显示给用户。同时追踪 token 使用量。',
    enDesc: 'Receive response tokens via SSE streaming, progressively displaying to the user. Token usage is tracked simultaneously.',
    codeHint: 'yield streamEvent',
    type: 'normal',
    color: '#d946ef',
  },
  {
    id: 6,
    icon: '🔍',
    title: '解析响应',
    enTitle: 'Parse Response',
    desc: '解析 assistant 消息的 content blocks：可能是纯文本 (text)，也可能包含工具调用 (tool_use)。',
    enDesc: 'Parse the assistant message content blocks: may be plain text or contain tool_use blocks.',
    codeHint: 'content: text | tool_use[]',
    type: 'normal',
    color: '#ec4899',
  },
  {
    id: 7,
    icon: '🔀',
    title: '工具调用判断',
    enTitle: 'Tool Decision',
    desc: '检查响应中是否包含 tool_use block。如果有，继续执行工具；如果没有，准备结束本轮。',
    enDesc: 'Check if the response contains tool_use blocks. If yes, continue to execute tools; if no, prepare to end this turn.',
    codeHint: 'has tool_use?',
    type: 'branch',
    branchYes: '有 tool_use → 继续',
    enBranchYes: 'Has tool_use → Continue',
    branchNo: '无 tool_use → 结束',
    enBranchNo: 'No tool_use → End',
    color: '#f59e0b',
  },
  {
    id: 8,
    icon: '🔐',
    title: '权限检查',
    enTitle: 'Permission Check',
    desc: '对每个工具调用执行权限检查 canUseTool()：是否在白名单中？是否需要用户确认？',
    enDesc: 'Run permission check canUseTool() for each tool call: is it whitelisted? Does it need user confirmation?',
    codeHint: 'canUseTool()',
    type: 'normal',
    color: '#f97316',
  },
  {
    id: 9,
    icon: '⚙️',
    title: '执行工具',
    enTitle: 'Tool Execution',
    desc: '通过 runTools() 并行或串行执行工具（Read、Edit、Bash 等），收集每个工具的执行结果。',
    enDesc: 'Execute tools (Read, Edit, Bash, etc.) via runTools() in parallel or serial, collecting each tool result.',
    codeHint: 'runTools()',
    type: 'normal',
    color: '#ef4444',
  },
  {
    id: 10,
    icon: '💉',
    title: '结果注入',
    enTitle: 'Result Integration',
    desc: '将 tool_result 消息注入对话历史。每个 tool_use 都获得对应的 tool_result，形成完整的上下文。',
    enDesc: 'Inject tool_result messages into conversation history. Each tool_use gets its corresponding tool_result, forming complete context.',
    codeHint: 'messages.push(tool_result)',
    type: 'normal',
    color: '#22c55e',
  },
  {
    id: 11,
    icon: '🔄',
    title: '循环或终止',
    enTitle: 'Loop or Stop',
    desc: '检查终止条件：end_turn（模型主动结束）、max_tokens（上限）、budget（预算耗尽）、interrupt（用户中断）。',
    enDesc: 'Check termination conditions: end_turn (model ends), max_tokens (limit), budget (exhausted), interrupt (user cancel).',
    codeHint: 'end_turn | max_tokens | budget',
    type: 'branch',
    branchYes: '未终止 → 回到步骤 4',
    enBranchYes: 'Not terminated → Back to step 4',
    branchNo: '终止 → 返回结果',
    enBranchNo: 'Terminated → Return result',
    color: '#14b8a6',
  },
];

const SPEED_OPTIONS = [0.5, 1, 2] as const;
type Speed = (typeof SPEED_OPTIONS)[number];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AgenticLoopViz() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [hasCompleted, setHasCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = STEPS[currentStep];
  const total = STEPS.length;

  /* Auto-play -------------------------------------------------------- */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advance = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= total - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [total]);

  useEffect(() => {
    if (!isPlaying) {
      clearTimer();
      return;
    }
    const delay = 2200 / speed;
    timerRef.current = setTimeout(advance, delay);
    return clearTimer;
  }, [isPlaying, currentStep, speed, advance, clearTimer]);

  /* Scene completion ------------------------------------------------- */
  useEffect(() => {
    if (currentStep >= total - 1 && !hasCompleted) {
      setHasCompleted(true);
      sceneComplete?.();
    }
  }, [currentStep, total, hasCompleted, sceneComplete]);

  /* Navigation ------------------------------------------------------- */
  const goPrev = () => {
    setIsPlaying(false);
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const goNext = () => {
    setIsPlaying(false);
    setCurrentStep((s) => Math.min(total - 1, s + 1));
  };

  const togglePlay = () => {
    if (currentStep >= total - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  };

  const goToStep = (i: number) => {
    setIsPlaying(false);
    setCurrentStep(i);
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="alv" data-interactive>
      {/* ---- Progress dots ---- */}
      <div className="alv__progress">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            className={`alv__dot ${i === currentStep ? 'alv__dot--active' : ''} ${i < currentStep ? 'alv__dot--done' : ''}`}
            style={{
              '--dot-color': s.color,
            } as React.CSSProperties}
            onClick={() => goToStep(i)}
            title={`${s.id}. ${t(s.title, s.enTitle)}`}
          >
            <span className="alv__dot-num">{s.id}</span>
          </button>
        ))}
      </div>

      {/* ---- Step counter ---- */}
      <div className="alv__step-counter">
        {t(`步骤 ${step.id} / ${total}`, `Step ${step.id} / ${total}`)}
      </div>

      {/* ---- Main card ---- */}
      <div className="alv__card" style={{ '--step-color': step.color } as React.CSSProperties}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            className="alv__card-inner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Icon + title row */}
            <div className="alv__header">
              <motion.span
                className="alv__icon"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {step.icon}
              </motion.span>
              <div className="alv__titles">
                <span className="alv__step-num" style={{ color: step.color }}>
                  {String(step.id).padStart(2, '0')}
                </span>
                <h3 className="alv__title">{t(step.title, step.enTitle)}</h3>
              </div>
            </div>

            {/* Description */}
            <p className="alv__desc">{t(step.desc, step.enDesc)}</p>

            {/* Code hint */}
            <div className="alv__code">
              <code>{step.codeHint}</code>
            </div>

            {/* Branch visualization */}
            {step.type === 'branch' && (
              <div className="alv__branch">
                <div className="alv__branch-yes">
                  <span className="alv__branch-badge alv__branch-badge--yes">
                    {t('是', 'Yes')}
                  </span>
                  <span className="alv__branch-text">
                    {t(step.branchYes!, step.enBranchYes!)}
                  </span>
                </div>
                <div className="alv__branch-no">
                  <span className="alv__branch-badge alv__branch-badge--no">
                    {t('否', 'No')}
                  </span>
                  <span className="alv__branch-text">
                    {t(step.branchNo!, step.enBranchNo!)}
                  </span>
                </div>
              </div>
            )}

            {/* Animated flow indicator */}
            <div className="alv__flow">
              {currentStep < total - 1 ? (
                <motion.div
                  className="alv__flow-arrow"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  style={{ color: step.color }}
                >
                  ↓
                </motion.div>
              ) : (
                <motion.div
                  className="alv__flow-end"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {t('✅ 流程结束', '✅ Flow Complete')}
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---- Playback controls ---- */}
      <div className="alv__controls">
        <button
          className="alv__ctrl-btn"
          onClick={goPrev}
          disabled={currentStep === 0}
          title={t('上一步', 'Previous')}
        >
          ◀
        </button>

        <button
          className="alv__ctrl-btn alv__ctrl-btn--play"
          onClick={togglePlay}
          title={isPlaying ? t('暂停', 'Pause') : t('播放', 'Play')}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          className="alv__ctrl-btn"
          onClick={goNext}
          disabled={currentStep >= total - 1}
          title={t('下一步', 'Next')}
        >
          ▶
        </button>

        <div className="alv__speed">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              className={`alv__speed-btn ${speed === s ? 'alv__speed-btn--active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* ---- Loop indicator ---- */}
      {currentStep >= total - 1 && (
        <motion.div
          className="alv__replay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            className="alv__replay-btn"
            onClick={() => {
              setCurrentStep(0);
              setIsPlaying(false);
            }}
          >
            {t('↺ 重新观看', '↺ Replay')}
          </button>
        </motion.div>
      )}
    </div>
  );
}
