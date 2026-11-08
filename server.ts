import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limit for receipt images
app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI client with required header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Built-in sample receipts for instant testing
const SAMPLE_RECEIPTS = [
  {
    id: 'sample-cantina',
    name: 'El Toro Mexican Cantina',
    date: '2025-05-18 20:45',
    currency: '$',
    items: [
      { id: 'item-1', name: 'Loaded Queso Nachos', price: 14.50, quantity: 1, category: 'Appetizer', assignedTo: [] },
      { id: 'item-2', name: 'Birria Tacos (3pcs)', price: 17.00, quantity: 1, category: 'Main', assignedTo: [] },
      { id: 'item-3', name: 'Carne Asada Fajitas', price: 22.50, quantity: 1, category: 'Main', assignedTo: [] },
      { id: 'item-4', name: 'House Classic Margarita', price: 13.00, quantity: 2, category: 'Drinks', assignedTo: [] },
      { id: 'item-5', name: 'Guacamole & Chips', price: 9.50, quantity: 1, category: 'Appetizer', assignedTo: [] },
      { id: 'item-6', name: 'Cinnamon Churros & Dip', price: 8.50, quantity: 1, category: 'Dessert', assignedTo: [] },
    ],
    subtotal: 98.00,
    tax: 8.82,
    tip: 17.64,
    total: 124.46,
    defaultParticipants: ['Dhruv', 'Sarah', 'Sue', 'Alex']
  },
  {
    id: 'sample-pizzeria',
    name: 'Bella Napoli Pizzeria & Bar',
    date: '2025-05-19 19:15',
    currency: '$',
    items: [
      { id: 'p-1', name: 'Margherita Wood-Fired Pizza', price: 19.00, quantity: 1, category: 'Pizza', assignedTo: [] },
      { id: 'p-2', name: 'Truffle & Wild Mushroom Pasta', price: 23.50, quantity: 1, category: 'Pasta', assignedTo: [] },
      { id: 'p-3', name: 'Crispy Calamari Fritti', price: 15.00, quantity: 1, category: 'Starters', assignedTo: [] },
      { id: 'p-4', name: 'Caesar Salad with Chicken', price: 14.00, quantity: 1, category: 'Salads', assignedTo: [] },
      { id: 'p-5', name: 'Peroni Draught Beer', price: 8.00, quantity: 3, category: 'Drinks', assignedTo: [] },
      { id: 'p-6', name: 'Classic Tiramisu', price: 9.50, quantity: 1, category: 'Dessert', assignedTo: [] },
    ],
    subtotal: 105.00,
    tax: 9.45,
    tip: 18.90,
    total: 133.35,
    defaultParticipants: ['Dhruv', 'Sarah', 'Sue']
  },
  {
    id: 'sample-sushi',
    name: 'Sakura Omakase & Izakaya',
    date: '2025-05-20 21:00',
    currency: '$',
    items: [
      { id: 's-1', name: 'Spicy Salmon Crunch Roll', price: 16.50, quantity: 1, category: 'Sushi', assignedTo: [] },
      { id: 's-2', name: 'Dragon Roll (Eel & Avocado)', price: 18.00, quantity: 1, category: 'Sushi', assignedTo: [] },
      { id: 's-3', name: 'Chicken Karaage Bites', price: 11.50, quantity: 1, category: 'Small Plates', assignedTo: [] },
      { id: 's-4', name: 'Steamed Edamame with Sea Salt', price: 6.50, quantity: 1, category: 'Small Plates', assignedTo: [] },
      { id: 's-5', name: 'Hot Green Tea', price: 4.00, quantity: 2, category: 'Beverage', assignedTo: [] },
      { id: 's-6', name: 'Matcha Green Tea Ice Cream', price: 7.00, quantity: 1, category: 'Dessert', assignedTo: [] },
    ],
    subtotal: 67.50,
    tax: 6.08,
    tip: 13.50,
    total: 87.08,
    defaultParticipants: ['Dhruv', 'Sarah', 'Liam', 'Emma']
  }
];

// Endpoint: Get sample receipts
app.get('/api/receipts/samples', (_req, res) => {
  res.json({ samples: SAMPLE_RECEIPTS });
});

// Endpoint: Parse Receipt Image via Gemini
app.post('/api/receipt/parse', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in server environment. Please configure it in Settings > Secrets.',
      });
    }

    // Clean base64 data if it contains a data URL prefix
    let cleanBase64 = imageBase64;
    let detectedMime = mimeType || 'image/jpeg';

    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      detectedMime = parts[0].replace('data:', '') || detectedMime;
      cleanBase64 = parts[1];
    }

    const promptText = `Analyze this restaurant / store receipt carefully and extract:
1. The restaurant / store name
2. The date and time if visible
3. An exact itemized list of all food/drink/grocery items with:
   - item name (clean, proper capitalisation)
   - quantity (integer or number, default 1)
   - unit/line price (number)
   - category (e.g., Appetizer, Main, Pizza, Pasta, Drinks, Dessert, Sides, Other)
4. Subtotal (before tax and tip)
5. Tax amount
6. Tip or gratuity if already included (otherwise 0)
7. Final Total amount
8. Currency symbol (usually '$')

Be precise with numbers and make sure prices match the receipt. If subtotal is missing, calculate the sum of items.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: detectedMime,
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction: 'You are an expert OCR receipt auditor. Extract receipt items accurately into JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restaurantName: { type: Type.STRING },
            date: { type: Type.STRING },
            currency: { type: Type.STRING },
            subtotal: { type: Type.NUMBER },
            tax: { type: Type.NUMBER },
            tip: { type: Type.NUMBER },
            total: { type: Type.NUMBER },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  price: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                },
                required: ['name', 'price'],
              },
            },
          },
          required: ['restaurantName', 'items', 'subtotal', 'total'],
        },
      },
    });

    const parsedJsonText = response.text || '{}';
    const parsedData = JSON.parse(parsedJsonText);

    // Format items with unique IDs and empty assignedTo
    const items = (parsedData.items || []).map((item: any, idx: number) => ({
      id: `item-${Date.now()}-${idx + 1}`,
      name: item.name || `Item ${idx + 1}`,
      quantity: item.quantity || 1,
      price: typeof item.price === 'number' ? Number(item.price.toFixed(2)) : 0,
      category: item.category || 'General',
      assignedTo: [],
    }));

    const subtotal = parsedData.subtotal ?? items.reduce((acc: number, it: any) => acc + it.price, 0);
    const tax = parsedData.tax ?? Number((subtotal * 0.08875).toFixed(2));
    const tip = parsedData.tip ?? Number((subtotal * 0.18).toFixed(2));
    const total = parsedData.total ?? Number((subtotal + tax + tip).toFixed(2));

    return res.json({
      success: true,
      receipt: {
        restaurantName: parsedData.restaurantName || 'Restaurant Receipt',
        date: parsedData.date || new Date().toISOString().split('T')[0],
        currency: parsedData.currency || '$',
        items,
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        tip: Number(tip.toFixed(2)),
        total: Number(total.toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error('Error parsing receipt:', error);
    return res.status(500).json({
      error: error.message || 'Failed to parse receipt with Gemini.',
      details: String(error),
    });
  }
});

// Endpoint: Smart Natural Language Chat Command
app.post('/api/chat/command', async (req, res) => {
  try {
    const { message, history, currentReceipt, participants } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message command is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in server environment.',
      });
    }

    const itemsContext = (currentReceipt?.items || []).map((it: any) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      assignedTo: it.assignedTo || [],
    }));

    const systemPrompt = `You are a conversational bill-splitting assistant for a restaurant receipt.
The current receipt has these items:
${JSON.stringify(itemsContext, null, 2)}

Current known participants: ${JSON.stringify(participants || [])}
Current subtotal: ${currentReceipt?.subtotal ?? 0}, tax: ${currentReceipt?.tax ?? 0}, tip: ${currentReceipt?.tip ?? 0}

The user will provide natural language instructions like:
- "Dhruv had the nachos"
- "Sarah and Sue shared the pizza"
- "Alex and I split the wings and he also had a beer"
- "Everyone shared the appetizer" / "Split nachos among everyone"
- "Remove Sue from the pizza"
- "Tip 20%" or "Set tip to 15 dollars"
- "Add Mike to the bill"
- "Who owes what so far?"

Your task is to:
1. Understand the user's intent. Match mentioned items against current receipt items (use fuzzy matching, e.g. "nachos" matches "Loaded Queso Nachos", "pizza" matches "Margherita Wood-Fired Pizza").
2. Extract the people mentioned. If a new name is mentioned (e.g. "Dhruv", "Sarah", "Sue", "Bob"), add them as participants.
3. Determine assignment actions:
   - "ASSIGN": single person has the item. Replaces or sets assignment for that item.
   - "SPLIT": two or more people share the item. Sets assignedTo to that list of people.
   - "SPLIT_ALL": split an item among all known participants.
   - "UNASSIGN": remove a specific person or everyone from an item.
   - "SET_TIP": update tip percentage or fixed amount.
   - "ADD_PERSON": explicitly add a person to the group.
   - "REMOVE_PERSON": remove a person from group and clear their assignments.
   - "CLEAR_ALL": reset all assignments.
4. Provide a friendly, concise, natural language explanation in 'reply' (1-2 sentences with emojis).
5. Provide 2-3 short, relevant 'quickSuggestions' the user might want to say next.

Return STRICT JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `User command: "${message}"` }],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Friendly response explaining what was assigned or answering the question',
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: 'One of: ASSIGN, SPLIT, SPLIT_ALL, UNASSIGN, SET_TIP, ADD_PERSON, REMOVE_PERSON, CLEAR_ALL, NONE',
                  },
                  itemId: { type: Type.STRING, description: 'Matched item id if applicable' },
                  itemName: { type: Type.STRING, description: 'Matched item name' },
                  people: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'List of people names for this action',
                  },
                  tipPercent: { type: Type.NUMBER, description: 'New tip percent if SET_TIP' },
                  tipAmount: { type: Type.NUMBER, description: 'New tip dollar amount if SET_TIP' },
                },
                required: ['type'],
              },
            },
            newParticipants: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Any newly discovered people names that should be added to the group',
            },
            quickSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 to 3 contextual follow-up prompt pills',
            },
          },
          required: ['reply', 'actions'],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      data: parsedResult,
    });
  } catch (error: any) {
    console.error('Error processing chat command:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process chat command with Gemini.',
    });
  }
});

// Endpoint: Sınırsız Siber Asistan Chat (Turkish Voice & Command AI)
app.post('/api/cyber/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mesaj metni zorunludur.' });
    }

    const cyberSystemInstruction = `Sen "Sınırsız Asistan"sın — Otonom Siber Güvenlik Savunması ve Kişisel Mobil Asistansın.
Kullanıcı siber güvenlik ve kişisel asistanlık görevlerini yöneten bir uzmandır.
Asla borsa, hisse senedi, finansal ticaret veya siyasal/politik tartışmalara girme.
Odak alanların yalnızca iki temel direktiftir:
1. SİBER GÜVENLİK & SAVUNMA: PentAGI, Robo, DarkMoon, Arcanum Core, LLMtary, OIHK, Assail Ares, AntiPegasus/Aegis, VIGIL takip tespiti, Scout, WARNE, TruffleHog, Checkov, VulnHouse etik zafiyet analizi ve acil durum kalkanı.
2. KİŞİSEL ASİSTAN & MOBİL OTOMASYON: Telefon sesli kontrolleri (Neuron, Android Use ADB, XPhoneUse, ClawNode), mesajlaşma ve günlük görevler (OpenClaw, Hermes Agent, WhatsApp/Telegram botları), cihaz içi internetsiz Qwen/Ollama modelleri ve eller-serbest sesli kaydırma.
Yanıtların kısa, net, teknik, Türkçe ve doğrudan eyleme yönelik olsun.`;

    // Format history if provided
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.slice(-8).forEach((h: any) => {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    if (process.env.GEMINI_API_KEY) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI_TIMEOUT')), 3500)
      );

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: cyberSystemInstruction,
        },
      });

      const response: any = await Promise.race([geminiPromise, timeoutPromise]);
      const replyText = response.text || 'Komutunuz işlendi.';
      return res.json({
        success: true,
        reply: replyText,
        source: 'gemini-3.8-flash',
      });
    } else {
      const fallbackReply = generateCyberFallbackResponse(message);
      return res.json({
        success: true,
        reply: fallbackReply,
        source: 'local-cyber-engine',
      });
    }
  } catch (error: any) {
    console.warn('Cyber assistant fallback active:', error?.message);
    const fallbackReply = generateCyberFallbackResponse(req.body?.message || '');
    return res.json({
      success: true,
      reply: fallbackReply,
      source: 'local-cyber-engine',
    });
  }
});

// Helper for offline / fast fallback response in Turkish
function generateCyberFallbackResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('pentagi')) {
    return 'PentAGI, 20\'den fazla güvenlik aracını yöneten otonom kırmızı takım ajanıdır. Sıfır maliyetle çalıştırmak için: mkdir pentagi && cd pentagi ardından curl ile docker-compose.yml ve .env indirip "docker-compose up -d" ile başlatabilirsiniz. Yerel Ollama (llama3.1:8b) ile tam uyumludur.';
  }
  if (lower.includes('aegis') || lower.includes('pegasus')) {
    return 'AntiPegasus (Aegis), sıfır tıklamalı exploit ve casus yazılımları sistem çağrıları ve ağ trafiği analiziyle gerçek zamanlı tespit edip karantinaya alan açık kaynaklı savunma aracıdır.';
  }
  if (lower.includes('vigil') || lower.includes('airtag') || lower.includes('takip')) {
    return 'VIGIL, Apple AirTag, Tile ve SmartTag gibi takip cihazlarını internet izni olmadan çevrimdışı "zamansal birlikte hareket" analiziyle tespit eden açık kaynaklı Android uygulamasıdır.';
  }
  if (lower.includes('ollama') || lower.includes('yerel') || lower.includes('ücretsiz')) {
    return 'Sıfır maliyetli yerel LLM çalıştırmak için: "curl -fsSL https://ollama.com/install.sh | sh" komutunu çalıştırın ve "ollama pull llama3.1:8b-instruct-q8_0" modelini indirin. Sistem http://localhost:11434 üzerinden API anahtarı istemeden sınırsız çalışır.';
  }
  if (lower.includes('robo')) {
    return 'Robo (Ignitee Now), "Hey Roh Boh" sesli uyandırma komutuyla cihaz üzerinde çalışan, dosya okuyup kod çalıştırabilen ve güvenlik keşfi yapabilen yerel bir yapay zeka ajanıdır.';
  }
  if (lower.includes('kalkan') || lower.includes('güvenlik') || lower.includes('durum')) {
    return 'Siber savunma kalkanları devrede. Ağ izleme aktif, paket filtreleme hazır, yerel çıkarım motoru çalışıyor. Herhangi bir acil durumda kırmızı Kalkan / Kill-Switch butonunu kullanabilirsiniz.';
  }
  return `Komutunuz alındı: "${msg}". Siber Asistan tüm savunma, casus yazılım tespiti, otonom sızma testi ve yerel model yapılandırmalarını sıfır API ücretiyle yönetmeye hazır.`;
}

// Endpoint: Cyber system live status
app.get('/api/cyber/status', (_req, res) => {
  res.json({
    online: true,
    defenseShieldActive: true,
    localOllamaEndpoint: 'http://localhost:11434',
    recommendedModel: 'llama3.1:8b-instruct-q8_0',
    mode: 'Zero-Cost Local & Cloud Dual Engine',
    emergencyKillSwitchReady: true,
    networkStatus: {
      latencyMs: 14,
      packetLoss: 0,
      dnsSecured: true,
      firewall: 'Active (Permissive for Authorized Local Labs)',
    },
  });
});

// Configure Vite in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SplitWise AI server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
