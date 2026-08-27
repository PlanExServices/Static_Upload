# The DelQuro Files Pro: AI Intake & Project Organization System

Welcome to your upgraded project organization hub. This system solves the challenge of capturing, structuring, and tracking ideas and code produced by AI assistants into **The DelQuro Files**.

---

## 🟢 Live Public AI Webhook Receiver

Your cloud receiver is deployed and running live 24/7 on Render at:
```
POST https://static-upload.onrender.com/api/intake
```
Your dashboard sites:
- **Render Live Site**: [https://static-upload.onrender.com/](https://static-upload.onrender.com/)
- **GitHub Pages Site**: [https://planexservices.github.io/Static_Upload/](https://planexservices.github.io/Static_Upload/)

---

## 🤖 Tell Your AI How to Upload Code

### Option 1: Give This Prompt to Any AI (Claude, ChatGPT, Arena Agent)
Copy and paste this instruction into your conversation with your AI:

```markdown
You are helping me build and organize projects for "The DelQuro Files".
Whenever you propose an idea, complete a script, or write a feature for me, please output an intake card formatted as JSON and send an HTTP POST request to:
https://static-upload.onrender.com/api/intake

JSON format:
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
curl -X POST https://static-upload.onrender.com/api/intake \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "name": "HyperAgent Router",
  "tagline": "Autonomous multi-model query router with sub-50ms latency",
  "description": "HyperAgent Router evaluates prompt complexity in real time and dispatches requests to optimal frontier models. It features zero-config streaming, automatic fallback handling, and semantic caching. Built for high-throughput production environments that demand enterprise reliability.",
  "stack": "TypeScript, Fastify, Redis, Arena SDK",
  "arena_link": "https://arena.ai/c/hyperagent",
  "github_link": "https://github.com/PlanExServices/Static_Upload",
  "emergent_link": "https://emergent.sh/app/hyperagent",
  "base44_link": "https://base44.com/apps/hyperagent",
  "differentiator": "Unlike heavy frameworks like LangChain, HyperAgent has zero runtime dependencies, a 12KB footprint, and sub-millisecond dispatch overhead.",
  "filename": "router.ts",
  "code": "// Source code here"
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
2. POST the payload to https://static-upload.onrender.com/api/intake so it appears in The DelQuro Files intake staging queue.
```

### Option 4: Quick Web Dropzone (No Network Access Needed)
If your AI is running in a locked-down environment without outbound internet access:
1. Open **[https://static-upload.onrender.com/](https://static-upload.onrender.com/)** or **[https://planexservices.github.io/Static_Upload/](https://planexservices.github.io/Static_Upload/)**.
2. Click **AI Intake & Studio** in the navigation.
3. Click the **"Paste / Drop Code"** button.
4. Paste the code or conversation transcript.
5. Click **"Analyze & Build Card"** — the built-in parser automatically extracts all 8 fields, enforces the 120-word limit, and loads it into the interactive Card Studio!

---

## 🛠 File Structure & Deliverables

| File | Description |
| :--- | :--- |
| `delquro-files-pro.html` | The complete, upgraded single-file application. Works offline, on GitHub Pages, Emergent, or Base44. |
| `index.html` | Root entrypoint served by Render, GitHub Pages, and dev servers. |
| `server.js` | Zero-dependency Node.js server handling the live receiver (`/api/intake`), project API, and static files. |
| `data/delquro-db.json` | Persisted database storing projects, ideas, changelog, builds, code, and dialogues. |
| `data/inbox.json` | Staged AI code uploads waiting to be converted into cards. |
| `test-upload.sh` | Executable verification script that tests uploading an AI project payload. |
| `render.yaml` | Render 1-click blueprint configuration. |
| `railway.json` | Railway configuration. |
| `AI-INTEGRATION-GUIDE.md` | This reference guide and prompt cheat sheet. |
| `RENDER-DEPLOYMENT.md` | Complete Render setup manual. |
