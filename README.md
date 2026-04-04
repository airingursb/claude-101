# Claude 101

> An interactive learning website that explains how Claude Code works — from AI's first-person perspective, with **annotated real source code** and interactive visualizations.

**[Live Demo](https://airingursb.github.io/claude-101/)**

## Features

- **16 in-depth chapters** covering every aspect of Claude Code's architecture
- **Annotated source code** — real code from Claude Code's `src/`, with line-by-line sidebar annotations explaining key mechanisms
- **Interactive visualizations** — Agent Loop step-by-step animation, Permission Waterfall simulator, Tool Catalog browser, Architecture Treemap, and more
- **Bilingual** — full Chinese / English toggle
- **AI first-person narrative** — learn how Claude Code works by seeing through its eyes

## Chapters

### Fundamentals

| # | Topic | Source Code Highlight |
|---|-------|---------------------|
| 01 | **Prompt** | `getSystemPrompt()` — how the ~12K token system prompt is built |
| 02 | **System Prompt** | `fetchSystemPromptParts()` — the 6-layer assembly process |
| 03 | **Context** | `QueryEngine` class — conversation state & mutableMessages |

### Tools & Execution

| # | Topic | Source Code Highlight |
|---|-------|---------------------|
| 04 | **Tools** | `getAllBaseTools()` — 50+ tool registry with feature flags |
| 05 | **Agentic Loop** | `queryLoop()` — the core while(true) async generator |
| 06 | **Message Pipeline** | Message normalization — 6 internal message types |
| 07 | **MCP** | `callMCPTool()` — JSON-RPC dispatch to MCP servers |

### Memory & Knowledge

| # | Topic | Source Code Highlight |
|---|-------|---------------------|
| 08 | **Memory** | `loadMemoryPrompt()` — MEMORY.md loading & 200-line truncation |
| 09 | **Codebase Intelligence** | `GrepTool.call()` — ripgrep-powered Agentic RAG |

### Extensions

| # | Topic | Source Code Highlight |
|---|-------|---------------------|
| 10 | **Hooks** | `getMatchingHooks()` — event-driven hook matching & dispatch |
| 11 | **Skills** | `SkillTool.call()` — slash command loading & invocation |
| 12 | **Plugins** | `installPluginOp()` — plugin lifecycle & marketplace |

### Collaboration & Governance

| # | Topic | Source Code Highlight |
|---|-------|---------------------|
| 13 | **Agents & Subagents** | `runAgent()` — subagent spawning with isolated QueryEngine |
| 14 | **Permissions & Safety** | Permission Waterfall — 5-stage deny→allow→validate→classify→prompt |
| 15 | **Configuration** | Settings onion model — 5-layer config hierarchy |
| 16 | **Hidden Features** | Kairos, AutoDream, UltraPlan, Bridge, Buddy & more |

## Interactive Components

| Component | Chapter | Description |
|-----------|---------|-------------|
| `AgenticLoopViz` | Ch5 | 11-step animated walkthrough with playback controls |
| `PermissionWaterfall` | Ch14 | 5-stage waterfall with 4 preset scenarios |
| `PromptAssembler` | Ch2 | 6-layer system prompt assembly animation |
| `ToolCatalog` | Ch4 | Browseable catalog of 54 tools by category |
| `ArchitectureTreemap` | Home | Claude Code source structure explorer |
| `AnnotatedSource` | All | Real source code with sidebar annotations |

## Tech Stack

- **Framework**: [Astro](https://astro.build/) (Island Architecture)
- **Interactive Components**: [React](https://react.dev/) (`client:visible` / `client:only="react"`)
- **Content**: MDX + custom Scene Engine
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4 + CSS Variables (dark theme)
- **Animation**: [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://gsap.com/)
- **Language**: TypeScript (strict)
- **i18n**: Chinese / English toggle

## Getting Started

```bash
npm install
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
```

## Project Structure

```
src/
├── config/                  # Chapter metadata & categories
├── engine/                  # Scene engine (navigation, transitions, context)
├── i18n/                    # Language context & toggle
├── components/
│   ├── scene/               # Scene primitives (Narration, ChatBubble, DeepDive...)
│   └── interactive/         # Interactive components per chapter
│       ├── AnnotatedSource  #   Annotated source code viewer (used across all chapters)
│       ├── ArchitectureTreemap  # Source structure explorer (homepage)
│       ├── ch01–ch16/       #   Chapter-specific interactive components
├── chapters/                # Chapter scene definitions (Ch01–Ch16)
├── layouts/                 # Astro layouts (base + chapter)
├── pages/
│   ├── index.astro          # Home page
│   └── chapters/*.mdx       # Chapter pages (article + scenes)
└── styles/
    ├── global.css           # Tailwind + theme variables
    └── scene.css            # Scene engine + component styles
```

## How It Works

Each chapter combines three layers:

1. **Scenes** (React) — full-screen interactive experiences with click-to-advance navigation
2. **Article** (MDX) — scrollable long-form content explaining concepts in depth
3. **Annotated Source** (React) — real Claude Code source snippets with sidebar annotations

The Scene Engine manages transitions, scroll locking, and progress tracking. Interactive components use `useSceneComplete()` to gate progression.

## References

- Visual & interaction design: [The Evolution of Trust](https://ncase.me/trust/) by Nicky Case
- Source code analysis: [Claude Code](https://github.com/anthropics/claude-code) by Anthropic
- Content reference: [ccunpacked.dev](https://ccunpacked.dev/), [DeepWiki](https://deepwiki.com/zackautocracy/claude-code)

## License

MIT
