# Siber Asistan — Android: kapsam ve teslim durumu

## Tamamlandı

- [x] **API anahtarsız yerel sohbet:** Uygulama kullanıcıdan API/IP/sunucu bilgisi istemez. Qwen3-0.6B Q4_K_M (yaklaşık 397 MB) indirilip `llama.rn` ile cihazda çalıştırılır. İlk model indirmesi internet ve depolama gerektirir; sonraki çıkarım cihazdadır. Hız cihaz donanımına bağlıdır, sınırsız/ışık hızında değildir.
- [x] **Türkçe öncelikli kullanım:** Türkçe sistem istemi, İngilizce soruda İngilizce yanıt, savunma ve izinli testlere dönük güvenlik yardımı; küçük modelin yanılabileceğine ilişkin uyarı.
- [x] **Yerel geçmiş ve sohbet kontrolleri:** Geçmiş cihazda saklanır; yeni sohbet, onaylı geçmiş temizleme, ekrandaki Durdur düğmesiyle üretimi kesme, yanıtı sesli okuma ve yanıt süresi gösterimi. Sesli “okumayı/sesi durdur” komutu yalnızca TTS sesini durdurur.
- [x] **Çevrimdışı ses girişi ve yerel TTS:** Ses kaydı sonlandırılınca Whisper tiny modeli ile cihazda çözümlenir; Android cihaz TTS motoru yanıtı okur. “Aşağı kaydır” / “yukarı kaydır” ses komutları sohbet listesinde çalışır. Ses tonu gerçek insanla birebir klonlanmış değildir; tanıma doğruluğu ve hız garanti edilemez.
- [x] **Görünür arka plan ses oturumu:** Kullanıcı oturumu ekrandan başlatır; foreground mikrofon servisi ve Android bildirimi bulunur. Gizli dinleme, uyandırma kelimesi veya sürekli arka plan konuşma tanıma değildir.
- [x] **Açık kaynak iskelet:** MIT lisansı, katkı rehberi ve GitHub Actions workflow dosyası eklendi.
- [x] **Siyah-beyaz arayüz ve renk vurguları:** Siyah/koyu gri yüzeyler, beyaz metin, yeşil etkinlik, turuncu vurgu ve kırmızı uyarı/temizleme rengi.
- [x] **Savunma amaçlı kaynaklar:** Ayarlar panelinde TruffleHog, Checkov ve GitHub Secret Scanning belgelerine tıklanabilir resmi bağlantılar bulunur; araçlar telefona gömülü veya otomatik çalışan değildir.
- [x] **APK bundle hata düzeltmesi:** Android export'ta görülen `whisper.rn → safe-buffer → buffer` modül eksikliği giderildi; Android JS bundle başarıyla oluşturuldu.
- [x] **Expo SDK uyumu:** 10 yama paketi SDK 57'nin beklediği sürümlere eşitlendi; `expo-doctor` 21/21 ve `expo install --check` başarılı.
- [x] **Kod doğrulamaları:** TypeScript kontrolü başarılı; mevcut birim testlerinde 25 geçti, 1 önceden atlanmış test; Android native prebuild ve Android JS bundle export başarılı.

## Açık / henüz teslim edilmemiş

- [ ] **İndirilebilir APK binary'si:** Gerçek Gradle Android APK derlemesi bu sandbox'ta çalıştırılmadı. Manus Dashboard'daki Android build yüzeyi veya kullanıcıya ait GitHub Actions koşusu gerekir. Bu nedenle APK linki henüz yok.
- [ ] **Canlı ekran paylaşımı:** Her oturumda MediaProjection kullanıcı onayı ve görünür foreground servis gerektiren native modül henüz bağlı değil.
- [ ] **Kayan işaretçi:** Kullanıcı kontrollü overlay izni ve native overlay servisi henüz bağlı değil.
- [ ] **Ekran metni anlama/OCR:** Şu an ekran görüntüsünü canlı izleme veya analiz etme yeteneği yok.
- [ ] **Sürekli sesli komut ve telefon genelinde kontrol:** Deşifre kayıt bitince yapılır; uygulama dışına komutla kaydırma/ayar değiştirme veya sürekli wake-word tanıma yok. Android'in özel erişilebilirlik ve arka plan mikrofon sınırlarını atlatmayız.
- [ ] **Gelişmiş savunma laboratuvarı:** Cihaz içi izin/ağ gizlilik rehberleri güvenli biçimde ayrıca tasarlanabilir. Root komutları, izinsiz trafik yakalama, gizli izleme, saldırı izi silme ve güvenlik korumalarını aşma önceki kodlardan uygulamaya taşınmadı.

## Teknik tanı

Detaylı kök neden, test kanıtları ve yeniden üretim adımları `docs/build-troubleshooting.md` dosyasındadır.
