/**
 * Haptic Feedback System using Navigator.vibrate API
 * Provides tactile vibration pulses for critical and warning system alerts.
 */

export type HapticType = 'critical' | 'warning' | 'click' | 'success';

export function triggerHaptic(type: HapticType): void {
  if (typeof window === 'undefined' || !navigator || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'critical':
        // Short-long tactical pulse pattern
        navigator.vibrate([100, 60, 350]);
        break;

      case 'warning':
        // Short-short pulse pattern
        navigator.vibrate([80, 50, 80]);
        break;

      case 'success':
        // Double crisp tap
        navigator.vibrate([50, 40, 50]);
        break;

      case 'click':
      default:
        // Subtle single tap
        navigator.vibrate(35);
        break;
    }
  } catch (err) {
    // Ignore vibration restrictions in browsers without permission
  }
}
