const STORAGE_KEY = 'hospixo_kitchen_sound_enabled';
const LIVE_STORAGE_KEY = 'hospixo_kitchen_live_enabled';

export function readKitchenSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw == null) return true;
  return raw !== 'false';
}

export function writeKitchenSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
}

export function readKitchenLiveEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = window.localStorage.getItem(LIVE_STORAGE_KEY);
  if (raw == null) return true;
  return raw !== 'false';
}

export function writeKitchenLiveEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LIVE_STORAGE_KEY, enabled ? 'true' : 'false');
}

export function playKitchenAlertSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.15);
    void ctx.close();
  } catch {
    /* ignore audio failures */
  }
}
