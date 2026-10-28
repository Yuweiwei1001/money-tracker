type WebStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const storage = (globalThis as unknown as { localStorage?: WebStorage })
  .localStorage;

export async function readStoredJson(key: string): Promise<string | null> {
  return storage?.getItem(key) ?? null;
}

export async function writeStoredJson(
  key: string,
  value: string
): Promise<void> {
  storage?.setItem(key, value);
}
