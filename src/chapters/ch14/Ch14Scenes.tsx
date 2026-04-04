import SceneEngine from '../../engine/SceneEngine';
import Scene from '../../components/scene/Scene';
import Narration from '../../components/scene/Narration';
import DeepDive from '../../components/scene/DeepDive';
import PromptAssembler from '../../components/interactive/ch14/PromptAssembler';
import { LanguageProvider, useLanguage } from '../../i18n/LanguageContext';

export default function Ch14Scenes() {
  return <LanguageProvider><Ch14Content /></LanguageProvider>;
}

function Ch14Content() {
  const { t } = useLanguage();

  return (
    <SceneEngine>
      <Scene>
        <Narration>
          <p>
            {t(
              '在上一章，你了解了 System Prompt 的概念。但你有没有好奇——那段 ~12,000 tokens 的文本，到底是怎么拼装出来的？',
              'In the last chapter, you learned about the System Prompt concept. But have you wondered — how is that ~12,000 token text actually assembled?'
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              '它不是一段硬编码的字符串。它是一个动态装配的过程——就像搭积木一样，一层一层叠上去。',
              "It's not a hardcoded string. It's a dynamic assembly process — like building blocks, stacked layer by layer."
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>先是<strong>核心指令</strong>——我是谁、我的行为准则。</>,
              <>First come the <strong>core instructions</strong> — who I am, my behavioral rules.</>
            )}
          </p>
          <p>
            {t(
              <>然后是<strong>工具定义</strong>——50+ 个工具，每个都有详细的 JSON Schema。</>,
              <>Then the <strong>tool definitions</strong> — 50+ tools, each with a detailed JSON Schema.</>
            )}
          </p>
          <p>
            {t(
              <>再加上 <strong>CLAUDE.md</strong>——你的项目指令。</>,
              <>Then <strong>CLAUDE.md</strong> — your project instructions.</>
            )}
          </p>
          <p>
            {t(
              <>最后是<strong>记忆</strong>——跨会话的持久化知识。</>,
              <>Finally, <strong>memory</strong> — persistent knowledge across sessions.</>
            )}
          </p>
        </Narration>
      </Scene>

      <Scene interactive>
        <Narration>
          <p>
            {t(
              '拖动各个模块，看看 System Prompt 是如何一步步装配起来的——',
              'Drag the modules to see how the System Prompt is assembled step by step —'
            )}
          </p>
        </Narration>
        <PromptAssembler />
      </Scene>

      <Scene>
        <DeepDive title={t('Prompt 缓存', 'Prompt Caching')}>
          <p>
            {t(
              '相同的 System Prompt 在多个用户之间共享 API 缓存，通过 cache_control 前缀。这意味着 ~12K tokens 的固定开销实际上几乎不花钱。',
              'Identical System Prompts share API cache across users via cache_control prefix. This means the ~12K token fixed overhead costs almost nothing.'
            )}
          </p>
        </DeepDive>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>从 <code>getSystemPrompt()</code> 到 <code>fetchSystemPromptParts()</code>，从 Tool descriptions 到 CLAUDE.md 注入——每一次对话开始前，这个装配过程都在幕后默默完成。</>,
              <>From <code>getSystemPrompt()</code> to <code>fetchSystemPromptParts()</code>, from tool descriptions to CLAUDE.md injection — before every conversation begins, this assembly process runs silently behind the scenes.</>
            )}
          </p>
          <p>
            {t(
              '下一章，我们将深入探索另一个关键问题——你能看到什么？',
              "In the next chapter, we'll dive into another key question — what can you see?"
            )}
          </p>
        </Narration>
      </Scene>
    </SceneEngine>
  );
}
