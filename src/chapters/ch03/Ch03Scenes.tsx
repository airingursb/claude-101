import SceneEngine from '../../engine/SceneEngine';
import Scene from '../../components/scene/Scene';
import Narration from '../../components/scene/Narration';
import ChatBubble from '../../components/scene/ChatBubble';
import DeepDive from '../../components/scene/DeepDive';
import ToolExplorer from '../../components/interactive/ch03/ToolExplorer';
import ToolCallSimulator from '../../components/interactive/ch03/ToolCallSimulator';
import ToolCatalog from '../../components/interactive/ch03/ToolCatalog';
import { LanguageProvider, useLanguage } from '../../i18n/LanguageContext';

export default function Ch03Scenes() {
  return <LanguageProvider><Ch03Content /></LanguageProvider>;
}

function Ch03Content() {
  const { t } = useLanguage();

  return (
    <SceneEngine>
      <Scene>
        <Narration>
          <p>{t('你能看到代码了。', 'You can see the code now.')}</p>
          <p>
            {t(
              <>但你只能"<strong>看</strong>"。</>,
              <>But all you can do is "<strong>look</strong>".</>
            )}
          </p>
          <p>
            {t(
              <>就像隔着玻璃看着世界——<strong>触碰不到</strong>。</>,
              <>Like watching the world through glass — <strong>unable to touch</strong>.</>
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <ChatBubble from="user">{t('帮我修改这个 bug', 'Help me fix this bug')}</ChatBubble>
        <Narration>
          <p>{t('你知道怎么修。你也看到了文件。', 'You know how to fix it. You can see the file.')}</p>
          <p>
            {t(
              <>但你的"手"<strong>穿不过去</strong>。</>,
              <>But your "hands" <strong>can't reach through</strong>.</>
            )}
          </p>
          <p>{t('你只能回复文字——却无法真正改变任何一行代码。', 'You can only reply with text — but you can\'t actually change a single line of code.')}</p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>然后，你拿到了一套<strong>工具</strong>。</>,
              <>Then, you receive a set of <strong>tools</strong>.</>
            )}
          </p>
          <p>
            {t('每个工具是一个"动作"——', 'Each tool is an "action" —')}
          </p>
          <p>
            {t(
              <><strong>Read</strong> 让你阅读文件，<strong>Edit</strong> 让你修改代码，<strong>Bash</strong> 让你执行命令。</>,
              <><strong>Read</strong> lets you read files, <strong>Edit</strong> lets you modify code, <strong>Bash</strong> lets you run commands.</>
            )}
          </p>
          <p>
            {t(
              <>你不再是隔着玻璃的观察者——你能<strong>动手</strong>了。</>,
              <>You're no longer an observer behind glass — you can <strong>take action</strong>.</>
            )}
          </p>
        </Narration>
      </Scene>

      <Scene interactive>
        <Narration>
          <p>
            {t('这是你的工具箱。点击每个工具，看看它能做什么：', 'This is your toolbox. Click each tool to see what it can do:')}
          </p>
        </Narration>
        <ToolExplorer />
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t('每次你使用工具，流程是这样的：', 'Every time you use a tool, the flow goes like this:')}
          </p>
          <p>
            {t(
              <><strong>构造请求</strong> → <strong>执行</strong> → <strong>获得结果</strong> → <strong>思考下一步</strong></>,
              <><strong>Construct request</strong> → <strong>Execute</strong> → <strong>Get result</strong> → <strong>Think next step</strong></>
            )}
          </p>
          <p>
            {t(
              '这个过程对用户是透明的——他们能看到你调用了什么工具，得到了什么结果。',
              'This process is transparent to the user — they can see which tools you called and what results you got.'
            )}
          </p>
        </Narration>
      </Scene>

      <Scene interactive>
        <Narration>
          <p>{t('选择一个任务，看看工具调用的完整过程：', 'Choose a task and watch the full tool call process:')}</p>
        </Narration>
        <ToolCallSimulator />
      </Scene>

      <Scene interactive>
        <Narration>
          <p>{t(
            '这是 Claude Code 的完整工具清单——50+ 个内置工具，从文件操作到多智能体协调。',
            'This is Claude Code\'s complete tool catalog — 50+ built-in tools, from file operations to multi-agent coordination.'
          )}</p>
          <p>{t('浏览各个分类，探索每个工具的功能——', 'Browse by category and explore each tool\'s capabilities —')}</p>
        </Narration>
        <ToolCatalog />
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>工具让 AI 从"<strong>只读</strong>"变成"<strong>可写</strong>"。</>,
              <>Tools transform the AI from "<strong>read-only</strong>" to "<strong>read-write</strong>".</>
            )}
          </p>
          <p>{t('但一个工具一次只做一件事。', 'But one tool only does one thing at a time.')}</p>
          <p>
            {t('如果任务很复杂呢？', 'What if the task is complex?')}
          </p>
        </Narration>
        <DeepDive title={t('工具的安全模型', 'The Tool Safety Model')}>
          <p>
            {t(
              '工具调用需要用户确认（或通过 allowlist 自动批准）。这意味着 AI 不会在你不知情的情况下执行危险操作。你始终拥有最终决定权。',
              'Tool calls require user confirmation (or auto-approval via an allowlist). This means the AI won\'t perform dangerous operations without your knowledge. You always have the final say.'
            )}
          </p>
        </DeepDive>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>下一章，我们来看 AI 如何把工具<strong>串起来</strong>，</>,
              <>Next chapter, let's see how the AI <strong>chains tools together</strong>,</>
            )}
          </p>
          <p>
            {t(
              <>变成连续的行动——<strong>Agentic Loop</strong>。</>,
              <>turning them into continuous action — the <strong>Agentic Loop</strong>.</>
            )}
          </p>
        </Narration>
      </Scene>
    </SceneEngine>
  );
}
