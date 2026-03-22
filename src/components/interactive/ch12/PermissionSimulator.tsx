import { useState, useEffect } from 'react';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

interface ToolCall {
  id: string;
  tool: string;
  action: string;
  detail: string;
  risk: 'safe' | 'medium' | 'dangerous';
  autoAllowed: boolean;
  recommended: 'allow' | 'deny' | 'allow-always';
  explanation: string;
}

type Decision = 'allow' | 'deny' | 'allow-always';

export default function PermissionSimulator() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const toolCalls: ToolCall[] = [
    {
      id: 'read',
      tool: 'Read',
      action: t('读取 src/auth.ts', 'Read src/auth.ts'),
      detail: 'Read("src/auth.ts")',
      risk: 'safe',
      autoAllowed: true,
      recommended: 'allow',
      explanation: t(
        '只读操作，不会修改任何文件。自动放行。',
        'Read-only operation, will not modify any files. Auto-approved.'
      ),
    },
    {
      id: 'edit',
      tool: 'Edit',
      action: t('编辑 src/auth.ts 第 42 行', 'Edit src/auth.ts line 42'),
      detail: t(
        'Edit("src/auth.ts", line 42, "添加 token 验证")',
        'Edit("src/auth.ts", line 42, "add token validation")'
      ),
      risk: 'medium',
      autoAllowed: false,
      recommended: 'allow',
      explanation: t(
        '文件编辑操作。需要确认——检查修改内容是否合理。',
        'File edit operation. Requires confirmation—check if the changes are reasonable.'
      ),
    },
    {
      id: 'bash-danger',
      tool: 'Bash',
      action: t('执行 rm -rf node_modules/', 'Execute rm -rf node_modules/'),
      detail: 'Bash("rm -rf node_modules/")',
      risk: 'dangerous',
      autoAllowed: false,
      recommended: 'deny',
      explanation: t(
        '危险的删除操作！虽然删除 node_modules 通常无害，但 rm -rf 模式应该被拒绝。',
        'Dangerous delete operation! While deleting node_modules is usually harmless, the rm -rf pattern should be denied.'
      ),
    },
    {
      id: 'mcp',
      tool: 'MCP',
      action: t('查询数据库用户表', 'Query database user table'),
      detail: 'mcp__database__query("SELECT * FROM users LIMIT 10")',
      risk: 'medium',
      autoAllowed: false,
      recommended: 'allow',
      explanation: t(
        'MCP 调用访问外部服务。需要确认——检查是否在授权范围内。',
        'MCP call accessing an external service. Requires confirmation—check if it is within authorized scope.'
      ),
    },
    {
      id: 'subagent',
      tool: 'Subagent',
      action: t('派遣子代理执行代码重构', 'Dispatch subagent for code refactoring'),
      detail: 'Subagent("refactor", { tools: ["edit", "bash"] })',
      risk: 'medium',
      autoAllowed: false,
      recommended: 'allow-always',
      explanation: t(
        '子代理派遣。子代理会继承你授予的权限，但在独立的 context 中运行。',
        'Subagent dispatch. The subagent inherits the permissions you grant, but runs in an independent context.'
      ),
    },
  ];

  const currentCall = toolCalls[currentIndex];
  const isAutoAllowed = currentCall?.autoAllowed;

  useEffect(() => {
    if (allDone && sceneComplete) {
      sceneComplete();
    }
  }, [allDone, sceneComplete]);

  useEffect(() => {
    const call = toolCalls[currentIndex];
    if (call?.autoAllowed) {
      setDecisions((prev) => ({ ...prev, [call.id]: 'allow' }));
      setShowFeedback(true);
      const timer = setTimeout(() => {
        setShowFeedback(false);
        if (currentIndex < toolCalls.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          setAllDone(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const makeDecision = (decision: Decision) => {
    setDecisions((prev) => ({ ...prev, [currentCall.id]: decision }));
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      if (currentIndex < toolCalls.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setAllDone(true);
      }
    }, 2000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'safe': return 'var(--color-green, #22c55e)';
      case 'medium': return 'var(--color-yellow, #eab308)';
      case 'dangerous': return 'var(--color-red, #ef4444)';
      default: return 'var(--color-text-muted)';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'safe': return t('安全', 'Safe');
      case 'medium': return t('需审核', 'Review');
      case 'dangerous': return t('危险', 'Danger');
      default: return '';
    }
  };

  const getDecisionLabel = (decision: Decision) => {
    switch (decision) {
      case 'allow': return t('允许', 'Allow');
      case 'deny': return t('拒绝', 'Deny');
      case 'allow-always': return t('始终允许', 'Always Allow');
    }
  };

  if (allDone) {
    const correct = toolCalls.filter((tc) => decisions[tc.id] === tc.recommended).length;
    return (
      <div className="perm-sim scene-dark-interactive" data-interactive>
        <div className="perm-sim__summary">
          <div className="perm-sim__summary-title">{t('审核完成', 'Review Complete')}</div>
          <div className="perm-sim__summary-score">
            {t(
              `${correct} / ${toolCalls.length} 个判断与建议一致`,
              `${correct} / ${toolCalls.length} decisions match recommendations`
            )}
          </div>
          <div className="perm-sim__summary-list">
            {toolCalls.map((tc) => {
              const decision = decisions[tc.id];
              const isCorrect = decision === tc.recommended;
              return (
                <div key={tc.id} className="perm-sim__summary-item">
                  <span className="perm-sim__summary-icon">
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <span className="perm-sim__summary-action">{tc.action}</span>
                  <span className="perm-sim__summary-decision">
                    {t('你', 'You')}: {getDecisionLabel(decision)}
                  </span>
                  {!isCorrect && (
                    <span className="perm-sim__summary-hint">
                      {t('建议', 'Recommended')}: {getDecisionLabel(tc.recommended)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="perm-sim scene-dark-interactive" data-interactive>
      <div className="perm-sim__progress">
        {currentIndex + 1} / {toolCalls.length}
      </div>

      <div className="perm-sim__card">
        <div className="perm-sim__card-header">
          <span
            className="perm-sim__risk-badge"
            style={{
              background: getRiskColor(currentCall.risk),
              color: '#000',
            }}
          >
            {getRiskLabel(currentCall.risk)}
          </span>
          <span className="perm-sim__tool-name">{currentCall.tool}</span>
        </div>

        <div className="perm-sim__action">{currentCall.action}</div>

        <div className="perm-sim__detail">
          <code>{currentCall.detail}</code>
        </div>

        {isAutoAllowed && (
          <div className="perm-sim__auto">
            {t('自动放行 — 只读操作无需确认', 'Auto-approved — read-only operations need no confirmation')}
          </div>
        )}

        {!isAutoAllowed && !showFeedback && (
          <div className="perm-sim__buttons">
            <button
              className="perm-sim__btn perm-sim__btn--allow"
              onClick={() => makeDecision('allow')}
            >
              {t('允许', 'Allow')}
            </button>
            <button
              className="perm-sim__btn perm-sim__btn--deny"
              onClick={() => makeDecision('deny')}
            >
              {t('拒绝', 'Deny')}
            </button>
            <button
              className="perm-sim__btn perm-sim__btn--always"
              onClick={() => makeDecision('allow-always')}
            >
              {t('始终允许', 'Always Allow')}
            </button>
          </div>
        )}

        {showFeedback && (
          <div className="perm-sim__feedback">
            <p className="perm-sim__feedback-text">{currentCall.explanation}</p>
          </div>
        )}
      </div>

      <div className="perm-sim__history">
        {toolCalls.slice(0, currentIndex).map((tc) => (
          <div key={tc.id} className="perm-sim__history-item">
            <span
              className="perm-sim__history-dot"
              style={{ background: getRiskColor(tc.risk) }}
            />
            <span className="perm-sim__history-action">{tc.action}</span>
            <span className="perm-sim__history-decision">
              {decisions[tc.id] === 'allow' ? t('✓ 允许', '✓ Allow') : decisions[tc.id] === 'deny' ? t('✗ 拒绝', '✗ Deny') : t('✓ 始终允许', '✓ Always Allow')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
