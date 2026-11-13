import { useEffect, useRef, useState, useCallback } from 'react';
import { parseTurkishVoiceCommand, VoiceCommandResult } from './voiceCommandHandler';
import { speakUltraRealistic } from './ultraTTS';
import { playTacticalSound } from './audioEffects';
import { triggerHaptic } from './haptics';

interface UseVoiceCommandListenerOptions {
  enabled: boolean;
  isMicMuted: boolean;
  autoSpeak?: boolean;
  lang?: string;
  onCommand: (result: VoiceCommandResult, transcript: string) => void;
}

export function useVoiceCommandListener({
  enabled,
  isMicMuted,
  autoSpeak = true,
  lang = 'tr-TR',
  onCommand,
}: UseVoiceCommandListenerOptions) {
  const [isListeningActive, setIsListeningActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [lastMatchedCommand, setLastMatchedCommand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const enabledRef = useRef(enabled && !isMicMuted);
  const onCommandRef = useRef(onCommand);
  const lastFiredRef = useRef<{ key: string; timestamp: number }>({ key: '', timestamp: 0 });
  const commandClearTimerRef = useRef<number | null>(null);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    enabledRef.current = enabled && !isMicMuted;
  }, [enabled, isMicMuted]);

  const dispatchCommand = useCallback(
    (transcript: string) => {
      const cleaned = transcript.trim();
      if (!cleaned) return false;

      setLastTranscript(cleaned);
      const parsed = parseTurkishVoiceCommand(cleaned);
      if (!parsed.isCommand || !parsed.action) return false;

      const now = Date.now();
      const dedupeKey = `${parsed.action}:${parsed.target || ''}`;
      if (
        lastFiredRef.current.key === dedupeKey &&
        now - lastFiredRef.current.timestamp < 1600
      ) {
        return true;
      }

      lastFiredRef.current = { key: dedupeKey, timestamp: now };
      setLastMatchedCommand(parsed.matchedKeyword || parsed.action);

      if (commandClearTimerRef.current !== null) {
        window.clearTimeout(commandClearTimerRef.current);
      }
      commandClearTimerRef.current = window.setTimeout(() => {
        setLastMatchedCommand(null);
      }, 3200);

      playTacticalSound('command_exec');
      triggerHaptic('success');

      if (autoSpeak && !isMicMuted && parsed.feedbackText) {
        speakUltraRealistic(parsed.feedbackText);
      }

      onCommandRef.current(parsed, cleaned);
      return true;
    },
    [autoSpeak, isMicMuted]
  );

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    setIsSupported(Boolean(SpeechRecognition));

    if (!enabled || isMicMuted) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
      setIsListeningActive(false);
      return;
    }

    if (!SpeechRecognition) {
      setError('Tarayıcı ses tanımayı (SpeechRecognition) desteklemiyor.');
      setIsListeningActive(false);
      return;
    }

    let stopped = false;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      if (!stopped) {
        setIsListeningActive(true);
        setError(null);
      }
    };

    recognition.onresult = (event: any) => {
      let latestTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        latestTranscript += event.results[i][0]?.transcript || '';
      }
      if (latestTranscript.trim()) {
        dispatchCommand(latestTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Mikrofon izni verilmedi.');
        stopped = true;
        setIsListeningActive(false);
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(`Ses tanıma hatası: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListeningActive(false);
      if (!stopped && enabledRef.current) {
        window.setTimeout(() => {
          if (!stopped && enabledRef.current && recognitionRef.current === recognition) {
            try {
              recognition.start();
            } catch {}
          }
        }, 350);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsListeningActive(false);
    }

    return () => {
      stopped = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
      if (commandClearTimerRef.current !== null) {
        window.clearTimeout(commandClearTimerRef.current);
      }
      setIsListeningActive(false);
    };
  }, [enabled, isMicMuted, lang, dispatchCommand]);

  return {
    isListeningActive,
    isSupported,
    lastTranscript,
    lastMatchedCommand,
    error,
    triggerVoicePhrase: dispatchCommand,
  };
}
