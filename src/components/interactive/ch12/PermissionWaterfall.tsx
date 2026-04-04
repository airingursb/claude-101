import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

/* ------------------------------------------------------------------ */
/*  Stage definitions — the 5-step permission waterfall                */
/* ------------------------------------------------------------------ */

interface Stage {
  id: number;
  name: string;
  enName: string;
  desc: string;
  enDesc: string;
  sourceRef: string;
}

const STAGES: Stage[] = [
  {
    id: 1,
    name: 'Always-Deny 规则',
    enName: 'Always-Deny Rules',
    desc: '检查 alwaysDenyRules —— 匹配即拒绝',
    enDesc: 'Check alwaysDenyRules — match means denied',
    sourceRef: 'permissions.ts',
  },
  {
    id: 2,
    name: 'Always-Allow 规则',
    enName: 'Always-Allow Rules',
    desc: '检查 alwaysAllowRules —— 匹配即放行',
    enDesc: 'Check alwaysAllowRules — match means allowed',
    sourceRef: 'permissions.ts',
  },
  {
    id: 3,
    name: '工具校验',
    enName: 'Tool Validation',
    desc: 'tool.validateInput() 校验参数合法性',
    enDesc: 'tool.validateInput() validates input legality',
    sourceRef: 'Tool.ts',
  },
  {
    id: 4,
    name: '转录分类器',
    enName: 'Transcript Classifier',
    desc: 'LLM 安全检查（仅自动模式）',
    enDesc: 'LLM-based safety check (auto mode only)',
    sourceRef: 'Transcript classifier',
  },
  {
    id: 5,
    name: '用户确认',
    enName: 'User Prompt',
    desc: '询问用户是否授权',
    enDesc: 'Ask user for permission',
    sourceRef: 'useCanUseTool.ts',
  },
];

/* ------------------------------------------------------------------ */
/*  Scenario definitions                                               */
/* ------------------------------------------------------------------ */

type StageOutcome = 'pass' | 'allow' | 'deny';

interface Scenario {
  id: string;
  toolCall: string;
  label: string;
  enLabel: string;
  /** outcome for each stage (indexed 0–4). null = not reached */
  outcomes: (StageOutcome | null)[];
  /** Index of the stage where the final decision is made (0-based) */
  decisionStage: number;
  finalResult: 'ALLOWED' | 'DENIED';
}

const SCENARIOS: Scenario[] = [
  {
    id: 'npm-test',
    toolCall: 'Bash("npm run test")',
    label: 'npm run test',
    enLabel: 'npm run test',
    outcomes: ['pass', 'allow', null, null, null],
    decisionStage: 1,
    finalResult: 'ALLOWED',
  },
  {
    id: 'rm-rf',
    toolCall: 'Bash("rm -rf /")',
    label: 'rm -rf /',
    enLabel: 'rm -rf /',
    outcomes: ['deny', null, null, null, null],
    decisionStage: 0,
    finalResult: 'DENIED',
  },
  {
    id: 'git-push',
    toolCall: 'Bash("git push origin main")',
    label: 'git push origin main',
    enLabel: 'git push origin main',
    outcomes: ['pass', 'pass', 'pass', 'pass', 'allow'],
    decisionStage: 4,
    finalResult: 'ALLOWED',
  },
  {
    id: 'edit-file',
    toolCall: 'Edit("src/app.ts")',
    label: 'Edit src/app.ts',
    enLabel: 'Edit src/app.ts',
    outcomes: ['pass', 'allow', null, null, null],
    decisionStage: 1,
    finalResult: 'ALLOWED',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const STAGE_DELAY = 400; // ms per stage

export default function PermissionWaterfall() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState(-1); // -1 = idle
  const [animating, setAnimating] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === selectedId) ?? null;

  // Trigger scene complete after first full interaction
  useEffect(() => {
    if (hasInteracted && sceneComplete) {
      sceneComplete();
    }
  }, [hasInteracted, sceneComplete]);

  const runScenario = useCallback(
    (id: string) => {
      if (animating) return;
      const sc = SCENARIOS.find((s) => s.id === id)!;
      setSelectedId(id);
      setActiveStage(-1);
      setAnimating(true);

      // Animate through each stage
      const totalStages = sc.decisionStage + 1;
      for (let i = 0; i < totalStages; i++) {
        setTimeout(() => {
          setActiveStage(i);
          if (i === sc.decisionStage) {
            setTimeout(() => {
              setAnimating(false);
              setHasInteracted(true);
            }, STAGE_DELAY);
          }
        }, (i + 1) * STAGE_DELAY);
      }
    },
    [animating]
  );

  const getStageStatus = (idx: number): 'idle' | 'active' | 'pass' | 'allow' | 'deny' => {
    if (!scenario) return 'idle';
    if (idx > activeStage) return 'idle';
    if (idx === activeStage && animating && idx === scenario.decisionStage) {
      const outcome = scenario.outcomes[idx];
      return outcome === 'deny' ? 'deny' : outcome === 'allow' ? 'allow' : 'pass';
    }
    if (idx < activeStage) {
      return scenario.outcomes[idx] ?? 'idle';
    }
    if (idx === activeStage && !animating) {
      return scenario.outcomes[idx] ?? 'idle';
    }
    return 'active';
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'var(--color-text-muted)';
      case 'allow':
        return '#22c55e';
      case 'deny':
        return '#ef4444';
      case 'active':
        return 'var(--color-accent, #a78bfa)';
      default:
        return 'var(--color-border)';
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return '\u2193'; // down arrow
      case 'allow':
        return '\u2713'; // check
      case 'deny':
        return '\u2717'; // cross
      case 'active':
        return '\u25CF'; // filled circle
      default:
        return '\u25CB'; // empty circle
    }
  };

  return (
    <div className="perm-waterfall scene-dark-interactive" data-interactive>
      {/* Scenario selector */}
      <div className="perm-waterfall__scenarios">
        <div className="perm-waterfall__scenarios-label">
          {t('选择场景', 'Choose a scenario')}
        </div>
        <div className="perm-waterfall__scenario-btns">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              className={`perm-waterfall__scenario-btn ${selectedId === sc.id ? 'perm-waterfall__scenario-btn--active' : ''}`}
              onClick={() => runScenario(sc.id)}
              disabled={animating}
            >
              <code>{t(sc.label, sc.enLabel)}</code>
            </button>
          ))}
        </div>
      </div>

      {/* Main layout: request card + waterfall */}
      <div className="perm-waterfall__layout">
        {/* Request card */}
        <div className="perm-waterfall__request">
          <div className="perm-waterfall__request-title">
            {t('工具调用', 'Tool Call')}
          </div>
          <AnimatePresence mode="wait">
            {scenario ? (
              <motion.div
                key={scenario.id}
                className="perm-waterfall__request-code"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <code>{scenario.toolCall}</code>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="perm-waterfall__request-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {t('点击上方场景开始', 'Click a scenario above to start')}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result badge */}
          <AnimatePresence>
            {scenario && !animating && (
              <motion.div
                className={`perm-waterfall__result perm-waterfall__result--${scenario.finalResult === 'ALLOWED' ? 'allow' : 'deny'}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {scenario.finalResult === 'ALLOWED'
                  ? t('已放行', 'ALLOWED')
                  : t('已拒绝', 'DENIED')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Waterfall stages */}
        <div className="perm-waterfall__stages">
          {STAGES.map((stage, idx) => {
            const status = getStageStatus(idx);
            const isDecision = scenario && idx === scenario.decisionStage && !animating && selectedId;
            const reached = scenario && idx <= (scenario?.decisionStage ?? -1);

            return (
              <div key={stage.id} className="perm-waterfall__stage-wrapper">
                {/* Connector arrow */}
                {idx > 0 && (
                  <div
                    className="perm-waterfall__connector"
                    style={{
                      borderColor:
                        status !== 'idle'
                          ? statusColor(status)
                          : 'var(--color-border)',
                    }}
                  />
                )}

                {/* Stage card */}
                <motion.div
                  className={`perm-waterfall__stage ${status !== 'idle' ? `perm-waterfall__stage--${status}` : ''}`}
                  animate={{
                    borderColor: statusColor(status),
                    opacity: !scenario || reached ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="perm-waterfall__stage-header">
                    <span
                      className="perm-waterfall__stage-icon"
                      style={{ color: statusColor(status) }}
                    >
                      {statusIcon(status)}
                    </span>
                    <span className="perm-waterfall__stage-name">
                      {t(stage.name, stage.enName)}
                    </span>
                    <span className="perm-waterfall__stage-num">#{stage.id}</span>
                  </div>

                  <div className="perm-waterfall__stage-desc">
                    {t(stage.desc, stage.enDesc)}
                  </div>

                  {/* Decision label */}
                  <AnimatePresence>
                    {isDecision && (
                      <motion.div
                        className={`perm-waterfall__stage-verdict perm-waterfall__stage-verdict--${status}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {status === 'allow'
                          ? t('ALLOWED', 'ALLOWED')
                          : status === 'deny'
                            ? t('DENIED', 'DENIED')
                            : t('PASS', 'PASS')}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="perm-waterfall__stage-ref">
                    {stage.sourceRef}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
