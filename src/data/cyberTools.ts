export interface CyberTool {
  id: string;
  name: string;
  section: string; // e.g. "Bölüm 2 — Otonom Sızma Testi ve Saldırı Araçları"
  category: 'pentest' | 'spyware' | 'mobile' | 'agent' | 'osint' | 'local_llm' | 'lab';
  categoryTitle: string;
  description: string;
  features: string[];
  license: string;
  url: string;
  requirements?: string;
  quickCommands?: string[];
  envConfig?: Record<string, string>;
  dockerCompose?: string;
  statusBadge: 'active' | 'verified' | 'commercial' | 'experimental';
}

export const CYBER_TOOLS_CATALOG: CyberTool[] = [
  // BÖLÜM 2 — OTONOM SIZMA TESTİ VE SALDIRI ARAÇLARI
  {
    id: 'pentagi',
    name: 'PentAGI',
    section: 'Bölüm 2 — Otonom Sızma Testi ve Saldırı Araçları',
    category: 'pentest',
    categoryTitle: 'Otonom Kırmızı Takım Ajanı',
    description: '20\'den fazla güvenlik aracını (nmap, metasploit, sqlmap vb.) tam otonom yöneten kırmızı takım yapay zeka ajanı.',
    features: [
      'Keşif, zafiyet analizi, exploit geliştirme ve raporlama süreçlerini uçtan uca yönetir.',
      'Canlı Azure VM testlerinde ve 100 saatlik kesintisiz sızma testi etkinliklerinde kullanılmıştır.',
      'Docker konteynerlerinde izole çalışır; OpenAI, Anthropic, Gemini ve Ollama (yerel modeller) ile uyumludur.',
      'Yanlış pozitif oranı %10-30 arasındadır, insan doğrulaması ile tam kontrol sağlar.'
    ],
    license: 'MIT (Tamamen Ücretsiz)',
    url: 'https://github.com/vxcontrol/pentagi',
    requirements: 'Linux/macOS/Windows; Min 2 vCPU (4+ önerilir); Min 4GB RAM (8GB+ önerilir); 20GB disk; Docker & Docker Compose',
    quickCommands: [
      'mkdir pentagi && cd pentagi',
      'curl -o .env https://raw.githubusercontent.com/vxcontrol/pentagi/master/.env.example',
      'curl -o docker-compose.yml https://raw.githubusercontent.com/vxcontrol/pentagi/master/docker-compose.yml',
      'docker-compose up -d',
      '# Erişim: http://localhost:8080 (admin@pentagi.com / admin)'
    ],
    envConfig: {
      'OLLAMA_SERVER_URL': 'http://localhost:11434',
      'OLLAMA_SERVER_MODEL': 'llama3.1:8b-instruct-q8_0',
      'OLLAMA_SERVER_PULL_MODELS_ENABLED': 'true',
      'OLLAMA_SERVER_LOAD_MODELS_ENABLED': 'true'
    },
    statusBadge: 'verified'
  },
  {
    id: 'robo',
    name: 'Robo (Ignitee Now)',
    section: 'Bölüm 2 — Otonom Sızma Testi ve Saldırı Araçları',
    category: 'pentest',
    categoryTitle: 'Yerel Sesli Güvenlik Ajanı',
    description: 'Bilgisayarınızda yerel çalışan, sesli komut ("Hey Roh Boh") alabilen otonom yapay zeka ajanı.',
    features: [
      'Dosya okuyabilir, kod yazıp çalıştırabilir, web\'de gezinebilir.',
      'Keşif, tehdit analizi, binary tersine mühendislik ve exploit araştırması yapar.',
      'Terminal, masaüstü, web paneli ve Telegram/Discord/Slack üzerinden çalışır.',
      'Sesli komutları cihaz üzerinde işler, veriler buluta gönderilmez.'
    ],
    license: 'MIT (Ücretsiz)',
    url: 'https://github.com/igniteenow/robo',
    quickCommands: [
      'git clone https://github.com/igniteenow/robo.git',
      'cd robo',
      'bash install-robo.sh',
      'sudo apt install libportaudio2',
      'robo model',
      'robo'
    ],
    statusBadge: 'verified'
  },
  {
    id: 'darkmoon',
    name: 'DarkMoon (ASC-IT)',
    section: 'Bölüm 2 — Otonom Sızma Testi ve Saldırı Araçları',
    category: 'pentest',
    categoryTitle: 'Geniş Kapsamlı Pentest Motoru',
    description: 'Web, API, Active Directory, Kubernetes, bulut ve iç ağlar için 50+ uzman ajan ve saldırı aracı.',
    features: [
      '50\'den fazla uzman ajan ve 50\'den fazla saldırı aracı içerir.',
      'LLM\'in gerçek IP, hostname veya kimlik bilgilerini görmesini engelleyen gizlilik ağ geçidi.',
      'Active Directory ve Kubernetes iç sızma senaryolarına özel kütüphaneler.'
    ],
    license: 'GPLv3 (Ücretsiz)',
    url: 'https://github.com/ASCIT31/Dark-Moon',
    quickCommands: [
      'git clone https://github.com/ASCIT31/Dark-Moon.git',
      'cd Dark-Moon',
      'docker-compose up -d'
    ],
    statusBadge: 'verified'
  },
  {
    id: 'arcanum-core',
    name: 'Arcanum Core',
    section: 'Bölüm 2 — Otonom Sızma Testi ve Saldırı Araçları',
    category: 'pentest',
    categoryTitle: 'Otonom Keşif ve Pentest',
    description: 'Kendi kendine barındırılan yerel LLM (Ollama) ve izole Docker/Kali ortamında 40+ güvenlik aracını çalıştırır.',
    features: [
      '40\'tan fazla sızma testi aracını entegre eder.',
      'Ollama üzerinden tamamen yerel ve özel altyapıda sıfır maliyetle çalışır.',
      'İzole Kali Docker konteyner mimarisi.'
    ],
    license: 'Açık Kaynak',
    url: 'https://github.com/valinorintelligence/arcanum-core',
    quickCommands: [
      'git clone https://github.com/valinorintelligence/arcanum-core.git',
      'cd arcanum-core',
      'docker build -t arcanum .',
      'docker run -it --rm arcanum'
    ],
    statusBadge: 'verified'
  },
  {
    id: 'llmtary',
    name: 'LLMtary',
    section: 'Bölüm 2 — Otonom Sızma Testi ve Saldırı Araçları',
    category: 'pentest',
    categoryTitle: 'LLM Güdümlü Keşif & Exploit Doğrulama',
    description: 'İç ve dış hedefler için zafiyet keşfi, analizi ve exploit doğrulamasını yerel veya bulut LLM ile yürütür.',
    features: [
      'Yerel (Ollama, LM Studio) ve bulut modelleriyle çalışır.',
      'Linux, macOS ve Windows üzerinde çapraz platform desteği.',
      'Otomatik kanıt (PoC) ve zafiyet raporlama.'
    ],
    license: 'Açık Kaynak',
    url: 'https://github.com/chetstriker/LLMtary',
    quickCommands: [
      'git clone https://github.com/chetstriker/LLMtary.git',
      'cd LLMtary',
      'pip install -r requirements.txt',
      'python run.py --target 127.0.0.1'
    ],
    statusBadge: 'verified'
  },
  {
    id: 'oihk',
    name: 'OIHK-pentesting',
    section: 'Bölüm 2 — Otonom Sızma Testi ve Saldırı Araçları',
    category: 'pentest',
    categoryTitle: 'Çok Ajanlı Pentest Motoru',
    description: 'Yetkili güvenlik değerlendirmeleri için tasarlanmış, değiştirilemez kanıt ve doğrulama geçidi olan çok ajanlı motor.',
    features: [
      'Çoklu ajan işbirliği ve görev paylaşımı.',
      'Yerel çıkarım (local inference) desteği.',
      'Değiştirilemez kanıt doğrulama mekanizması.'
    ],
    license: 'Açık Kaynak',
    url: 'https://github.com/Broskigx/Oihk-pentesting',
    statusBadge: 'verified'
  },
  {
    id: 'assail-ares',
    name: 'Assail Ares',
    section: 'Bölüm 2 — Otonom Sızma Testi ve Saldırı Araçları',
    category: 'pentest',
    categoryTitle: 'Otonom Kırmızı Takım Platformu',
    description: 'API, mobil ve web uygulamalarındaki zafiyetleri keşfetmek ve zincirlemek için Sidewinder harness mimarisi.',
    features: [
      'Sidewinder harness ile kendi işini denetleyip hatalarını düzeltebilir.',
      'API ve mobil uçnokta zafiyet zincirleme.',
      'Gelişmiş exploit kurgusu.'
    ],
    license: 'Ticari / Referans',
    url: 'https://ares.assailai.com',
    statusBadge: 'commercial'
  },

  // BÖLÜM 3 — CASUS YAZILIM VE TAKİP TESPİTİ
  {
    id: 'aegis',
    name: 'AntiPegasus / Aegis',
    section: 'Bölüm 3 — Casus Yazılım ve Takip Tespiti',
    category: 'spyware',
    categoryTitle: 'Gelişmiş Casus Yazılım Kalkanı',
    description: 'Pegasus ve benzeri casus yazılımları gerçek zamanlı tespit eden, önleyen ve karantinaya alan savunma sistemi.',
    features: [
      'Sistem çağrılarını, ağ trafiğini ve dosya değişikliklerini sürekli izler.',
      'Yapay zeka destekli anomali tespiti ile sıfır tıklamalı (zero-click) saldırıları engeller.',
      'Android, iOS, Windows ve macOS desteği; tespit edilen tehditleri otomatik karantinaya alır.'
    ],
    license: 'Apache 2.0 (Ücretsiz)',
    url: 'https://github.com/antiPegasus/Aegis',
    quickCommands: [
      'git clone https://github.com/antiPegasus/Aegis.git',
      'cd Aegis',
      'pip install -r requirements.txt',
      'python aegis_monitor.py --realtime'
    ],
    statusBadge: 'verified'
  },
  {
    id: 'vigil',
    name: 'VIGIL',
    section: 'Bölüm 3 — Casus Yazılım ve Takip Tespiti',
    category: 'spyware',
    categoryTitle: 'Fiziksel Takip Cihazı Tespiti',
    description: 'Android telefonunuzda çalışan, çevrenizde sizi gizlice takip eden AirTag, Tile, SmartTag gibi etiketleri bulan sistem.',
    features: [
      'Apple AirTag, Tile, Samsung Galaxy SmartTag, Google Find My Device etiketlerini tespit eder.',
      'Tamamen çevrimdışı çalışır; internet izni istemez.',
      'Zamansal birlikte hareket (temporal co-movement) analizi ile sizi takip eden yabancı etiketleri ayrıştırır.',
      'Kişisel veya aile cihazlarınızı güvenilir listeye ekler.'
    ],
    license: 'Açık Kaynak (Ücretsiz)',
    url: 'https://git.churchofmalware.org/leviathan/VIGIL',
    statusBadge: 'verified'
  },
  {
    id: 'scout',
    name: 'Scout (Tevora)',
    section: 'Bölüm 3 — Casus Yazılım ve Takip Tespiti',
    category: 'spyware',
    categoryTitle: 'Araç ve Kamera Takip Tespiti',
    description: 'Tesla kameralarını kullanarak gerçek zamanlı plaka tanıma ve fiziksel takip tespiti yapan sistem.',
    features: [
      'Plaka tanıma ve sizi izleyen araçları anında bildirme.',
      'Park halindeyken çevredeki kişilerin yaşam kalıplarını analiz etme.'
    ],
    license: 'Açık Kaynak',
    url: 'https://github.com/tevora-threat/scout',
    statusBadge: 'verified'
  },
  {
    id: 'warne',
    name: 'WARNE',
    section: 'Bölüm 3 — Casus Yazılım ve Takip Tespiti',
    category: 'spyware',
    categoryTitle: 'Stalkerware Adli Analiz Aracı',
    description: 'Cihazda iz bırakmadan takip yazılımlarını (stalkerware) tespit eden adli analiz sistemi.',
    features: [
      '30\'dan fazla casus takip uygulaması üzerinde test edilmiştir.',
      'İstismarcının kimlik bilgilerini, panel URL\'lerini ve çalınan veri kanıtlarını ortaya çıkarır.',
      'Concordia Üniversitesi araştırma altyapısı.'
    ],
    license: 'Akademik / Açık Proje',
    url: 'https://github.com',
    statusBadge: 'active'
  },

  // BÖLÜM 4 — TELEFON SESLİ KOMUT VE OTOMASYON
  {
    id: 'neuron',
    name: 'Neuron',
    section: 'Bölüm 4 — Telefon Sesli Komut ve Otomasyon',
    category: 'mobile',
    categoryTitle: 'Doğal Dil Telefon Ajanı',
    description: 'Android 8.0+ cihazlarda çalışan, internet gerektirmeyen cihaz içi Gemma modeli ile doğal dil telefon kontrolü.',
    features: [
      'Erişilebilirlik servisi ile "şu uygulamayı aç", "mesaj gönder" gibi komutları otonom yürütür.',
      'Tamamen cihaz üzerinde çalışan model ile internet bağlantısı gerekmez.',
      '"WhatsApp\'tan anneme 20 dakika gecikeceğimi söyle" gibi karmaşık doğal dil komutlarını çözer.'
    ],
    license: 'Açık Kaynak (Ücretsiz)',
    url: 'https://github.com/gokul-hastrophil/neuron',
    quickCommands: [
      '# GitHub Releases sayfasından APK indir',
      '# Bilinmeyen kaynaklar iznini ver',
      '# Erişilebilirlik servisini etkinleştir'
    ],
    statusBadge: 'verified'
  },
  {
    id: 'android-use',
    name: 'Android Use Agent',
    section: 'Bölüm 4 — Telefon Sesli Komut ve Otomasyon',
    category: 'mobile',
    categoryTitle: 'USB / ADB Otonom Telefon Kontrolü',
    description: 'Doğal dil komutlarıyla Android telefonunuzu USB hata ayıklama üzerinden dokunma ve kaydırmayla yönetir.',
    features: [
      'Söylediğiniz hedefi dokunma, yazma ve kaydırma hareketleriyle otonom olarak gerçekleştirir.',
      'Python 3.10+ ile çalışır.'
    ],
    license: 'Açık Kaynak (Ücretsiz)',
    url: 'https://github.com/languse-ai/android-use',
    quickCommands: [
      'git clone https://github.com/languse-ai/android-use.git',
      'cd android-use',
      'pip install -e .'
    ],
    statusBadge: 'verified'
  },
  {
    id: 'xphoneuse',
    name: 'XPhoneUse',
    section: 'Bölüm 4 — Telefon Sesli Komut ve Otomasyon',
    category: 'mobile',
    categoryTitle: 'AI Telefon Yansıtma & Kontrol',
    description: 'Telefonu bilgisayara yansıtarak AI ajanlarının telefonu "gözleri ve elleri" ile kontrol etmesini sağlar.',
    features: [
      'DeepSeek V4.1 gibi yerel modellerle sıfır API maliyetiyle tam otomasyon.',
      'Skill paketi mimarisi ile kolay entegrasyon.'
    ],
    license: 'Ücretsiz Skill',
    url: 'https://xphoneuse.com/static/skills/xphoneuse.zip',
    statusBadge: 'verified'
  },
  {
    id: 'clawnode',
    name: 'ClawNode',
    section: 'Bölüm 4 — Telefon Sesli Komut ve Otomasyon',
    category: 'mobile',
    categoryTitle: 'AI Uzaktan Kontrol Düğümü',
    description: 'Telefonunuzu OpenClaw Gateway ile uzaktan kontrol edilen güvenli bir AI düğümüne dönüştürür.',
    features: [
      '34\'ten fazla doğrulanmış uzaktan komut.',
      'Kamera, GPS, rehber ve IoT cihazlarını sesli komutlarla kontrol eder.',
      'Uçtan uca şifreli WebSocket bağlantısı.'
    ],
    license: 'Açık Kaynak',
    url: 'https://github.com/openclaw/openclaw/releases',
    statusBadge: 'verified'
  },

  // BÖLÜM 5 — DİJİTAL ASİSTAN VE OTONOM AJANLAR
  {
    id: 'openclaw',
    name: 'OpenClaw (Clawdbot)',
    section: 'Bölüm 5 — Dijital Asistan ve Otonom Ajanlar',
    category: 'agent',
    categoryTitle: 'Kişisel Yerel AI Asistanı',
    description: 'WhatsApp, Telegram, Discord, Slack ve iMessage\'ı yerel Ollama yapay zekasına bağlayan çok yönlü asistan.',
    features: [
      'Mesajlaşma uygulamalarına bağlanır, dosya düzenler, kod yazar, e-posta gönderir, takvim yönetir.',
      'Akıllı ev (IoT) cihazlarını kontrol eder.',
      'Ollama yerel API (api/chat) ile %100 yerel ve gizli çalışır.'
    ],
    license: 'Açık Kaynak',
    url: 'https://github.com/openclaw/openclaw',
    quickCommands: [
      'npm install -g openclaw',
      'openclaw onboard --provider ollama --url http://127.0.0.1:11434'
    ],
    statusBadge: 'verified'
  },
  {
    id: 'hermes-agent',
    name: 'Hermes Agent (Nous Research)',
    section: 'Bölüm 5 — Dijital Asistan ve Otonom Ajanlar',
    category: 'agent',
    categoryTitle: 'Kendini Geliştiren Otonom Ajan',
    description: 'Otomatik beceri oluşturan, oturumlar arası kalıcı hafızaya sahip, 70+ hazır becerili otonom ajan.',
    features: [
      '70\'ten fazla hazır beceri ile gelir.',
      'Telegram, Discord, Slack, WhatsApp, Signal bağlantısı.',
      'Paket kurar, kabuk komutları çalıştırır, API\'leri yönetir.'
    ],
    license: 'MIT (Ücretsiz)',
    url: 'https://github.com/NousResearch/hermes-agent',
    quickCommands: [
      'curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash',
      '# .env içine yerel Ollama ekleyin:',
      '# OPENAI_BASE_URL=http://localhost:11434/v1',
      '# OPENAI_API_KEY=ollama'
    ],
    statusBadge: 'verified'
  },

  // BÖLÜM 6 — TEHDİT İSTİHBARATI VE DİJİTAL İZ SÜRME
  {
    id: 'tracefinder',
    name: 'TraceFinder AI',
    section: 'Bölüm 6 — Tehdit İstihbaratı ve Dijital İz Sürme',
    category: 'osint',
    categoryTitle: 'Açık Kaynak Dijital İz Avcısı',
    description: 'İsim, görsel, kimlik bilgisi veya kullanıcı adından yola çıkarak hedefin tüm dijital ayak izlerini tespit eder.',
    features: [
      'Profiller, adresler, görseller, hesaplar ve bahsetmeleri bulur.',
      'Google, Bing, LinkedIn, Twitter/X, Instagram üzerinde derin tarama.',
      'Yapay zeka destekli korelasyon analizi.'
    ],
    license: 'Açık Kaynak / SaaS',
    url: 'https://github.com/Via4/tracefinder-ai',
    statusBadge: 'verified'
  },
  {
    id: 'anubisx',
    name: 'AnubisX Framework',
    section: 'Bölüm 6 — Tehdit İstihbaratı ve Dijital İz Sürme',
    category: 'osint',
    categoryTitle: 'Bilişsel İmza ve Stilometri Analizi',
    description: 'Yazım tarzı, davranış kalıpları ve dilsel sinyallerle anonim dijital kimlikleri gerçek kişilere atfeder.',
    features: [
      'Geçici IP ve donanım izleri yerine kalıcı bilişsel imzaları modeller.',
      'Stilometri, davranış analitiği ve makine öğrenimi.',
      'Bilimsel adli tıp ve tehdit atıf çerçevesi.'
    ],
    license: 'Bilimsel Metodoloji / Framework',
    url: 'https://anubisxframework.github.io',
    statusBadge: 'verified'
  },
  {
    id: 'prevyn',
    name: 'Prevyn AI (Group-IB)',
    section: 'Bölüm 6 — Tehdit İstihbaratı ve Dijital İz Sürme',
    category: 'osint',
    categoryTitle: 'Karanlık Web & Tehdit Aktörü Avcısı',
    description: '11 uzman AI ajanını koordine ederek saldırganı hazırlık aşamasında tespit eden önleyici sistem.',
    features: [
      'Saldırganın niyetini ve altyapısını saldırıdan önce sezer.',
      'Karanlık web izleme, kötü amaçlı yazılım analizi.',
      'Yönetilen XDR ve olay müdahale desteği.'
    ],
    license: 'Kurumsal Lisans',
    url: 'https://group-ib.com',
    statusBadge: 'commercial'
  },

  // BÖLÜM 7 & 8 — 100 SAATLİK CANLI TEST & OLLAMA YAPILANDIRMASI
  {
    id: 'ollama-local',
    name: 'Ollama Yerel Çıkarım Motoru',
    section: 'Bölüm 8 — Sıfır Maliyetli LLM Yapılandırması (Ollama)',
    category: 'local_llm',
    categoryTitle: 'Ücretsiz & Yerel Yapay Zeka',
    description: 'Tüm siber güvenlik araçlarını sıfır API ücretiyle, sınırsız ve kotasız çalıştırmak için yerel LLM motoru.',
    features: [
      'Tamamen çevrimdışı ve cihaz üzerinde çıkarım.',
      'Llama 3.1 8B, Qwen 2.5, Mistral, DeepSeek modellerini çalıştırır.',
      'OpenAI uyumlu yerel API (http://localhost:11434/v1).'
    ],
    license: 'MIT (Tamamen Ücretsiz)',
    url: 'https://ollama.com',
    quickCommands: [
      'curl -fsSL https://ollama.com/install.sh | sh',
      'ollama pull llama3.1:8b-instruct-q8_0',
      'sudo systemctl enable --now ollama',
      '# Yerel test: curl http://localhost:11434/api/tags'
    ],
    envConfig: {
      'OLLAMA_SERVER_URL': 'http://localhost:11434',
      'OLLAMA_SERVER_MODEL': 'llama3.1:8b-instruct-q8_0',
      'OPENAI_BASE_URL': 'http://localhost:11434/v1',
      'OPENAI_API_KEY': 'ollama'
    },
    statusBadge: 'verified'
  }
];

export const VULNHOUSE_100_HOURS_DATA = {
  title: '100 Saatlik Canlı Sızma Testi Özeti',
  event: 'Otonom Güvenlik & Zafiyet Doğrulama Benchmarkı',
  systems: 'Wachi AI Desktop & Sonic Harness',
  target: 'VulnHouse Laboratuvarı (4 gün 4 gece kesintisiz)',
  metrics: {
    solvedQuestions: '297 / 464 Soru',
    successRate: '%78.5 Başarı Oranı',
    totalScore: '19.340 Puan',
    fastestTask: '54 Saniye',
    autonomousBreakthrough: '33 Dakika (Sıfır insan müdahalesi)'
  },
  capabilities: [
    'Gerçek CVE zafiyetlerinin otomatik yeniden üretilmesi',
    'Karmaşık çok adımlı saldırı zincirlerinin kurgulanması',
    'Beyaz kutu kaynak kod denetimi ve açık taraması',
    'Bellek güvenliği ve PoC (Proof-of-Concept) oluşturulması'
  ],
  warning: 'Test özel laboratuvarda yapılmıştır; gerçek dünyadaki karmaşık altyapılarda insan doğrulaması gerektirir.'
};
