# Android derleme hata ayıklama kaydı

## Bulunan kök nedenler

1. **Android JavaScript bundle çözümlenemiyordu:** Expo export çıktısı `whisper.rn → safe-buffer → require("buffer")` zincirinde `Unable to resolve module buffer` hatası verdi. `buffer` paketi uygulamanın doğrudan runtime bağımlılığı olarak eklendi. Aynı Android bundle export tekrar çalıştırıldığında 1.900 modül ile başarıyla tamamlandı.
2. **Expo SDK yama sürümleri gerideydi:** İlk `expo-doctor` çağrısı SDK 57'nin beklediği 10 yama paketinin eski sürümde olduğunu gösterdi. `pnpm` workspace kökü nedeniyle `expo install --fix` kök bağımlılık yazımını reddetti. Beklenen sürümler `pnpm add -w` ile güncellendi. Sonuç: Expo Doctor 21/21 ve `expo install --check` başarılı.

## Doğrulama sonuçları

- `pnpm check`: başarılı (TypeScript).
- `CI=1 pnpm test`: 25 test geçti, 1 önceden atlanmış auth testi; başarısız test yok.
- `CI=1 pnpm exec expo prebuild --platform android --no-install`: başarılı.
- `CI=1 pnpm exec expo export --platform android --output-dir /tmp/termuxlocalai-export`: başarılı; JS bundle oluşturuldu.
- Gerçek Android Gradle `assembleDebug`/APK derlemesi bu sandbox içinde çalıştırılmadı. Expo Mobile proje talimatları release/native build'i Manus Dashboard Android build yüzeyinde çalıştırmayı gerektirir. O nedenle indirilebilir APK bulunduğunu iddia etmiyoruz.

## Yeniden üretme

```bash
pnpm install --frozen-lockfile
npx --yes expo-doctor@latest
pnpm exec expo install --check
pnpm check
CI=1 pnpm test
CI=1 pnpm exec expo prebuild --platform android --no-install
CI=1 pnpm exec expo export --platform android --output-dir /tmp/termuxlocalai-export
```

Ardından Manus Dashboard'da projeyi açıp Android APK build'i başlatın. Bir native Gradle hatası devam ederse, o derlemenin ilk `FAILURE: Build failed with an exception` bölümünü ve ilk `Caused by:` satırından itibaren çıktıyı paylaşın; bundle ve Expo SDK hataları artık yeniden üretilemiyor.

## Güvenli ürün sınırı

Uygulamaya önceki kodlardan `JavascriptInterface → su -c` root komut geçidi, gizli ağ dinleme/izleme, log/iz silme, trafik yakalama ya da güvenlik duvarı varsayılanlarını değiştirme eklenmedi. Bunlar cihaza veya başkalarına zarar verebilir ve kötüye kullanıma açık. Yerine çevrimdışı savunma rehberi, yalnızca kullanıcının açıkça başlattığı mikrofon oturumu ve Android'in kendi onay/izin akışları hedeflenir. Gizli dinleme, korumaları aşma, yasa dışı kullanım veya hatasız/sınırsız çalışma garantisi yoktur.
