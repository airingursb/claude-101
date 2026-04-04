import SceneEngine from '../../engine/SceneEngine';
import Scene from '../../components/scene/Scene';
import Narration from '../../components/scene/Narration';
import { LanguageProvider, useLanguage } from '../../i18n/LanguageContext';

export default function Ch15Scenes() {
  return <LanguageProvider><Ch15Content /></LanguageProvider>;
}

function Ch15Content() {
  const { t } = useLanguage();

  return (
    <SceneEngine>
      <Scene>
        <Narration>
          <p>
            {t(
              '到目前为止，你已经了解了 Claude Code 的所有核心机制。',
              "So far, you've learned all of Claude Code's core mechanisms."
            )}
          </p>
          <p>
            {t(
              '但就像任何复杂的软件一样——总有些隐藏的宝藏等待你去发现。',
              'But like any complex software — there are always hidden treasures waiting to be discovered.'
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              '有些功能藏在 feature flag 后面，有些是实验性的探索，有些则是开发者的小彩蛋。',
              'Some features hide behind feature flags, some are experimental explorations, and some are developer Easter eggs.'
            )}
          </p>
          <p>
            {t(
              '让我们掀开幕布——',
              "Let's peek behind the curtain —"
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>
                <strong>Kairos 模式</strong>——持久化的 AI 助手。
              </>,
              <>
                <strong>Kairos Mode</strong> — a persistent AI assistant.
              </>
            )}
          </p>
          <p>
            {t(
              '不再是一次性的对话，而是一个始终在线的伙伴，通过 daily-log 记忆模式记住一切。',
              'No longer a one-off conversation, but an always-on companion that remembers everything through daily-log memory.'
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>
                <strong>AutoDream</strong>——在你不使用 Claude Code 的时候，它会在后台自动整理记忆。
              </>,
              <>
                <strong>AutoDream</strong> — while you're away, it automatically consolidates memories in the background.
              </>
            )}
          </p>
          <p>
            {t(
              <>
                <strong>Bridge</strong>——从手机或浏览器远程控制终端中的 Claude Code。
              </>,
              <>
                <strong>Bridge</strong> — remotely control Claude Code in your terminal from your phone or browser.
              </>
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>甚至还有一个虚拟宠物——<strong>Buddy</strong>。</>,
              <>There's even a virtual pet — <strong>Buddy</strong>.</>
            )}
          </p>
          <p>
            {t(
              '一个会眨眼、会说话的小精灵，陪伴你的编码之旅。',
              'A blinking, chatting little sprite that accompanies your coding journey.'
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>这些功能展示了 Claude Code 的野心——不仅仅是一个编码工具，而是一个<strong>完整的 AI 开发环境生态</strong>。</>,
              <>These features reveal Claude Code's ambition — not just a coding tool, but a <strong>complete AI development ecosystem</strong>.</>
            )}
          </p>
        </Narration>
      </Scene>
    </SceneEngine>
  );
}
