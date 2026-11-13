# Asistay Mobil Arayüz — Uygulama Planı

## Hedef
GitHub’daki Asistay siber güvenlik ürününün kullanılabilir Türkçe arayüzünü Expo/React Native mobil projeye taşımak; `yusuferat76/Asistay` `main` dalının `7670220` commit’indeki izlenen kaynak ağacını kayıpsız referans arşivinde korumak.

## Uygulama yaklaşımı
Native Expo uygulamasında tek el kullanımına uygun dört ana bölüm olacak: Asistan ana ekranı gönderilen örneğe uygun dünya küresi, varsayılan kapalı ekran paylaşımı kartı, bas-konuş orb’u, güvenlik özeti ve Messenger tarzı sohbetle uyumlu olacak; Güvenlik, Geçmiş ve Ayarlar aynı siyah/kobalt görsel dili kullanacak. Yüzlü Asistay baloncuğu üç kontrolü (Kamera, Ekran, Sessiz) açıp kapatacak; tekrar baloncuğa dokunma paneli kapatacak. Yüz ifadesi gerçek duygu algısı değil, yalnızca uygulamanın çalışma modunu gösterecek. Kamera, sadece kullanıcı isteğiyle Android kamera izni alındıktan sonra cihazda yerel canlı önizleme açacak; görüntü AI servisine aktarılmayacak çünkü model endpoint’i bağlı değil. Ekran paylaşımı için MediaProjection native bileşeni yok; Ekran düğmesi eksikliği açıkça bildirip görüntü yakalamayacak. Sessiz kontrolü yalnızca uygulama içindeki ses giriş durumunu değiştirir; uygulamada mikrofon oturumu olmadığından kayıt ya da arka plan dinleme başlatmaz. Baloncuktaki bileşen simgeleri gerçek durumları gösterir ve dokunulduğunda kısa bilgi verir; bağlı olmayan servisler çalışıyor gibi gösterilmez. Mesaj ve yerel geçmiş cihazda tutulur. GitHub’daki Vite/React kaynak arşivi mobil bundle’dan ayrı korunur.

## Tasarım
- **Design Movement:** Siyah teknik minimalizm ve ölçülü siber güvenlik HUD estetiği.
- **Core Principles:** Saf siyah yüzeyler; yüksek kontrast; sınırlı buz mavisi vurgu; açık izin/durum metinleri.
- **Color Philosophy:** #000000 arka plan, #0B0D12 grafit paneller, #E9EEF7 birincil metin, #91A0B7 ikincil metin, #318BFF kobalt ve #7DC8FF buz mavisi etkileşim rengi. Yeşil kullanılmaz; uyarılar yalnızca amber/kırmızı ile ayrılır.
- **Layout Paradigm:** Ana ekranda dünya ve bas-konuş görsel hiyerarşisi, alt bölümde sohbet balonları; dört sekmeli sabit alt gezinme ve başparmak erişiminde izinli işlemler.
- **Signature Elements:** Yumuşak nabız animasyonlu soyut asistan yüzü; mavi yörünge çizgili dünya görseli; durum/izin etiketleri.
- **Interaction Philosophy:** Sohbet taslağı yerelde tutulur; kullanıcı gönderdiğinde model bağlı değilse bunu dürüstçe bildirir. Baloncuktaki izinli kamera önizlemesi yalnızca kullanıcı dokunuşu ve Android izniyle açılır, görsel cihazdan çıkmaz. Ekran yakalama MediaProjection modülü gelene dek kapalı kalır. Durum simgeleri bilgi verir, gizli arka plan işi yoktur.
- **Animation:** Hafif ölçek/opacity nabzı; düşük frekanslı, iptal edilebilir animasyon; yoğun partikül veya sürekli çizim yok.
- **Typography System:** Sistem sans-serif (Android Roboto/iOS system), 24 başlık, 16 gövde, 12 durum etiketi; okunaklı kontrast.
- **Brand Essence:** Türkçe ve gizlilik odaklı siber güvenlik asistanı; sakin, net, güvenilir.
- **Brand Voice:** Kısa ve dürüst; “İzinli kontrollerini tek yerde gör.” / “Ekran paylaşımı kapalı. Başlatmak için Android izni gerekir.”
- **Wordmark & Logo:** Kalkan içinde ses dalgası işareti ve Asistay yazısı.
- **Signature Brand Color:** Kobalt mavi #318BFF; yeşil kullanılmayacak.

## Proje yapısı
- `app/(tabs)/index.tsx`: Expo Router giriş ekranı.
- `components/asistay/AsistayMobile.tsx`: sekme durumu, sohbet akışı, cihaz içi AsyncStorage geçmişi, izin açıklamaları ve dört bölümün arayüzü.
- `app.config.ts` / `expo-camera`: Türkçe Android kamera izni metni ve yalnızca kullanıcı başlatmalı yerel kamera önizlemesi.
- `components/asistay/GlobeVisual.tsx`: hafif SVG yedek dünya görseli.
- `assets/images/`: marka/splash varlıkları ve kullanıcının örnek ekranından ayrıştırılmış native dünya görseli.
- `reference/Asistay-GitHub-main.zip`: GitHub’daki web kaynağının eksiksiz, değişmeden saklanan snapshot’ı.

## Platform sınırları
Android APK derlemesi Dashboard’daki Mobile Build yüzeyiyle yapılır; Sandbox içinde Gradle/EAS sürüm derlemesi çalıştırılmaz. Kaynak kodun checkpoint edilmesi tek başına APK üretildiği anlamına gelmez. Native mikrofon/STT, Hugging Face modeli, MediaProjection ekran paylaşımı ve cihaz genelinde komutlar bu UI çalışmasının dışında, ayrı native izinli entegrasyonlardır.
