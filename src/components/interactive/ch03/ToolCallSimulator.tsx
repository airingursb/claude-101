import { useState, useEffect, useRef, useCallback } from 'react';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

interface SimStep {
  phase: 'think' | 'construct' | 'execute' | 'result';
  label: string;
  content: string;
}

interface Task {
  id: string;
  label: string;
  icon: string;
  steps: SimStep[];
}

export default function ToolCallSimulator() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [hasCompleted, setHasCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tasks: Task[] = [
    {
      id: 'read',
      label: t('读取文件', 'Read File'),
      icon: '📖',
      steps: [
        { phase: 'think', label: t('思考', 'Think'), content: t('用户想了解 auth.ts 的代码。我需要用 Read 工具读取这个文件。', 'The user wants to see the auth.ts code. I need to use the Read tool to read this file.') },
        { phase: 'construct', label: t('构造请求', 'Construct Request'), content: '{\n  "tool": "Read",\n  "parameters": {\n    "file_path": "src/auth.ts"\n  }\n}' },
        { phase: 'execute', label: t('执行中…', 'Executing...'), content: t('⏳ 读取文件 src/auth.ts …', '⏳ Reading file src/auth.ts ...') },
        { phase: 'result', label: t('获得结果', 'Got Result'), content: t('📄 成功读取 src/auth.ts (128 行)\n\nexport async function login() {\n  const token = getToken();\n  return token;\n}', '📄 Successfully read src/auth.ts (128 lines)\n\nexport async function login() {\n  const token = getToken();\n  return token;\n}') },
      ],
    },
    {
      id: 'search',
      label: t('搜索代码', 'Search Code'),
      icon: '🔎',
      steps: [
        { phase: 'think', label: t('思考', 'Think'), content: t('需要找到所有使用 token 的地方。Grep 工具可以搜索文件内容。', 'I need to find everywhere token is used. The Grep tool can search file contents.') },
        { phase: 'construct', label: t('构造请求', 'Construct Request'), content: '{\n  "tool": "Grep",\n  "parameters": {\n    "pattern": "token",\n    "glob": "src/**/*.ts"\n  }\n}' },
        { phase: 'execute', label: t('执行中…', 'Executing...'), content: t('⏳ 在 src/**/*.ts 中搜索 "token" …', '⏳ Searching for "token" in src/**/*.ts ...') },
        { phase: 'result', label: t('获得结果', 'Got Result'), content: t('🔎 在 5 个文件中找到 12 处匹配：\n\nsrc/auth.ts:12  const token = getToken();\nsrc/auth.ts:28  validateToken(token);\nsrc/api.ts:5    headers.set("token", t);', '🔎 Found 12 matches in 5 files:\n\nsrc/auth.ts:12  const token = getToken();\nsrc/auth.ts:28  validateToken(token);\nsrc/api.ts:5    headers.set("token", t);') },
      ],
    },
    {
      id: 'edit',
      label: t('修改函数', 'Edit Function'),
      icon: '🔧',
      steps: [
        { phase: 'think', label: t('思考', 'Think'), content: t('login 函数缺少 token 过期检查。我要用 Edit 工具精确替换那段代码。', 'The login function is missing a token expiry check. I\'ll use the Edit tool to precisely replace that code.') },
        { phase: 'construct', label: t('构造请求', 'Construct Request'), content: '{\n  "tool": "Edit",\n  "parameters": {\n    "file_path": "src/auth.ts",\n    "old_string": "const token = getToken();\\n  return token;",\n    "new_string": "const token = getToken();\\n  if (isExpired(token)) {\\n    throw new Error(\\"Token expired\\");\\n  }\\n  return token;"\n  }\n}' },
        { phase: 'execute', label: t('执行中…', 'Executing...'), content: t('⏳ 编辑 src/auth.ts …', '⏳ Editing src/auth.ts ...') },
        { phase: 'result', label: t('获得结果', 'Got Result'), content: t('✅ 已替换 src/auth.ts 中的 1 处匹配\n\n添加了 token 过期检查逻辑。', '✅ Replaced 1 match in src/auth.ts\n\nAdded token expiry check logic.') },
      ],
    },
  ];

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleSelectTask = (taskId: string) => {
    cleanup();
    setSelectedTaskId(taskId);
    setCurrentStep(0);
    setIsAnimating(false);
  };

  const handleTaskComplete = useCallback((taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      next.add(taskId);

      if (next.size >= 2 && !hasCompleted) {
        setHasCompleted(true);
        setTimeout(() => {
          if (sceneComplete) sceneComplete();
        }, 0);
      }

      return next;
    });
  }, [hasCompleted, sceneComplete]);

  const handleNextStep = () => {
    if (!selectedTask) return;

    if (currentStep < selectedTask.steps.length - 1) {
      if (selectedTask.steps[currentStep + 1].phase === 'execute') {
        const taskId = selectedTask.id;
        const totalSteps = selectedTask.steps.length;
        setCurrentStep((s) => s + 1);
        setIsAnimating(true);
        timerRef.current = setTimeout(() => {
          setCurrentStep((s) => {
            const newStep = s + 1;
            // If this is the last step, mark task as complete
            if (newStep >= totalSteps - 1) {
              handleTaskComplete(taskId);
            }
            return newStep;
          });
          setIsAnimating(false);
        }, 1200);
      } else {
        setCurrentStep((s) => s + 1);
      }
    } else {
      // Task finished (user clicked manually)
      handleTaskComplete(selectedTask.id);
    }
  };

  const phaseColors: Record<string, string> = {
    think: '#a78bfa',
    construct: '#60a5fa',
    execute: '#fbbf24',
    result: '#34d399',
  };

  const phaseIcons: Record<string, string> = {
    think: '🧠',
    construct: '🔨',
    execute: '⚡',
    result: '📋',
  };

  return (
    <div className="tool-sim" data-interactive>
      {/* Task selector */}
      <div className="tool-sim__tasks">
        <div className="tool-sim__tasks-label">{t('选择一个任务：', 'Choose a task:')}</div>
        <div className="tool-sim__tasks-list">
          {tasks.map((task) => (
            <button
              key={task.id}
              className={`tool-sim__task-btn ${selectedTaskId === task.id ? 'tool-sim__task-btn--active' : ''} ${completedTasks.has(task.id) ? 'tool-sim__task-btn--done' : ''}`}
              onClick={() => handleSelectTask(task.id)}
            >
              <span className="tool-sim__task-icon">{task.icon}</span>
              <span className="tool-sim__task-label">{task.label}</span>
              {completedTasks.has(task.id) && <span className="tool-sim__task-check">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Simulation */}
      {selectedTask ? (
        <div className="tool-sim__simulation">
          {/* Progress bar */}
          <div className="tool-sim__progress">
            {selectedTask.steps.map((step, i) => (
              <div
                key={i}
                className={`tool-sim__progress-dot ${i <= currentStep ? 'tool-sim__progress-dot--active' : ''}`}
                style={{ borderColor: i <= currentStep ? phaseColors[step.phase] : undefined }}
              >
                <span className="tool-sim__progress-icon">{phaseIcons[step.phase]}</span>
                <span className="tool-sim__progress-label">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Current step display */}
          <div
            className="tool-sim__step"
            style={{ borderColor: phaseColors[selectedTask.steps[currentStep].phase] }}
          >
            <div className="tool-sim__step-header">
              <span className="tool-sim__step-icon">
                {phaseIcons[selectedTask.steps[currentStep].phase]}
              </span>
              <span
                className="tool-sim__step-phase"
                style={{ color: phaseColors[selectedTask.steps[currentStep].phase] }}
              >
                {selectedTask.steps[currentStep].label}
              </span>
            </div>
            <pre className="tool-sim__step-content">
              {selectedTask.steps[currentStep].content}
            </pre>
          </div>

          {/* Action button */}
          <div className="tool-sim__actions">
            {currentStep < selectedTask.steps.length - 1 ? (
              <button
                className="tool-sim__next-btn"
                onClick={handleNextStep}
                disabled={isAnimating}
              >
                {isAnimating ? t('执行中…', 'Executing...') : t('下一步 →', 'Next Step →')}
              </button>
            ) : (
              <div className="tool-sim__done">
                {t('✅ 工具调用完成！', '✅ Tool call complete!')}
                {completedTasks.size < 2 && (
                  <span className="tool-sim__done-hint">{t('试试其他任务吧', 'Try another task')}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="tool-sim__placeholder">
          {t('← 选择一个任务，看 AI 如何构造和执行工具调用', '← Choose a task to see how the AI constructs and executes tool calls')}
        </div>
      )}
    </div>
  );
}
