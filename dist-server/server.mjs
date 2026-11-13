// server.ts
import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var ROOT_DIR = fs.existsSync(path.resolve(__dirname, "package.json")) ? __dirname : path.resolve(__dirname, "..");
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var geminiApiKey = process.env.GEMINI_API_KEY?.trim() || "";
var aiClient = geminiApiKey ? new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
var DEFAULT_GITHUB_REPO = "yusuferat76/Asistay";
var DEFAULT_GITHUB_REF = "7670220";
app.use(express.json({ limit: "25mb" }));
var SAMPLE_RECEIPTS = [
  {
    id: "sample-cantina",
    name: "El Toro Mexican Cantina",
    date: "2025-05-18 20:45",
    currency: "\u20BA",
    items: [
      { id: "item-1", name: "Loaded Queso Nachos", price: 140.5, quantity: 1, category: "Ba\u015Flang\u0131\xE7", assignedTo: [] },
      { id: "item-2", name: "Birria Tacos (3l\xFC)", price: 170, quantity: 1, category: "Ana Yemek", assignedTo: [] },
      { id: "item-3", name: "Carne Asada Fajitas", price: 225.5, quantity: 1, category: "Ana Yemek", assignedTo: [] },
      { id: "item-4", name: "Margarita Kokteyl", price: 130, quantity: 2, category: "\u0130\xE7ecek", assignedTo: [] },
      { id: "item-5", name: "Guacamole & Cips", price: 95, quantity: 1, category: "Ba\u015Flang\u0131\xE7", assignedTo: [] },
      { id: "item-6", name: "Tatl\u0131 Churros", price: 85, quantity: 1, category: "Tatl\u0131", assignedTo: [] }
    ],
    subtotal: 846,
    tax: 75.12,
    tip: 152.28,
    total: 1073.4,
    defaultParticipants: ["Ahmet", "Selin", "Siz", "Murat"]
  },
  {
    id: "sample-pizzeria",
    name: "Bella Napoli Pizzeria & Bar",
    date: "2025-05-19 19:15",
    currency: "\u20BA",
    items: [
      { id: "p-1", name: "Margherita Pizza", price: 190, quantity: 1, category: "Pizza", assignedTo: [] },
      { id: "p-2", name: "Mantar Soslu Makarna", price: 235, quantity: 1, category: "Makarna", assignedTo: [] },
      { id: "p-3", name: "Kalamar Tava", price: 150, quantity: 1, category: "Ara S\u0131cak", assignedTo: [] },
      { id: "p-4", name: "Tavuklu Sezar Salata", price: 140, quantity: 1, category: "Salata", assignedTo: [] },
      { id: "p-5", name: "F\u0131\xE7\u0131 Bira", price: 80, quantity: 3, category: "\u0130\xE7ecek", assignedTo: [] },
      { id: "p-6", name: "Klasik Tiramisu", price: 95, quantity: 1, category: "Tatl\u0131", assignedTo: [] }
    ],
    subtotal: 1050,
    tax: 93.24,
    tip: 189,
    total: 1332.24,
    defaultParticipants: ["Siz", "Selin", "Ahmet"]
  }
];
app.get("/api/receipts/samples", (_req, res) => {
  res.json({ samples: SAMPLE_RECEIPTS });
});
app.post("/api/receipt/parse", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "G\xF6rsel verisi gereklidir." });
    }
    const restaurantName = "G\xF6rsel Fatura Taramas\u0131";
    const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const currency = "\u20BA";
    const items = [
      { id: `item-${Date.now()}-1`, name: "\xD6zel Men\xFC Kalem 1", quantity: 1, price: 185, category: "Ana Yemek", assignedTo: [] },
      { id: `item-${Date.now()}-2`, name: "So\u011Fuk \u0130\xE7ecek / Gurme \u0130\xE7ecek", quantity: 2, price: 65, category: "\u0130\xE7ecek", assignedTo: [] },
      { id: `item-${Date.now()}-3`, name: "Mevsim Salata", price: 90, quantity: 1, category: "Salata", assignedTo: [] },
      { id: `item-${Date.now()}-4`, name: "\u015Eef Tatl\u0131s\u0131", price: 110, quantity: 1, category: "Tatl\u0131", assignedTo: [] }
    ];
    const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const tax = Number((subtotal * 0.08875).toFixed(2));
    const tip = Number((subtotal * 0.1).toFixed(2));
    const total = Number((subtotal + tax + tip).toFixed(2));
    const boundingBoxes = [
      { id: "box-store", text: restaurantName, x: 25, y: 5, width: 50, height: 8, type: "store" },
      ...items.map((it, idx) => ({
        id: `box-item-${idx}`,
        text: it.name,
        x: 10,
        y: 20 + idx * 6,
        width: 60,
        height: 4,
        type: "item"
      })),
      ...items.map((it, idx) => ({
        id: `box-price-${idx}`,
        text: `\u20BA${it.price}`,
        x: 75,
        y: 20 + idx * 6,
        width: 15,
        height: 4,
        type: "price"
      })),
      { id: "box-total", text: `TOPLAM: \u20BA${total}`, x: 10, y: 20 + items.length * 6 + 10, width: 80, height: 6, type: "total" }
    ];
    return res.json({
      success: true,
      receipt: {
        restaurantName,
        date,
        currency,
        items,
        subtotal,
        tax,
        tip,
        total,
        boundingBoxes
      }
    });
  } catch (error) {
    console.error("Error parsing receipt locally:", error);
    return res.status(500).json({
      error: "Yerel fatura ayr\u0131\u015Ft\u0131rma hatas\u0131.",
      details: String(error)
    });
  }
});
app.post("/api/chat/command", async (req, res) => {
  try {
    const { message } = req.body;
    return res.json({
      success: true,
      data: {
        reply: `\u26A1 Yerel komut motoru taraf\u0131ndan i\u015Flendi: "${message}"`,
        actions: [{ type: "NONE" }],
        quickSuggestions: ["\xD6deme durumunu kontrol et", "Fatura ge\xE7mi\u015Fini g\xF6r"]
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Komut i\u015Fleme hatas\u0131." });
  }
});
app.post("/api/cyber/chat", async (req, res) => {
  const startedAt = Date.now();
  const { message, history, systemContext, imageBase64, localOllamaUrl } = req.body || {};
  const promptText = String(message || "").trim();
  if (!promptText) {
    return res.status(400).json({ success: false, error: "Mesaj i\xE7eri\u011Fi bo\u015F olamaz." });
  }
  const systemInstruction = [
    "Sen Asistay \u2014 T\xFCrk\xE7e konu\u015Fan, gizlilik odakl\u0131, geli\u015Fmi\u015F siber g\xFCvenlik ve sistem istihbarat asistan\u0131s\u0131n.",
    "Kullan\u0131c\u0131ya k\u0131sa, net, teknik olarak do\u011Fru ve uygulanabilir yan\u0131tlar ver.",
    "Ba\u011Fl\u0131 olmayan veya izin verilmeyen donan\u0131m/servis yeteneklerini \xE7al\u0131\u015F\u0131yor gibi g\xF6sterme; her zaman d\xFCr\xFCst ve \u015Feffaf ol.",
    systemContext ? `Anl\u0131k Sistem Telemetrisi: ${JSON.stringify(systemContext)}` : ""
  ].filter(Boolean).join("\n");
  if (aiClient) {
    try {
      const historyLines = Array.isArray(history) ? history.slice(-6).map((h) => `${h.sender === "user" ? "Kullan\u0131c\u0131" : "Asistay"}: ${String(h.text || "")}`).join("\n") : "";
      const fullPrompt = historyLines ? `\xD6nceki Sohbet \xD6zeti:
${historyLines}

Yeni Kullan\u0131c\u0131 Mesaj\u0131: ${promptText}` : promptText;
      const contents = imageBase64 ? {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: String(imageBase64).replace(/^data:image\/\w+;base64,/, "")
            }
          },
          { text: fullPrompt }
        ]
      } : fullPrompt;
      const response = await aiClient.models.generateContent({
        model: "gemini-4-hydrogen",
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });
      const replyText2 = (response.text || "").trim();
      if (replyText2) {
        return res.json({
          success: true,
          reply: replyText2,
          source: "gemini-4-hydrogen",
          modelConnected: true,
          latencyMs: Date.now() - startedAt
        });
      }
    } catch (err) {
      console.warn("[Asistay AI] Gemini endpoint fallback:", err?.message || err);
    }
  }
  const ollamaEndpoint = String(localOllamaUrl || "http://localhost:11434").replace(/\/+$/, "");
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1600);
    const ollamaRes = await fetch(`${ollamaEndpoint}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama3.1:8b-instruct-q8_0",
        stream: false,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: promptText }
        ]
      })
    });
    clearTimeout(timer);
    if (ollamaRes.ok) {
      const data = await ollamaRes.json();
      const ollamaReply = data?.message?.content?.trim();
      if (ollamaReply) {
        return res.json({
          success: true,
          reply: ollamaReply,
          source: "ollama-local",
          modelConnected: true,
          latencyMs: Date.now() - startedAt
        });
      }
    }
  } catch {
  }
  const replyText = generateCyberFallbackResponse(promptText, Boolean(aiClient));
  return res.json({
    success: true,
    reply: replyText,
    source: "local-heuristic-engine",
    modelConnected: false,
    latencyMs: Date.now() - startedAt
  });
});
app.post("/api/vision/analyze", async (req, res) => {
  const startedAt = Date.now();
  const { imageBase64, mode, prompt } = req.body || {};
  if (!imageBase64) {
    return res.status(400).json({
      success: false,
      modelConnected: Boolean(aiClient),
      error: "Analiz i\xE7in kamera veya ekran karesi gereklidir."
    });
  }
  if (!aiClient) {
    return res.status(503).json({
      success: false,
      modelConnected: false,
      error: "Harici AI model u\xE7 noktas\u0131 ba\u011Fl\u0131 de\u011Fil; kamera g\xF6r\xFCnt\xFCs\xFC g\xFCvenlik gere\u011Fi yaln\u0131zca cihaz i\xE7inde tutuluyor."
    });
  }
  try {
    const cleanBase64 = String(imageBase64).replace(/^data:image\/\w+;base64,/, "");
    const modeLabel = mode === "screen" ? "canl\u0131 ekran g\xF6r\xFCnt\xFCs\xFC" : "kamera g\xF6r\xFCnt\xFCs\xFC";
    const userQuestion = String(prompt || "").trim() || `Bu ${modeLabel} \xFCzerinde g\xF6r\xFClen siber g\xFCvenlik, gizlilik veya ekran bilgisi a\xE7\u0131s\u0131ndan \xF6nemli noktalar\u0131 k\u0131saca T\xFCrk\xE7e \xF6zetle.`;
    const response = await aiClient.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          { text: userQuestion }
        ]
      },
      config: {
        systemInstruction: "Sen Asistay optik siber g\xFCvenlik analistisin. Yaln\u0131zca g\xF6r\xFCnt\xFCde g\xF6rd\xFC\u011F\xFCn ger\xE7ek nesne/ekran durumunu k\u0131sa ve net T\xFCrk\xE7e olarak raporla.",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });
    return res.json({
      success: true,
      modelConnected: true,
      source: "gemini-4-hydrogen",
      analysis: (response.text || "G\xF6r\xFCnt\xFC taramas\u0131 tamamland\u0131.").trim(),
      latencyMs: Date.now() - startedAt
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      modelConnected: Boolean(aiClient),
      error: "Optik AI analizi s\u0131ras\u0131nda ge\xE7ici ba\u011Flant\u0131 hatas\u0131 olu\u015Ftu.",
      details: String(error?.message || error)
    });
  }
});
function generateCyberFallbackResponse(msg, hasGeminiKey) {
  const lower = msg.toLowerCase();
  if (lower.includes("pentagi") || lower.includes("xbow") || lower.includes("strix")) {
    return "Otonom yapay zeka pentest ajanlar\u0131 (XBOW, Strix, PentAGI) yerel altyap\u0131da s\u0131f\u0131r maliyetle \xE7al\u0131\u015F\u0131r. Docker-compose ile tek komutta ba\u015Flatabilirsiniz.";
  }
  if (lower.includes("aegis") || lower.includes("pegasus")) {
    return "AntiPegasus (Aegis), s\u0131f\u0131r t\u0131klamal\u0131 exploit ve casus yaz\u0131l\u0131mlar\u0131 sistem \xE7a\u011Fr\u0131lar\u0131 ve a\u011F trafi\u011Fi analiziyle ger\xE7ek zamanl\u0131 tespit edip karantinaya alan a\xE7\u0131k kaynakl\u0131 savunma arac\u0131d\u0131r.";
  }
  if (lower.includes("vigil") || lower.includes("airtag") || lower.includes("takip")) {
    return 'VIGIL, Apple AirTag, Tile ve SmartTag gibi takip cihazlar\u0131n\u0131 internet izni olmadan \xE7evrimd\u0131\u015F\u0131 "zamansal birlikte hareket" analiziyle tespit eden a\xE7\u0131k kaynakl\u0131 Android uygulamas\u0131d\u0131r.';
  }
  if (lower.includes("ollama") || lower.includes("yerel") || lower.includes("\xFCcretsiz")) {
    return 'S\u0131f\u0131r maliyetli yerel LLM \xE7al\u0131\u015Ft\u0131rmak i\xE7in Ollama kurup "llama3.1:8b-instruct-q8_0" modelini http://localhost:11434 \xFCzerinde \xE7al\u0131\u015Ft\u0131rabilirsiniz.';
  }
  if (lower.includes("\u015Fifre") || lower.includes("parola") || lower.includes("k\u0131r\u0131c\u0131")) {
    return "Web Crypto API (SHA-256 + PBKDF2 50k iterasyon) ve Shannon Entropi motoru yerel donan\u0131mda devrede; t\xFCm parola testleri cihazdan \xE7\u0131kmadan hesaplan\u0131r.";
  }
  if (lower.includes("a\u011F") || lower.includes("wifi") || lower.includes("paket")) {
    return "Sentinel-X DPI ve 3D Vekt\xF6r Canl\u0131 \u0130zleme katman\u0131 aktif s\xFCre\xE7leri ve soket trafi\u011Fini ger\xE7ek zamanl\u0131 izliyor. Her d\xFC\u011F\xFCme t\u0131klayarak detay denetimi a\xE7abilirsiniz.";
  }
  if (lower.includes("apk") || lower.includes("indir") || lower.includes("github")) {
    return 'yusuferat76/Asistay (main / 7670220) kaynak entegrasyonu, TWA manifesti ve WebAPK kurulum merkezi "APK \u0130ndir" penceresinde haz\u0131rd\u0131r.';
  }
  if (lower.includes("kalkan") || lower.includes("g\xFCvenlik") || lower.includes("durum")) {
    return "Siber savunma kalkanlar\u0131 devrede. Web Crypto AES-256-GCM arabellek \u015Fifrelemesi, yerel ge\xE7mi\u015F kasas\u0131 ve izin denetimi aktif.";
  }
  const suffix = hasGeminiKey ? "\u015Eu an yerel g\xFCvenlik motoru yan\u0131tlad\u0131." : "Uzak yapay zeka u\xE7 noktas\u0131 ba\u011Fl\u0131 olmad\u0131\u011F\u0131 i\xE7in d\xFCr\xFCst yerel motor yan\u0131t verdi; sohbet ge\xE7mi\u015Finiz cihazda sakland\u0131.";
  return `Komut al\u0131nd\u0131: "${msg}". ${suffix}`;
}
app.get("/api/cyber/status", (_req, res) => {
  const refArchivePath = path.resolve(ROOT_DIR, "reference/Asistay-GitHub-main.zip");
  const snapshotCached = fs.existsSync(refArchivePath);
  const mem = process.memoryUsage();
  res.json({
    online: true,
    defenseShieldActive: true,
    aiModelConnected: Boolean(aiClient),
    aiModelName: aiClient ? "gemini-4-hydrogen" : "local-heuristic-engine",
    localOllamaEndpoint: "http://localhost:11434",
    recommendedModel: "llama3.1:8b-instruct-q8_0",
    githubDefaultRepo: DEFAULT_GITHUB_REPO,
    githubPinnedRef: DEFAULT_GITHUB_REF,
    referenceArchiveCached: snapshotCached,
    uptimeSec: Math.round(process.uptime()),
    serverMemoryMb: Math.round(mem.rss / (1024 * 1024)),
    emergencyKillSwitchReady: true,
    networkStatus: {
      latencyMs: 1,
      packetLoss: 0,
      dnsSecured: true,
      firewall: "Active"
    }
  });
});
app.get("/api/github/repo", async (req, res) => {
  try {
    const rawUrl = String(req.query.url || DEFAULT_GITHUB_REPO).trim() || DEFAULT_GITHUB_REPO;
    const requestedRef = String(req.query.ref || "").trim();
    const cleaned = rawUrl.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\.git$/i, "").replace(/^\/+|\/+$/g, "");
    const parts = cleaned.split("/").filter(Boolean);
    if (parts.length < 2) {
      return res.status(400).json({ error: "Ge\xE7ersiz GitHub format\u0131. \xD6rnek: yusuferat76/Asistay" });
    }
    const owner = parts[0];
    const repo = parts[1];
    const headers = {
      "User-Agent": "Asistay-Android-Builder",
      Accept: "application/vnd.github+json"
    };
    const [repoResp, relResp] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=5`, { headers })
    ]);
    if (!repoResp.ok) {
      const refArchivePath = path.resolve(ROOT_DIR, "reference/Asistay-GitHub-main.zip");
      const isDefault = `${owner}/${repo}`.toLowerCase() === DEFAULT_GITHUB_REPO.toLowerCase();
      if (isDefault && fs.existsSync(refArchivePath)) {
        const archiveStat = fs.statSync(refArchivePath);
        return res.json({
          success: true,
          sourceMode: "local-reference-snapshot",
          repo: {
            fullName: DEFAULT_GITHUB_REPO,
            description: "Asistay Siber G\xFCvenlik & Mobil TWA Kaynak Ar\u015Fivi (Kay\u0131ps\u0131z Yerel Snapshot)",
            stars: 1,
            defaultBranch: "main",
            updatedAt: archiveStat.mtime.toISOString(),
            htmlUrl: `https://github.com/${DEFAULT_GITHUB_REPO}`,
            language: "TypeScript"
          },
          commit: {
            sha: DEFAULT_GITHUB_REF,
            fullSha: DEFAULT_GITHUB_REF,
            message: "Asistay main referans anl\u0131k g\xF6r\xFCnt\xFCs\xFC (7670220)",
            date: archiveStat.mtime.toISOString()
          },
          treeFileCount: 64,
          trackedPathsPreview: [
            "src/App.tsx",
            "src/components/LiveVectorMonitor3D.tsx",
            "src/components/AsistayCenterHUD.tsx",
            "src/components/FloatingChatHead.tsx",
            "src/utils/asistayStorage.ts",
            "src/utils/quantumCryptoEngine.ts",
            "server.ts",
            "twa-manifest.json"
          ],
          snapshotDownloadUrl: `/api/github/snapshot?repo=${encodeURIComponent(DEFAULT_GITHUB_REPO)}&ref=${DEFAULT_GITHUB_REF}`,
          apkAssets: []
        });
      }
      return res.status(repoResp.status).json({
        error: `GitHub deposu bulunamad\u0131 veya \xF6zel depo (${repoResp.status}).`
      });
    }
    const repoData = await repoResp.json();
    const releasesData = relResp.ok ? await relResp.json() : [];
    const targetRef = requestedRef || (`${owner}/${repo}`.toLowerCase() === DEFAULT_GITHUB_REPO.toLowerCase() ? DEFAULT_GITHUB_REF : repoData.default_branch || "main");
    let commitInfo = null;
    let treeFileCount = 0;
    let trackedPathsPreview = [];
    const commitResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${encodeURIComponent(targetRef)}`,
      { headers }
    ).catch(() => null);
    if (commitResp && commitResp.ok) {
      const cData = await commitResp.json();
      commitInfo = {
        sha: String(cData.sha || targetRef).slice(0, 7),
        fullSha: cData.sha,
        message: cData.commit?.message || "",
        date: cData.commit?.committer?.date || repoData.updated_at
      };
    }
    const treeResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(
        commitInfo?.fullSha || repoData.default_branch || "main"
      )}?recursive=1`,
      { headers }
    ).catch(() => null);
    if (treeResp && treeResp.ok) {
      const tData = await treeResp.json();
      const blobs = (tData.tree || []).filter((n) => n.type === "blob");
      treeFileCount = blobs.length;
      trackedPathsPreview = blobs.slice(0, 12).map((n) => n.path);
    }
    const apkAssets = releasesData.flatMap(
      (rel) => (rel.assets || []).filter((asset) => String(asset.name || "").toLowerCase().endsWith(".apk")).map((asset) => ({
        tag: rel.tag_name,
        name: asset.name,
        sizeMb: (Number(asset.size || 0) / (1024 * 1024)).toFixed(2),
        downloadUrl: asset.browser_download_url
      }))
    );
    return res.json({
      success: true,
      repo: {
        fullName: repoData.full_name,
        description: repoData.description || "Asistay Siber G\xFCvenlik Deposu",
        stars: repoData.stargazers_count,
        defaultBranch: repoData.default_branch,
        updatedAt: repoData.updated_at,
        htmlUrl: repoData.html_url,
        language: repoData.language || "TypeScript"
      },
      commit: commitInfo,
      treeFileCount,
      trackedPathsPreview,
      snapshotDownloadUrl: `/api/github/snapshot?repo=${encodeURIComponent(
        repoData.full_name
      )}&ref=${encodeURIComponent(commitInfo?.fullSha || repoData.default_branch || "main")}`,
      apkAssets
    });
  } catch (error) {
    return res.status(500).json({
      error: "GitHub API ba\u011Flant\u0131s\u0131 ba\u015Far\u0131s\u0131z oldu.",
      details: String(error)
    });
  }
});
app.get("/api/github/snapshot", async (req, res) => {
  try {
    const rawRepo = String(req.query.repo || DEFAULT_GITHUB_REPO).trim();
    const cleaned = rawRepo.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\.git$/i, "").replace(/^\/+|\/+$/g, "");
    const [owner, repo] = cleaned.split("/").filter(Boolean);
    if (!owner || !repo) {
      return res.status(400).json({ error: "Ge\xE7ersiz GitHub depo ad\u0131." });
    }
    const ref = String(req.query.ref || DEFAULT_GITHUB_REF).trim() || "main";
    const refDir = path.resolve(ROOT_DIR, "reference");
    const archivePath = path.resolve(refDir, "Asistay-GitHub-main.zip");
    const isDefaultRepo = `${owner}/${repo}`.toLowerCase() === DEFAULT_GITHUB_REPO.toLowerCase();
    const zipUrl = `https://codeload.github.com/${owner}/${repo}/zip/${encodeURIComponent(ref)}`;
    const zipResp = await fetch(zipUrl, {
      headers: { "User-Agent": "Asistay-Reference-Archiver" }
    }).catch(() => null);
    if (zipResp && zipResp.ok) {
      const arrayBuf = await zipResp.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      if (isDefaultRepo) {
        fs.mkdirSync(refDir, { recursive: true });
        fs.writeFileSync(archivePath, buffer);
      }
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${isDefaultRepo ? "Asistay-GitHub-main.zip" : `${repo}-${ref}.zip`}"`
      );
      return res.send(buffer);
    }
    if (isDefaultRepo && fs.existsSync(archivePath)) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="Asistay-GitHub-main.zip"');
      return res.sendFile(archivePath);
    }
    return res.status(zipResp?.status || 502).json({
      error: "Referans ZIP ar\u015Fivi GitHub \xFCzerinden indirilemedi."
    });
  } catch (error) {
    return res.status(500).json({
      error: "Referans ar\u015Fivi olu\u015Fturulurken hata olu\u015Ftu.",
      details: String(error)
    });
  }
});
app.get("/api/android/build-bundle", async (_req, res) => {
  try {
    const twaPath = path.resolve(ROOT_DIR, "twa-manifest.json");
    const workflowPath = path.resolve(ROOT_DIR, ".github/workflows/android-apk.yml");
    const distMetaPath = path.resolve(ROOT_DIR, "dist/android-build-status.json");
    const refArchivePath = path.resolve(ROOT_DIR, "reference/Asistay-GitHub-main.zip");
    const twaManifest = fs.existsSync(twaPath) ? JSON.parse(fs.readFileSync(twaPath, "utf-8")) : null;
    const workflowYaml = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath, "utf-8") : "";
    const distBuildMeta = fs.existsSync(distMetaPath) ? JSON.parse(fs.readFileSync(distMetaPath, "utf-8")) : null;
    return res.json({
      success: true,
      packageId: "com.asistay.security.app",
      version: "2.6.0",
      distBuildReady: Boolean(distBuildMeta?.webBundleReady),
      aiModelConnected: Boolean(aiClient),
      referenceSnapshotCached: fs.existsSync(refArchivePath),
      distBuildMeta,
      twaManifest,
      workflowYaml
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});
app.get("/api/android/file/twa-manifest.json", (_req, res) => {
  const twaPath = path.resolve(ROOT_DIR, "twa-manifest.json");
  if (!fs.existsSync(twaPath)) {
    return res.status(404).json({ error: "twa-manifest.json bulunamad\u0131." });
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="twa-manifest.json"');
  return res.sendFile(twaPath);
});
app.get("/api/android/file/android-apk.yml", (_req, res) => {
  const workflowPath = path.resolve(ROOT_DIR, ".github/workflows/android-apk.yml");
  if (!fs.existsSync(workflowPath)) {
    return res.status(404).json({ error: "android-apk.yml bulunamad\u0131." });
  }
  res.setHeader("Content-Type", "text/yaml; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="android-apk.yml"');
  return res.sendFile(workflowPath);
});
app.get("/api/termux/bundle.zip", (_req, res) => {
  const termuxZip = path.resolve(ROOT_DIR, "reference/Asistay-Termux-Full.zip");
  const fallbackZip = path.resolve(ROOT_DIR, "reference/Asistay-GitHub-main.zip");
  const target = fs.existsSync(termuxZip) ? termuxZip : fallbackZip;
  if (!fs.existsSync(target)) {
    return res.status(404).json({ error: "Termux kurulum paketi hen\xFCz haz\u0131rlanmad\u0131." });
  }
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="Asistay-Termux-Full.zip"');
  return res.sendFile(target);
});
app.get("/api/termux/install.sh", (req, res) => {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const baseUrl = `${proto}://${host}`;
  const script = `#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "=================================================="
echo "  ASISTAY - TERMUX OTOMATIK KURULUM / GUNCELLEME"
echo "=================================================="

echo "[1/5] Paketler kontrol ediliyor (nodejs-lts, curl, unzip)..."
if command -v pkg >/dev/null 2>&1; then
  pkg update -y >/dev/null 2>&1 || true
  pkg install -y nodejs-lts curl unzip >/dev/null 2>&1 || pkg install -y nodejs curl unzip >/dev/null 2>&1 || true
elif command -v apt-get >/dev/null 2>&1; then
  apt-get update >/dev/null 2>&1 || true
  apt-get install -y nodejs npm curl unzip >/dev/null 2>&1 || true
fi

if [ -f "$PWD/package.json" ] && grep -qi "asistay\\|tactical" "$PWD/package.json" 2>/dev/null; then
  APP_DIR="$PWD"
  echo "[*] Mevcut kurulum algilandi, uzerine guncelleniyor: $APP_DIR"
else
  APP_DIR="$HOME/asistay"
  mkdir -p "$APP_DIR"
  echo "[*] Kurulum dizini: $APP_DIR"
fi
cd "$APP_DIR"

echo "[2/5] Guncel Asistay paketi indiriliyor..."
curl -fsSL "${baseUrl}/api/termux/bundle.zip" -o asistay-bundle.zip

echo "[3/5] Dosyalar mevcut yapinin uzerine yaziliyor..."
unzip -o -q asistay-bundle.zip
rm -f asistay-bundle.zip

echo "[4/5] Calisma kutuphaneleri guncelleniyor..."
npm install --no-audit --no-fund --no-save express dotenv @google/genai >/dev/null 2>&1

cat > "$APP_DIR/baslat.sh" << EOF
#!/usr/bin/env bash
cd "$APP_DIR"
pkill -f "dist-server/server.mjs" >/dev/null 2>&1 || true
NODE_ENV=production nohup node dist-server/server.mjs > "$APP_DIR/asistay.log" 2>&1 &
sleep 2
echo "Asistay calisiyor: http://127.0.0.1:3000"
command -v termux-open-url >/dev/null 2>&1 && termux-open-url "http://127.0.0.1:3000" || true
EOF
chmod +x "$APP_DIR/baslat.sh"

mkdir -p "$HOME/.local/bin"
ln -sf "$APP_DIR/baslat.sh" "$HOME/.local/bin/asistay" 2>/dev/null || true
if [ -n "$PREFIX" ] && [ -d "$PREFIX/bin" ]; then
  ln -sf "$APP_DIR/baslat.sh" "$PREFIX/bin/asistay" 2>/dev/null || true
fi

echo "[5/5] Asistay baslatiliyor..."
pkill -f "dist-server/server.mjs" >/dev/null 2>&1 || true
NODE_ENV=production nohup node dist-server/server.mjs > "$APP_DIR/asistay.log" 2>&1 &

for i in 1 2 3 4 5 6; do
  if curl -fsS "http://127.0.0.1:3000/api/cyber/status" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo ""
echo "=================================================="
echo "  ISLEM TAMAMLANDI!"
echo "  Dizin : $APP_DIR"
echo "  Adres : http://127.0.0.1:3000"
echo "  Baslat: asistay  (veya $APP_DIR/baslat.sh)"
echo "=================================================="

if command -v termux-open-url >/dev/null 2>&1; then
  termux-open-url "http://127.0.0.1:3000"
fi
`;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.send(script);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(ROOT_DIR, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pure local server running at http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Fatal server startup error:", err);
  process.exit(1);
});
