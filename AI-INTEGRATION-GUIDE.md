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

## 🔒 Security: Local Environment Variable Mode

To prevent your secret key from ever being exposed in public chat prompts, your system uses the **Local Environment Variable Mode**:
- On Render, the server enforces your secret key (`INTAKE_API_KEY`).
- On your computer or local shell, you store the key once in your environment:
  ```bash
  export INTAKE_API_KEY="f67d832c80a1fe6bfdce41f3d3ea94bd"
  ```
  *(Add this line to your `~/.bashrc` or `~/.zshrc` so it is always available).*
- In chat prompts and curl scripts, you and the AI reference **`$INTAKE_API_KEY`**.
- When the command runs, your local shell evaluates `$INTAKE_API_KEY` automatically. **Your secret key is never leaked in the public chat!**

---

## 🤖 Tell Your AI How to Upload Code (Safe for Public Chats)

### Option 1: Safe Public Chat Prompt (Claude, ChatGPT, Arena Agent)
Copy and paste this prompt into any public or shared AI chat:

```markdown
You are helping me build and organize projects for "The DelQuro Files".
Whenever you propose an idea, complete a script, or write a feature for me:
1. Formulate a structured project intake card conforming to the JSON schema below.
2. Send an HTTP POST request to: https://static-upload.onrender.com/api/intake
   (Include the authorization header: -H "X-API-Key: $INTAKE_API_KEY")

JSON Schema:
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

---

### Option 2: Terminal / CLI Upload (curl)
Run this command from any terminal or AI coding agent (Cursor, Windsurf, Aider):

```bash
curl -X POST https://static-upload.onrender.com/api/intake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $INTAKE_API_KEY" \
  -d @- << 'EOF'
{
  "name": "HyperAgent Router",
  "tagline": "Autonomous multi-model query router with sub-50ms latency",
  "description": "HyperAgent Router evaluates prompt complexity in real time and dispatches requests to optimal frontier models with zero framework bloat.",
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

---

### Option 3: Cursor / Windsurf / Copilot (`.cursorrules`)
Add this rule to your project's `.cursorrules` or system prompt:
```
When finishing a code milestone or building a new feature:
1. Formulate a project card definition:
   - name, tagline
   - description (STRICTLY <= 120 words)
   - stack
   - arena_link, github_link, emergent_link, base44_link
   - differentiator ("what sets this idea apart")
2. Send HTTP POST request to https://static-upload.onrender.com/api/intake using header:
   X-API-Key: $INTAKE_API_KEY
```

---

### Option 4: Quick Web Dropzone (No Keys, 100% Offline)
If you don't want any network calls:
1. Open **[https://static-upload.onrender.com/](https://static-upload.onrender.com/)** or **[https://planexservices.github.io/Static_Upload/](https://planexservices.github.io/Static_Upload/)**.
2. Click **AI Intake & Studio** > **"➕ Paste / Drop Code"**.
3. Paste the code or prompt response — the built-in parser automatically extracts all 8 fields, enforces the 120-word limit, and loads it into the interactive Card Studio!
