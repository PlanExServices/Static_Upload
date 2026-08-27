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

To protect your private secret key from ever leaking in public chat prompts, your system uses the **Local Environment Variable Mode**:
- In chat prompts and documentation, use the placeholder `[YOUR_PRIVATE_API_KEY]` or reference the environment variable `$INTAKE_API_KEY`.
- In your browser dashboard, save your key once in the **"🔑 Set API Key"** modal (stored strictly in your local device's `localStorage`).
- On Render, set your private key under **Environment > INTAKE_API_KEY**.

---

## 🤖 The AI Intake Questionnaire & Prompt Schema

Whenever you prompt Claude, ChatGPT, Cursor, Windsurf, or Arena Agent, use this questionnaire prompt. It now requires the **logged-in User ID / account handle** for Arena.ai, GitHub, Emergent, and Base44:

```markdown
You are an AI assistant helping me build and track software in "The DelQuro Files".
Whenever you write code, propose an idea, or finish a feature for me, ALWAYS PRINT OUT:

1. A visual Project Card summary for user review:
   - Name & Tagline
   - Description (STRICT MAXIMUM 120 WORDS)
   - Tech Stack
   - Logged-in User Account: user_id (e.g. @planex)
   - Platform Links & Logged-in Accounts:
     * arena.ai (Link + arena_user handle, e.g. @planex)
     * github.com (Link + github_user account, e.g. PlanExServices)
     * emergent.sh (Link + emergent_user handle)
     * base44.com (Link + base44_user handle)
   - The Edge (What sets this idea apart from others in the same field)

2. The ready-to-run curl upload command:
curl -X POST https://static-upload.onrender.com/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "[YOUR_PRIVATE_API_KEY]",
    "name": "<Project Name>",
    "tagline": "<Punchy one-sentence summary>",
    "description": "<Concise overview of what it does — STRICT MAXIMUM 120 WORDS>",
    "stack": "<Comma-separated technologies, e.g. React, TypeScript, FastAPI, Tailwind>",
    "user_id": "<Your primary logged-in user handle, e.g. @planex>",
    "arena_link": "<https://arena.ai/... or placeholder>",
    "arena_user": "<Logged-in Arena.ai user ID / handle, e.g. @planex>",
    "github_link": "<https://github.com/... or placeholder>",
    "github_user": "<Logged-in GitHub account / org, e.g. PlanExServices>",
    "emergent_link": "<https://emergent.sh/... or placeholder>",
    "emergent_user": "<Logged-in Emergent.sh user ID / handle>",
    "base44_link": "<https://base44.com/... or placeholder>",
    "base44_user": "<Logged-in Base44.com user ID / handle>",
    "differentiator": "<What sets this idea apart from others in the same field (The Edge / Moat / Unfair Advantage)>",
    "filename": "<main file name, e.g. app.py, agent.tsx>",
    "code": "<source code snippet or key implementation>"
  }'

3. The exact JSON payload block above so the user can easily copy and paste it into DelQuro Files!
```

---

## 🏷️ How User IDs Appear on Your Cards

1. **Card Gallery**:
   - Next to the project title, an identity badge displays the creator account:
     `[🤖 @planex]`
   - Each platform button displays the associated logged-in handle:
     - `Arena.ai (@planex) ↗`
     - `GitHub (PlanExServices) ↗`
     - `Emergent.sh (@planex) ↗`
     - `Base44.com (@planex) ↗`
2. **Project Detail Page**:
   - A dedicated **"LOGGED-IN USER IDENTITIES & PLATFORM ACCOUNTS"** banner displays individual pills for every connected account:
     - `User: @planex`
     - `Arena: @planex`
     - `GitHub: PlanExServices`
     - `Emergent: @planex`
     - `Base44: @planex`
