import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Activity,
  Terminal,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu,
  Radio,
  Eye,
  Smartphone,
  Layers,
  Key,
  Volume2,
  Power,
  RotateCcw,
  Sliders,
  Server,
  Database,
  Wifi,
  FileCode,
  Crosshair,
  WifiOff,
  EyeOff,
} from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';
import { speakUltraRealistic } from '../utils/ultraTTS';

export interface TacticalToolItem {
  id: string;
  num: number;
  name: string;
  codeName: string;
  category: 'network' | 'endpoint' | 'crypto' | 'osint' | 'signal' | 'apt' | 'soar';
  description: string;
  technicalCapability: string;
  mitreMapping: string;
  active: boolean;
  eventsMitigated: number;
  severity: 'Critical' | 'High' | 'Defense';
  audioFeedback: string;
}

const INITIAL_TACTICAL_TOOLS: TacticalToolItem[] = [
  // 1. Ağ İzleme
  {
    id: 'tool-1',
    num: 1,
    name: 'Ağ İzleme & Derin Paket İnceleme (DPI)',
    codeName: 'NET_SNIFFER_DPI',
    category: 'network',
    description: 'Ağ trafiğini kesintisiz izleyen, şüpheli TCP/UDP paketlerini filtreleyen aktif koruma modülü.',
    technicalCapability: 'Wireshark, Zeek ve Snort kuralları ile 10 Gbps hat hızında anlık protokol analizi.',
    mitreMapping: 'MITRE ATT&CK: T1040 (Network Sniffing)',
    active: true,
    eventsMitigated: 342,
    severity: 'High',
    audioFeedback: 'Ağ izleme ve derin paket inceleme filtresi devrede.',
  },
  // 2. Sızma Testleri & Zafiyet Analizi
  {
    id: 'tool-2',
    num: 2,
    name: 'Zafiyet Analizi & Güvenlik Değerlendirmesi',
    codeName: 'VULN_SCANNER_AUDIT',
    category: 'endpoint',
    description: 'Sistem portlarını, servis yapılandırmalarını ve açıkta kalan zafiyetleri denetleyen savunma motoru.',
    technicalCapability: 'OpenVAS ve Nuclei şablonları ile yerel ve dış zafiyet denetimi, otomatik risk puanlaması.',
    mitreMapping: 'MITRE ATT&CK: T1595 (Active Scanning)',
    active: true,
    eventsMitigated: 89,
    severity: 'High',
    audioFeedback: 'Zafiyet analizi ve sistem denetim motoru güncellendi.',
  },
  // 3. OSINT
  {
    id: 'tool-3',
    num: 3,
    name: 'Açık Kaynak İstihbaratı (OSINT)',
    codeName: 'OSINT_RECON_HARVEST',
    category: 'osint',
    description: 'Hedef kişi, kurum ve alan adları hakkında halka açık veritabanları ve dark web sızıntı taraması.',
    technicalCapability: 'Shodan, SpiderFoot ve Recon-ng veri beslemeleriyle dijital varlık haritalama.',
    mitreMapping: 'MITRE ATT&CK: T1596 (Search Open Technical Databases)',
    active: true,
    eventsMitigated: 156,
    severity: 'Defense',
    audioFeedback: 'Açık kaynak istihbarat havuzu senkronize edildi.',
  },
  // 4. Sinyal Takibi
  {
    id: 'tool-4',
    num: 4,
    name: 'Sinyal Takibi & RF Spektrum Analizi',
    codeName: 'RF_SPECTRUM_MONITOR',
    category: 'signal',
    description: 'Elektromanyetik dalgaları, radyo frekanslarını ve iletişim sinyallerini gerçek zamanlı izleme.',
    technicalCapability: 'SDR (Software Defined Radio) ve HackRF arabirimleriyle 1MHz - 6GHz bant genişliği taraması.',
    mitreMapping: 'MITRE ATT&CK: T1430 (Location Tracking & Signal Intel)',
    active: true,
    eventsMitigated: 41,
    severity: 'High',
    audioFeedback: 'RF spektrum izleme ve sinyal yakalama modülü aktif.',
  },
  // 5. Otonom Savunma
  {
    id: 'tool-5',
    num: 5,
    name: 'Otonom Savunma & Müdahale',
    codeName: 'AUTO_DEFENSE_RESPONDER',
    category: 'soar',
    description: 'Tehdit anında insan müdahalesi beklemeden otomatik savunma protokollerini devreye sokma.',
    technicalCapability: 'Risk derecesine göre renk kodlu uyarı üretimi, dinamik IP banlama ve port mühürleme.',
    mitreMapping: 'MITRE ATT&CK: M1037 (Filter Network Traffic)',
    active: true,
    eventsMitigated: 512,
    severity: 'Critical',
    audioFeedback: 'Otonom savunma motoru en yüksek teyakkuz seviyesinde.',
  },
  // 6. Kontrol Paneli
  {
    id: 'tool-6',
    num: 6,
    name: 'Gelişmiş Kontrol Paneli & İzin Merkezi',
    codeName: 'RBAC_SECURITY_GOVERNANCE',
    category: 'soar',
    description: 'Tüm modüllerin hassas yapılandırmasını sağlayan, kullanıcı onaylı izin kontrol merkezi.',
    technicalCapability: 'Sıfır Güven (Zero Trust) tabanlı rol yetkilendirme ve denetim kayıt zinciri.',
    mitreMapping: 'MITRE ATT&CK: M1026 (Privileged Account Management)',
    active: true,
    eventsMitigated: 18,
    severity: 'Defense',
    audioFeedback: 'Güvenlik ayarları ve izin matrisi doğrulandı.',
  },
  // 7. Sürekli Akış ve Davranış Analizi
  {
    id: 'tool-7',
    num: 7,
    name: 'Sürekli Akış & Davranış Analizi (SIEM/UEBA)',
    codeName: 'SIEM_UEBA_CORRELATION',
    category: 'soar',
    description: 'Kullanıcı ve varlık davranışlarını yapay zeka ile izleyen, anormal aktiviteleri saptayan proaktif motor.',
    technicalCapability: 'Elastic/Wazuh tabanlı gerçek zamanlı log korelasyonu ve kullanıcı anomalisi tespiti.',
    mitreMapping: 'MITRE ATT&CK: T1078 (Valid Accounts Abuse)',
    active: true,
    eventsMitigated: 780,
    severity: 'High',
    audioFeedback: 'SIEM ve UEBA davranış korelasyonu devrede.',
  },
  // 8. EDR/XDR
  {
    id: 'tool-8',
    num: 8,
    name: 'Uç Nokta Tespit ve Müdahale (EDR/XDR)',
    codeName: 'XDR_KERNEL_HOOK_EBPF',
    category: 'endpoint',
    description: 'Cihazlardaki şüpheli süreçleri takip edip, tehditleri kaynağında durduran ve karantinaya alan sistem.',
    technicalCapability: 'Linux eBPF kancaları ve Windows Sysmon ile çekirdek seviyesinde proses denetimi.',
    mitreMapping: 'MITRE ATT&CK: T1059 (Command and Scripting Interpreter)',
    active: true,
    eventsMitigated: 215,
    severity: 'Critical',
    audioFeedback: 'EDR uç nokta kalkanı aktif. Çekirdek koruması devrede.',
  },
  // 9. SOAR
  {
    id: 'tool-9',
    num: 9,
    name: 'Otomatik Olay Müdahale (SOAR)',
    codeName: 'SOAR_PLAYBOOK_ENGINE',
    category: 'soar',
    description: 'Tespit edilen saldırılara önceden tanımlanmış senaryolarla anında ve otomatik yanıt veren mekanizma.',
    technicalCapability: 'TheHive ve Shuffle entegrasyonuyla 500ms altında otonom olay kapatma ve karantina.',
    mitreMapping: 'MITRE ATT&CK: M1031 (Network Intrusion Prevention)',
    active: true,
    eventsMitigated: 620,
    severity: 'Critical',
    audioFeedback: 'SOAR olay müdahale senaryoları çalıştırılmaya hazır.',
  },
  // 10. Zafiyet Yönetimi ve Yama Otomasyonu
  {
    id: 'tool-10',
    num: 10,
    name: 'Zafiyet Yönetimi ve Yama Otomasyonu',
    codeName: 'VULN_AUTO_PATCH_SYSTEM',
    category: 'endpoint',
    description: 'Sistem açıklarını sürekli tarayan ve kritik güvenlik yamalarını otomatik olarak uygulayan yapı.',
    technicalCapability: 'CVE veritabanı eşleştirmesi ile zafiyetli kütüphaneleri anında güvenli sürüme yükseltme.',
    mitreMapping: 'MITRE ATT&CK: M1051 (Update Software)',
    active: true,
    eventsMitigated: 94,
    severity: 'High',
    audioFeedback: 'Yama otomasyonu ve zafiyet güncelleme servisi aktif.',
  },
  // 11. TSCM
  {
    id: 'tool-11',
    num: 11,
    name: 'Teknik Gözetim Karşı Tedbirleri (TSCM)',
    codeName: 'TSCM_BUG_SWEEP_DETECTOR',
    category: 'signal',
    description: 'Ortamdaki gizli dinleme cihazlarını, kameraları ve aktif RF vericileri nötralize eden tarama protokolü.',
    technicalCapability: 'Non-Linear Junction Detector (NLJD) ve optik lens yansıması analizi simülasyonu.',
    mitreMapping: 'MITRE ATT&CK: T1125 (Video Capture & Physical Surveillance)',
    active: true,
    eventsMitigated: 12,
    severity: 'High',
    audioFeedback: 'TSCM böcek ve gizli kamera tarama protokolü tamamlandı.',
  },
  // 12. Uçtan Uca Kriptolama & PQC
  {
    id: 'tool-12',
    num: 12,
    name: 'Uçtan Uca Kriptolama & PQC (NIST ML-KEM/DSA)',
    codeName: 'POST_QUANTUM_CRYPTO_VAULT',
    category: 'crypto',
    description: 'Mesajlaşma ve veri depolamada, sağlayıcıların dahi erişemediği kuantum dirençli kafes şifrelemesi.',
    technicalCapability: 'FIPS 203 ML-KEM (Kyber-768) + ECC Curve25519 hibrit anahtar değişimi ve AES-256-GCM.',
    mitreMapping: 'MITRE ATT&CK: M1041 (Encrypt Sensitive Information)',
    active: true,
    eventsMitigated: 1450,
    severity: 'Critical',
    audioFeedback: 'Kuantum dirençli ML-KEM şifreleme kasası devrede.',
  },
  // 13. Donanım Tabanlı Güvenlik & TEE/SE
  {
    id: 'tool-13',
    num: 13,
    name: 'Donanım Güvenlik & TEE / Secure Enclave',
    codeName: 'HARDWARE_ENCLAVE_ISOLATION',
    category: 'endpoint',
    description: 'Mikrofon, kamera ve sensörlerin donanım tabanlı yalıtımı; özel anahtarların HSM çipinde saklanması.',
    technicalCapability: 'ARM TrustZone / Apple Secure Enclave çipinde izole biyometrik ve anahtar işleme.',
    mitreMapping: 'MITRE ATT&CK: M1043 (Credential Protection - Hardware)',
    active: true,
    eventsMitigated: 830,
    severity: 'Critical',
    audioFeedback: 'Donanım güvenlik modülü ve TEE kasası kilitlendi.',
  },
  // 14. Ağ Maskeleme & Taktiksel Sinyal Gizleme
  {
    id: 'tool-14',
    num: 14,
    name: 'Ağ Maskeleme & Taktiksel Sinyal Gizleme',
    codeName: 'ONION_STEALTH_TUNNELING',
    category: 'network',
    description: 'Çok katmanlı VPN ve Tor tünelleme ile IP gizleme, sentetik trafik üreterek sinyal analizini yanıltma.',
    technicalCapability: 'WireGuard Multi-hop + obfs4 karıştırma ile DPI filtrelerini aşan şifreli tünel.',
    mitreMapping: 'MITRE ATT&CK: T1090 (Proxy: Multi-hop)',
    active: true,
    eventsMitigated: 410,
    severity: 'High',
    audioFeedback: 'Taktiksel tünelleme ve ağ maskeleme aktif.',
  },
  // 15. Dijital Ayak İzi Temizleme
  {
    id: 'tool-15',
    num: 15,
    name: 'Dijital Ayak İzi Temizleme & Sızıntı Savunması',
    codeName: 'FOOTPRINT_SANITIZER_PURGE',
    category: 'osint',
    description: 'Sosyal medya, halka açık veritabanları ve dark webdeki kişisel verilerin sürekli taranıp silinmesi.',
    technicalCapability: 'Dezenformasyon kampanyalarına karşı kimlik doğrulama ve veri sızıntı alarm sistemi.',
    mitreMapping: 'MITRE ATT&CK: T1589 (Gather Victim Identity Information)',
    active: true,
    eventsMitigated: 128,
    severity: 'Defense',
    audioFeedback: 'Dijital ayak izi temizlendi. Veri sızıntı taraması tamam.',
  },
  // 16. Sızma ve İstismar Kalkanı
  {
    id: 'tool-16',
    num: 16,
    name: 'Zafiyet İstismar Kalkanı (Exploit Guard)',
    codeName: 'EXPLOIT_PAYLOAD_NEUTRALIZER',
    category: 'endpoint',
    description: 'Metasploit, Core Impact gibi araçlarla denenen Buffer Overflow ve ROP zincirlerini engelleyen kalkan.',
    technicalCapability: 'ASLR, DEP/NX ve Control Flow Guard (CFG) zorlaması ile bellek taşması zafiyetlerinin engellenmesi.',
    mitreMapping: 'MITRE ATT&CK: T1203 (Exploitation for Client Execution)',
    active: true,
    eventsMitigated: 76,
    severity: 'Critical',
    audioFeedback: 'Bellek taşması ve ROP zincir istismar kalkanı aktif.',
  },
  // 17. Parola Kırma ve Kimlik Avı Koruması
  {
    id: 'tool-17',
    num: 17,
    name: 'Parola Güvenliği & Kimlik Avı Kalkanı',
    codeName: 'CREDENTIAL_VAULT_SHIELD',
    category: 'crypto',
    description: 'Hashcat ve Rainbow Table ataklarına karşı Argon2id hashing; Evilginx2 tipi oltalama tespiti.',
    technicalCapability: 'FIDO2 / WebAuthn donanım anahtarları ile MITM kimlik avı saldırılarının matematiksel imhası.',
    mitreMapping: 'MITRE ATT&CK: T1110 (Brute Force / Password Guessing)',
    active: true,
    eventsMitigated: 890,
    severity: 'High',
    audioFeedback: 'Kimlik avı ve parola kırma kalkanı devrede.',
  },
  // 18. Aktif Gözetim ve Sinyal İzleme
  {
    id: 'tool-18',
    num: 18,
    name: 'Sahte Baz İstasyonu Kalkanı (IMSI Guard)',
    codeName: 'IMSI_CATCHER_DETECTOR',
    category: 'signal',
    description: 'Stingray ve sahte hücresel kulelerin sinyal manipülasyonunu ve 2G düşürme (downgrade) ataklarını saptar.',
    technicalCapability: 'Baz istasyonu hücre kimliği (Cell-ID) ve sinyal gücü anomalisi telemetri doğrulaması.',
    mitreMapping: 'MITRE ATT&CK: T1430 (Location Tracking - Cell Tower Spoof)',
    active: true,
    eventsMitigated: 9,
    severity: 'Critical',
    audioFeedback: 'IMSI Catcher ve sahte hücresel kule algılayıcı aktif.',
  },
  // 19. OSINT ve Dijital İz Sürme
  {
    id: 'tool-19',
    num: 19,
    name: 'Tehdit Haritalama & Shodan / SpiderFoot Entegrasyonu',
    codeName: 'THREAT_SURFACE_MAPPER',
    category: 'osint',
    description: 'Açık portları, yanlış yapılandırılmış servisleri ve sızdırılmış kimlik bilgilerini haritalayan modül.',
    technicalCapability: 'Maltego tarzı grafik bağlantı analizi ile dış tehdit aktörlerinin hedef ilişkilendirmesi.',
    mitreMapping: 'MITRE ATT&CK: T1592 (Gather Victim Host Information)',
    active: true,
    eventsMitigated: 67,
    severity: 'Defense',
    audioFeedback: 'Saldırı yüzeyi ve tehdit ilişkilendirme haritası güncel.',
  },
  // 20. Uzaktan Erişim ve Komuta (C2) Kalkanı
  {
    id: 'tool-20',
    num: 20,
    name: 'C2 Beacon & RAT Avcısı (Cobalt Strike Trap)',
    codeName: 'C2_BEACON_HUNTER',
    category: 'apt',
    description: 'Cobalt Strike, Sliver, AsyncRAT gibi C2 çerçevelerinin tersine kabuk (Reverse Shell) tünellerini avlar.',
    technicalCapability: 'Periyodik sinyal (jitter) analizi ve TLS sertifika anomalileriyle gizli C2 tespiti.',
    mitreMapping: 'MITRE ATT&CK: T1071 (Application Layer Protocol: C2)',
    active: true,
    eventsMitigated: 142,
    severity: 'Critical',
    audioFeedback: 'C2 Beacon ve komuta merkezi tünel avcısı aktif.',
  },
  // 21. Ağ Sızma ve Trafik Zehirlenmesi Kalkanı
  {
    id: 'tool-21',
    num: 21,
    name: 'Ağ Zehirlenmesi Kalkanı (Anti-Responder / ARP)',
    codeName: 'ANTI_POISONING_SHIELD',
    category: 'network',
    description: 'Responder, Bettercap ve Ettercap ile yapılan LLMNR/NBT-NS ve ARP spoofing saldırılarını engeller.',
    technicalCapability: 'Dinamik ARP Teftişi (DAI) ve statik ARP eşleştirmesi ile Man-in-the-Middle saldırı blokajı.',
    mitreMapping: 'MITRE ATT&CK: T1557 (Adversary-in-the-Middle)',
    active: true,
    eventsMitigated: 310,
    severity: 'High',
    audioFeedback: 'ARP zehirlenmesi ve ortadaki adam saldırı kalkanı devrede.',
  },
  // 22. Karantina ve Eylem
  {
    id: 'tool-22',
    num: 22,
    name: 'Dinamik Karantina & Bellek Döküm İzolasyonu',
    codeName: 'MEMORY_DUMP_QUARANTINE',
    category: 'endpoint',
    description: 'Zararlı aktivite anında prosesi donduran, adli bilişim bellek dökümü alan ve sistemi izole eden motor.',
    technicalCapability: 'Volatile bellek imajı oluşturma, SHA-256 mühürleme ve ağ kartı acil bağlantı kesme.',
    mitreMapping: 'MITRE ATT&CK: T1003 (OS Credential Dumping)',
    active: true,
    eventsMitigated: 88,
    severity: 'Critical',
    audioFeedback: 'Dinamik karantina ve adli bellek kütüğü motoru hazır.',
  },
  // 23. İleri Seviye Zararlı Yazılım Kalkanı
  {
    id: 'tool-23',
    num: 23,
    name: 'İleri Seviye Casus Yazılım Kalkanı (Anti-Pegasus)',
    codeName: 'ZERO_CLICK_SPYWARE_SHIELD',
    category: 'apt',
    description: 'Pegasus, Duqu ve Stuxnet türevi kernel seviyesi rootkit ve zero-click saldırı vektörlerine karşı koruma.',
    technicalCapability: 'Amnesty MVT (Mobile Verification Toolkit) kuralları ile şüpheli dosya sistemi değişimi tespiti.',
    mitreMapping: 'MITRE ATT&CK: T1014 (Rootkit)',
    active: true,
    eventsMitigated: 14,
    severity: 'Critical',
    audioFeedback: 'İleri seviye casus yazılım ve zero-click kalkanı devrede.',
  },
  // 24. Tedarik Zinciri ve Donanım
  {
    id: 'tool-24',
    num: 24,
    name: 'Donanım & BadUSB Kalkanı (Rubber Ducky Guard)',
    codeName: 'BADUSB_HARDWARE_FILTER',
    category: 'endpoint',
    description: 'USB klavye öykünümü yapan Rubber Ducky, LAN Turtle ve fiziksel keylogger donanımlarını engeller.',
    technicalCapability: 'USB HID cihaz sınıfı hız ve VID/PID doğrulama motoru; yetkisiz aygıtların derhal engellenmesi.',
    mitreMapping: 'MITRE ATT&CK: T1200 (Privileged Hardware Addition)',
    active: true,
    eventsMitigated: 5,
    severity: 'High',
    audioFeedback: 'BadUSB ve donanım enjeksiyon filtresi aktif.',
  },
  // 25. Sinyal ve Uydu İstihbaratı
  {
    id: 'tool-25',
    num: 25,
    name: 'Uydu & Geniş Bant Trafik Kesme Kalkanı',
    codeName: 'SATELLITE_BGP_GUARD',
    category: 'signal',
    description: 'Uydu internet omurgasında ve BGP yönlendirme tablolarında trafik kaçırma (Hijack) girişimlerini denetler.',
    technicalCapability: 'RPKI (Resource Public Key Infrastructure) doğrulaması ve DNSSEC ile küresel rota güvenliği.',
    mitreMapping: 'MITRE ATT&CK: T1584 (Compromise Infrastructure)',
    active: true,
    eventsMitigated: 23,
    severity: 'High',
    audioFeedback: 'Uydu ve BGP rota kaçırma denetçisi devrede.',
  },
  // 26. Kitle İmha ve Biyometrik İzleme
  {
    id: 'tool-26',
    num: 26,
    name: 'Biyometrik İzleme & Yüz Tanıma Koruması',
    codeName: 'BIOMETRIC_STEALTH_SHIELD',
    category: 'osint',
    description: 'Kamusal yüz tanıma ve termal izleme ağlarına karşı sentetik optik ve dijital gürültü maskelemesi.',
    technicalCapability: 'Görsel veri filtreleme ve biyometrik öznitelik havuzlarında kimlik eşleştirmeyi bozan algoritmalar.',
    mitreMapping: 'MITRE ATT&CK: T1113 (Screen & Biometric Capture)',
    active: true,
    eventsMitigated: 38,
    severity: 'Defense',
    audioFeedback: 'Biyometrik gizlilik ve optik maskeleme devrede.',
  },
  // 27. Psikolojik Operasyonlar ve Dezenformasyon
  {
    id: 'tool-27',
    num: 27,
    name: 'Dezenformasyon & Deepfake Doğrulama Motoru',
    codeName: 'DEEPFAKE_SYNTHETIC_VERIFIER',
    category: 'osint',
    description: 'Bot ağları ve yapay zeka tarafından üretilen sahte ses/görüntü içeriklerini doğrulayan analiz sistemi.',
    technicalCapability: 'Frekans spektrumu, dudak senkronizasyonu ve artefakt analizi ile %98.4 deepfake tespiti.',
    mitreMapping: 'MITRE ATT&CK: T1583 (Acquire Infrastructure for Disinformation)',
    active: true,
    eventsMitigated: 110,
    severity: 'Defense',
    audioFeedback: 'Deepfake ve dezenformasyon doğrulama motoru güncel.',
  },
  // 28. Siber Fiziksel Tahribat (SCADA/ICS) Koruması
  {
    id: 'tool-28',
    num: 28,
    name: 'Kritik Altyapı & SCADA/ICS Kalkanı',
    codeName: 'SCADA_AIRGAP_ENFORCER',
    category: 'apt',
    description: 'Enerji, su ve endüstriyel kontrol sistemlerini hedefleyen sabotaj yazılımlarına karşı fiziksel izolasyon.',
    technicalCapability: 'Modbus, DNP3 ve S7comm endüstriyel protokollerinin anomali tespiti ve air-gap zorlaması.',
    mitreMapping: 'MITRE ATT&CK: T0855 (Unauthorized Command Message in ICS)',
    active: true,
    eventsMitigated: 19,
    severity: 'Critical',
    audioFeedback: 'SCADA ve endüstriyel altyapı koruma kalkanı aktif.',
  },
];

interface TacticalInventoryHubProps {
  onAskAssistant: (question: string) => void;
}

export const TacticalInventoryHub: React.FC<TacticalInventoryHubProps> = ({ onAskAssistant }) => {
  const [tools, setTools] = useState<TacticalToolItem[]>(INITIAL_TACTICAL_TOOLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [inspectingTool, setInspectingTool] = useState<TacticalToolItem | null>(null);

  const categories = [
    { id: 'all', label: 'Tüm Araçlar (28)', icon: Sliders },
    { id: 'network', label: 'Ağ & Trafik (4)', icon: Wifi },
    { id: 'endpoint', label: 'Uç Nokta & Çekirdek (6)', icon: Cpu },
    { id: 'crypto', label: 'Kripto & PQC (3)', icon: Key },
    { id: 'osint', label: 'OSINT & İstihbarat (5)', icon: Eye },
    { id: 'signal', label: 'Sinyal & TSCM (4)', icon: Radio },
    { id: 'apt', label: 'İleri Tehdit / APT (4)', icon: AlertTriangle },
    { id: 'soar', label: 'Otonom SOAR (3)', icon: Zap },
  ];

  const handleToggleTool = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playTacticalSound('click');

    setTools((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.active;
          const msg = nextState ? `${t.name} modülü aktif edildi.` : `${t.name} modülü devre dışı bırakıldı.`;
          speakUltraRealistic(msg);
          return { ...t, active: nextState };
        }
        return t;
      })
    );
  };

  const handleToggleAll = (activate: boolean) => {
    playTacticalSound('command_exec');
    setTools((prev) => prev.map((t) => ({ ...t, active: activate })));
    speakUltraRealistic(
      activate
        ? 'Tüm 28 taktiksel savunma aracı tam kapasiteyle aktifleştirildi.'
        : 'Tüm araçlar pasif izleme moduna alındı.'
    );
  };

  const filteredTools = tools.filter((tool) => {
    const matchSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.codeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.mitreMapping.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && tool.active) ||
      (selectedStatus === 'inactive' && !tool.active);

    return matchSearch && matchCategory && matchStatus;
  });

  const activeCount = tools.filter((t) => t.active).length;
  const totalEvents = tools.reduce((acc, t) => acc + t.eventsMitigated, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020611] text-white overflow-hidden p-4 sm:p-6 select-none">
      {/* Top Banner & Stats */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 border-b border-blue-900/40 gap-4 mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-600 flex items-center justify-center border border-blue-400/50 shadow-lg shadow-blue-950">
              <Sliders className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Taktik Savunma &amp; Tehdit Envanteri</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  28 ÇEKİRDEK ARAÇ VE PROTOKOL
                </span>
              </h2>
              <p className="text-xs text-blue-300/80 mt-0.5">
                Tanımlanan tüm siber güvenlik, zafiyet kalkanı, OSINT ve APT koruma modüllerinin interaktif denetim merkezi.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Stats & Toggles */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-black border border-blue-900/50 text-[11px] font-mono">
            <span className="text-gray-400">
              Aktif: <strong className="text-emerald-400">{activeCount}/28</strong>
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">
              Engellenen: <strong className="text-blue-300">{totalEvents.toLocaleString()}</strong>
            </span>
          </div>

          <button
            onClick={() => handleToggleAll(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-sm"
          >
            Tümünü Aç
          </button>

          <button
            onClick={() => handleToggleAll(false)}
            className="px-3 py-1.5 rounded-xl bg-black hover:bg-gray-900 text-gray-400 hover:text-white border border-gray-800 text-xs font-bold transition"
          >
            Tümünü Kapat
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4 shrink-0">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="28 araç arasında isim, MITRE kodu veya yetenek ara..."
            className="w-full pl-9 pr-3 py-2 bg-black/80 border border-blue-900/60 rounded-xl text-xs text-white placeholder:text-gray-500 font-mono focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-black/80 rounded-xl border border-blue-900/50 text-[11px] font-mono shrink-0">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              selectedStatus === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setSelectedStatus('active')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              selectedStatus === 'active' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Aktif ({activeCount})
          </button>
          <button
            onClick={() => setSelectedStatus('inactive')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              selectedStatus === 'inactive' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Pasif ({28 - activeCount})
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar shrink-0 text-xs font-mono">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSel = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border whitespace-nowrap transition ${
                isSel
                  ? 'bg-blue-600/30 text-blue-200 border-blue-400 shadow-sm'
                  : 'bg-black/60 text-gray-400 border-blue-900/40 hover:border-blue-700 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-blue-400" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 28 Tool Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-6">
          {filteredTools.map((tool) => {
            const isCrit = tool.severity === 'Critical';
            const isHigh = tool.severity === 'High';

            return (
              <div
                key={tool.id}
                onClick={() => setInspectingTool(tool)}
                className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group backdrop-blur-md ${
                  tool.active
                    ? 'bg-[#040a1b]/90 border-blue-800/80 hover:border-blue-500 shadow-lg'
                    : 'bg-black/60 border-gray-900 hover:border-gray-700 opacity-60'
                }`}
              >
                <div>
                  {/* Top line with tool number and toggle switch */}
                  <div className="flex items-center justify-between pb-2 border-b border-blue-900/30 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-[10px] font-mono font-bold text-blue-300">
                        {tool.num}
                      </span>
                      <span className="text-[9px] font-mono text-gray-400 truncate max-w-[130px]">
                        {tool.codeName}
                      </span>
                    </div>

                    {/* Interactive Toggle Switch */}
                    <button
                      onClick={(e) => handleToggleTool(tool.id, e)}
                      title={tool.active ? 'Modülü Kapat' : 'Modülü Aç'}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        tool.active ? 'bg-blue-600 shadow-[0_0_8px_#2563eb]' : 'bg-gray-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          tool.active ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-extrabold text-xs text-white leading-snug group-hover:text-blue-300 transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                {/* Card Footer with MITRE tag and events */}
                <div className="mt-3 pt-2 border-t border-blue-900/30 flex items-center justify-between text-[9px] font-mono">
                  <span
                    className={`px-1.5 py-0.5 rounded border ${
                      isCrit
                        ? 'bg-red-950/80 text-red-300 border-red-800'
                        : isHigh
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                        : 'bg-blue-950/80 text-blue-300 border-blue-800'
                    }`}
                  >
                    {tool.severity}
                  </span>

                  <span className="text-gray-400">
                    Olay: <strong className="text-white">{tool.eventsMitigated}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspect Tool Detail Modal */}
      {inspectingTool && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#030814] border border-blue-500/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-blue-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-700 flex items-center justify-center text-xs font-mono font-bold text-blue-300">
                  #{inspectingTool.num}
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">{inspectingTool.name}</h3>
                  <span className="text-[10px] font-mono text-blue-400">{inspectingTool.codeName}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectingTool(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black border border-blue-900/40 space-y-1.5">
                <span className="text-gray-400 block text-[10px]">Açıklama ve Koruma Prensibi:</span>
                <p className="text-gray-200 leading-relaxed text-xs">{inspectingTool.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-black border border-blue-900/40 space-y-1.5">
                <span className="text-gray-400 block text-[10px]">Teknik Altyapı ve Kabiliyet:</span>
                <p className="text-blue-200 leading-relaxed text-xs font-mono">{inspectingTool.technicalCapability}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-black border border-blue-900/40">
                  <span className="text-gray-400 block text-[9px]">MITRE ATT&amp;CK Eşlemesi:</span>
                  <span className="text-emerald-400 font-bold text-[10px]">{inspectingTool.mitreMapping}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black border border-blue-900/40">
                  <span className="text-gray-400 block text-[9px]">Engellenen Olay Sayısı:</span>
                  <span className="text-white font-bold text-[10px]">{inspectingTool.eventsMitigated.toLocaleString()} Olay</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  handleToggleTool(inspectingTool.id);
                  setInspectingTool((prev) => (prev ? { ...prev, active: !prev.active } : null));
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition text-center shadow-lg ${
                  inspectingTool.active
                    ? 'bg-red-600/80 hover:bg-red-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {inspectingTool.active ? 'Modülü Devre Dışı Bırak' : 'Modülü Aktifleştir'}
              </button>

              <button
                onClick={() => {
                  speakUltraRealistic(inspectingTool.audioFeedback);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/60 font-bold text-xs transition flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4" />
                <span>Seslendir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
