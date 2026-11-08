import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Key, ShieldCheck, Plus, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react';

interface VaultItem {
  id: string;
  title: string;
  encryptedData: string; // Base64 ciphertext
  iv: string; // Base64 IV
  category: 'password' | 'note' | 'card' | 'key';
  createdAt: string;
}

export const EncryptedVaultModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [passphrase, setPassphrase] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);

  const [items, setItems] = useState<VaultItem[]>([]);
  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'password' | 'note' | 'card' | 'key'>('note');
  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cyber_vault_items');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const deriveKey = async (pass: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(pass),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('SINIRSIZ_ASISTAN_VAULT_SALT_2026'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const handleUnlock = async () => {
    if (!passphrase) return;
    try {
      const derived = await deriveKey(passphrase);
      setCryptoKey(derived);
      setIsUnlocked(true);

      const decryptedObj: Record<string, string> = {};
      const decoder = new TextDecoder();

      for (const item of items) {
        try {
          const ivArr = Uint8Array.from(atob(item.iv), c => c.charCodeAt(0));
          const dataArr = Uint8Array.from(atob(item.encryptedData), c => c.charCodeAt(0));

          const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ivArr },
            derived,
            dataArr
          );
          decryptedObj[item.id] = decoder.decode(decryptedBuffer);
        } catch {
          decryptedObj[item.id] = '[Şifre Çözme Başarısız - Yanlış Parola]';
        }
      }
      setDecryptedMap(decryptedObj);
    } catch (err) {
      alert('Anahtar türetme hatası!');
    }
  };

  const handleAddItem = async () => {
    if (!title || !content || !cryptoKey) return;

    try {
      const encoder = new TextEncoder();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encoder.encode(content)
      );

      const ivBase64 = btoa(String.fromCharCode(...iv));
      const dataBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

      const newItem: VaultItem = {
        id: 'item-' + Date.now(),
        title,
        encryptedData: dataBase64,
        iv: ivBase64,
        category,
        createdAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };

      const updated = [newItem, ...items];
      setItems(updated);
      localStorage.setItem('cyber_vault_items', JSON.stringify(updated));

      setDecryptedMap(prev => ({ ...prev, [newItem.id]: content }));
      setTitle('');
      setContent('');
    } catch (err) {
      alert('Şifreleme sırasında hata oluştu.');
    }
  };

  const handleDelete = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('cyber_vault_items', JSON.stringify(updated));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-blue-900/60 bg-black p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-950 p-2.5 text-blue-400 border border-blue-700/50">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">Zero-Knowledge Encrypted Vault</h2>
              <p className="text-xs text-blue-300">Client-Side AES-GCM 256-Bit Şifreli Hassas Veri Kasası</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800">
            Kapat
          </button>
        </div>

        {/* Unlocked / Locked States */}
        {!isUnlocked ? (
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-blue-950/60 p-5 border border-blue-800/40">
              <Lock className="h-10 w-10 text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold">Kasa Kilitli</h3>
            <p className="mt-1 max-w-md text-xs text-gray-400">
              Anahtar cümleniz (Passphrase) tarayıcınızda PBKDF2 ile işlenerek 256-bit AES anahtarına dönüştürülür. Sunucuya veri gönderilmez.
            </p>

            <div className="mt-6 flex w-full max-w-sm gap-2">
              <input
                type="password"
                placeholder="Anahtar Parolanızı Girin..."
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                className="w-full rounded-xl border border-blue-900 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleUnlock}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition"
              >
                <Unlock className="h-4 w-4" />
                Aç
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {/* Add New Item */}
            <div className="rounded-xl border border-blue-900/40 bg-gray-950 p-4">
              <h4 className="text-xs font-semibold uppercase text-blue-400 mb-3 flex items-center gap-2">
                <Plus className="h-4 w-4" /> Yeni Şifreli Öğe Ekle
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Başlık (Örn: Banka Şifrem)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="rounded-lg border border-blue-900/60 bg-black px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="rounded-lg border border-blue-900/60 bg-black px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="note">Gizli Not</option>
                  <option value="password">Şifre / Parola</option>
                  <option value="card">Kart / Hesap</option>
                  <option value="key">API / Kripto Anahtarı</option>
                </select>
                <button
                  onClick={handleAddItem}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition flex items-center justify-center gap-1.5"
                >
                  <Key className="h-3.5 w-3.5" /> Şifrele ve Kaydet
                </button>
              </div>
              <textarea
                placeholder="Şifrelenecek İçerik (Gizli Şifre, Not, Kripto Seed Cümlesi vb.)"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-blue-900/60 bg-black p-3 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* List Items */}
            <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
              {items.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">Henüz kasaya şifreli bir veri eklenmedi.</div>
              ) : (
                items.map(item => {
                  const isVisible = visibleMap[item.id];
                  const decValue = decryptedMap[item.id] || '***';

                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-950 p-3 hover:border-blue-900 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase border border-blue-800/40">
                            {item.category}
                          </span>
                          <span className="font-semibold text-xs text-white">{item.title}</span>
                          <span className="text-[10px] text-gray-500">{item.createdAt}</span>
                        </div>
                        <div className="font-mono text-xs text-gray-300">
                          {isVisible ? decValue : '••••••••••••••••••••'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setVisibleMap(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
                        >
                          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleCopy(item.id, decValue)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
                        >
                          {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded p-1.5 text-red-400 hover:bg-red-950/60"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
