# How to Publish The DelQuro Files Pro (Permanent AI Receiver & Website)

Because a sandbox session is temporary, you need a permanent public URL so that AI assistants (ChatGPT, Claude, Cursor, Windsurf, Arena, etc.) can reach your intake endpoint (`POST /api/intake`) 24/7.

Here are the **4 best ways to publish**, ranging from 1-click free cloud hosting to local tunnels.

---

## 🚀 Option 1: Free 24/7 Cloud Web Service (Recommended: Render or Railway)

This hosts both the **web dashboard** and the **live intake API** with a permanent HTTPS address.

### A. Deploy to Render (100% Free Tier)
1. Create a GitHub repository (e.g. `delquro-files`) and push these files:
   - `server.js`
   - `delquro-files-pro.html`
   - `index.html`
   - `package.json`
   - `data/` directory
2. Go to [Render.com](https://render.com) and click **New + > Web Service**.
3. Connect your GitHub repository.
4. Set the settings:
   - **Environment**: `Node`
   - **Build Command**: *(leave blank or `npm install`)*
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Click **Create Web Service**.
6. Render gives you a permanent public HTTPS domain, for example:
   ```
   https://delquro-files.onrender.com
   ```
   Your AI endpoint is now permanently live at:
   ```
   https://delquro-files.onrender.com/api/intake
   ```

### B. Deploy to Railway.app
1. Go to [Railway.app](https://railway.app) and click **New Project > Deploy from GitHub repo**.
2. Select your repository. Railway automatically detects `server.js` and `package.json`.
3. In **Settings > Networking**, click **Generate Domain**.
4. You will get a permanent public URL like `https://delquro.up.railway.app`.

---

## ⚡ Option 2: Running Locally on Your Machine + Cloudflare Tunnel (Free, Zero Config)

If you primarily use local AI tools like **Cursor**, **Windsurf**, **VS Code Copilot**, or **Aider**:

1. Download the project folder to your computer.
2. Start the server:
   ```bash
   node server.js
   ```
   Your local AI tools can immediately POST to `http://localhost:3000/api/intake`.

3. **To let external AIs (ChatGPT web, Claude web, Arena Agent) reach your computer**, open a second terminal and run:
   ```bash
   npx cloudflared tunnel --url http://localhost:3000
   ```
   *(No account or installation required — `npx` runs it directly).*
4. Cloudflare gives you a free, public HTTPS URL like:
   ```
   https://random-words.trycloudflare.com
   ```
   Your AI endpoint is:
   ```
   https://random-words.trycloudflare.com/api/intake
   ```
   Whenever you tell ChatGPT or Claude to upload, it posts directly to your local DelQuro Files!

---

## 🌐 Option 3: Deploying on Base44.com or Emergent.sh

Since you track URLs for **Base44.com** and **Emergent.sh**:

### Deploying to Base44.com
1. Log in to [Base44.com](https://base44.com).
2. Create a new App / Project.
3. Select **Import Existing Web App / Repository** or upload `index.html` (`delquro-files-pro.html`).
4. If deploying the backend, use Base44's Node.js container runner pointing to `server.js`.

### Deploying to Emergent.sh
1. In [Emergent.sh](https://emergent.sh), launch an app workspace.
2. Mount your repository or import the `Dockerfile` included in this folder.
3. Emergent will expose port `3000` with an assigned public URL:
   `https://[your-app-id].emergent.sh/api/intake`

---

## 📄 Option 4: Static Hosting on GitHub Pages (Zero Server Needed)

If you only want the client dashboard hosted on GitHub Pages:
1. Create a repository on GitHub.
2. Place `delquro-files-pro.html` renamed to `index.html` in the root or `gh-pages` branch.
3. Go to **Repo Settings > Pages** and select **Deploy from branch: main / root**.
4. Your dashboard will be live at `https://[your-username].github.io/[repo-name]`.
5. In this mode:
   - All projects, cards, and logs save directly to your browser's `localStorage`.
   - To add code from an AI: Click **AI Intake & Studio > "➕ Paste / Drop Code"**, paste the AI snippet, and the in-browser synthesizer automatically generates the card!
   - You can also export/import JSON backups anytime using the sidebar buttons.

---

## 📋 Updated "Tell Your AI" Prompt for Your Published Domain

Once your site is published at your custom domain (e.g. `https://my-delquro.onrender.com`), give this exact prompt to any AI:

```markdown
Whenever you build, edit, or propose code for me, format your final deliverable as an intake card and send an HTTP POST request to:
https://YOUR-PUBLISHED-DOMAIN/api/intake

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
