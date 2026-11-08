import { agentManager, AgentReport } from './AgentManager';
import { speakUltraRealistic } from './ultraTTS';
import { playTacticalSound } from './audioEffects';

/**
 * Voice Notification Service
 * Listens to autonomous agent reports and triggers prioritized audio summaries.
 * Specifically monitors for 'critical' (red) severity events to provide
 * immediate eyes-free situational awareness.
 */
class VoiceNotificationService {
  private active = false;

  public start() {
    if (this.active) return;
    this.active = true;

    agentManager.onReport((report: AgentReport) => {
      this.processReport(report);
    });
  }

  private processReport(report: AgentReport) {
    if (report.type === 'critical') {
      this.triggerCriticalVoiceAlert(report);
    } else if (report.type === 'warning') {
      // Optional: Handle warnings with a simpler sound or lower priority
      playTacticalSound('ai_response');
    }
  }

  private triggerCriticalVoiceAlert(report: AgentReport) {
    // 1. Play immediate tactical alert sound to grab attention
    playTacticalSound('emergency');

    // 2. Generate a short, high-priority technical summary
    const summary = `Dikkat! Kritik sistem ihlali saptandı. ${report.agentName} raporluyor: ${report.title}. ${report.message}`;

    // 3. Trigger TTS with ultra-realistic engine
    setTimeout(() => {
      speakUltraRealistic(summary);
    }, 500); // Small delay after the alert sound
  }
}

export const voiceNotificationService = new VoiceNotificationService();
