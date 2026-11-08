import React, { useState } from 'react';
import { Link2, ShieldAlert, AlertTriangle, CheckCircle, Search, ExternalLink } from 'lucide-react';

export const PhishingAnalyzerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [analysis, setAnalysis] = useState<{
    riskScore: number;
    verdict: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';
    findings: string[];
    domain: string;
    punycodeDetected: boolean;
  } | null>(null);

  const handleAnalyze = () => {
    if (!inputUrl) return;

    let domain = inputUrl.replace(/^https?:\/\//, '').split('/')[0];
    const isPunycode = domain.startsWith('xn--');
    const isTyposquat = /g00gle|paypa1|banka-onl1ne|secur1ty|l0gin/.test(domain.toLowerCase());
    const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);

    let score = 15;
    const findings: string[] = [];

    if (isPunycode) {
      score += 45;
      findings.push('⚠️ Punycode / IDN Homograph karakter gizleme tespit edildi (Kullanıcıyı kandırma riski).');
    }
    if (isTyposquat) {
      score += 50;
      findings.push('🚨 Typosquatting (Tanınmış markanın harf oyunu ile taklit edilmesi) saptandı.');
    }
    if (isIpHost) {
      score += 35;
      findings.push('⚠️ Doğrudan IP adresi yönlendirmesi var (Domain adı kullanılmamış).');
    }
    if (inputUrl.includes('@')) {
      score += 30;
      findings.push('⚠️ URL içinde kullanıcı bilgisi maskeleme (@ simgesi) mevcut.');
    }

    if (findings.length === 0) {
      findings.push('✅ Şüpheli URL/SMS yönlendirme deseni bulunamadı.');
    }

    setAnalysis({
      riskScore: Math.min(score, 100),
      verdict: score >= 60 ? 'DANGEROUS' : score >= 30 ? 'SUSPICIOUS' : 'SAFE',
      findings,
      domain,
      punycodeDetected: isPunycode,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl border border-yellow-900/60 bg-black p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-yellow-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-950 p-2.5 text-yellow-400 border border-yellow-700/50">
              <Link2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">Phishing & SMS Link Analizörü</h2>
              <p className="text-xs text-yellow-300">Oltalama, Typosquatting ve Şüpheli URL Taraması</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800">
            Kapat
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Şüpheli Bağlantı veya SMS URL'sini Yapıştırın (Örn: http://paypa1-security.com)"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              className="w-full rounded-xl border border-yellow-900/60 bg-gray-950 px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
            />
            <button
              onClick={handleAnalyze}
              className="flex items-center gap-2 rounded-xl bg-yellow-600 px-5 py-2.5 text-xs font-bold text-black hover:bg-yellow-500 transition shrink-0"
            >
              <Search className="h-4 w-4" /> Tara
            </button>
          </div>

          {analysis && (
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Hedef Alan Adı:</span>
                  <p className="font-mono text-sm font-bold text-white">{analysis.domain}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Risk Skoru:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-lg font-black ${
                      analysis.verdict === 'DANGEROUS' ? 'text-red-500' : analysis.verdict === 'SUSPICIOUS' ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      %{analysis.riskScore}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-300 mb-2">Güvenlik Bulguları:</h4>
                <div className="space-y-2">
                  {analysis.findings.map((finding, idx) => (
                    <div key={idx} className="rounded-lg bg-black p-2.5 text-xs text-gray-200 border border-gray-800 flex items-center gap-2">
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
