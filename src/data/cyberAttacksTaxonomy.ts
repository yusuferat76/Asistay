export interface CyberAttackCategory {
  id: string;
  title: string;
  description: string;
  attacks: {
    name: string;
    summary: string;
    mechanism: string;
    countermeasure: string;
  }[];
}

export const CYBER_ATTACKS_TAXONOMY: CyberAttackCategory[] = [
  {
    id: 'sniffing-surveillance',
    title: '1. Sinyal, Takip, Dinleme ve İzleme Yöntemleri (Sniffing & Surveillance)',
    description: 'Ağ trafiğini izleme, sahte baz istasyonları ve casus yazılımlarla hedef verilerini toplama yöntemleri.',
    attacks: [
      {
        name: 'Paket Dinleme (Packet Sniffing)',
        summary: 'Ağ üzerinden geçen şifrelenmemiş veri trafiğinin (şifreler, mesajlar) özel yazılımlarla (Wireshark vb.) yakalanması.',
        mechanism: 'Ağ kartını Promiscuous modda çalıştırarak ağ segmentindeki tüm Ethernet/Wi-Fi paketlerini toplar.',
        countermeasure: 'TLS/HTTPS şifrelemesi kullanmak, VPN ve uçtan uca şifreli protokoller tercih etmek.'
      },
      {
        name: 'IMSI Yakalayıcılar (Stingray / IMSI Catchers)',
        summary: 'Sahte baz istasyonu kurarak hedef cep telefonlarının konumunu tespit etme ve aramaları dinleme.',
        mechanism: 'Çevredeki gerçek baz istasyonlarından daha yüksek sinyal gücü yayarak telefonların sahte cihaza bağlanmasını sağlar.',
        countermeasure: 'Şifreli hücresel iletişim protokolleri, 5G güvenlik sıkılaştırması ve IMSI algılama dedektörleri.'
      },
      {
        name: 'Radyo Frekansı Müdahalesi (RF Jamming & Eavesdropping)',
        summary: 'Kablosuz sinyalleri (Wi-Fi, Bluetooth, telsiz) kesintiye uğratma veya frekans aralığına sızma.',
        mechanism: 'Hedef frekansta gürültü (noise) yayarak iletişimi engeller veya havada uçuşan radyo dalgalarını kaydeder.',
        countermeasure: 'Frekans atlamalı yayılı spektrum (FHSS) ve fiziksel sinyal koruması.'
      },
      {
        name: 'Casus Yazılımlar (Spyware & Stalkerware)',
        summary: 'Hedef cihaza gizlice yüklenerek kamerayı, mikrofonu, GPS konumunu, galeri ve mesajları uzaktan canlı izleme.',
        mechanism: 'Zararlı APK/uygulama yükleyerek root/jailbreak yetkileri alır ve arka planda veri sızdırır.',
        countermeasure: 'İki aşamalı doğrulama, bilinmeyen kaynaklardan uygulama yüklememe, Anti-Spyware yazılımları.'
      },
      {
        name: 'Tuş Kaydediciler (Keylogging)',
        summary: 'Kullanıcının klavyede bastığı her tuşu (şifreler, kredi kartları, yazışmalar) kaydedip saldırgana gönderme.',
        mechanism: 'İşletim sistemi çekirdeğinde (kernel) ya da uygulama katmanında klavye olaylarını (key events) dinler.',
        countermeasure: 'Sanal klavye kullanımı, şifre yöneticileri (autofill) ve gelişmiş Endpoint Protection.'
      },
      {
        name: 'Oturum Çalma (Session Hijacking / Cookie Stealing)',
        summary: 'Kullanıcının web sitelerindeki aktif oturum çerezlerini (cookies) ele geçirerek hesaplara şifresiz erişim.',
        mechanism: 'XSS veya ağ dinleme yoluyla geçerli oturum belirteçlerini (session tokens) çalıp kendi tarayıcısına kopyalar.',
        countermeasure: 'HttpOnly ve Secure çerez bayrakları, kısa oturum zaman aşımı ve IP bağlama.'
      }
    ]
  },
  {
    id: 'password-cracking',
    title: '2. Şifre Kırma Yöntemleri (Password Cracking)',
    description: 'Zayıf şifreleri, hash özetlerini ve kimlik bilgilerini ele geçirme teknikleri.',
    attacks: [
      {
        name: 'Kaba Kuvvet Saldırısı (Brute Force)',
        summary: 'Özel yazılımlar kullanarak milyarlarca farklı şifre kombinasyonunun sırayla denenmesi.',
        mechanism: 'Tüm olası karakter kombinasyonlarını (karakter kümesi permütasyonları) otomatik olarak sisteme gönderir.',
        countermeasure: 'Güçlü ve uzun şifre politikaları, hesap kilitleme mekanizmaları ve CAPTCHA.'
      },
      {
        name: 'Sözlük Saldırısı (Dictionary Attack)',
        summary: 'En sık kullanılan şifrelerin, kelimelerin ve sızdırılmış veri tabanlarının bulunduğu listelerle deneme.',
        mechanism: 'İnsanların yaygın olarak seçtiği kelimeleri (ad, tarih, 123456) içeren sözlük dosyalarını kullanır.',
        countermeasure: 'Kişisel bilgi ve yaygın sözcüklerin şifre olarak kullanılmasını engelleyen filtreler.'
      },
      {
        name: 'Gökkuşağı Tabloları (Rainbow Table Attack)',
        summary: 'Şifrelerin hash çıktı اینکه, önceden hesaplanmış devasa veri tabanlarıyla eşleştirilerek kırılması.',
        mechanism: 'Hash fonksiyonlarının tersine çevrilemezliğini önceden hesaplanmış düz metin-hash eşleşme tablolarıyla aşar.',
        countermeasure: 'Şifrelere tuzlama (salting) ve güçlü hash algoritmaları (Argon2, bcrypt, PBKDF2) uygulama.'
      },
      {
        name: 'Kimlik Bilgisi Doldurma (Credential Stuffing)',
        summary: 'Geçmişte başka sitelerden sızdırılmış e-posta ve şifre ikililerinin farklı platformlarda topluca denenmesi.',
        mechanism: 'Botnet ağları üzerinden binlerce farklı web sitesine aynı anda otomatik giriş denemeleri yapar.',
        countermeasure: 'Çok faktörlü kimlik doğrulama (MFA / 2FA) ve IP tabanlı oran sınırlama (rate limiting).'
      },
      {
        name: 'Sosyal Mühendislik ve Oltalama (Phishing)',
        summary: 'Sahte web siteleri veya e-postalar tasarlayarak kullanıcının şifresini kendi eliyle girmesini sağlama.',
        mechanism: 'Güvenilir kurumların (bankalar, sosyal medya) birebir kopyalarını oluşturarak kullanıcıyı yanıltır.',
        countermeasure: 'E-posta filtreleme, alan adı (domain) doğrulama ve kullanıcı farkındalık eğitimleri.'
      }
    ]
  },
  {
    id: 'remote-access',
    title: '3. Uzaktan Erişim ve IP Tabanlı Sızma Yöntemleri (Remote Access & Network Exploitation)',
    description: 'Ağ protokolleri, açık portlar ve zararlı yazılımlarla uzaktan yönetim sağlama.',
    attacks: [
      {
        name: 'Truva Atları ve RAT (Remote Access Trojan)',
        summary: 'Meşru bir yazılım gibi görünen ancak arka planda cihazın tüm yönetimini veren zararlı yazılımlar.',
        mechanism: 'Arka planda gizli bir sunucu (server) açarak saldırganın komuta kontrol (C2) merkezine bağlanır.',
        countermeasure: 'Güncel Antivirüs / EDR çözümleri, bilinmeyen dosya çalıştırmama ve giden ağ trafiği denetimi.'
      },
      {
        name: 'Açık Port Taraması ve Sızma (Port Scanning & Exploitation)',
        summary: 'Hedef IP adresindeki açık kapıları tespit edip servis açıklarını kullanarak sızma.',
        mechanism: 'Nmap gibi araçlarla portları tarar, çalışan servislerin sürüm bilgilerini analiz eder ve exploit çalıştırır.',
        countermeasure: 'Gereksiz portları kapatma, güvenlik duvarı (Firewall) kuralları ve düzenli yama yönetimi.'
      },
      {
        name: 'IP Adresi Üzerinden Konum ve Servis Tespiti',
        summary: 'Hedef IP\'den servis sağlayıcı, yaklaşık konum ve cihaz modeline dair istihbarat toplama.',
        mechanism: 'GeoIP veritabanları ve ICMP/TCP paket analiziyle hedef hakkında ağ istihbaratı çıkarır.',
        countermeasure: 'VPN, Tor ağı ve proxy sunucuları kullanarak gerçek IP adresini gizleme.'
      },
      {
        name: 'Ortadaki Adam Saldırısı (MitM - Man-in-the-Middle)',
        summary: 'Kurban ile internet sitesi arasına girerek tüm trafiği kendi IP\'si üzerinden geçirme.',
        mechanism: 'ARP zehirlemesi veya sahte Wi-Fi (Evil Twin) ile kurbanın ağ trafiğini kendi üzerinden yönlendirir.',
        countermeasure: 'Halka açık güvensiz Wi-Fi ağlarında VPN kullanmak, SSL/TLS sertifika uyarılarını dikkate almak.'
      },
      {
        name: 'Botnet ve Zombi Cihaz Erişimi',
        summary: 'Binlerce cihazı ele geçirerek bir merkezden komuta etme ve DDOS saldırıları düzenleme.',
        mechanism: 'Zararlı yazılımlarla enfekte olan cihazları merkezi bir C2 sunucusuna bağlayıp koordine eder.',
        countermeasure: 'Cihaz yazılımlarını güncel tutma, anormal ağ trafiği ve DDoS koruma sistemleri (Cloudflare vb.).'
      }
    ]
  },
  {
    id: 'advanced-attacks',
    title: '4. Gelişmiş ve Diğer Siber Saldırı Çeşitleri',
    description: 'Sıfırıncı gün açıkları, fidye yazılımları ve gelişmiş siber tehditler.',
    attacks: [
      {
        name: 'Sıfırıncı Gün Saldırıları (Zero-Day Exploits)',
        summary: 'Yazılımcıların henüz fark etmediği ve yamalamadığı bilinmeyen açıkları kullanarak sızma.',
        mechanism: 'Keşfedilen ancak üreticiye bildirilmemiş yazılım açıklarını (zero-day) özel exploit kodlarıyla tetikler.',
        countermeasure: 'Davranış tabanlı güvenlik izleme (EDR/XDR) ve sıfır güven (Zero Trust) mimarisi.'
      },
      {
        name: 'SQL Enjeksiyonu (SQL Injection)',
        summary: 'Web sitelerinin veri tabanı sorgularına zararlı kodlar ekleyerek yetkisiz erişim sağlama.',
        mechanism: 'Giriş alanlarına (input fields) SQL komutları enjekte ederek veritabanı tablolarını okuma/silme.',
        countermeasure: 'Parameterized queries (hazırlanmış ifadeler), ORM kullanımı ve girdi doğrulama.'
      },
      {
        name: 'Fidye Yazılımları (Ransomware)',
        summary: 'Cihazdaki tüm dosyaları güçlü algoritmalarla şifreleyerek fidye talep etme.',
        mechanism: 'Sistemdeki dosyaları simetrik/asimetrik kriptografiyle şifreleyip anahtarı imha eder.',
        countermeasure: 'Düzenli çevrimdışı yedekleme (3-2-1 kuralı) ve güçlü uç nokta koruması.'
      },
      {
        name: 'Sosyal Mühendislik ve SIM Değişimi (SIM Swapping)',
        summary: 'GSM operatörünü kandırarak hedefin telefon numarasını yeni bir SIM karta çıkarma.',
        mechanism: 'Operatör destek ekibine sahte kimlik bilgileri sunarak hattı kendi kontrolündeki SIM karta taşır.',
        countermeasure: 'Operatörlerde ek şifre/PIN koruması ve SMS tabanlı 2FA yerine donanım anahtarları kullanma.'
      }
    ]
  }
];
