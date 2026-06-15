// Encrypted local backup + restore for For Once.
// Everything stays on-device. Backups are encrypted with a passphrase the
// user chooses, using AES-GCM with a PBKDF2-derived key (Web Crypto).

// All localStorage keys that hold the user's space.
export const BACKUP_KEYS = [
  "foronce.profile",
  "foronce.journal",
  "foronce.community",
  "foronce.hearted",
  "foronce.gratitude",
  "foronce.jar",
  "foronce.celebrate",
  "foronce.itwasreal",
  "foronce.itwasreturned",
  "foronce.songs",
] as const;

const MAGIC = "foronce-backup";
const VERSION = 1;
const PBKDF2_ITERATIONS = 250_000;

export interface BackupFile {
  magic: typeof MAGIC;
  version: number;
  createdAt: number;
  salt: string; // base64
  iv: string; // base64
  cipher: string; // base64
}

const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, salt: BufferSource): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// Snapshot every backup key currently in localStorage.
export function collectData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const key of BACKUP_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw != null) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }
  return data;
}

export async function createBackup(passphrase: string): Promise<BackupFile> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const plaintext = enc.encode(JSON.stringify(collectData()));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    magic: MAGIC,
    version: VERSION,
    createdAt: Date.now(),
    salt: toBase64(salt),
    iv: toBase64(iv),
    cipher: toBase64(new Uint8Array(cipher)),
  };
}

function isBackupFile(value: unknown): value is BackupFile {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.magic === MAGIC &&
    typeof v.salt === "string" &&
    typeof v.iv === "string" &&
    typeof v.cipher === "string"
  );
}

export async function decryptBackup(
  file: unknown,
  passphrase: string,
): Promise<Record<string, unknown>> {
  if (!isBackupFile(file)) {
    throw new Error("This doesn't look like a For Once backup file.");
  }
  const key = await deriveKey(passphrase, fromBase64(file.salt));
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(file.iv) },
      key,
      fromBase64(file.cipher),
    );
  } catch {
    throw new Error("Wrong passphrase, or the file is damaged.");
  }
  return JSON.parse(dec.decode(plaintext)) as Record<string, unknown>;
}

// Write restored data back into localStorage and notify the app.
export function applyRestore(data: Record<string, unknown>) {
  for (const key of BACKUP_KEYS) {
    if (key in data) {
      window.localStorage.setItem(key, JSON.stringify(data[key]));
      window.dispatchEvent(new StorageEvent("storage", { key }));
    }
  }
}

export function backupFilename(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `for-once-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.foronce`;
}
