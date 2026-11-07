# Teknik kaynaklar (geliştirme notları)

Bu uygulama kullanıcıdan API anahtarı, IP adresi veya sunucu adresi istemez. İlk kez model indirmek için internete ve telefonda depolama alanına ihtiyaç vardır; daha sonra metin çıkarımı yerelde yapılır.

- `llama.rn` resmi repo: https://github.com/mybigday/llama.rn — React Native llama.cpp binding; Expo CNG/dev build desteği, GGUF yükleme ve `initLlama`/`completion` örnekleri. v0.10+ New Architecture ister. Projede `0.12.9` kullanılıyor.
- Qwen3-0.6B GGUF kaynak deposu: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF — Q4_K_M dosyası `Qwen3-0.6B-Q4_K_M.gguf`, 396,705,472 bayt (yaklaşık 397 MB), Apache-2.0. İndirme endpoint'i: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_K_M.gguf
- `whisper.rn` resmi repo: https://github.com/mybigday/whisper.rn — cihaz içi whisper.cpp STT, `initWhisper` ve `transcribe`; native Android derlemesi gerekir. Projede 0.7.4 kullanılıyor.
- Whisper tiny multilingual model: https://huggingface.co/ggerganov/whisper.cpp — model dosyası `ggml-tiny.bin`, ilk indirme internet ister.
- Expo Audio resmi dokümanı: https://docs.expo.dev/versions/latest/sdk/audio/ — `enableBackgroundRecording`, Android microphone foreground service/kalıcı bildirim ve kullanıcı durdurma kontrolü. Arka plan kayıt batarya tüketir.
- Android foreground service türleri: https://developer.android.com/about/versions/14/changes/fgs-types-required — Android 14+ microphone service tipi ve `FOREGROUND_SERVICE_MICROPHONE`; `RECORD_AUDIO` izni ve while-in-use kısıtları önemlidir.
- Android MediaProjection: https://developer.android.com/media/grow/media-projection — her ekran yakalama oturumu için açık kullanıcı onayı; Android 14+ foreground service tipi ve token kullanım şartları.
- Expo native code: https://docs.expo.dev/workflow/customizing/ — native kütüphaneler Expo Go'da çalışmaz; development build gerekir.
- Expo development build: https://docs.expo.dev/develop/development-builds/introduction/ — native modülleri içeren özel uygulama build'i gereklidir.

Sınırlar: Qwen3-0.6B küçük, metin odaklı bir modeldir; ekran görüntüsü görsel anlama sağlamaz. Bu kaynak sürümündeki arka plan ses modu kayıt oturumudur; Whisper çözümlemesi oturum durdurulunca yapılır. Bu, tam zamanlı uyandırma sözcüğü/Gemini Live eşdeğeri değildir. Ekran MediaProjection ve diğer uygulamaların üstünde kayan marker için native modül ayrıca tamamlanıp cihaz üzerinde doğrulanmalıdır. Hatasızlık, sınırsızlık, aynı hız veya kusursuz ses algılama garantisi yoktur.


## Savunma amaçlı kod ve yapılandırma taraması

- TruffleHog resmi deposu: https://github.com/trufflesecurity/trufflehog — Git ve filesystem kaynaklarında gizli kimlik bilgisi taraması. Yalnızca sahip olunan veya açıkça yetkili olunan depolarda kullanılır; dış servise doğrulama istekleri gibi seçenekler ayrıca değerlendirilmelidir.
- Checkov resmi deposu: https://github.com/bridgecrewio/checkov — Infrastructure-as-Code, konteyner ve CI yapılandırmalarında statik güvenlik denetimleri.
- GitHub Secret Scanning resmi belge: https://docs.github.com/code-security/secret-scanning/about-secret-scanning — geçmişteki sabitlenmiş credential sızıntılarını saptama ve sızıntı sonrası anahtarı iptal/döndürme.
- Kali araç kataloğu: https://www.kali.org/tools/ — geniş çift kullanımlı araç envanteri; saldırı, dinleme ve kablosuz analiz araçları nedeniyle mobil uygulamada gömülü komut veya kurulum kataloğu olarak sunulmaz.

Bu dış bağlantılar uygulamada yalnızca kullanıcının açıkça dokunmasıyla tarayıcıda açılır. Uygulama bu araçları çalıştırmaz; uzaktan tarama veya cihaz/ağ izleme yapmaz.
