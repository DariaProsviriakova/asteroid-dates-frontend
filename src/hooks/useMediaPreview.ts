import { useEffect, useState } from 'react';

export function useMediaPreview(file: File | null, fallback: string): string {
  const [url, setUrl] = useState(fallback);
  useEffect(() => {
    if (!file) { setUrl(fallback); return; }
    const selected = URL.createObjectURL(file);
    setUrl(selected);
    return () => URL.revokeObjectURL(selected);
  }, [file, fallback]);
  return url;
}
