# Katkı rehberi

Bu proje MIT lisanslıdır ve açık kaynak olarak geliştirilmeye açıktır. Türkçe veya İngilizce katkı gönderebilirsiniz.

## Geliştirme

```bash
pnpm install
pnpm exec expo prebuild --platform android
pnpm exec expo run:android
```

- `pnpm exec expo start` yalnızca web önizlemesi içindir. `llama.rn`, `whisper.rn` ve arka plan mikrofon servisi **Expo Go'da çalışmaz**; native derleme gerekir.
- TypeScript tanılaması: `npx tsc --noEmit`.
- Değişiklik göndermeden önce ekran görüntüsü veya cihaz notu ekleyin.

## Genişletme noktaları

| Dosya | Ne yapar | Nasıl genişletilir |
|---|---|---|
| `lib/local-models.ts` | Model kataloğu ve indirme | Yeni GGUF/Whisper modeli eklemek için `CHAT_MODEL` benzeri bir kayıt tanımlayın |
| `lib/local-ai.native.ts` | llama.rn oturumu | Farklı bağlam/sıcaklık, çok turlu bellek veya araç çağrısı eklenebilir |
| `lib/offline-voice.native.ts` | Whisper STT | Gerçek zamanlı `RealtimeTranscriber` akışına geçirilebilir |
| `components/assistant-settings.tsx` | Ayar paneli | Yeni izin/özellik anahtarları buraya eklenir |
| `app/(tabs)/index.tsx` | Sohbet ekranı | Mesaj eylemleri, hız göstergesi, paylaşım |

## Planlanan açık işler

1. **Canlı ekran paylaşımı**: `MediaProjection` için Expo config plugin + foreground service (`mediaProjection` tipi), her oturumda kullanıcı onayı ve görünür bildirim.
2. **Kayan işaretçi**: `SYSTEM_ALERT_WINDOW` izniyle `TYPE_APPLICATION_OVERLAY` penceresi; uygulama içinden aç/kapat.
3. **Ekran metni anlama**: ML Kit OCR ile cihaz içi metin çıkarımı; görsel anlama olmadığı açıkça belirtilmeli.
4. **Gerçek zamanlı ses**: Whisper `RealtimeTranscriber` + VAD ile sürekli dinleme oturumu (görünür bildirim korunarak).
5. **Model kataloğu**: Cihaz RAM'ine göre öneri, birden fazla GGUF boyutu.

## Güvenlik ilkeleri

- Gizli dinleme, kullanıcı onayı olmadan ekran/mikrofon erişimi veya Android izin ekranlarını atlatma kabul edilmez.
- Kullanıcı verisi varsayılan olarak cihazda kalır; dışarı aktarma açık kullanıcı eylemi gerektirir.
- Reklam, izleme veya üçüncü taraf analitik eklenmez.
