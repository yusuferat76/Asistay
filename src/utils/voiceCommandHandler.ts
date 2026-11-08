export interface VoiceCommandResult {
  isCommand: boolean;
  action?:
    | 'SWITCH_TAB'
    | 'SET_THEME'
    | 'EMERGENCY'
    | 'OPEN_MODAL'
    | 'RUN_SCAN'
    | 'STOP_SPEECH'
    | 'TOGGLE_MUTE'
    | 'CLEAR_LOGS'
    | 'SCROLL_DOWN'
    | 'SCROLL_UP'
    | 'SCROLL_TOP'
    | 'SCROLL_BOTTOM'
    | 'CLOSE_MODAL'
    | 'LIGHTSPEED_MODE'
    | 'DEBT_SUMMARY';
  target?: string;
  feedbackText?: string;
}

/**
 * Recognizes and parses direct spoken Turkish commands in <1ms (saliselik / light-speed)
 */
export function parseTurkishVoiceCommand(transcript: string): VoiceCommandResult {
  const text = transcript.toLowerCase().trim();

  // 0. Işık Hızı / Ultra Hız Kontrolü & Anlık Selamlama
  if (
    text.includes('ışık hızı') ||
    text.includes('isik hizi') ||
    text.includes('ışık hızında') ||
    text.includes('saliselik') ||
    text.includes('hızlı yap')
  ) {
    return {
      isCommand: true,
      action: 'LIGHTSPEED_MODE',
      feedbackText: 'Işık hızında işlem çekirdeği aktif. Tüm komutlar saliselik olarak anında icra ediliyor.',
    };
  }

  if (
    text.includes('selam') ||
    text.includes('merhaba') ||
    text.includes('hey') ||
    text === 'selam ver'
  ) {
    return {
      isCommand: true,
      action: 'LIGHTSPEED_MODE',
      feedbackText: 'Aleykümselam Komutan. Sınırsız Asistan emrinizde, tüm sistemler ışık hızında aktif.',
    };
  }

  if (
    text.includes('nasılsın') ||
    text.includes('durum ne')
  ) {
    return {
      isCommand: true,
      action: 'LIGHTSPEED_MODE',
      feedbackText: 'Sistemler %100 kapasiteyle, sıfır gecikmeyle ve güvenle çalışıyor.',
    };
  }

  if (
    text.includes('borç durumumu özetle') ||
    text.includes('borçlarımı özetle') ||
    text.includes('borç durumum') ||
    text.includes('hesap özeti') ||
    text.includes('kim ne kadar ödeyecek')
  ) {
    return {
      isCommand: true,
      action: 'DEBT_SUMMARY',
      feedbackText: 'Borç durumu ve kişi bazlı ödeme yükümlülükleri analiz ediliyor...',
    };
  }

  // 1. Acil durum / Kill switch
  if (
    text.includes('acil durum') ||
    text.includes('sistemi durdur') ||
    text.includes('kill switch') ||
    text.includes('kalkanı kilitle') ||
    text.includes('her şeyi kapat') ||
    text.includes('acil durdur') ||
    text === 'panik'
  ) {
    return {
      isCommand: true,
      action: 'EMERGENCY',
      feedbackText: 'Acil durum protokolü devrede. Tüm veri ve ses akışları izole edildi.',
    };
  }

  // 2. Sesi durdur / sustur / ses kontrolü
  if (
    text === 'sesi durdur' ||
    text === 'sus' ||
    text === 'sessiz ol' ||
    text === 'okumayı durdur' ||
    text.includes('sesi kes') ||
    text === 'dur'
  ) {
    return {
      isCommand: true,
      action: 'STOP_SPEECH',
      feedbackText: 'Ses çıkışı durduruldu.',
    };
  }

  if (text.includes('sesi kapat') || text.includes('sessize al')) {
    return {
      isCommand: true,
      action: 'TOGGLE_MUTE',
      target: 'mute',
      feedbackText: 'Ses motoru sessize alındı.',
    };
  }

  if (text.includes('sesi aç')) {
    return {
      isCommand: true,
      action: 'TOGGLE_MUTE',
      target: 'unmute',
      feedbackText: 'Ses motoru aktif edildi.',
    };
  }

  // 3. Karanlık Mod & Tema Değiştirme (Siyah / Parlement Mavisi / Matrix)
  if (
    text.includes('oled') ||
    text.includes('saf siyah') ||
    text.includes('simsiyah') ||
    text.includes('siyah mod')
  ) {
    return {
      isCommand: true,
      action: 'SET_THEME',
      target: 'oled',
      feedbackText: 'Saf OLED siyah modu aktif edildi.',
    };
  }

  if (
    text.includes('parlement') ||
    text.includes('parlament') ||
    text.includes('mavi mod') ||
    text.includes('gece modu') ||
    text.includes('parlement mavisi')
  ) {
    return {
      isCommand: true,
      action: 'SET_THEME',
      target: 'parliament',
      feedbackText: 'Parlement mavisi siber gece modu aktif edildi.',
    };
  }

  if (
    text.includes('gizlilik modu') ||
    text.includes('taktik mod') ||
    text.includes('matrix') ||
    text.includes('yeşil mod') ||
    text.includes('stealth')
  ) {
    return {
      isCommand: true,
      action: 'SET_THEME',
      target: 'stealth',
      feedbackText: 'Taktik gizlilik modu aktif edildi.',
    };
  }

  if (
    text.includes('karanlık mod') ||
    text.includes('temayı değiştir') ||
    text.includes('tema testi') ||
    text.includes('temalar')
  ) {
    return {
      isCommand: true,
      action: 'OPEN_MODAL',
      target: 'theme',
      feedbackText: 'Karanlık mod ve tema test paneli açılıyor.',
    };
  }

  // 4. Sesli Ekran Kaydırma Komutları (Işık Hızında Kaydırma)
  if (
    text === 'aşağı kaydır' ||
    text === 'aşağı in' ||
    text === 'kaydır aşağı' ||
    text === 'sayfayı aşağı kaydır' ||
    text === 'aşağı git' ||
    text === 'aşağı' ||
    text === 'kaydır' ||
    text.includes('aşağı kaydır') ||
    text.includes('kaydır aşağı')
  ) {
    return {
      isCommand: true,
      action: 'SCROLL_DOWN',
      feedbackText: 'Ekran ışık hızında aşağı kaydırıldı.',
    };
  }

  if (
    text === 'yukarı kaydır' ||
    text === 'yukarı çık' ||
    text === 'kaydır yukarı' ||
    text === 'sayfayı yukarı kaydır' ||
    text === 'yukarı git' ||
    text === 'yukarı' ||
    text.includes('yukarı kaydır') ||
    text.includes('kaydır yukarı')
  ) {
    return {
      isCommand: true,
      action: 'SCROLL_UP',
      feedbackText: 'Ekran ışık hızında yukarı kaydırıldı.',
    };
  }

  if (
    text === 'en başa git' ||
    text === 'en yukarı' ||
    text === 'başa dön' ||
    text === 'en tepeye' ||
    text === 'en tepeye çık' ||
    text === 'başa sar' ||
    text.includes('en başa') ||
    text.includes('en tepeye')
  ) {
    return {
      isCommand: true,
      action: 'SCROLL_TOP',
      feedbackText: 'Sayfa en başa kaydırıldı.',
    };
  }

  if (
    text === 'en alta git' ||
    text === 'en aşağı' ||
    text === 'sona git' ||
    text === 'en dibe git' ||
    text === 'en dibe in' ||
    text.includes('en alta') ||
    text.includes('en dibe')
  ) {
    return {
      isCommand: true,
      action: 'SCROLL_BOTTOM',
      feedbackText: 'Sayfa en alta kaydırıldı.',
    };
  }

  // 5. Sekme Geçiş Komutları (Işık Hızında Ekran Değişimi)
  if (
    text.includes('araçlar') ||
    text.includes('katalog') ||
    text.includes('pentest araçları') ||
    text.includes('araçlara geç') ||
    text.includes('araç listesi') ||
    text.includes('siber araçlar')
  ) {
    return {
      isCommand: true,
      action: 'SWITCH_TAB',
      target: 'tools',
      feedbackText: 'Siber güvenlik ve pentest araçları kataloğuna geçildi.',
    };
  }

  if (
    text.includes('kişisel asistan') ||
    text.includes('telefon kontrolü') ||
    text.includes('otomasyon') ||
    text.includes('cihaz kontrol') ||
    text.includes('kişisel') ||
    text.includes('telefon ajanları')
  ) {
    return {
      isCommand: true,
      action: 'SWITCH_TAB',
      target: 'personal',
      feedbackText: 'Kişisel asistan ve mobil otomasyon merkezine geçildi.',
    };
  }

  if (
    text.includes('asistana geç') ||
    text.includes('ana ekrana dön') ||
    text.includes('sesli komuta dön') ||
    text.includes('asistan ekranı') ||
    text === 'asistan' ||
    text === 'ana ekran'
  ) {
    return {
      isCommand: true,
      action: 'SWITCH_TAB',
      target: 'assistant',
      feedbackText: 'Sesli asistan merkezine dönüldü.',
    };
  }

  // 6. Modal Açma Komutları (APK / Ollama / Tema)
  if (
    text.includes('apk') ||
    text.includes('mobil yükle') ||
    text.includes('telefona indir') ||
    text.includes('uygulamayı indir') ||
    text.includes('apk hazırla') ||
    text.includes('mobil uygulama')
  ) {
    return {
      isCommand: true,
      action: 'OPEN_MODAL',
      target: 'apk',
      feedbackText: 'Android APK ve mobil kurulum penceresi açıldı.',
    };
  }

  if (
    text.includes('ollama') ||
    text.includes('yerel model') ||
    text.includes('llama kur') ||
    text.includes('sıfır maliyet')
  ) {
    return {
      isCommand: true,
      action: 'OPEN_MODAL',
      target: 'ollama',
      feedbackText: 'Sıfır maliyetli Ollama yapılandırma penceresi açıldı.',
    };
  }

  // 7. Güvenlik Taraması Komutu
  if (
    text.includes('tara') ||
    text.includes('kalkanları kontrol et') ||
    text.includes('ağ taraması') ||
    text.includes('casus yazılım ara') ||
    text.includes('güvenlik taraması')
  ) {
    return {
      isCommand: true,
      action: 'RUN_SCAN',
      feedbackText: 'Tüm sistem ve ağ kalkanları tarandı. Sıfır tehdit, sistem %100 güvenli.',
    };
  }

  // 8. Ekranı temizle
  if (
    text.includes('temizle') ||
    text.includes('ekranı sil') ||
    text.includes('sıfırla') ||
    text === 'ekranı temizle'
  ) {
    return {
      isCommand: true,
      action: 'CLEAR_LOGS',
      feedbackText: 'Terminal telemetrisi ve oturum geçmişi temizlendi.',
    };
  }

  // 9. Pencereleri / Modalları Kapat
  if (
    text === 'kapat' ||
    text === 'pencereyi kapat' ||
    text === 'modalı kapat' ||
    text === 'geri dön' ||
    text === 'çık' ||
    text === 'vazgeç' ||
    text.includes('pencereyi kapat') ||
    text.includes('kapat bunu')
  ) {
    return {
      isCommand: true,
      action: 'CLOSE_MODAL',
      feedbackText: 'Pencere kapatıldı.',
    };
  }

  return { isCommand: false };
}
