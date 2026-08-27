# ☁️ Option A: GitHub Repository as Your Cloud Storage

With **Option A**, your GitHub repository `PlanExServices/Static_Upload` serves as your permanent cloud database and code vault.

Every time you approve a card in DelQuro Files, the system automatically commits:
1. **The Project Card**: Stored as a permanent JSON file under `projects/[project-name].json`.
2. **The Source Code File**: Stored as a real source code file under `code/[project-name]/[filename]`.
3. **The Database Snapshot**: Committed to `data/delquro-db.json`.

---

## ⚡ 60-Second Setup

### Step 1: Create a GitHub Personal Access Token
1. Go to **[GitHub Token Settings](https://github.com/settings/tokens?type=beta)** (or GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens).
2. Click **Generate new token**.
3. Set:
   - **Token name**: `DelQuro Cloud Sync`
   - **Repository access**: Select **Only select repositories** > choose **`PlanExServices/Static_Upload`**.
   - **Permissions**: Under **Repository permissions**, set **Contents** to **Read and write**.
4. Click **Generate token** and copy it (`github_pat_...`).

---

### Step 2: Connect it in DelQuro Files
Open either:
- **Render App**: [https://static-upload.onrender.com/](https://static-upload.onrender.com/)
- **GitHub Pages**: [https://planexservices.github.io/Static_Upload/](https://planexservices.github.io/Static_Upload/)

1. In **AI Intake & Studio**, click **"☁️ GitHub Cloud"** (or click **"☁️ Cloud"** at the bottom of the sidebar).
2. Paste your token into the **GitHub Personal Access Token** field.
3. Click **Test Connection** — you will see `✅ Connected to GitHub repository!`.
4. Click **💾 Save Cloud Settings**.

---

### Step 3: (Optional) Set on Render Server for 100% Automated Backend Commits
If you want the Render server itself to commit to GitHub automatically whenever an AI uploads code:
1. Go to your **[Render Dashboard](https://dashboard.render.com)**.
2. Select your `static-upload` service.
3. Go to **Environment** > click **Add Environment Variable**:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: *(Paste your GitHub token)*
4. Click **Save Changes**.

---

## 🌟 Why Option A is the Best Setup

- **Permanent & Free**: GitHub will never delete your files or charge you a monthly database subscription.
- **Real Code in Git**: Your code snippets live as real files in your repo where you can browse them, clone them, or checkout branches anytime.
- **Multi-Device Sync**: Any phone, laptop, or browser running DelQuro Files can pull your projects and code directly from GitHub with one click.
