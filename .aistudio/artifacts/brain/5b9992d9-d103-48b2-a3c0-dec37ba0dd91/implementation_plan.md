# Siber & Kişisel Asistan — Kesintisiz Canlı Sesli Komuta, Saf Siyah/Parlement Mavisi Görsel Restil ve SplitWise Hızlı Eylem Menüsü

Bu güncelleme; kullanıcının talebi doğrultusunda arayüz renklerini saf siyah (#000000) zemin, derin parlement mavisi (#1e3a8a / #2563eb) vurgular ve saf beyaz metin kontrastıyla en üst profesyonellik seviyesine taşır. Yüzen asistan baloncuğuna tıklandığında metin kutusu yerine doğrudan **kesintisiz canlı sesli dinleme (Gemini Live tarzı)** başlatılır ve kullanıcının tek tıkla fatura/adisyon işlemlerine erişebilmesi için **yüzen SplitWise Hızlı Eylem Kısayolu** eklenir.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Onaylanan Kritik Kararlar:**
> - **Yüzen Baloncuk Davranışı:** Baloncuğa tıklandığında artık metin kutusu açılmaz; doğrudan mikrofona bağlanarak kesintisiz eller-serbest sesli dinleme ve akıllı filtrelemeli konuşma başlatılır (Gemini Live deneyimi).
> - **SplitWise Hızlı Eylemi:** Yüzen baloncuğun yanında dairesel hızlı kısayol butonuyla (Speed-Dial) SplitWise fiş tarayıcı ve adisyon paylaştırıcı tek tıkla açılır/kapanır.
> - **Renk Paleti:** Arka plan komple saf OLED siyah (#000000 / #02050e), derin parlement mavisi neon kenarlıklar ve beyaz tipografi ile yüksek kontrastlı siber tasarım.
> - **Mobil APK & Tek Parça Kod:** PWA manifest altyapısıyla anında telefona yükleme ve Bubblewrap bağımsız APK derleme çıktısı.

---

## 1. Genel Bakış ve Temel Konsept

Uygulama, hem gelişmiş bir **Siber Güvenlik Savunma Merkezi** (18+ otonom pentest ve takip dedektörü), hem de **Kişisel Sesli Mobil Asistan** (Neuron, Android Use, OpenClaw, Qwen cihaz içi model) olarak çalışır.

Bu plan ile:
1. **Canlı Sesli Sohbet:** Yüzen simgeye tıklandığında kullanıcıyı dinleyen, arkaplanda çalışan ve seslenildiğinde ışık hızında yanıt veren eller-serbest konuşma çekirdeği aktif olur.
2. **Hızlı Fatura / Adisyon Kısayolu:** Tek dokunuşla fiş tarayıcı modalı ve paylaştırma ekranı açılır.
3. **Saf Siyah & Parlement Mavisi:** Göz yormayan, pil tasarrufu sağlayan ve profesyonel terminal estetiğini yansıtan yüksek kontrastlı karanlık mod.

---

## 2. Kullanıcı Deneyimi ve Görsel Tasarım

```
┌────────────────────────────────────────────────────────────────────────┐
│  Üst Siber Navigasyon: [Sınırsız Asistan] [Sesli] [Siber] [Kişisel] [APK] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ANA ÇALIŞMA ALANI (Saf Siyah #000000 & Parlement Mavisi #1e3a8a)    │
│   • Siber Güvenlik Araçları / Otonom Ajanlar / Yerel Qwen LLM        │
│   • Işık Hızında Saliselik Komut Terminali                             │
│   • Sesle Ekran Kaydırma ("Aşağı kaydır", "Yukarı kaydır")             │
│                                                                        │
│                                    ┌───────────────────────┐           │
│                                    │ [🧾 SplitWise Fatura]  │ (Hızlı)   │
│                                    │ [⚡ Hızlı Tarama]     │           │
│                                    └───────────┬───────────┘           │
│                                                │                       │
│                                      ┌─────────▼─────────┐             │
│                                      │  🎙️ YÜZEN BALONCUK │             │
│                                      │ (Gemini Live Modu)│             │
│                                      └───────────────────┘             │
└────────────────────────────────────────────────────────────────────────┘
```

- **Renk Paleti:**
  - `Arka Plan`: Saf Siyah (`#000000` / `#02050e`)
  - `Birincil Renk (Parlement Mavisi)`: `#1e3a8a`, `#2563eb`
  - `Metin`: Saf Beyaz (`#ffffff`) ve Gümüş Gri (`#cbd5e1`)
  - `Acil Durum & Uyarı`: Kırmızı (`#ef4444`), Zümrüt Yeşili (`#10b981`), Sarı (`#f59e0b`)
- **Yüzen Baloncuk Etkileşimi:**
  - Tek tık: Kesintisiz sesli konuşma oturumunu başlatır/durdurur.
  - Mikrofon aktifken dairesel neon parlement mavisi ve yeşil dalga animasyonu yayılır.
  - Yanında açılan tek tıkla **SplitWise Fiş Tarama** kısayolu yer alır.

---

## 3. Temel Ürün Kararları ve Mimari

1. **Sesli Sohbet Baloncuğu Yeniden Tasarımı (`FloatingChatHead.tsx`):**
   - Eski metin kutusu açılma mantığı kaldırılır.
   - Doğrudan Web Speech API `SpeechRecognition` ve `SpeechSynthesis` döngüsünü tetikler.
   - Sürekli dinleme modunda bekler; kullanıcının komutlarını saliselik yerel yönlendirmeyle icra eder.
2. **SplitWise Hızlı Eylem Menüsü:**
   - Yüzen asistanın üzerinde açılan kompakt `Speed-Dial` menüsü eklenir.
   - Kullanıcı dilediği anda tek tıkla fiş yükleme, yapay zekayla fatura tarama ve adisyon paylaştırma modalını açabilir.
3. **Genel Tema ve Kontrast Güçlendirmesi:**
   - `App.tsx` ve bileşenler saf OLED siyah (`bg-black`) ve parlement mavisi (`border-blue-900/60`, `bg-[#040814]`) zeminlerle yeniden stillendirilir.

---

## 4. Teknik Mimari ve Bileşen Haritası

```
┌──────────────────────────────────────────────────────────────┐
│                     App.tsx (Root View)                      │
│   - Tema Durumu: Saf Siyah / Parlement Mavisi (#000000)      │
│   - SplitWise Hızlı Eylem Modal Yöneticisi                   │
└──────────────┬──────────────────────────────┬────────────────┘
               │                              │
┌──────────────▼──────────────┐  ┌────────────▼────────────────┐
│   CyberVoiceAssistant.tsx   │  │   FloatingChatHead.tsx      │
│   - Sesli Komuta            │  │   - Tıklayınca Canlı Dinle  │
│   - Sesle Kaydırma (<1ms)   │  │   - SplitWise Hızlı Menüsü │
└─────────────────────────────┘  └─────────────────────────────┘
               │                              │
┌──────────────▼──────────────┐  ┌────────────▼────────────────┐
│    PersonalAssistantHub     │  │   ReceiptUploadModal        │
│    - Telefon Otomasyonu     │  │   - Tek Tıkla Fatura Tarama │
│    - Qwen Cihaz İçi Model   │  │   - SplitWise Hesap Bölücü  │
└─────────────────────────────┘  └─────────────────────────────┘
```

- **`src/components/FloatingChatHead.tsx`**: Tıklama eylemi metin açmak yerine doğrudan canlı mikrofonu açıp kapatacak; yanında SplitWise hızlı menü düğmesi sunacak.
- **`src/components/ReceiptUploadModal.tsx` & `ReceiptPane.tsx`**: Hızlı eylem kısayolu ile tek tıkla açılarak fatura yükleme ve otomatik OCR tarama yapacak.
- **`src/App.tsx`**: Varsayılan tema saf siyah ve parlement mavisi olarak kilitlenecek.
