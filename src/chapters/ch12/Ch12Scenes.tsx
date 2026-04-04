import SceneEngine from '../../engine/SceneEngine';
import Scene from '../../components/scene/Scene';
import Narration from '../../components/scene/Narration';
import ChatBubble from '../../components/scene/ChatBubble';
import DeepDive from '../../components/scene/DeepDive';
import PermissionSimulator from '../../components/interactive/ch12/PermissionSimulator';
import PermissionWaterfall from '../../components/interactive/ch12/PermissionWaterfall';
import { LanguageProvider, useLanguage } from '../../i18n/LanguageContext';

export default function Ch12Scenes() {
  return <LanguageProvider><Ch12Content /></LanguageProvider>;
}

function Ch12Content() {
  const { t } = useLanguage();

  return (
    <SceneEngine>
      <Scene>
        <Narration>
          <p>
            {t(
              <>你现在可以读文件、写代码、执行命令、<br />连接外部服务、甚至派出子代理。</>,
              <>You can now read files, write code, execute commands,<br />connect to external services, and even dispatch subagents.</>
            )}
          </p>
          <p>
            {t(
              <>这些能力很强大——也很<strong>危险</strong>。</>,
              <>These capabilities are powerful—and <strong>dangerous</strong>.</>
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>如果 AI 执行了 <code>rm -rf /</code>？</>,
              <>What if AI executes <code>rm -rf /</code>?</>
            )}
          </p>
          <p>{t('如果它把秘密写进了公开仓库？', 'What if it writes secrets into a public repository?')}</p>
          <p>{t('如果它未经授权访问了生产数据库？', 'What if it accesses the production database without authorization?')}</p>
          <p>
            {t(
              <><strong>能力没有边界，就是灾难。</strong></>,
              <><strong>Power without boundaries is a disaster.</strong></>
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>所以 Claude Code 有一套分层的<strong>权限系统</strong>。</>,
              <>That's why Claude Code has a layered <strong>permission system</strong>.</>
            )}
          </p>
          <p>
            {t(
              <>只读操作——<strong>自动放行</strong>，不需要确认。<br />写操作——<strong>需要确认</strong>，你来决定。<br />Bash 命令——<strong>需要确认</strong>，逐条审核。</>,
              <>Read-only operations—<strong>auto-approved</strong>, no confirmation needed.<br />Write operations—<strong>require approval</strong>, you decide.<br />Bash commands—<strong>require approval</strong>, reviewed one by one.</>
            )}
          </p>
          <p>
            {t(
              <>每一层，都是一道安全的<strong>闸门</strong>。</>,
              <>Each layer is a safety <strong>gate</strong>.</>
            )}
          </p>
        </Narration>
      </Scene>

      <Scene interactive>
        <Narration>
          <p>
            {t(
              <>现在你来当<strong>守门人</strong>。</>,
              <>Now it's your turn to be the <strong>gatekeeper</strong>.</>
            )}
          </p>
          <p>{t('审核以下操作，决定是否放行：', 'Review the following operations and decide whether to approve:')}</p>
        </Narration>
        <PermissionSimulator />
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>权限模式有<strong>五种</strong>：</>,
              <>There are <strong>five</strong> permission modes:</>
            )}
          </p>
          <p>
            {t(
              <><strong>default</strong> —— 标准模式，该问就问。<br /><strong>acceptEdits</strong> —— 自动通过文件编辑。<br /><strong>plan</strong> —— 只读模式，只看不动。<br /><strong>dontAsk</strong> —— 只用预批准的工具。<br /><strong>bypassPermissions</strong> —— 跳过所有检查，危险！</>,
              <><strong>default</strong> — Standard mode, asks when needed.<br /><strong>acceptEdits</strong> — Auto-approves file edits.<br /><strong>plan</strong> — Read-only mode, observe without action.<br /><strong>dontAsk</strong> — Only uses pre-approved tools.<br /><strong>bypassPermissions</strong> — Skips all checks, dangerous!</>
            )}
          </p>
          <p>
            {t(
              <>选择哪种模式，取决于你对 AI 的<strong>信任程度</strong>。</>,
              <>Which mode you choose depends on your <strong>level of trust</strong> in AI.</>
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>{t(
            <>更精细的控制？用 <strong>Allow & Deny 规则</strong>。</>,
            <>Need finer control? Use <strong>Allow & Deny rules</strong>.</>
          )}</p>
          <p>
            {t(
              <><code>Bash(npm run *)</code> —— 允许所有 npm 命令。<br /><code>Bash(rm -rf *)</code> —— 拒绝危险删除。</>,
              <><code>Bash(npm run *)</code> — Allow all npm commands.<br /><code>Bash(rm -rf *)</code> — Deny dangerous deletions.</>
            )}
          </p>
          <p>
            {t(
              <>规则很简单：<strong>Deny 优先于 Allow</strong>。</>,
              <>The rule is simple: <strong>Deny takes priority over Allow</strong>.</>
            )}
          </p>
          <p>
            {t(
              <>只要有一条 Deny 匹配，无论多少 Allow 都不管用。<br />这就是"安全优先"的原则。</>,
              <>As long as one Deny rule matches, no amount of Allow rules will override it.<br />This is the "safety first" principle.</>
            )}
          </p>
        </Narration>
      </Scene>

      <Scene interactive>
        <Narration>
          <p>{t(
            '每一次工具调用，都要经过一道"权限瀑布"——从上到下，逐层过滤。',
            'Every tool call passes through a "permission waterfall" — filtered layer by layer, top to bottom.'
          )}</p>
          <p>{t(
            '选择不同的场景，看看请求如何在瀑布中流动——',
            'Choose different scenarios to see how requests flow through the waterfall —'
          )}</p>
        </Narration>
        <PermissionWaterfall />
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <><strong>权限不是限制——是信任的边界。</strong></>,
              <><strong>Permissions aren't restrictions—they're trust boundaries.</strong></>
            )}
          </p>
          <p>
            {t(
              '好的权限设置让 AI 高效工作，同时确保安全。',
              'Good permission settings let AI work efficiently while staying safe.'
            )}
          </p>
          <p>
            {t(
              <>就像给赛车手一条赛道——<br />不是不让他开快车，而是确保他不会冲出跑道。</>,
              <>Like giving a race car driver a track—<br />not to stop them from going fast, but to make sure they don't fly off the road.</>
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>{t('最后一章。', 'The final chapter.')}</p>
          <p>
            {t(
              <>我们来把所有这些定制和配置整合在一起——<strong>Configuration</strong>。</>,
              <>Let's bring all the customization and configuration together—<strong>Configuration</strong>.</>
            )}
          </p>
        </Narration>
      </Scene>
    </SceneEngine>
  );
}
