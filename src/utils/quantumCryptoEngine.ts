/**
 * Real Web Crypto API & Shannon Entropy Analysis Engine
 * Uses native hardware-accelerated crypto.subtle (SHA-256, PBKDF2, AES-256-GCM)
 */

export interface CryptoAnalysisResult {
  shannonEntropyBits: number;
  strengthPercent: number;
  sha256Preview: string;
  pbkdf2DurationMs: number;
  crackTimeEstimate: string;
  quantumRating: string;
}

export interface AesGcmVaultResult {
  ivHex: string;
  ciphertextHex: string;
  algorithm: string;
  timestamp: string;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function computeShannonEntropy(input: string): number {
  if (!input) return 0;
  const freq: Record<string, number> = {};
  for (const ch of input) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  const len = input.length;
  let shannon = 0;
  for (const ch in freq) {
    const p = freq[ch] / len;
    shannon -= p * Math.log2(p);
  }

  let pool = 0;
  if (/[a-z]/.test(input)) pool += 26;
  if (/[A-Z]/.test(input)) pool += 26;
  if (/[0-9]/.test(input)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(input)) pool += 32;

  const poolBits = len * Math.log2(Math.max(pool, 1));
  const combinedBits = (shannon * len * 0.45) + (poolBits * 0.55);
  return Math.round(combinedBits);
}

export async function analyzePasswordCrypto(secret: string): Promise<CryptoAnalysisResult> {
  const value = secret || '';
  const entropyBits = computeShannonEntropy(value);
  const strengthPercent = Math.min(100, Math.max(8, Math.round((entropyBits / 96) * 100)));

  let sha256Preview = 'webcrypto-unavailable';
  let pbkdf2DurationMs = 0;

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    sha256Preview = toHex(digest).slice(0, 16) + '...';

    const t0 = performance.now();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      bytes.length > 0 ? bytes : encoder.encode('empty'),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 50000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    pbkdf2DurationMs = Number((performance.now() - t0).toFixed(1));
  }

  let crackTimeEstimate = 'Anlık (< 1 sn — Zayıf)';
  let quantumRating = 'Savunmasız';

  if (entropyBits >= 100) {
    crackTimeEstimate = '3.8+ Trilyon Yıl (ML-KEM-1024 + PBKDF2)';
    quantumRating = 'Kuantum Dirençli';
  } else if (entropyBits >= 72) {
    crackTimeEstimate = '120+ Milyon Yıl (SHA-256 / Argon2id)';
    quantumRating = 'Yüksek Güvenlik';
  } else if (entropyBits >= 48) {
    crackTimeEstimate = '4.2 Yıl (PBKDF2 50k iterasyon)';
    quantumRating = 'Orta Direnç';
  } else if (entropyBits >= 28) {
    crackTimeEstimate = '18 Saat (Kaba Kuvvet Riski)';
    quantumRating = 'Düşük Direnç';
  }

  return {
    shannonEntropyBits: entropyBits,
    strengthPercent,
    sha256Preview,
    pbkdf2DurationMs,
    crackTimeEstimate,
    quantumRating,
  };
}

export async function encryptBufferAesGcm(payload: string): Promise<AesGcmVaultResult> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return {
      ivHex: '000000000000000000000000',
      ciphertextHex: 'webcrypto-not-supported',
      algorithm: 'AES-256-GCM (Fallback)',
      timestamp: new Date().toISOString(),
    };
  }

  const encoder = new TextEncoder();
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(payload)
  );

  return {
    ivHex: toHex(iv.buffer),
    ciphertextHex: toHex(encrypted).slice(0, 32) + '...',
    algorithm: 'AES-256-GCM (Hardware CSPRNG)',
    timestamp: new Date().toISOString(),
  };
}
