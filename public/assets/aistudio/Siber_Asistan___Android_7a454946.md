# Siber Asistan — Android

Telefonunda çalışan, **API anahtarı / IP adresi / sunucu istemeyen** Türkçe yapay zeka asistanı. Sohbet metni cihazdaki Qwen3 0.6B modeliyle, ses çözümlemesi cihazdaki Whisper modeliyle üretilir.

## Neler var

| Özellik | Durum | Not |
|---|---|---|
| Cihaz içi sohbet (Qwen3 0.6B, Q4_K_M, ~397 MB) | Hazır | İlk indirme internet ister, sonrası çevrimdışı |
| Türkçe yanıt, İngilizce soruya İngilizce yanıt | Hazır | Sistem istemi Türkçe öncelikli |
| Sohbet geçmişi, yeni sohbet, geçmişi temizleme | Hazır | Telefondaki uygulama deposunda |
| Yanıtı durdurma / iptal | Hazır | `stopCompletion` |
| Türkçe konuşmayı yazıya çevirme (Whisper tiny) | Hazır | Native derleme gerekir |
| Yanıtı cihaz sesiyle okuma (TTS) | Hazır | Android metin-ses motoru |
| Sesli kısa komutlar (yeni sohbet, TTS sesini durdur, oku, yukarı/aşağı kaydır) | Hazır | Sadece uygulama içindeki sohbeti kontrol eder; model üretimini ekrandaki Durdur düğmesi keser |
| Arka planda kayıt oturumu + kalıcı bildirim | Hazır (native izinlerle) | Uyandırma sözcüğü değildir |
| Siyah-beyaz arayüz ve yeşil/turuncu/kırmızı vurgular | Hazır | Koyu yüzey, yüksek kontrastlı metin |
| Canlı ekran paylaşımı (MediaProjection) | **Henüz yok** | Ayrı native modül gerekir |
| Kayan işaretçi (overlay) | **Henüz yok** | Ayrı native modül gerekir |

Ekran görüntüsü ve kayan işaretçi, ayrı bir Android native modülü (MediaProjection servisi + `SYSTEM_ALERT_WINDOW` overlay) gerektirdiği için bu sürümde arayüzde "hazır" gibi gösterilmez; ayarlar ekranında durumu açıkça yazılıdır.

Android JS bundle derlemesini engelleyen eksik `buffer` bağımlılığı ve eski Expo SDK yama sürümleri giderildi. Kök neden ve doğrulama çıktıları için [`docs/build-troubleshooting.md`](docs/build-troubleshooting.md) dosyasına bakın.

## Savunma amaçlı açık kaynaklar

Ayarlar panelindeki bağlantılar [TruffleHog](https://github.com/trufflesecurity/trufflehog), [Checkov](https://github.com/bridgecrewio/checkov) ve [GitHub Secret Scanning belgelerini](https://docs.github.com/code-security/secret-scanning/about-secret-scanning) açar. Bunlar uygulamaya gömülü değildir; yalnızca kullanıcının yetkili olduğu depolar ve yapılandırmalar için dış kaynaklardır. Kali'nin tüm araç kataloğu çift kullanımlı saldırı ve dinleme araçları içerdiği için uygulamaya eklenmemiştir.

## Neden APK hemen inmiyor

`llama.rn`, `whisper.rn` ve arka plan mikrofon servisi **native kod** içerir. Expo Go bu modülleri çalıştıramaz. Bu yüzden uygulamanın Android geliştirme/sürüm derlemesi gerekir:

1. Manus panelinde projeyi aç → **Android** derlemesini başlat (APK/AAB).
2. Derleme tamamlanınca indirme bağlantısı panelde görünür.
3. Telefonda "bilinmeyen kaynaklardan yükleme" iznini verip APK'yı kur.

Yerel geliştirme için:

```bash
pnpm install
pnpm exec expo prebuild --platform android
pnpm exec expo run:android          # cihaz/emülatör bağlıyken
```

veya EAS ile:

```bash
npx eas build -p android --profile preview
```

## İlk kullanım

1. Uygulamayı aç, **Ayarlar → Sohbet modelini indir** (yaklaşık 397 MB, ücretsiz).
2. Türkçe sesli giriş için ayrıca **Türkçe ses modelini indir**.
3. Mikrofon düğmesine bas, konuş, tekrar bas: ses cihazda yazıya çevrilir ve yanıt üretilir.
4. Arka plan oturumu istiyorsan ayarlardan aç; Android kalıcı kayıt bildirimi gösterir, oradan durdurabilirsin.

## Gizlilik ve sınırlar

- API anahtarı, IP adresi, hesap veya abonelik gerekmez. İnternet yalnızca model indirmede kullanılır.
- Sohbet geçmişi cihazda saklanır; dışarı gönderilmez.
- 0.6B model küçüktür: hız yüksektir ama karmaşık sorularda hata yapabilir. "Sıfır hata" garantisi yoktur.
- Hız; işlemci, RAM, sıcaklık ve pil durumuna göre değişir; takılma olmaması garanti edilemez.
- Ses algılama gürültülü ortamda düşebilir; kusursuz algılama iddia edilmez.
- Arka plan kayıt pili ve ısıyı artırır; Android/üretici kısıtlamaları oturumu durdurabilir.

## Proje yapısı

```
app/(tabs)/index.tsx          sohbet ekranı
components/assistant-settings.tsx  model/ses/gizlilik paneli
lib/local-ai.native.ts        llama.rn ile cihaz içi üretim
lib/local-models.ts           model indirme ve depolama
lib/offline-voice.native.ts   whisper.rn ile çevrimdışı STT
docs/technical-sources.md     resmi kaynaklar ve sınırlar
```

Lisans notu: Qwen3-0.6B Apache-2.0, llama.cpp/llama.rn MIT, whisper.cpp/whisper.rn MIT. Model dosyaları depoya dahil değildir; uygulama ilk açılışta indirir.
