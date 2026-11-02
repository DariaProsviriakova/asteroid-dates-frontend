import { useEffect, useState } from 'react';
import { DEFAULT_IMAGE, DEFAULT_VIDEO, resolveMedia } from '../lib/media';

interface DateImageProps { src: string | null; alt: string; className?: string; loading?: 'lazy' | 'eager' }

export function DateImage({ src, alt, className = '', loading = 'lazy' }: DateImageProps) {
  const original = resolveMedia(src, DEFAULT_IMAGE);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return <img
    src={failed ? DEFAULT_IMAGE : original}
    alt={alt} className={className} loading={loading}
    data-default={failed || original === DEFAULT_IMAGE}
    onError={event => {
      if (failed || original === DEFAULT_IMAGE) event.currentTarget.onerror = null;
      else setFailed(true);
    }}
  />;
}

interface DateVideoProps {
  src: string | null;
  poster: string | null;
  designation: string;
  ambient?: boolean;
}

export function DateVideo({ src, poster, designation, ambient = false }: DateVideoProps) {
  const original = resolveMedia(src, DEFAULT_VIDEO);
  const [failed, setFailed] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => { setFailed(false); setUnavailable(false); }, [src]);
  const selected = failed ? DEFAULT_VIDEO : original;

  if (unavailable) return <div className="media-unavailable"><DateImage src={poster} alt={`Астероид ${designation}`} /><span>Видео недоступно. Показано изображение.</span></div>;

  return <video
    key={selected} className="date-video"
    src={selected} poster={resolveMedia(poster, DEFAULT_IMAGE)}
    autoPlay={ambient} muted={ambient} loop={ambient} playsInline
    controls={!ambient} preload={ambient ? 'auto' : 'metadata'}
    data-default={selected === DEFAULT_VIDEO}
    aria-label={`Видео астероида ${designation}`}
    onError={() => selected === DEFAULT_VIDEO ? setUnavailable(true) : setFailed(true)}
  >Ваш браузер не поддерживает видео.</video>;
}
