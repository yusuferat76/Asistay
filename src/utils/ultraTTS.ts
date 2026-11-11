/**
 * Ultra-Realistic Human-Like Turkish Text-to-Speech (TTS) Engine
 * Selects the highest quality neural / natural Turkish voice available in the browser
 * with optimized pitch, rate, and intonation for maximum human resemblance.
 */

// Global Mute State: Defaulted to true (silenced/muted) per user request
let globalMuted = true;

// Cancel any active speech synthesis immediately on load
if (typeof window !== 'undefined' && window.speechSynthesis) {
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    // Ignore
  }
}

export function setGlobalMute(muted: boolean): void {
  globalMuted = muted;
  if (muted && typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

export function getGlobalMute(): boolean {
  return globalMuted;
}

export function speakUltraRealistic(text: string, onEnd?: () => void): void {
  // If muted, completely suppress speech and cancel any pending queue
  if (globalMuted || typeof window === 'undefined' || !window.speechSynthesis) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech instantly
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'tr-TR';
  utterance.rate = 1.02; // natural conversational tempo
  utterance.pitch = 1.0; // natural human pitch
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  // Find the best Turkish voice (Google Türkçe, Microsoft natural, or any tr-TR)
  const bestVoice =
    voices.find((v) => v.lang === 'tr-TR' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Online'))) ||
    voices.find((v) => v.lang === 'tr-TR' || v.lang.startsWith('tr')) ||
    voices[0];

  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  if (onEnd) {
    utterance.onend = () => {
      onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };
  }

  window.speechSynthesis.speak(utterance);
}

export function stopUltraSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}
