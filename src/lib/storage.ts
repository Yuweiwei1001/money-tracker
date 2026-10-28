import Storage from 'expo-sqlite/kv-store';

export async function readStoredJson(key: string): Promise<string | null> {
  return Storage.getItem(key);
}

export async function writeStoredJson(
  key: string,
  value: string
): Promise<void> {
  await Storage.setItem(key, value);
}
