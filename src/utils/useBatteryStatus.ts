import { useEffect, useState } from 'react';

interface BatteryState {
  level: number;
  charging: boolean;
  isLowBattery: boolean;
}

export function useBatteryStatus() {
  const [battery, setBattery] = useState<BatteryState>({
    level: 100,
    charging: false,
    isLowBattery: false,
  });

  useEffect(() => {
    if (!('getBattery' in navigator)) return;

    let batteryInstance: any;

    const updateBattery = (b: any) => {
      const level = Math.round(b.level * 100);
      setBattery({
        level,
        charging: b.charging,
        isLowBattery: level <= 20 && !b.charging,
      });
    };

    (navigator as any).getBattery().then((b: any) => {
      batteryInstance = b;
      updateBattery(b);
      b.addEventListener('levelchange', () => updateBattery(b));
      b.addEventListener('chargingchange', () => updateBattery(b));
    });

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener('levelchange', () => updateBattery(batteryInstance));
        batteryInstance.removeEventListener('chargingchange', () => updateBattery(batteryInstance));
      }
    };
  }, []);

  return battery;
}
