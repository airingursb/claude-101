import { useState, useEffect } from 'react';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  label: string;
}

const roleColors: Record<string, { bg: string; border: string; dot: string }> = {
  system: { bg: 'rgba(234, 179, 8, 0.08)', border: 'rgba(234, 179, 8, 0.3)', dot: '#eab308' },
  user: { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.3)', dot: '#3b82f6' },
  assistant: { bg: 'rgba(124, 58, 237, 0.08)', border: 'rgba(124, 58, 237, 0.3)', dot: '#7c3aed' },
};

const roleIcons: Record<string, string> = {
  system: '⚙️',
  user: '👤',
  assistant: '🤖',
};

export default function MessageStructure() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(0);

  const messages: Message[] = [
    {
      role: 'system',
      content: t('你是一个友好的编程助手，擅长 TypeScript。', 'You are a friendly coding assistant who specializes in TypeScript.'),
      label: t('系统指令', 'System Instruction'),
    },
    {
      role: 'user',
      content: t('帮我写一个排序函数', 'Write me a sorting function'),
      label: t('用户消息', 'User Message'),
    },
    {
      role: 'assistant',
      content: t('好的！这是一个 TypeScript 排序函数...', 'Sure! Here\'s a TypeScript sorting function...'),
      label: t('AI 回复', 'AI Response'),
    },
  ];

  useEffect(() => {
    if (visibleCount >= messages.length && sceneComplete) {
      sceneComplete();
    }
  }, [visibleCount, messages.length, sceneComplete]);

  const handleAdd = () => {
    if (visibleCount < messages.length) {
      setVisibleCount((c) => c + 1);
    }
  };

  const handleReset = () => {
    setVisibleCount(0);
  };

  return (
    <div className="msg-structure scene-dark-interactive" data-interactive>
      <div className="msg-structure__container">
        <div className="msg-structure__bracket">[</div>

        {messages.map((msg, i) => {
          const colors = roleColors[msg.role];
          const visible = i < visibleCount;
          return (
            <div
              key={i}
              className="msg-structure__item"
              style={{
                opacity: visible ? 1 : 0.15,
                transform: visible ? 'translateY(0)' : 'translateY(8px)',
                transition: 'all 0.4s ease',
                background: visible ? colors.bg : 'transparent',
                borderColor: visible ? colors.border : 'var(--color-border)',
              }}
            >
              <div className="msg-structure__item-header">
                <span className="msg-structure__icon">{roleIcons[msg.role]}</span>
                <span
                  className="msg-structure__role"
                  style={{ color: visible ? colors.dot : 'var(--color-text-muted)' }}
                >
                  {msg.role}
                </span>
                <span className="msg-structure__label">{msg.label}</span>
              </div>
              <div className="msg-structure__content">"{msg.content}"</div>
            </div>
          );
        })}

        <div className="msg-structure__bracket">]</div>
      </div>

      <div className="msg-structure__actions">
        {visibleCount < messages.length ? (
          <button className="msg-structure__btn" onClick={handleAdd}>
            {t(`+ 添加 ${messages[visibleCount].label}`, `+ Add ${messages[visibleCount].label}`)}
          </button>
        ) : (
          <button className="msg-structure__btn msg-structure__btn--reset" onClick={handleReset}>
            {t('↺ 重新开始', '↺ Start Over')}
          </button>
        )}
      </div>

      {visibleCount > 0 && (
        <div className="msg-structure__hint">
          {visibleCount === 1 && t(
            'System prompt 是 AI 的「出厂设置」——用户看不到，但它决定了 AI 的行为。',
            'The system prompt is the AI\'s "factory settings" — invisible to the user, but it determines the AI\'s behavior.'
          )}
          {visibleCount === 2 && t(
            '用户的消息来了——这就是你收到的 prompt。',
            'The user\'s message arrives — this is the prompt you receive.'
          )}
          {visibleCount === 3 && t(
            'AI 的回复也是数组中的一条消息。每轮对话，数组不断增长。',
            'The AI\'s response is also a message in the array. With each turn, the array keeps growing.'
          )}
        </div>
      )}
    </div>
  );
}
