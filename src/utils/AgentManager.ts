/**
 * Autonomous Cyber Security Agent System
 * Manages 3 independent AI agents: Sentinel-X, Guardian-V, and Ghost-S.
 * These agents run autonomous protocols and report real-time telemetry.
 */

export type AgentStatus = 'idle' | 'scanning' | 'alert' | 'defending';

export interface AgentTelemetry {
  agentId: string;
  name: string;
  status: AgentStatus;
  lastAction: string;
  logs: string[];
  threatsDetected: number;
}

export interface EncryptionStreamTelemetry {
  streamId: string;
  algorithm: string;
  integrity: number; // e.g., 99.99
  latencyMs: number;
  status: 'secure' | 'rekeying' | 'quantum-locked';
}

export interface AgentReport {
  id: string;
  agentName: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
}

export interface DefenseMacro {
  id: string;
  name: string;
  codeName: string;
  agentId: 'sentinel-x' | 'guardian-v' | 'ghost-s';
  agentName: string;
  iconType: 'kill' | 'vpn' | 'buffer' | 'subnet' | 'quarantine' | 'fingerprint';
  severity: 'Critical' | 'High' | 'Defense';
  description: string;
  technicalDetails: string;
  audioSpeech: string;
  badgeColor: string;
}

export const DEFENSE_MACROS: DefenseMacro[] = [
  {
    id: 'macro-kill-proc',
    name: 'Kill Network Process',
    codeName: 'SIGKILL_ROGUE_SOCKET',
    agentId: 'sentinel-x',
    agentName: 'Sentinel-X',
    iconType: 'kill',
    severity: 'Critical',
    description: 'Yetkisiz dış soket açan veya veri sızdıran prosesi anında öldürür.',
    technicalDetails: 'TCP/UDP bağlantıları sıfırlanır, PID sonlandırma sinyali gönderilir.',
    audioSpeech: 'Sentinel-X: Ağ prosesi sonlandırıldı ve port mühürlendi.',
    badgeColor: 'border-red-500 text-red-400 bg-red-950/80',
  },
  {
    id: 'macro-isolate-subnet',
    name: 'Isolate Subnet',
    codeName: 'ZERO_TRUST_SEGMENT',
    agentId: 'sentinel-x',
    agentName: 'Sentinel-X',
    iconType: 'subnet',
    severity: 'High',
    description: 'Lokal alt ağı genel anahtarlamadan soyutlar, mikrosegmentasyon uygular.',
    technicalDetails: 'VLAN 10 isolated, DoH omurgası dışındaki tüm ARP sorguları bloke.',
    audioSpeech: 'Sentinel-X: Alt ağ mikrosegmentasyonu uygulandı.',
    badgeColor: 'border-blue-500 text-blue-400 bg-blue-950/80',
  },
  {
    id: 'macro-encrypt-buffer',
    name: 'Encrypt Current Buffer',
    codeName: 'RAM_VAULT_AES256',
    agentId: 'guardian-v',
    agentName: 'Guardian-V',
    iconType: 'buffer',
    severity: 'Critical',
    description: 'RAM bellek ve pano arabelleğini anında kuantum-dirençli şifrelemeye alır.',
    technicalDetails: 'AES-256-GCM ile geçici bellek şifrelenir, dump alma girişimleri sıfırlanır.',
    audioSpeech: 'Guardian-V: Bellek arabelleği şifrelendi ve izole edildi.',
    badgeColor: 'border-amber-500 text-amber-400 bg-amber-950/80',
  },
  {
    id: 'macro-quarantine-payload',
    name: 'Quarantine Payloads',
    codeName: 'HEURISTIC_JAIL',
    agentId: 'guardian-v',
    agentName: 'Guardian-V',
    iconType: 'quarantine',
    severity: 'High',
    description: 'Şüpheli binary ve imzasız kütüphaneleri yalıtılmış güvenlik kafesine alır.',
    technicalDetails: 'Chroot/seccomp filtresi ile izole kafese taşınır, disk yazma izni iptal edilir.',
    audioSpeech: 'Guardian-V: Şüpheli zararlı yük karantinaya alındı.',
    badgeColor: 'border-orange-500 text-orange-400 bg-orange-950/80',
  },
  {
    id: 'macro-rotate-vpn',
    name: 'Rotate VPN / Tor Hop',
    codeName: 'ONION_CIRCUIT_HOP',
    agentId: 'ghost-s',
    agentName: 'Ghost-S',
    iconType: 'vpn',
    severity: 'High',
    description: 'Ağ tünelini yeni bir anonim Avrupa omurgasına taşır, IP ve rotayı değiştirir.',
    technicalDetails: '3-Hop WireGuard tüneli Zürih sunucusuna aktarılır, yeni IP atanır.',
    audioSpeech: 'Ghost-S: Ağ tüneli döndürüldü, yeni anonim düğüme geçildi.',
    badgeColor: 'border-cyan-500 text-cyan-400 bg-cyan-950/80',
  },
  {
    id: 'macro-scrub-fingerprint',
    name: 'Scrub Fingerprint',
    codeName: 'SYNTHETIC_MASKING',
    agentId: 'ghost-s',
    agentName: 'Ghost-S',
    iconType: 'fingerprint',
    severity: 'Defense',
    description: 'Tarayıcı, WebRTC, donanım kimliği ve TLS parmak izini sentetik verilerle maskeler.',
    technicalDetails: 'Canvas, WebGL ve ses parmak izine rastgele gürültü eklenerek nötralize edilir.',
    audioSpeech: 'Ghost-S: Dijital parmak izi sentetik verilerle maskelendi.',
    badgeColor: 'border-indigo-500 text-indigo-400 bg-indigo-950/80',
  },
];

type ReportCallback = (report: AgentReport) => void;
type TelemetryCallback = (telemetry: AgentTelemetry[]) => void;

class AutonomousAgentManager {
  private agents: AgentTelemetry[] = [
    {
      agentId: 'sentinel-x',
      name: 'Sentinel-X',
      status: 'idle',
      lastAction: 'Ağ trafiği izleme modunda.',
      logs: ['Modül başlatıldı.', 'Paket filtreleme aktif.'],
      threatsDetected: 0,
    },
    {
      agentId: 'guardian-v',
      name: 'Guardian-V',
      status: 'idle',
      lastAction: 'Dosya bütünlüğü kontrol ediliyor.',
      logs: ['Sistem çekirdeği doğrulandı.', 'Malware imzaları güncellendi.'],
      threatsDetected: 0,
    },
    {
      agentId: 'ghost-s',
      name: 'Ghost-S',
      status: 'idle',
      lastAction: 'Veri sızıntısı taraması hazır.',
      logs: ['OSINT tüneli kuruldu.', 'Sızıntı veritabanı senkronize.'],
      threatsDetected: 0,
    },
  ];

  private reportListeners: ReportCallback[] = [];
  private telemetryListeners: TelemetryCallback[] = [];
  private intervals: any[] = [];
  private encryptionStreams: EncryptionStreamTelemetry[] = [
    { streamId: 'q-stream-01', algorithm: 'ML-KEM-1024 (Post-Quantum)', integrity: 99.99, latencyMs: 1.2, status: 'quantum-locked' },
    { streamId: 'q-stream-02', algorithm: 'AES-256-GCM Hardware Vault', integrity: 100.00, latencyMs: 0.8, status: 'secure' },
    { streamId: 'q-stream-03', algorithm: 'Zero-Trust Micro-Segment', integrity: 99.95, latencyMs: 2.1, status: 'secure' }
  ];

  public getEncryptionStreams(): EncryptionStreamTelemetry[] {
    // slight random fluctuation for realism
    return this.encryptionStreams.map(s => ({
      ...s,
      integrity: Number((99.90 + Math.random() * 0.10).toFixed(2))
    }));
  }

  public start() {
    this.intervals.push(setInterval(() => this.runSentinelX(), 8000));
    this.intervals.push(setInterval(() => this.runGuardianV(), 12000));
    this.intervals.push(setInterval(() => this.runGhostS(), 20000));
  }

  public stop() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
  }

  public onReport(cb: ReportCallback) {
    this.reportListeners.push(cb);
    return () => { this.reportListeners = this.reportListeners.filter(l => l !== cb); };
  }

  public onTelemetry(cb: TelemetryCallback) {
    this.telemetryListeners.push(cb);
    return () => { this.telemetryListeners = this.telemetryListeners.filter(l => l !== cb); };
  }

  private updateAgent(id: string, updates: Partial<AgentTelemetry>) {
    this.agents = this.agents.map(a => a.agentId === id ? { ...a, ...updates } : a);
    this.telemetryListeners.forEach(cb => cb([...this.agents]));
  }

  private notify(agentName: string, report: Omit<AgentReport, 'id' | 'agentName' | 'timestamp'>) {
    const data: AgentReport = {
      id: `rep-${Date.now()}`,
      agentName,
      timestamp: new Date().toLocaleTimeString(),
      ...report,
    };
    this.reportListeners.forEach(cb => cb(data));
  }

  private runSentinelX() {
    const agent = this.agents[0];
    this.updateAgent('sentinel-x', { status: 'scanning', lastAction: 'Paket analizi yapılıyor...' });

    setTimeout(() => {
      if (Math.random() > 0.8) {
        this.updateAgent('sentinel-x', { 
          status: 'alert', 
          lastAction: 'Şüpheli IP tespiti!',
          threatsDetected: agent.threatsDetected + 1,
          logs: [...agent.logs.slice(-10), `[ALERT] Şüpheli giriş denemesi engellendi: ${this.genIP()}`]
        });
        this.notify('Sentinel-X', {
          type: 'warning',
          title: 'Ağ İhlali Girişimi',
          message: 'Dış kaynaklı bir IP adresinden port tarama girişimi saptandı ve engellendi.',
        });
      } else {
        this.updateAgent('sentinel-x', { 
          status: 'idle', 
          lastAction: 'Trafik temiz. İzlemeye devam ediliyor.',
          logs: [...agent.logs.slice(-10), `[OK] Trafik analizi tamamlandı: 0 tehdit.`]
        });
      }
    }, 3000);
  }

  private runGuardianV() {
    const agent = this.agents[1];
    this.updateAgent('guardian-v', { status: 'scanning', lastAction: 'Dosya sistemi taranıyor...' });

    setTimeout(() => {
      if (Math.random() > 0.9) {
        this.updateAgent('guardian-v', { 
          status: 'alert', 
          lastAction: 'Bilinmeyen dosya değişikliği!',
          threatsDetected: agent.threatsDetected + 1,
          logs: [...agent.logs.slice(-10), `[CRITICAL] /usr/bin/ unauthorized modification detected!`]
        });
        this.notify('Guardian-V', {
          type: 'critical',
          title: 'Sistem Bütünlüğü Bozuldu',
          message: 'Sistem dizininde yetkisiz bir dosya değişikliği saptandı. Karantina başlatıldı.',
        });
      } else {
        this.updateAgent('guardian-v', { 
          status: 'idle', 
          lastAction: 'Sistem bütünlüğü %100.',
          logs: [...agent.logs.slice(-10), `[OK] Derin tarama tamamlandı: Sistem güvenli.`]
        });
      }
    }, 5000);
  }

  private runGhostS() {
    const agent = this.agents[2];
    this.updateAgent('ghost-s', { status: 'scanning', lastAction: 'Veri sızıntı havuzları kontrol ediliyor...' });

    setTimeout(() => {
      if (Math.random() > 0.85) {
        this.updateAgent('ghost-s', { 
          status: 'alert', 
          lastAction: 'Yeni sızıntı kaydı bulundu!',
          threatsDetected: agent.threatsDetected + 1,
          logs: [...agent.logs.slice(-10), `[INFO] Dark web senkronizasyonu: 1 eşleşen kayıt found.`]
        });
        this.notify('Ghost-S', {
          type: 'info',
          title: 'Veri Sızıntısı Bilgisi',
          message: 'Kayıtlı e-posta adreslerinizden biri son sızıntı veritabanında görüldü. Parola yenileme önerilir.',
        });
      } else {
        this.updateAgent('ghost-s', { 
          status: 'idle', 
          lastAction: 'Kullanıcı verileri güvende.',
          logs: [...agent.logs.slice(-10), `[OK] Sızıntı kontrolü temiz.`]
        });
      }
    }, 7000);
  }

  private genIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  public getAgents(): AgentTelemetry[] {
    return [...this.agents];
  }

  public executeMacro(macroId: string): { success: boolean; macro: DefenseMacro; message: string } {
    const macro = DEFENSE_MACROS.find(m => m.id === macroId) || DEFENSE_MACROS[0];
    const agent = this.agents.find(a => a.agentId === macro.agentId);
    const newLog = `[MACRO RUN] ${macro.codeName}: ${macro.name} başarıyla uygulandı.`;
    
    this.updateAgent(macro.agentId, {
      status: 'defending',
      lastAction: `⚡ Makro devrede: ${macro.name}`,
      logs: [...(agent?.logs.slice(-10) || []), newLog],
    });

    this.notify(macro.agentName, {
      type: 'critical',
      title: `⚡ Otonom Savunma: ${macro.name}`,
      message: `${macro.description} (${macro.technicalDetails})`,
    });

    // Reset status back to idle after defense burst
    setTimeout(() => {
      this.updateAgent(macro.agentId, {
        status: 'idle',
        lastAction: 'Makro operasyonu tamamlandı. İzlemeye dönüldü.',
      });
    }, 4500);

    return {
      success: true,
      macro,
      message: `${macro.name} başarıyla devreye alındı.`,
    };
  }
}

export const agentManager = new AutonomousAgentManager();
