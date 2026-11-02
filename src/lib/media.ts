export const DEFAULT_IMAGE = '/media/default-date.png';
export const DEFAULT_VIDEO = '/media/default-date.mp4';

/** null, пустая строка и пробелы означают отсутствие медиа. */
export function resolveMedia(url: string | null | undefined, fallback: string): string {
  return url?.trim() || fallback;
}
