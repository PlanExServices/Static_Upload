# ⚡ The DelQuro Files Pro

> **Project Tracker & Build Log for AI-Augmented Developers with Live AI Code Receiver**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)]()
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

**The DelQuro Files Pro** bridges the gap between fast AI code generation and disciplined project tracking. It provides a live HTTP webhook endpoint (`POST /api/intake`) waiting for code from any AI assistant (ChatGPT, Claude, Cursor, Windsurf, Arena.ai Agent, Aider). Incoming code is automatically analyzed, summarized into a **120-word maximum project card**, tagged with multi-platform links (**Arena.ai**, **GitHub**, **Emergent.sh**, and **Base44.com**), and highlighted with **"The Edge"** (what sets the idea apart).

---

## ✨ Features

- **🟢 Live AI Code Receiver (`POST /api/intake`)**: A zero-dependency Node.js server waiting for incoming code and project payloads 24/7.
- **🤖 Built-in Code & Metadata Analyzer**: Automatically detects languages, extracts frameworks (React, FastAPI, TypeScript, SQLite, etc.), infers titles, docstrings, and platform links.
- **✂️ Strict 120-Word Description Limit**: Real-time interactive word counter with visual warning alerts and a 1-click **Auto-Trim** button.
- **🔗 Multi-Platform Linking**:
  - `arena.ai` URL
  - `github.com` URL
  - `emergent.sh` URL
  - `base44.com` URL
- **💎 The Edge / Differentiator**: Prominent gold-accented callout on every card defining what makes the idea unique compared to competitors in the same field.
- **💻 Attached Source Code Viewer**: Syntax-styled monospace viewer with line numbers, 1-click copy, and download.
- **📦 Zero-Dependency Architecture**: Pure standard library Node.js backend. The frontend is a single-file portable app that also works 100% offline via browser `localStorage`.

---

## 🚀 Quick Start (Local)

### 1. Clone or Download
```bash
git clone https://github.com/YOUR_USERNAME/delquro-files.git
cd delquro-files
```

### 2. Start the Server
No `npm install` needed!
```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Verify the AI Receiver
Run the included test script in another terminal:
```bash
bash test-upload.sh
```
Open **AI Intake & Studio** in your browser to see your test project staged and ready to publish!

---

## 🤖 Tell Your AI How to Upload Code

Give this prompt to Claude, ChatGPT, Cursor, Arena.ai Agent, or Aider:

```markdown
Whenever you build, edit, or propose code for me, format your final deliverable as an intake card and send an HTTP POST request to:
https://YOUR-SERVER-URL/api/intake

Payload format:
{
  "name": "<Project Name>",
  "tagline": "<Punchy one-sentence summary>",
  "description": "<Concise overview of what it does, architecture, and goals — STRICT MAXIMUM 120 WORDS>",
  "stack": "<Comma-separated technologies, e.g. React, TypeScript, FastAPI, Tailwind>",
  "arena_link": "<https://arena.ai/... or placeholder>",
  "github_link": "<https://github.com/... or placeholder>",
  "emergent_link": "<https://emergent.sh/... or placeholder>",
  "base44_link": "<https://base44.com/... or placeholder>",
  "differentiator": "<What sets this idea apart from others in the same field (The Edge / Moat)>",
  "filename": "<main file name, e.g. app.py>",
  "code": "<source code snippet>"
}
```

### Direct Terminal `curl` Upload
```bash
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HyperAgent Router",
    "tagline": "Autonomous multi-model routing engine with sub-50ms latency",
    "description": "HyperAgent Router evaluates prompt complexity in real time and dispatches requests to optimal frontier models. It features zero-config streaming, automatic fallback handling, and semantic caching. Built for high-throughput production environments that demand enterprise reliability.",
    "stack": "TypeScript, Fastify, Redis, Arena SDK",
    "arena_link": "https://arena.ai/c/hyperagent",
    "github_link": "https://github.com/delquro/hyperagent",
    "emergent_link": "https://emergent.sh/app/hyperagent",
    "base44_link": "https://base44.com/apps/hyperagent",
    "differentiator": "Unlike heavy frameworks like LangChain, HyperAgent has zero runtime dependencies, a 12KB footprint, and sub-millisecond dispatch overhead.",
    "filename": "router.ts",
    "code": "// TypeScript code here"
  }'
```

---

## 🌐 1-Click Cloud Deployment

### Free 24/7 Hosting on Render.com
1. Push this repository to GitHub.
2. Log into [Render.com](https://render.com) and click **New + > Web Service**.
3. Select your repository.
4. Set:
   - **Environment**: `Node`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. Click **Create Web Service**.
6. You will get a permanent public URL (e.g. `https://my-delquro.onrender.com`). Your AI endpoint is `https://my-delquro.onrender.com/api/intake`.

### Local Development with Cloudflare Tunnel (Free Public URL)
If running locally on your laptop:
```bash
node server.js
```
In another terminal:
```bash
npx cloudflared tunnel --url http://localhost:3000
```
Cloudflare gives you an instant, free public HTTPS address pointing to your local machine!

### Docker Deployment
```bash
docker build -t delquro-files-pro .
docker run -d -p 3000:3000 --name delquro delquro-files-pro
```

### GitHub Pages (Static / Offline Mode)
1. In your GitHub repo settings, navigate to **Pages**.
2. Select **Deploy from branch: main / root**.
3. Your dashboard will be live at `https://<user>.github.io/<repo>`.
4. In this mode, everything runs client-side with `localStorage`. Use the **"➕ Paste / Drop Code"** button in **AI Intake & Studio** to paste code directly from an AI.

---

## 📂 Repository Structure

```
├── .github/
│   └── workflows/
│       └── pages.yml           # Auto-deploy to GitHub Pages
├── data/
│   ├── delquro-db.json         # Persisted database (projects, ideas, changelog, code)
│   └── inbox.json              # AI intake queue
├── delquro-files-pro.html      # Full-featured single-file application
├── index.html                  # Root static entrypoint
├── server.js                   # Live receiver & REST API (pure Node.js)
├── package.json                # Project metadata & npm scripts
├── Dockerfile                  # Container deployment config
├── AI-INTEGRATION-GUIDE.md     # Detailed prompt cheat sheet for all AI tools
├── DEPLOYMENT.md               # Step-by-step cloud deployment manual
├── test-upload.sh              # Executable verification script
├── LICENSE                     # MIT License
└── README.md                   # This documentation
```

---

## 📄 License

MIT License. Free to use, modify, and distribute.
