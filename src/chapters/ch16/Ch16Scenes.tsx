import SceneEngine from '../../engine/SceneEngine';
import Scene from '../../components/scene/Scene';
import Narration from '../../components/scene/Narration';
import { LanguageProvider, useLanguage } from '../../i18n/LanguageContext';

export default function Ch16Scenes() {
  return <LanguageProvider><Ch16Content /></LanguageProvider>;
}

function Ch16Content() {
  const { t } = useLanguage();

  return (
    <SceneEngine>
      <Scene>
        <Narration>
          <p>
            {t(
              '你发送的每条消息、每个工具调用的结果、每条系统通知——在到达 Claude API 之前，都要经过一条精密的消息管线。',
              'Every message you send, every tool call result, every system notification — all pass through a precise message pipeline before reaching the Claude API.'
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              '在这条管线中，消息不只是文本。它们是结构化的对象——带有类型、元数据、时间戳，甚至可以被标记为"墓碑"而被丢弃。',
              'In this pipeline, messages are not just text. They are structured objects — with types, metadata, timestamps, and can even be marked as \'tombstones\' to be discarded.'
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              <>六种消息类型在管线中流动：<strong>UserMessage</strong>（你的输入）、<strong>AssistantMessage</strong>（我的回复）、<strong>SystemMessage</strong>（系统通知）、<strong>ProgressMessage</strong>（进度更新）、<strong>AttachmentMessage</strong>（附件）、<strong>TombstoneMessage</strong>（已删除标记）。</>,
              <>Six message types flow through the pipeline: <strong>UserMessage</strong> (your input), <strong>AssistantMessage</strong> (my response), <strong>SystemMessage</strong> (system notifications), <strong>ProgressMessage</strong> (progress updates), <strong>AttachmentMessage</strong> (attachments), <strong>TombstoneMessage</strong> (deletion markers).</>
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              '在发送到 API 之前，消息还要经过规范化——多内容块拆分、tool_use/tool_result 配对、连续消息合并。',
              'Before reaching the API, messages go through normalization — multi-block splitting, tool_use/tool_result pairing, and consecutive message merging.'
            )}
          </p>
        </Narration>
      </Scene>

      <Scene>
        <Narration>
          <p>
            {t(
              '这条管线确保了每一次 API 调用都是格式正确、配对完整的。它是 Agentic Loop 可靠运行的基石。',
              'This pipeline ensures every API call is correctly formatted and properly paired. It is the foundation for reliable Agentic Loop operation.'
            )}
          </p>
        </Narration>
      </Scene>
    </SceneEngine>
  );
}
