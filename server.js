/**
 * The DelQuro Files Pro — AI Code Intake Receiver & Project Management Server
 * Zero external dependencies — runs on standard Node.js (v18+)
 * Fully optimized for Railway, Render, Docker, and Local environments.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Railway sets PORT dynamically (e.g. 8080 or random port)
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Support custom persistent volume if configured in Railway (e.g. DATA_DIR=/data)
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");

// Security configuration (Set INTAKE_API_KEY in Render dashboard under Environment)
const INTAKE_API_KEY = (process.env.INTAKE_API_KEY || "").trim();

// GitHub Cloud Storage Configuration (Option A)
const GITHUB_REPO = process.env.GITHUB_REPO || "PlanExServices/Static_Upload";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

function slugify(str) {
  return (str || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function commitFileToGitHub(filePath, contentString, commitMessage) {
  if (!GITHUB_TOKEN) return false;
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
    let existingSha = null;
    try {
      const getRes = await fetch(url + `?ref=${GITHUB_BRANCH}`, {
        headers: {
          "Authorization": `Bearer ${GITHUB_TOKEN}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "DelQuro-Files"
        }
      });
      if (getRes.ok) {
        const fileData = await getRes.json();
        existingSha = fileData.sha;
      }
    } catch (e) {}

    const base64Content = Buffer.from(contentString, "utf8").toString("base64");
    const payload = {
      message: commitMessage || `Update ${filePath} via DelQuro Files Pro`,
      content: base64Content,
      branch: GITHUB_BRANCH
    };
    if (existingSha) payload.sha = existingSha;

    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "DelQuro-Files"
      },
      body: JSON.stringify(payload)
    });

    return putRes.ok;
  } catch (err) {
    console.error("[GitHub Cloud Sync] Error:", err.message);
    return false;
  }
}

async function syncProjectToGitHub(project, db) {
  if (!GITHUB_TOKEN) return;
  const slug = slugify(project.name);
  try {
    // 1. Commit main database file
    await commitFileToGitHub("data/delquro-db.json", JSON.stringify(db, null, 2), `Cloud Sync: add ${project.name}`);
    // 2. Commit project card JSON
    await commitFileToGitHub(`projects/${slug}.json`, JSON.stringify(project, null, 2), `Cloud Card: ${project.name}`);
    // 3. Commit attached source code file
    if (project.attached_code) {
      const ext = (project.filename && project.filename.includes(".")) ? project.filename.split(".").pop() : "txt";
      const codeFilename = project.filename || `source.${ext}`;
      await commitFileToGitHub(`code/${slug}/${codeFilename}`, project.attached_code, `Cloud Code: ${project.name}`);
    }
  } catch (e) {
    console.error("[GitHub Cloud Sync] Error syncing project to repo:", e);
  }
}


// Rate limiting: 60 requests per minute per IP
const ipRateMap = new Map();
function checkRateLimit(ip, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const record = ipRateMap.get(ip) || { count: 0, reset: now + windowMs };
  if (now > record.reset) {
    record.count = 0;
    record.reset = now + windowMs;
  }
  record.count++;
  ipRateMap.set(ip, record);
  return record.count <= limit;
}

function isAuthorized(req, parsedUrl, bodyPayload = null) {
  if (!INTAKE_API_KEY) {
    // Locked down: reject until user configures INTAKE_API_KEY in Render environment
    return false;
  }
  const expected = (INTAKE_API_KEY || "").trim();
  const headerKey = (req.headers["x-api-key"] || "").trim();
  const authHeader = (req.headers["authorization"] || "").trim();
  const bearerToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  const queryToken = (parsedUrl.searchParams.get("token") || parsedUrl.searchParams.get("key") || parsedUrl.searchParams.get("api_key") || "").trim();

  let bodyKey = "";
  if (bodyPayload && typeof bodyPayload === "object") {
    bodyKey = String(bodyPayload.api_key || bodyPayload.apiKey || bodyPayload.key || bodyPayload.token || "").trim();
  }

  return (
    headerKey === expected ||
    bearerToken === expected ||
    queryToken === expected ||
    bodyKey === expected
  );
}

const DB_FILE = path.join(DATA_DIR, "delquro-db.json");
const INBOX_FILE = path.join(DATA_DIR, "inbox.json");

// Resolve public HTML file
let PUBLIC_HTML = path.join(__dirname, "index.html");
if (!fs.existsSync(PUBLIC_HTML)) {
  PUBLIC_HTML = path.join(__dirname, "delquro-files-pro.html");
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper: Word counter
function countWords(str) {
  return (str || "").trim().split(/\s+/).filter(Boolean).length;
}

// Helper: Intelligent code analyzer to extract fields from raw code
function analyzeCode(rawCode, filename = "") {
  const code = rawCode || "";
  function extract(regex) {
    const m = code.match(regex);
    return m ? m[1].trim() : "";
  }

  // 1. Check explicit headers or comments
  let name = extract(/(?:name|project|title):\s*([^\r\n]+)/i);
  let tagline = extract(/(?:tagline|summary):\s*([^\r\n]+)/i);
  let desc = extract(/(?:description|desc|about):\s*([^\r\n]+)/i);
  let diff = extract(/(?:differentiator|edge|sets\s+it\s+apart|unique|moat):\s*([^\r\n]+)/i);
  let stack = extract(/(?:stack|tech|technologies):\s*([^\r\n]+)/i);

  // 2. Extract platform links
  let arena = extract(/(https?:\/\/(?:www\.)?arena\.ai\S*)/i);
  let github = extract(/(https?:\/\/(?:www\.)?github\.com\S*)/i);
  let emergent = extract(/(https?:\/\/(?:www\.)?emergent\.sh\S*)/i);
  let base44 = extract(/(https?:\/\/(?:www\.)?base44\.com\S*)/i);

  // Clean trailing punctuation from URLs
  [arena, github, emergent, base44].forEach((url, idx) => {
    const cleaned = url ? url.replace(/[,;)"']+$/, "") : "";
    if (idx === 0) arena = cleaned;
    if (idx === 1) github = cleaned;
    if (idx === 2) emergent = cleaned;
    if (idx === 3) base44 = cleaned;
  });

  // 3. Stack heuristic detection
  const detectedStack = [];
  if (/react/i.test(code) || /useState/i.test(code)) detectedStack.push("React");
  if (/typescript|\.tsx?/i.test(filename) || /:\s*(string|number|boolean)/.test(code)) detectedStack.push("TypeScript");
  if (/fastapi/i.test(code)) { detectedStack.push("FastAPI"); detectedStack.push("Python"); }
  else if (/flask/i.test(code)) { detectedStack.push("Flask"); detectedStack.push("Python"); }
  else if (/def |import sys|print\(/i.test(code)) detectedStack.push("Python");
  if (/sqlite/i.test(code)) detectedStack.push("SQLite");
  if (/tailwind|className=/i.test(code)) detectedStack.push("TailwindCSS");
  if (/arena/i.test(code) && !detectedStack.includes("Arena SDK")) detectedStack.push("Arena SDK");
  if (/base44/i.test(code)) detectedStack.push("Base44 SDK");
  if (/emergent/i.test(code)) detectedStack.push("Emergent Engine");
  if (/docker|container/i.test(code)) detectedStack.push("Docker");
  if (/next/i.test(code) || /getServerSideProps/i.test(code)) detectedStack.push("Next.js");
  if (/express/i.test(code)) detectedStack.push("Express", "Node.js");

  if (!stack && detectedStack.length) {
    stack = [...new Set(detectedStack)].join(", ");
  }

  // 4. Name fallback
  if (!name) {
    const titleMatch = code.match(/<title>([^<]+)<\/title>/i) ||
                       code.match(/FastAPI\s*\(\s*title=["']([^"']+)["']/i) ||
                       code.match(/(?:class|function)\s+([A-Z][A-Za-z0-9_]+)/);
    if (titleMatch) {
      name = titleMatch[1].replace(/([A-Z])/g, " $1").trim();
    } else if (filename) {
      name = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    } else {
      name = "Autonomous AI Module";
    }
  }

  // 5. Tagline fallback
  if (!tagline) {
    tagline = `High-performance ${detectedStack.slice(0, 3).join("/") || "software"} architecture built for rapid execution.`;
  }

  // 6. Description fallback
  if (!desc) {
    const docMatch = code.match(/"""([\s\S]*?)"""/) || code.match(/\/\*([\s\S]*?)\*\//);
    if (docMatch) {
      desc = docMatch[1].replace(/\*/g, "").trim().replace(/\s+/g, " ");
    } else {
      desc = `Streamlined implementation featuring modular components, robust state management, and optimized execution flow. Designed for scalable deployment with direct integration across modern cloud environments.`;
    }
  }

  // Strict 120-word maximum cap
  const words = desc.trim().split(/\s+/).filter(Boolean);
  if (words.length > 120) {
    desc = words.slice(0, 120).join(" ") + "...";
  }

  // 7. Differentiator fallback
  if (!diff) {
    diff = "Zero runtime bloat with direct-to-metal execution and instant multi-platform deployment capability.";
  }

  return {
    name,
    tagline,
    description: desc,
    wordCount: countWords(desc),
    stack: stack || "JavaScript, CSS, HTML",
    arena_link: arena,
    github_link: github,
    emergent_link: emergent,
    base44_link: base44,
    differentiator: diff,
    filename: filename || "snippet.txt",
    code
  };
}

// Storage helpers
function loadJSON(filePath, fallback = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (err) {
    console.error("Error reading " + filePath, err);
  }
  return fallback;
}

function saveJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving " + filePath, err);
  }
}

// Initial DB setup if empty
function getDB() {
  const fallback = {
    nextId: 1,
    projects: [],
    ideas: [],
    changelog: [],
    builds: [],
    code: [],
    dialogues: [],
    inbox: []
  };

  const current = loadJSON(DB_FILE, fallback);
  if (!current.inbox) current.inbox = [];
  if (!current.projects) current.projects = [];
  return current;
}

function getInbox() {
  const db = getDB();
  return db.inbox || [];
}

function saveInbox(inbox) {
  const db = getDB();
  db.inbox = inbox;
  saveJSON(DB_FILE, db);
}

// Parse request body
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) { // 25MB limit
        req.destroy();
        reject(new Error("Payload too large (max 5MB)"));
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// Request dispatcher
const server = http.createServer(async (req, res) => {
  // Global CORS headers for seamless AI and browser interaction from any origin
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  if (!checkRateLimit(clientIP)) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too Many Requests", message: "Rate limit exceeded. Please wait a minute." }));
    return;
  }
  const pathname = parsedUrl.pathname;

  // JSON helper
  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data, null, 2));
  };

  try {
            // ----------------------------------------------------
    // API: GET /api/github/status — GitHub Cloud Sync Status
    // ----------------------------------------------------
    if (pathname === "/api/github/status" && req.method === "GET") {
      return sendJSON(200, {
        enabled: Boolean(GITHUB_TOKEN),
        repository: GITHUB_REPO,
        branch: GITHUB_BRANCH,
        message: GITHUB_TOKEN ? "GitHub Cloud Storage is active. All projects commit directly to " + GITHUB_REPO : "GitHub token not set. Set GITHUB_TOKEN in Render environment to enable automatic repo commits."
      });
    }

    // ----------------------------------------------------
    // API: POST /api/github/sync — Push all data to GitHub
    // ----------------------------------------------------
    if (pathname === "/api/github/sync" && req.method === "POST") {
      const db = getDB();
      if (!GITHUB_TOKEN) {
        return sendJSON(400, { success: false, error: "GITHUB_TOKEN is not configured on server." });
      }
      const success = await commitFileToGitHub("data/delquro-db.json", JSON.stringify(db, null, 2), "Manual Cloud Backup from DelQuro Files Pro");
      return sendJSON(success ? 200 : 500, {
        success,
        message: success ? "All projects and logs committed to " + GITHUB_REPO : "Failed to commit to GitHub. Check token permissions."
      });
    }

    // ----------------------------------------------------
    // API: POST /api/verify-key — Verify API key from app
    // ----------------------------------------------------
    if (pathname === "/api/verify-key" && req.method === "POST") {
      const rawBody = await readBody(req);
      let payload = {};
      try { payload = JSON.parse(rawBody); } catch (e) {}

      if (!INTAKE_API_KEY) {
        return sendJSON(200, {
          valid: true,
          authEnabled: false,
          message: "Server is in open mode (no INTAKE_API_KEY set on server). All uploads accepted."
        });
      }

      const valid = isAuthorized(req, parsedUrl, payload);
      return sendJSON(valid ? 200 : 401, {
        valid,
        authEnabled: true,
        message: valid ? "API key is valid and verified by server! ✓" : "Invalid API key. Check INTAKE_API_KEY in Render."
      });
    }

    // ----------------------------------------------------
    // API: System Status & Railway Healthcheck
    // ----------------------------------------------------
    if ((pathname === "/api/status" || pathname === "/health" || pathname === "/ping") && req.method === "GET") {
      const db = getDB();
      return sendJSON(200, {
        status: "online",
        service: "The DelQuro Files Pro",
        platform: process.env.RAILWAY_ENVIRONMENT ? "Railway" : "Node.js",
        port: PORT,
        intakeEndpoint: "/api/intake",
        projectCount: (db.projects || []).length,
        inboxCount: (db.inbox || []).length,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      });
    }

    // ----------------------------------------------------
    // API: GET /api/intake — List queued uploads
    // ----------------------------------------------------
    if (pathname === "/api/intake" && req.method === "GET") {
      return sendJSON(200, {
        success: true,
        count: getInbox().length,
        items: getInbox()
      });
    }

    // ----------------------------------------------------
    // API: POST /api/intake — AI uploads code (supports api_key in JSON body)
    // ----------------------------------------------------
    if (pathname === "/api/intake" && req.method === "POST") {
      const rawBody = await readBody(req);
      let payload = {};

      // 1. Clean rawBody: strip markdown code blocks like ```json ... ``` or ``` ... ```
      let cleaned = (rawBody || "").trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

      try {
        payload = JSON.parse(cleaned);
      } catch (e) {
        // Try searching for JSON inside text
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try { payload = JSON.parse(jsonMatch[0]); } catch (e2) { payload = { code: cleaned }; }
        } else {
          payload = { code: cleaned, filename: "uploaded_code.txt" };
        }
      }

      // Check authorization: header, query param, or JSON body "api_key"
      if (!isAuthorized(req, parsedUrl, payload)) {
        return sendJSON(401, {
          success: false,
          error: "Unauthorized",
          message: "Valid API key required. Pass 'api_key' in JSON payload, 'X-API-Key' header, 'Authorization: Bearer <key>', or '?token=<key>'."
        });
      }

      // 2. Extract code & filename flexibly
      let rawCode = payload.code || payload.content || payload.source || payload.source_code || payload.script || "";
      let filename = payload.filename || payload.file || payload.name || "snippet.txt";

      // If AI passed multi-file array: {"files": [{"path": "...", "content": "..."}]}
      if (!rawCode && Array.isArray(payload.files) && payload.files.length) {
        rawCode = payload.files.map(f => {
          if (typeof f === "string") return f;
          return `// File: ${f.path || f.name || "file"}\n${f.content || f.code || ""}`;
        }).join("\n\n// ==========================================\n\n");
        filename = (payload.files[0].path || payload.files[0].name || "project_bundle.txt");
      }
      if (!rawCode && !payload.name && !payload.title) {
        rawCode = cleaned;
      }

      // 3. Analyze code heuristics for missing fields
      const analyzed = analyzeCode(rawCode, filename);

      // 4. Resolve all field aliases gracefully
      const finalName = (payload.name || payload.title || payload.project_name || payload.projectName || analyzed.name).trim();
      const finalTagline = (payload.tagline || payload.summary || payload.hook || payload.one_liner || analyzed.tagline).trim();
      let finalDesc = (payload.description || payload.desc || payload.about || payload.overview || analyzed.description).trim();
      const finalStack = (payload.stack || payload.tech_stack || payload.technologies || payload.tools || analyzed.stack).trim();
      const finalArena = (payload.arena_link || payload.arena_url || payload.arena || analyzed.arena_link).trim();
      const finalGithub = (payload.github_link || payload.github_url || payload.github || payload.repo || payload.repository || analyzed.github_link).trim();
      const finalEmergent = (payload.emergent_link || payload.emergent_url || payload.emergent || analyzed.emergent_link).trim();
      const finalBase44 = (payload.base44_link || payload.base44_url || payload.base44 || analyzed.base44_link).trim();
      const finalDiff = (payload.differentiator || payload.edge || payload.moat || payload.why || payload.sets_apart || analyzed.differentiator).trim();

      // Enforce 120-word maximum limit on description
      const words = finalDesc.split(/\s+/).filter(Boolean);
      if (words.length > 120) {
        finalDesc = words.slice(0, 120).join(" ") + "...";
      }

      const intakeItem = {
        id: "inbox-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        name: finalName,
        tagline: finalTagline,
        description: finalDesc,
        wordCount: countWords(finalDesc),
        stack: finalStack,
        arena_link: finalArena,
        github_link: finalGithub,
        emergent_link: finalEmergent,
        base44_link: finalBase44,
        differentiator: finalDiff,
        filename: filename,
        code: rawCode,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      const inbox = getInbox();
      inbox.unshift(intakeItem);
      saveInbox(inbox);

      return sendJSON(201, {
        success: true,
        message: "Code successfully received and drafted into project card!",
        id: intakeItem.id,
        item: intakeItem
      });
    }

    // ----------------------------------------------------
    // API: DELETE /api/intake/:id — Dismiss item
    // ----------------------------------------------------
    if (pathname.startsWith("/api/intake/") && req.method === "DELETE") {
      const id = pathname.replace("/api/intake/", "");
      let inbox = getInbox();
      inbox = inbox.filter(item => item.id !== id);
      saveInbox(inbox);
      return sendJSON(200, { success: true, message: `Intake item ${id} deleted.` });
    }

    // ----------------------------------------------------
    // API: POST /api/intake/:id/convert — Convert to Project
    // ----------------------------------------------------
    if (pathname.match(/^\/api\/intake\/([^/]+)\/convert$/) && req.method === "POST") {
      const id = pathname.match(/^\/api\/intake\/([^/]+)\/convert$/)[1];
      const rawBody = await readBody(req);
      let overrides = {};
      try { overrides = JSON.parse(rawBody); } catch (e) {}

      const db = getDB();
      const itemIdx = (db.inbox || []).findIndex(i => i.id === id);
      if (itemIdx === -1 && !overrides.name) {
        return sendJSON(404, { success: false, error: "Intake item not found" });
      }

      const item = itemIdx !== -1 ? db.inbox[itemIdx] : {};
      const newProjectId = db.nextId++;

      let desc = (overrides.description || item.description || "").trim();
      const words = desc.split(/\s+/).filter(Boolean);
      if (words.length > 120) {
        desc = words.slice(0, 120).join(" ") + "...";
      }

      const newProject = {
        id: newProjectId,
        name: overrides.name || item.name || "New Project",
        tagline: overrides.tagline || item.tagline || "",
        description: desc,
        status: overrides.status || "active",
        stack: overrides.stack || item.stack || "",
        arena_link: overrides.arena_link || item.arena_link || "",
        github_link: overrides.github_link || item.github_link || "",
        emergent_link: overrides.emergent_link || item.emergent_link || "",
        base44_link: overrides.base44_link || item.base44_link || "",
        differentiator: overrides.differentiator || item.differentiator || "",
        attached_code: overrides.code || item.code || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.projects.unshift(newProject);

      if (newProject.attached_code) {
        db.code.unshift({
          id: db.nextId++,
          projectId: newProjectId,
          title: (overrides.filename || item.filename || newProject.name) + " (Source)",
          language: (newProject.stack || "code").split(",")[0].toLowerCase().trim(),
          notes: `Uploaded via AI Intake for ${newProject.name}`,
          code: newProject.attached_code,
          createdAt: new Date().toISOString()
        });
      }

      if (itemIdx !== -1) {
        db.inbox.splice(itemIdx, 1);
      }

      saveJSON(DB_FILE, db);
      syncProjectToGitHub(newProject, db);

      return sendJSON(201, {
        success: true,
        message: "Project card successfully published to DelQuro Files!",
        project: newProject
      });
    }

    // ----------------------------------------------------
    // API: GET /api/projects — Return all projects
    // ----------------------------------------------------
    if (pathname === "/api/projects" && req.method === "GET") {
      const db = getDB();
      return sendJSON(200, { success: true, projects: db.projects || [] });
    }

    // ----------------------------------------------------
    // API: POST /api/projects — Create or update project
    // ----------------------------------------------------
    if (pathname === "/api/projects" && req.method === "POST") {
      const rawBody = await readBody(req);
      const data = JSON.parse(rawBody);
      const db = getDB();

      let desc = (data.description || "").trim();
      const words = desc.split(/\s+/).filter(Boolean);
      if (words.length > 120) {
        desc = words.slice(0, 120).join(" ") + "...";
      }
      data.description = desc;

      if (data.id) {
        const idx = db.projects.findIndex(p => p.id === data.id);
        if (idx !== -1) {
          db.projects[idx] = { ...db.projects[idx], ...data, updatedAt: new Date().toISOString() };
          saveJSON(DB_FILE, db);
          return sendJSON(200, { success: true, project: db.projects[idx] });
        }
      }

      const newId = db.nextId++;
      const created = {
        id: newId,
        name: data.name || "Untitled Project",
        tagline: data.tagline || "",
        description: data.description || "",
        status: data.status || "active",
        stack: data.stack || "",
        arena_link: data.arena_link || "",
        github_link: data.github_link || "",
        emergent_link: data.emergent_link || "",
        base44_link: data.base44_link || "",
        differentiator: data.differentiator || "",
        attached_code: data.attached_code || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.projects.unshift(created);
      saveJSON(DB_FILE, db);
      syncProjectToGitHub(created, db);
      return sendJSON(201, { success: true, project: created });
    }

    // ----------------------------------------------------
    // API: POST /api/sync — Bidirectional full DB sync
    // ----------------------------------------------------
    if (pathname === "/api/sync" && req.method === "POST") {
      const rawBody = await readBody(req);
      const clientDB = JSON.parse(rawBody);
      const serverDB = getDB();

      const mergedProjects = [...serverDB.projects];
      (clientDB.projects || []).forEach(cp => {
        const idx = mergedProjects.findIndex(sp => sp.id === cp.id);
        if (idx === -1) {
          mergedProjects.unshift(cp);
        } else {
          mergedProjects[idx] = { ...mergedProjects[idx], ...cp };
        }
      });

      serverDB.projects = mergedProjects;
      serverDB.ideas = clientDB.ideas && clientDB.ideas.length ? clientDB.ideas : serverDB.ideas;
      serverDB.changelog = clientDB.changelog && clientDB.changelog.length ? clientDB.changelog : serverDB.changelog;
      serverDB.builds = clientDB.builds && clientDB.builds.length ? clientDB.builds : serverDB.builds;
      serverDB.code = clientDB.code && clientDB.code.length ? clientDB.code : serverDB.code;
      serverDB.dialogues = clientDB.dialogues && clientDB.dialogues.length ? clientDB.dialogues : serverDB.dialogues;

      saveJSON(DB_FILE, serverDB);
      if (GITHUB_TOKEN) {
        commitFileToGitHub("data/delquro-db.json", JSON.stringify(serverDB, null, 2), "Auto-sync database update to GitHub");
      }
      return sendJSON(200, { success: true, db: serverDB });
    }

    // ----------------------------------------------------
    // API: GET /api/db — Full database dump
    // ----------------------------------------------------
    if (pathname === "/api/db" && req.method === "GET") {
      return sendJSON(200, getDB());
    }

    // ----------------------------------------------------
    // Static HTML serving: index.html
    // ----------------------------------------------------
    if (pathname === "/" || pathname === "/index.html" || pathname === "/app") {
      if (fs.existsSync(PUBLIC_HTML)) {
        const html = fs.readFileSync(PUBLIC_HTML, "utf8");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
        return;
      }
    }

    // Direct download of standalone HTML file
    if (pathname === "/download" || pathname === "/delquro-files-pro.html") {
      if (fs.existsSync(PUBLIC_HTML)) {
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": "attachment; filename=\"delquro-files-pro.html\""
        });
        fs.createReadStream(PUBLIC_HTML).pipe(res);
        return;
      }
    }

    // 404 for unknown endpoints
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");

  } catch (error) {
    console.error("Server error:", error);
    sendJSON(500, { success: false, error: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`  The DelQuro Files Pro — Railway & Cloud Server Ready `);
  console.log(`  Listening at http://${HOST}:${PORT}`);
  console.log(`  Health Check: http://${HOST}:${PORT}/api/status`);
  console.log(`  Intake Endpoint: POST http://${HOST}:${PORT}/api/intake`);
  console.log(`=======================================================`);
});
