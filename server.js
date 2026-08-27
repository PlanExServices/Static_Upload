/**
 * The DelQuro Files Pro — AI Code Intake Receiver & Project Management Server
 * Zero external dependencies — runs on standard Node.js (v18+)
 * Binds to 0.0.0.0:3000 for preview and API access.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "delquro-db.json");
const INBOX_FILE = path.join(DATA_DIR, "inbox.json");
const PUBLIC_HTML = path.join(__dirname, "delquro-files-pro.html");

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
    nextId: 10,
    projects: [
      {
        id: 1,
        name: "HyperAgent Orchestrator",
        tagline: "Autonomous multi-model routing engine with sub-50ms latency",
        description: "A lightweight orchestration framework that intelligently routes user prompts across Claude, GPT-4, and specialized local LLMs. It features zero-config streaming, automatic fallback handling, semantic caching, and full observability. Built for high-throughput production environments requiring ultra-low overhead.",
        status: "active",
        stack: "TypeScript, Node.js, Fastify, Redis, Arena SDK",
        arena_link: "https://arena.ai/c/hyperagent-orchestrator",
        github_link: "https://github.com/delquro/hyperagent",
        emergent_link: "https://emergent.sh/app/hyperagent",
        base44_link: "https://base44.com/apps/hyperagent",
        differentiator: "Unlike heavy frameworks like LangChain, HyperAgent has zero runtime dependencies, a 12KB footprint, and sub-millisecond dispatch overhead with predictive model pre-warming.",
        attached_code: `// HyperAgent Multi-Model Router
import { FastifyInstance } from "fastify";

export async function routeRequest(prompt: string, context: Record<string, any>) {
  const complexity = evaluateComplexity(prompt);
  const targetModel = complexity > 0.7 ? "claude-3-7-sonnet" : "gpt-4o-mini";
  console.log(\`[HyperAgent] Dispatching to \${targetModel} (complexity: \${complexity})\`);
  return await executeModelCall(targetModel, prompt, context);
}`,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        name: "DelQuro Files Pro",
        tagline: "Single-file build tracker with live AI code receiver and 120-word card synthesizer",
        description: "The premier build log and project tracker for AI-augmented developers. Features zero-install single-file portability, live webhook code intake from any AI assistant, automatic 120-word card synthesis, and native multi-platform linking across Arena.ai, GitHub, Emergent.sh, and Base44.com.",
        status: "shipped",
        stack: "HTML5, CSS3, JavaScript, Node.js, REST API",
        arena_link: "https://arena.ai/delquro",
        github_link: "https://github.com/delquro/delquro-files",
        emergent_link: "https://emergent.sh/delquro",
        base44_link: "https://base44.com/delquro",
        differentiator: "Bridges the gap between AI code generation and project management by providing an instant webhook receiver that turns raw AI code into structured, shareable cards in one click.",
        attached_code: `// DelQuro Files Pro — Instant Code Receiver & Card Synthesizer
const server = http.createServer(async (req, res) => {
  if (req.url === "/api/intake" && req.method === "POST") {
    const payload = await readBody(req);
    const card = analyzeCode(payload.code, payload.filename);
    saveToInbox(card);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, card }));
  }
});`,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    ideas: [
      {
        id: 3,
        title: "Auto-git commit webhook on DelQuro card creation",
        body: "Allow DelQuro Files to trigger a GitHub dispatch event to commit the uploaded code snippet directly into a new repository branch.",
        tags: "automation, github, webhooks",
        status: "considering",
        projectId: 2,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    changelog: [
      {
        id: 4,
        projectId: 2,
        title: "Added AI Intake Studio with 120-word card synthesizer",
        version: "v1.0.0",
        kind: "feature",
        body: "Live webhook receiver, multi-platform URL linking (Arena.ai, GitHub, Emergent.sh, Base44.com), and 'The Edge' differentiator callout.",
        createdAt: new Date().toISOString()
      }
    ],
    builds: [
      {
        id: 5,
        projectId: 2,
        buildNo: "b-101",
        status: "success",
        summary: "DelQuro Files Pro release build deployed successfully.",
        log: "All tests passed. Receiver listening on port 3000.",
        createdAt: new Date().toISOString()
      }
    ],
    code: [
      {
        id: 6,
        projectId: 1,
        title: "Fastify multi-model dispatch handler",
        language: "typescript",
        notes: "Primary router logic for HyperAgent.",
        code: `export async function routeRequest(prompt: string, context: Record<string, any>) {
  const complexity = evaluateComplexity(prompt);
  return await executeModelCall(complexity > 0.7 ? "claude-3-7-sonnet" : "gpt-4o-mini", prompt, context);
}`,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    dialogues: [
      {
        id: 7,
        projectId: 2,
        speaker: "you",
        role: "user",
        content: "We need an intake page that takes code from an AI and turns it into cards with 120-word max description, platform links, and differentiator.",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    inbox: [
      {
        id: "inbox-101",
        name: "VectorFlow Neural Indexer",
        tagline: "Ultra-fast approximate nearest neighbor vector indexing engine",
        description: "VectorFlow is a high-performance vector similarity search engine implemented in Python and Rust. It provides sub-5ms cosine similarity lookups across millions of high-dimensional embeddings. Designed as an embedded library with zero external cluster requirements.",
        wordCount: 35,
        stack: "Python, Rust, FastAPI, NumPy",
        arena_link: "https://arena.ai/c/vector-flow",
        github_link: "https://github.com/delquro/vector-flow",
        emergent_link: "https://emergent.sh/app/vector-flow",
        base44_link: "https://base44.com/apps/vector-flow",
        differentiator: "Runs completely in-process with zero network hops, delivering 10x lower latency than Pinecone or Weaviate for embedded AI workloads.",
        filename: "vector_flow.py",
        code: `# VectorFlow Neural Indexer
from fastapi import FastAPI, HTTPException
import numpy as np

app = FastAPI(title="VectorFlow")
index = {}

@app.post("/index")
def add_vector(doc_id: str, vector: list[float]):
    index[doc_id] = np.array(vector, dtype=np.float32)
    return {"status": "indexed", "total": len(index)}

@app.post("/search")
def search_similar(query: list[float], top_k: int = 5):
    q = np.array(query, dtype=np.float32)
    scores = {k: float(np.dot(q, v) / (np.linalg.norm(q) * np.linalg.norm(v))) for k, v in index.items()}
    sorted_res = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
    return {"results": [{"id": k, "score": s} for k, s in sorted_res]}`,
        status: "pending",
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ]
  };

  const current = loadJSON(DB_FILE, fallback);
  // Ensure inbox exists
  if (!current.inbox) current.inbox = fallback.inbox;
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
  // Global CORS headers for seamless AI and browser interaction
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
    // API: System Status & Discovery
    // ----------------------------------------------------
    if (pathname === "/api/status" && req.method === "GET") {
      const db = getDB();
      return sendJSON(200, {
        status: "online",
        name: "The DelQuro Files Pro — Live AI Code Receiver",
        port: PORT,
        intakeEndpoint: "/api/intake",
        projectCount: db.projects.length,
        inboxCount: (db.inbox || []).length,
        features: [
          "Auto code analysis",
          "120-word maximum description enforcement",
          "Multi-platform URL linking (Arena.ai, GitHub, Emergent.sh, Base44.com)",
          "The Edge / Differentiator synthesis",
          "Bidirectional sync & offline localStorage support"
        ],
        instructions: {
          curlExample: `curl -X POST http://${req.headers.host || "localhost:3000"}/api/intake -H "Content-Type: application/json" -d '{"code":"/* code */", "filename":"app.py"}'`
        }
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
        // Raw text / code was sent directly
        payload = { code: rawBody, filename: "uploaded_code.txt" };
      }

      const rawCode = payload.code || payload.content || rawBody;
      const filename = payload.filename || payload.file || "snippet.txt";

      // Run code analysis to infer missing fields
      const analyzed = analyzeCode(rawCode, filename);

      // Merge explicit user/AI overrides if provided
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

      // If code was attached, also register it in code repository
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

      // Remove from inbox if it was in inbox
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
      return sendJSON(200, { success: true, projects: db.projects });
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

      // Merge projects: client takes precedence if newer, otherwise keep server
      const mergedProjects = [...serverDB.projects];
      (clientDB.projects || []).forEach(cp => {
        const idx = mergedProjects.findIndex(sp => sp.id === cp.id);
        if (idx === -1) {
          mergedProjects.unshift(cp);
        } else {
          // If client version has newer or richer data, merge
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
    // Static HTML serving: delquro-files-pro.html
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
  console.log(`  The DelQuro Files Pro — Live AI Code Receiver Active `);
  console.log(`  Listening at http://${HOST}:${PORT}`);
  console.log(`  Intake Endpoint: POST http://${HOST}:${PORT}/api/intake`);
  console.log(`=======================================================`);
});
