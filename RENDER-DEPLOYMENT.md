# 🚀 Render Deployment Guide for PlanExServices/Static_Upload

Render is significantly simpler than Railway:
- **100% Free Forever Tier**
- **No credit card required** to sign up
- **Direct GitHub integration** with automatic deploys on every push
- **Free permanent HTTPS domain** (`https://[your-app].onrender.com`)

---

## ⚡ 3-Minute Render Setup

### Step 1: Sign in to Render with GitHub
1. Go to **[https://render.com](https://render.com)**.
2. Click **Get Started** or **Sign In** and choose **GitHub**.

---

### Step 2: Create a Free Web Service
1. On your Render dashboard, click the blue **New +** button (top right).
2. Select **Web Service**.
3. Under *Connect a repository*, find and select:
   👉 **`PlanExServices/Static_Upload`**
4. Configure the settings:
   - **Name**: `static-upload` *(or any name you prefer)*
   - **Region**: Choose one closest to you (e.g. `Oregon (US West)` or `Ohio (US East)`)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: *(leave blank or `npm install`)*
   - **Start Command**: `node server.js`
   - **Instance Type**: Select **Free** ($0/month)
5. Click **Create Web Service** at the bottom of the page.

*(Alternatively, because this repository contains `render.yaml`, you can also choose **New + > Blueprint** and select `PlanExServices/Static_Upload` to deploy automatically with zero manual inputs!)*

---

### Step 3: Get Your Permanent Live AI Webhook URL
Within 45 seconds, Render will build and deploy your service.
At the top of your service page, you will see your live public URL:

```
https://static-upload.onrender.com
```

Your permanent live endpoint for all AI assistants is:
```
POST https://static-upload.onrender.com/api/intake
```

---

## 🔗 Connect Render to Your GitHub Pages Site

You now have two seamless ways to access your system:

### Option A: Use the Render Site Directly
Open:
```
https://static-upload.onrender.com/
```
It runs the complete DelQuro Files Pro app with the live AI receiver and card studio running on the same server.

### Option B: Connect Render to Your GitHub Pages Site
Open your live GitHub Pages dashboard at:
👉 **[https://planexservices.github.io/Static_Upload/](https://planexservices.github.io/Static_Upload/)**

1. Navigate to **AI Intake & Studio**.
2. Click the **"Connect Render URL"** button.
3. Paste your Render domain: `https://static-upload.onrender.com`.
4. Click **Save & Connect**.

Your GitHub Pages site will now continuously poll and sync incoming code uploads from Render in real time!

---

## 🤖 Tell Your AI How to Upload Code via Render

Give this instruction to Claude, ChatGPT, Cursor, Windsurf, Arena Agent, or Aider:

> *"Whenever you build, edit, or propose code for me, format your deliverable as an intake card and send an HTTP POST request to:*
> `https://static-upload.onrender.com/api/intake`
> 
> *Payload schema:*
> ```json
> {
>   "name": "<Project Name>",
>   "tagline": "<Punchy one-sentence summary>",
>   "description": "<Concise overview, architecture, goals — STRICT MAXIMUM 120 WORDS>",
>   "stack": "<Comma-separated stack, e.g. React, TypeScript, FastAPI, Tailwind>",
>   "arena_link": "<https://arena.ai/... or placeholder>",
>   "github_link": "<https://github.com/... or placeholder>",
>   "emergent_link": "<https://emergent.sh/... or placeholder>",
>   "base44_link": "<https://base44.com/... or placeholder>",
>   "differentiator": "<What sets this idea apart from others in the same field (The Edge / Moat)>",
>   "filename": "<main file name, e.g. app.py>",
>   "code": "<source code snippet>"
> }
> ```

---

## 🧪 Test Your Live Render Webhook

From any terminal:
```bash
curl -X POST https://static-upload.onrender.com/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HyperAgent Router",
    "tagline": "Autonomous multi-model query router with sub-50ms latency",
    "description": "HyperAgent Router evaluates prompt complexity in real time and dispatches requests to optimal frontier models with zero framework bloat.",
    "stack": "TypeScript, Fastify, Redis, Arena SDK",
    "arena_link": "https://arena.ai/c/hyperagent",
    "github_link": "https://github.com/PlanExServices/Static_Upload",
    "emergent_link": "https://emergent.sh/app/hyperagent",
    "base44_link": "https://base44.com/apps/hyperagent",
    "differentiator": "Unlike heavy frameworks like LangChain, HyperAgent has zero runtime dependencies, a 12KB footprint, and sub-millisecond dispatch overhead.",
    "code": "// TypeScript router code"
  }'
```
Your card will immediately appear in **AI Intake & Studio** on both your Render site and your GitHub Pages site!
