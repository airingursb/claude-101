import { useState } from 'react';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

interface HookEvent {
  id: string;
  name: string;
  label: string;
  description: string;
  example: string;
  color: string;
  position: number;
}

export default function HookLifecycle() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [viewedEvents, setViewedEvents] = useState<Set<string>>(new Set());

  const hookEvents: HookEvent[] = [
    {
      id: 'session-start',
      name: 'SessionStart',
      label: t('会话开始', 'Session Start'),
      description: t(
        '当 Claude Code 启动一个新会话时触发。适合加载环境变量、初始化工具、检查依赖。',
        'Triggered when Claude Code starts a new session. Ideal for loading environment variables, initializing tools, and checking dependencies.'
      ),
      example: `// .claude/settings.json
{
  "hooks": {
    "SessionStart": [{
      "type": "command",
      "command": "source .env && echo 'Environment loaded'"
    }]
  }
}`,
      color: '#3b82f6',
      position: 0,
    },
    {
      id: 'prompt-submit',
      name: 'UserPromptSubmit',
      label: t('用户提交 Prompt', 'User Submits Prompt'),
      description: t(
        '当用户提交 prompt 后触发。可以用来记录日志、添加上下文、审查输入。',
        'Triggered after a user submits a prompt. Can be used for logging, adding context, or reviewing input.'
      ),
      example: `{
  "hooks": {
    "UserPromptSubmit": [{
      "type": "command",
      "command": "echo \\"$(date): $PROMPT\\" >> .claude/prompt.log"
    }]
  }
}`,
      color: '#8b5cf6',
      position: 1,
    },
    {
      id: 'pre-tool',
      name: 'PreToolUse',
      label: t('工具调用前', 'Before Tool Use'),
      description: t(
        '在 AI 调用任何工具之前触发。可以拦截危险操作（返回 deny）、自动批准安全操作（返回 approve）、修改参数。',
        'Triggered before the AI calls any tool. Can intercept dangerous operations (return deny), auto-approve safe operations (return approve), or modify parameters.'
      ),
      example: `{
  "hooks": {
    "PreToolUse": [{
      "type": "command",
      "command": "if [ \\"$TOOL_NAME\\" = 'Bash' ]; then echo '{\\"decision\\": \\"deny\\", \\"reason\\": \\"Bash disabled\\"}'; fi",
      "matcher": "Bash"
    }]
  }
}`,
      color: '#ef4444',
      position: 2,
    },
    {
      id: 'post-tool',
      name: 'PostToolUse',
      label: t('工具调用后', 'After Tool Use'),
      description: t(
        '在工具执行完毕后触发。适合自动格式化代码、跑 lint、发送通知。',
        'Triggered after a tool finishes execution. Ideal for auto-formatting code, running lint, or sending notifications.'
      ),
      example: `{
  "hooks": {
    "PostToolUse": [{
      "type": "command",
      "command": "npx prettier --write $FILE_PATH",
      "matcher": "Write"
    }]
  }
}`,
      color: '#10b981',
      position: 3,
    },
    {
      id: 'stop',
      name: 'Stop',
      label: t('回复结束', 'Response Complete'),
      description: t(
        '当 AI 完成一轮回复后触发。适合自动跑测试、生成报告、提交代码。',
        'Triggered when the AI finishes a response. Ideal for auto-running tests, generating reports, or committing code.'
      ),
      example: `{
  "hooks": {
    "Stop": [{
      "type": "command",
      "command": "npm test -- --changed"
    }]
  }
}`,
      color: '#f59e0b',
      position: 4,
    },
  ];

  const handleSelect = (eventId: string) => {
    setSelectedEvent(selectedEvent === eventId ? null : eventId);
    setViewedEvents((prev) => {
      const next = new Set(prev);
      next.add(eventId);
      if (next.size >= 3 && sceneComplete) {
        sceneComplete();
      }
      return next;
    });
  };

  const selected = hookEvents.find((e) => e.id === selectedEvent);

  return (
    <div className="hook-lifecycle scene-dark-interactive" data-interactive>
      <div className="hook-lifecycle__hint">{t(
        '点击时间线上的事件，查看可以挂载的 Hook',
        'Click events on the timeline to see available Hook mount points'
      )}</div>

      <div className="hook-lifecycle__timeline">
        <div className="hook-lifecycle__timeline-line" />

        {hookEvents.map((event) => {
          const isActive = selectedEvent === event.id;
          const isViewed = viewedEvents.has(event.id);
          return (
            <div
              key={event.id}
              className={`hook-lifecycle__event ${isActive ? 'hook-lifecycle__event--active' : ''}`}
              onClick={() => handleSelect(event.id)}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="hook-lifecycle__event-node"
                style={{
                  background: isActive || isViewed ? event.color : 'var(--color-bg-secondary)',
                  borderColor: event.color,
                  boxShadow: isActive ? `0 0 12px ${event.color}40` : 'none',
                }}
              />
              <div className="hook-lifecycle__event-label">
                <div
                  className="hook-lifecycle__event-name"
                  style={{ color: isActive ? event.color : 'var(--color-text)' }}
                >
                  {event.name}
                </div>
                <div className="hook-lifecycle__event-sublabel">{event.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bracket visualization for tool loop */}
      <div className="hook-lifecycle__bracket-hint">
        <span style={{ color: '#ef4444' }}>PreToolUse</span>
        {' → Tool Execution → '}
        <span style={{ color: '#10b981' }}>PostToolUse</span>
        {'  '}
        <span style={{ color: 'var(--color-text-muted)' }}>{t('（每次工具调用都循环）', '(loops for every tool call)')}</span>
      </div>

      {selected && (
        <div
          className="hook-lifecycle__detail"
          style={{ borderColor: selected.color + '40' }}
        >
          <div className="hook-lifecycle__detail-header">
            <div className="hook-lifecycle__detail-dot" style={{ background: selected.color }} />
            <div className="hook-lifecycle__detail-title">{selected.name}</div>
            <div className="hook-lifecycle__detail-label">{selected.label}</div>
          </div>
          <div className="hook-lifecycle__detail-desc">{selected.description}</div>
          <div className="hook-lifecycle__detail-example">
            <div className="hook-lifecycle__detail-example-label">{t('配置示例', 'Configuration Example')}</div>
            <pre className="hook-lifecycle__detail-example-code">{selected.example}</pre>
          </div>
        </div>
      )}

      {viewedEvents.size > 0 && (
        <div className="hook-lifecycle__progress">
          {t(
            <>已探索 {viewedEvents.size}/{hookEvents.length} 个事件{viewedEvents.size >= 3 && ' —— 你已经掌握了 Hook 生命周期的核心！'}</>,
            <>Explored {viewedEvents.size}/{hookEvents.length} events{viewedEvents.size >= 3 && ' — You\'ve mastered the core of the Hook lifecycle!'}</>
          )}
        </div>
      )}
    </div>
  );
}
