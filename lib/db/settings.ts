import fs from 'node:fs/promises';
import path from 'node:path';

export type PlaybackRestrictionSettings = {
  enabled: boolean;
  allowedDomains: string[];
  allowNoReferrer: boolean;
  allowNoUserAgent: boolean;
  allowHighRiskUserAgent: boolean;
  restrictionId?: string;
};

const dataDir = path.join(process.cwd(), '.data');
const settingsFile = path.join(dataDir, 'settings.json');

async function ensureDir(): Promise<void> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {
    // ignore
  }
}

const defaultSettings: PlaybackRestrictionSettings = {
  enabled: false,
  allowedDomains: [],
  allowNoReferrer: false,
  allowNoUserAgent: true,
  allowHighRiskUserAgent: true,
};

export async function getPlaybackRestrictionSettings(): Promise<PlaybackRestrictionSettings> {
  try {
    const raw = await fs.readFile(settingsFile, 'utf8');
    const parsed = JSON.parse(raw) as {
      playbackRestriction?: PlaybackRestrictionSettings;
    };
    return { ...defaultSettings, ...(parsed.playbackRestriction ?? {}) };
  } catch {
    return { ...defaultSettings };
  }
}

export async function setPlaybackRestrictionSettings(
  value: PlaybackRestrictionSettings
): Promise<void> {
  await ensureDir();
  let current: Record<string, unknown> = {};
  try {
    const raw = await fs.readFile(settingsFile, 'utf8');
    current = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // ignore
  }
  const next = {
    ...current,
    playbackRestriction: value,
  };
  await fs.writeFile(settingsFile, JSON.stringify(next, null, 2), 'utf8');
}
