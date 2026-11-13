/**
 * Device-Local Persistent Storage Engine (localStorage + IndexedDB mirror)
 * Stores chat messages, drafts, security history, and settings on-device.
 */

export interface PersistedChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

export interface PersistedSecurityAlert {
  id: string;
  title: string;
  message: string;
  severity: 'green' | 'yellow' | 'red';
  timestamp?: string;
}

export interface PersistedSystemSettings {
  continuousListening: boolean;
  autoSpeak: boolean;
  showSecurityAlerts: boolean;
  stealthMode: boolean;
  visualGauges: boolean;
  monthlyLimit: number;
  visionCloudAnalysis: boolean;
}

const KEYS = {
  CHAT_MESSAGES: 'asistay_chat_messages_v1',
  CHAT_DRAFT: 'asistay_chat_draft_v1',
  SECURITY_HISTORY: 'asistay_security_history_v1',
  SYSTEM_SETTINGS: 'asistay_settings_v1',
  MIC_MUTED: 'asistay_mic_muted_v1',
  THEME: 'asistay_theme_v1',
};

const IDB_NAME = 'asistay_local_vault';
const IDB_STORE = 'kv_store';

function writeToIndexedDB(key: string, value: unknown): void {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  try {
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      try {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(value, key);
      } catch {
        // Ignore IDB quota/transaction errors gracefully
      }
    };
  } catch {
    // Ignore IDB availability errors
  }
}

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    writeToIndexedDB(key, value);
  } catch {
    // Ignore storage quota exceeded errors
  }
}

export const DEFAULT_SYSTEM_SETTINGS: PersistedSystemSettings = {
  continuousListening: false,
  autoSpeak: true,
  showSecurityAlerts: true,
  stealthMode: false,
  visualGauges: true,
  monthlyLimit: 5000,
  visionCloudAnalysis: false,
};

export function loadChatMessages(defaultMessages: PersistedChatMessage[]): PersistedChatMessage[] {
  const saved = safeReadJson<PersistedChatMessage[]>(KEYS.CHAT_MESSAGES, []);
  return Array.isArray(saved) && saved.length > 0 ? saved : defaultMessages;
}

export function saveChatMessages(messages: PersistedChatMessage[]): void {
  safeWriteJson(KEYS.CHAT_MESSAGES, messages.slice(-100));
}

export function loadChatDraft(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(KEYS.CHAT_DRAFT) || '';
  } catch {
    return '';
  }
}

export function saveChatDraft(draft: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEYS.CHAT_DRAFT, draft);
    writeToIndexedDB(KEYS.CHAT_DRAFT, draft);
  } catch {
    // Ignore
  }
}

export function loadSecurityHistory(
  defaultAlerts: PersistedSecurityAlert[]
): PersistedSecurityAlert[] {
  const saved = safeReadJson<PersistedSecurityAlert[]>(KEYS.SECURITY_HISTORY, []);
  return Array.isArray(saved) && saved.length > 0 ? saved : defaultAlerts;
}

export function saveSecurityHistory(alerts: PersistedSecurityAlert[]): void {
  safeWriteJson(KEYS.SECURITY_HISTORY, alerts.slice(0, 60));
}

export function loadSystemSettings(): PersistedSystemSettings {
  const saved = safeReadJson<Partial<PersistedSystemSettings>>(KEYS.SYSTEM_SETTINGS, {});
  return { ...DEFAULT_SYSTEM_SETTINGS, ...saved };
}

export function saveSystemSettings(settings: PersistedSystemSettings): void {
  safeWriteJson(KEYS.SYSTEM_SETTINGS, settings);
}

export function loadMicMuted(fallback = false): boolean {
  return safeReadJson<boolean>(KEYS.MIC_MUTED, fallback);
}

export function saveMicMuted(muted: boolean): void {
  safeWriteJson(KEYS.MIC_MUTED, muted);
}

export function loadSavedTheme<T extends string>(fallback: T): T {
  return safeReadJson<T>(KEYS.THEME, fallback);
}

export function saveTheme(theme: string): void {
  safeWriteJson(KEYS.THEME, theme);
}

export function clearAllAsistayStorage(): void {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  if ('indexedDB' in window) {
    try {
      window.indexedDB.deleteDatabase(IDB_NAME);
    } catch {
      // Ignore
    }
  }
}
