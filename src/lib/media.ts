import { IS_PAGES } from '../deployment';

export const DEFAULT_IMAGE = import.meta.env.BASE_URL + 'media/default-date.png';
export const DEFAULT_VIDEO = import.meta.env.BASE_URL + 'media/default-date.mp4';

export function resolveMedia(url: string | null | undefined, fallback: string): string {
  if (IS_PAGES) return fallback;
  const value = url?.trim();
  if (!value) return fallback;

  const minioBase = (import.meta.env.VITE_MINIO_PUBLIC_BASE_URL || 'http://localhost:9000').replace(/\/+$/, '');
  for (const base of [minioBase, 'http://localhost:9000', 'http://127.0.0.1:9000']) {
    if (value.startsWith(base + '/')) return '/s3' + value.slice(base.length);
  }
  return value;
}
