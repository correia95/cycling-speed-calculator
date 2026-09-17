export type Mode = 'time' | 'distance' | 'speed';
export type SpeedUnit = 'kmh' | 'mph';

export function distanceFromSpeedTime(speed: number, timeHours: number): number {
  return speed * timeHours;
}

export function speedFromDistanceTime(distance: number, timeHours: number): number | null {
  if (timeHours <= 0) return null;
  return distance / timeHours;
}

export function timeHoursFromDistanceSpeed(distance: number, speed: number): number | null {
  if (speed <= 0) return null;
  return distance / speed;
}

export function parseDuration(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;
  const parts = trimmed.split(':');
  if (parts.length === 1) {
    const plain = Number(trimmed);
    return !Number.isNaN(plain) && plain >= 0 ? plain : null;
  }
  if (parts.length > 3) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => Number.isNaN(n))) return null;
  if (nums.length === 3) {
    const [h, m, s] = nums;
    if (m >= 60 || s >= 60) return null;
    return h * 3600 + m * 60 + s;
  }
  const [h, m] = nums;
  if (m >= 60) return null;
  return h * 3600 + m * 60;
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.round((totalSeconds % 3600) / 60);
  return `${hours}:${mins.toString().padStart(2, '0')}`;
}

export interface State {
  mode: Mode;
  unit: SpeedUnit;
  speed: number;
  distance: number;
  timeSeconds: number;
}

function toUint8Array(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function toBase64Url(text: string): string {
  const bytes = toUint8Array(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(encoded: string): string {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeState(state: State): URLSearchParams {
  const params = new URLSearchParams();
  params.set('d', toBase64Url(JSON.stringify(state)));
  return params;
}

export function decodeState(params: URLSearchParams, fallback: State): State {
  const raw = params.get('d');
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(fromBase64Url(raw));
    if (typeof parsed !== 'object' || parsed === null || typeof parsed.speed !== 'number') {
      return fallback;
    }
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}
