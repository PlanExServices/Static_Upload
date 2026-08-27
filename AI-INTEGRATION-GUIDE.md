# The DelQuro Files Pro: AI Intake & Project Organization System

Welcome to your upgraded project organization hub. This system solves the challenge of capturing, structuring, and tracking ideas and code produced by AI assistants into **The DelQuro Files**.

---

## 🌟 What Was Built

1. **AI Code Receiver API (`server.js` running on port 3000)**:
   - A live HTTP endpoint waiting for incoming code and project payloads at:
     ```
     POST /api/intake
     ```
   - Automatically analyzes incoming code and comments to extract:
     - **Name**: Project title
     - **Tagline**: Punchy one-sentence hook
     - **Description**: Strict **120-word maximum**, with real-time word counting and auto-trimming
     - **Stack**: Detected languages, frameworks, and tools (e.g., React, TypeScript, FastAPI, Tailwind, SQLite)
     - **Platform URLs**:
       - `arena.ai` URL
       - `github.com` URL
       - `emergent.sh` URL
       - `base44.com` URL
     - **What Sets It Apart (The Edge)**: The unique competitive differentiator, moat, or architectural advantage
     - **Source Code**: Retains the code snippet and attaches it to the project

2. **Dedicated "AI Intake & Card Studio" Page**:
   - Live receiver status banner with animated beacon: `🟢 RECEIVER ACTIVE · WAITING FOR AI CODE`.
   - **Staged Queue**: View all incoming uploads from AI assistants waiting to be turned into cards.
   - **Interactive Card Builder**:
     - Monospace **Code Inspector** with line counts, syntax styling, and copy controls.
     - **Live Word Counter**: Real-time counter showing `[ X / 120 words ]` (turns amber at 105 words, red with a warning alert if over 120 words, with a 1-click `✂ Auto-Trim` helper).
     - **Quick-Add Stack Chips**: One-click tags for React, TypeScript, FastAPI, Python, Tailwind, SQLite, Arena SDK, Base44, Emergent, etc.
     - **Dedicated Platform URL Inputs**: Custom branded inputs for Arena.ai, GitHub, Emergent.sh, and Base44.com.
     - **"The Edge" Callout**: Highlighted section for competitive differentiation.
     - **Real-Time Live Card Preview**: See the card exactly as it will appear in DelQuro Files before publishing.
     - **"🚀 Upload Card to DelQuro Files" Button**: Validates word limits, pushes the card to the project gallery, links attached code under the Code tab, and redirects straight to the project view!

3. **Upgraded "The DelQuro Files Pro" (`delquro-files-pro.html`)**:
   - **New Project Cards**:
     - Displays Name, Status, Tagline
     - **The Edge / What Sets It Apart**: Distinct gold-accented callout badge
     - 120-word description with word count pill (`34/120w`)
     - Stack tags
     - 4 platform action buttons: **Arena.ai**, **GitHub**, **Emergent.sh**, and **Base44.com** (with 1-click launch and copy buttons)
     - Attached Code badge
   - **Project Detail Page**:
     - Hero section featuring all 4 platform links + copy buttons
     - Prominent "WHAT SETS THIS IDEA APART · THE EDGE" banner
     - Full 120-word description
     - **Attached Source Code Section**: Full-width monospace code viewer with copy and download buttons
   - **Zero-Dependency Portability**:
     - Works both connected to the live Node server (with real-time background sync) **AND** completely standalone as an offline HTML file in any browser using `localStorage`.

---

## 🤖 How to Tell Your AI to Upload Code

### Option 1: Give This Prompt to Any AI (Claude, ChatGPT, Arena Agent)
Copy and paste this instruction into your conversation with your AI:

```markdown
You are helping me build and organize projects for "The DelQuro Files".
Whenever you propose an idea, complete a script, or write a feature for me, please output an intake card formatted as JSON (or send an HTTP POST request to http://localhost:3000/api/intake) with the following structure:

{
  "name": "<Project Name>",
  "tagline": "<Punchy one-sentence summary>",
  "description": "<Concise overview of what it does, architecture, and goals — STRICT MAXIMUM 120 WORDS>",
  "stack": "<Comma-separated technologies, e.g. React, TypeScript, FastAPI, Tailwind>",
  "arena_link": "<https://arena.ai/... or placeholder>",
  "github_link": "<https://github.com/... or placeholder>",
  "emergent_link": "<https://emergent.sh/... or placeholder>",
  "base44_link": "<https://base44.com/... or placeholder>",
  "differentiator": "<What sets this idea apart from others in the same field (The Edge / Moat / Unfair Advantage)>",
  "filename": "<main file name, e.g. app.py, index.ts>",
  "code": "<source code snippet or key implementation>"
}
```

### Option 2: Direct Terminal / CLI Upload (curl)
Run this command from any terminal or AI environment:

```bash
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "name": "HyperAgent Router",
  "tagline": "Autonomous multi-model query router with sub-50ms latency",
  "description": "HyperAgent Router evaluates prompt complexity in real time and dispatches requests to optimal frontier models. It features zero-config streaming, automatic fallback handling, and semantic caching. Built for high-throughput production environments that demand enterprise reliability.",
  "stack": "TypeScript, Fastify, Redis, Arena SDK",
  "arena_link": "https://arena.ai/c/hyperagent",
  "github_link": "https://github.com/delquro/hyperagent",
  "emergent_link": "https://emergent.sh/app/hyperagent",
  "base44_link": "https://base44.com/apps/hyperagent",
  "differentiator": "Unlike heavy frameworks like LangChain, HyperAgent has zero runtime dependencies, a 12KB footprint, and sub-millisecond dispatch overhead.",
  "filename": "router.ts",
  "code": "// Your source code here"
}
EOF
```

### Option 3: Cursor / Windsurf / Copilot (`.cursorrules`)
Add this rule to your project's `.cursorrules` or AI instructions file:
```
When finishing a code milestone or building a new feature:
1. Formulate a project card definition:
   - name, tagline
   - description (STRICTLY <= 120 words)
   - stack
   - arena_link, github_link, emergent_link, base44_link
   - differentiator ("what sets this idea apart")
2. POST the payload to http://localhost:3000/api/intake so it appears in The DelQuro Files intake staging queue.
```

### Option 4: Quick Web Dropzone (No Network Access Needed)
If your AI is running in a locked-down environment without outbound internet access:
1. Open **The DelQuro Files Pro**.
2. Click **AI Intake & Studio** in the navigation.
3. Click the **"Paste / Drop Code"** button.
4. Paste the code or conversation transcript.
5. Click **"Analyze & Build Card"** — the built-in parser automatically extracts all 8 fields, enforces the 120-word limit, and loads it into the interactive Card Studio!

---

## 🛠 File Structure & Deliverables

| File | Description |
| :--- | :--- |
| `delquro-files-pro.html` | The complete, upgraded single-file application. Works offline, on GitHub Pages, Emergent, or Base44. |
| `index.html` | Root entrypoint served by dev servers and static hosts. |
| `server.js` | Zero-dependency Node.js server handling the live receiver (`/api/intake`), project API, and static files. |
| `data/delquro-db.json` | Persisted database storing projects, ideas, changelog, builds, code, and dialogues. |
| `data/inbox.json` | Staged AI code uploads waiting to be converted into cards. |
| `test-upload.sh` | Executable verification script that tests uploading an AI project payload. |
| `AI-INTEGRATION-GUIDE.md` | This reference guide and prompt cheat sheet. |

---

## 🚀 Quick Verification

To verify that your AI receiver is active:
```bash
./test-upload.sh
```
This script will send a test project (`OmniVector Engine`) to the receiver. You can then open the **AI Intake & Studio** page in your browser to see the card waiting in the staging queue, ready to be reviewed and published!
