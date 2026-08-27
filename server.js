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
      if (data.length > 25 * 1024 * 1024) { // 25MB limit
        req.destroy();
        reject(new Error("Payload too large (max 25MB)"));
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
  const pathname = parsedUrl.pathname;

  // JSON helper
  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data, null, 2));
  };

  try {
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
    // API: POST /api/intake — AI uploads code
    // ----------------------------------------------------
    if (pathname === "/api/intake" && req.method === "POST") {
      const rawBody = await readBody(req);
      let payload = {};

      try {
        payload = JSON.parse(rawBody);
      } catch (e) {
        payload = { code: rawBody, filename: "uploaded_code.txt" };
      }

      const rawCode = payload.code || payload.content || rawBody;
      const filename = payload.filename || payload.file || "snippet.txt";

      const analyzed = analyzeCode(rawCode, filename);

      const finalName = (payload.name || payload.title || analyzed.name).trim();
      const finalTagline = (payload.tagline || payload.summary || analyzed.tagline).trim();
      let finalDesc = (payload.description || payload.desc || analyzed.description).trim();
      const finalStack = (payload.stack || analyzed.stack).trim();
      const finalArena = (payload.arena_link || payload.arena_url || analyzed.arena_link).trim();
      const finalGithub = (payload.github_link || payload.github_url || analyzed.github_link).trim();
      const finalEmergent = (payload.emergent_link || payload.emergent_url || analyzed.emergent_link).trim();
      const finalBase44 = (payload.base44_link || payload.base44_url || analyzed.base44_link).trim();
      const finalDiff = (payload.differentiator || payload.edge || payload.sets_apart || analyzed.differentiator).trim();

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
