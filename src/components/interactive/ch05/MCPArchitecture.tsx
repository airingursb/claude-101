import { useState } from 'react';
import { useSceneComplete } from '../../../engine/SceneContext';
import { useLanguage } from '../../../i18n/LanguageContext';

interface Layer {
  id: string;
  label: string;
  zhDescription: string;
  enDescription: string;
  color: string;
}

const layersData: Layer[] = [
  {
    id: 'claude',
    label: 'Claude Code',
    zhDescription: '你——AI 助手。你能调用工具来完成任务，但你的工具箱是固定的。MCP 让你可以动态获得新工具。',
    enDescription: 'You — the AI assistant. You can call tools to complete tasks, but your toolbox is fixed. MCP lets you dynamically gain new tools.',
    color: '#7c3aed',
  },
  {
    id: 'client',
    label: 'MCP Client',
    zhDescription: 'MCP 客户端内置在 Claude Code 中。它负责发现可用的 MCP 服务器、管理连接、把服务器提供的工具注册到你的工具箱。',
    enDescription: 'The MCP client is built into Claude Code. It discovers available MCP servers, manages connections, and registers server-provided tools into your toolbox.',
    color: '#3b82f6',
  },
  {
    id: 'server',
    label: 'MCP Server',
    zhDescription: 'MCP 服务器是一个独立的进程。它实现了 MCP 协议，把外部服务的能力"翻译"成 AI 能调用的工具。任何人都可以写一个。',
    enDescription: 'An MCP server is an independent process. It implements the MCP protocol, "translating" external service capabilities into tools the AI can call. Anyone can write one.',
    color: '#10b981',
  },
  {
    id: 'service',
    label: 'External Service',
    zhDescription: '外部服务——GitHub API、Slack API、数据库、浏览器……MCP 服务器把它们的能力暴露给 AI。',
    enDescription: 'External services — GitHub API, Slack API, databases, browsers… MCP servers expose their capabilities to the AI.',
    color: '#f59e0b',
  },
];

interface MCPServer {
  id: string;
  name: string;
  icon: string;
  tools: string[];
}

const mcpServers: MCPServer[] = [
  { id: 'github', name: 'GitHub', icon: '🐙', tools: ['create_issue', 'list_prs', 'review_pr'] },
  { id: 'slack', name: 'Slack', icon: '💬', tools: ['send_message', 'list_channels', 'search'] },
  { id: 'database', name: 'Database', icon: '🗄️', tools: ['query', 'insert', 'update'] },
  { id: 'playwright', name: 'Playwright', icon: '🎭', tools: ['navigate', 'screenshot', 'click'] },
  { id: 'filesystem', name: 'Filesystem', icon: '📁', tools: ['read_file', 'write_file', 'list_dir'] },
];

export default function MCPArchitecture() {
  const sceneComplete = useSceneComplete();
  const { t } = useLanguage();
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [connectedServers, setConnectedServers] = useState<Set<string>>(new Set());

  const handleConnect = (serverId: string) => {
    setConnectedServers((prev) => {
      const next = new Set(prev);
      if (next.has(serverId)) {
        next.delete(serverId);
      } else {
        next.add(serverId);
      }
      if (next.size >= 2 && sceneComplete) {
        sceneComplete();
      }
      return next;
    });
  };

  return (
    <div className="mcp-arch scene-dark-interactive" data-interactive>
      <div className="mcp-arch__section">
        <div className="mcp-arch__section-title">{t('MCP 架构', 'MCP Architecture')}</div>
        <div className="mcp-arch__section-hint">{t('点击每一层，了解它的作用', 'Click each layer to learn its role')}</div>

        <div className="mcp-arch__layers">
          {layersData.map((layer, i) => (
            <div key={layer.id}>
              <div
                className={`mcp-arch__layer ${selectedLayer === layer.id ? 'mcp-arch__layer--active' : ''}`}
                style={{
                  borderColor: selectedLayer === layer.id ? layer.color : undefined,
                  background: selectedLayer === layer.id ? `${layer.color}15` : undefined,
                }}
                onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
              >
                <div className="mcp-arch__layer-dot" style={{ background: layer.color }} />
                <span className="mcp-arch__layer-label">{layer.label}</span>
              </div>
              {i < layersData.length - 1 && (
                <div className="mcp-arch__arrow">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2 L10 14 M5 10 L10 15 L15 10" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedLayer && (() => {
          const layer = layersData.find((l) => l.id === selectedLayer)!;
          return (
            <div
              className="mcp-arch__detail"
              style={{
                borderColor: layer.color + '40',
                background: layer.color + '10',
              }}
            >
              <p>{t(layer.zhDescription, layer.enDescription)}</p>
            </div>
          );
        })()}
      </div>

      <div className="mcp-arch__divider" />

      <div className="mcp-arch__section">
        <div className="mcp-arch__section-title">{t('MCP 服务器生态', 'MCP Server Ecosystem')}</div>
        <div className="mcp-arch__section-hint">{t('点击卡片，"连接"一个 MCP 服务器', 'Click a card to "connect" an MCP server')}</div>

        <div className="mcp-arch__servers">
          {mcpServers.map((server) => {
            const connected = connectedServers.has(server.id);
            return (
              <div
                key={server.id}
                className={`mcp-arch__server ${connected ? 'mcp-arch__server--connected' : ''}`}
                onClick={() => handleConnect(server.id)}
              >
                <div className="mcp-arch__server-icon">{server.icon}</div>
                <div className="mcp-arch__server-name">{server.name}</div>
                {connected && (
                  <div className="mcp-arch__server-tools">
                    {server.tools.map((tool) => (
                      <span key={tool} className="mcp-arch__tool-tag">{tool}</span>
                    ))}
                  </div>
                )}
                <div className="mcp-arch__server-status">
                  {connected ? t('✓ 已连接', '✓ Connected') : t('点击连接', 'Click to connect')}
                </div>
              </div>
            );
          })}
        </div>

        {connectedServers.size > 0 && (
          <div className="mcp-arch__summary">
            {t(
              `已连接 ${connectedServers.size} 个 MCP 服务器，你的工具箱增加了 ${mcpServers.filter((s) => connectedServers.has(s.id)).reduce((sum, s) => sum + s.tools.length, 0)} 个新工具`,
              `Connected ${connectedServers.size} MCP server${connectedServers.size > 1 ? 's' : ''}, your toolbox gained ${mcpServers.filter((s) => connectedServers.has(s.id)).reduce((sum, s) => sum + s.tools.length, 0)} new tools`
            )}
          </div>
        )}
      </div>
    </div>
  );
}
