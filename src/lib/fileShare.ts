import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

type WebDocument = {
  createElement(tag: string): {
    href: string;
    download: string;
    click(): void;
  };
};

type WebGlobal = {
  Blob: new (parts: string[], options: { type: string }) => unknown;
  URL: {
    createObjectURL(blob: unknown): string;
    revokeObjectURL(url: string): void;
  };
  document: WebDocument;
};

export async function shareTextFile(
  filename: string,
  content: string,
  mimeType: string,
  dialogTitle: string
): Promise<void> {
  if (Platform.OS === 'web') {
    const web = globalThis as unknown as WebGlobal;
    const blob = new web.Blob([content], { type: mimeType });
    const url = web.URL.createObjectURL(blob);
    const link = web.document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    web.URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true, intermediates: true });
  await file.write(content);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('当前设备不支持系统分享。');
  }
  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle });
}
