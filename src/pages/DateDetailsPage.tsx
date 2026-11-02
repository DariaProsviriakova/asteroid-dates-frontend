import { useState } from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { DateImage, DateVideo } from '../components/DateMedia';
import { ErrorState, LoadingState } from '../components/ResourceState';
import { Icon } from '../components/Icon';
import { useDates } from '../hooks/useDates';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatApproach, formatDistance, formatKilometers } from '../lib/format';
import type { AsteroidDate } from '../types/date';
import { NotFoundPage } from './NotFoundPage';

export function DateDetailsPage() {
  const { id } = useParams();
  const { data, loading, error, reload } = useDates<AsteroidDate[]>('/api/dates');
  const date = data?.find(item => item.id === Number(id));
  const [media, setMedia] = useState<'image' | 'video'>('image');
  useDocumentTitle(date ? date.designation : 'Дата сближения');

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!date) return <NotFoundPage />;

  const fallback = media === 'image' ? !date.imageUrl?.trim() : !date.videoUrl?.trim();
  return <section className="details-section" aria-labelledby="detail-title">
    <div className="breadcrumbs"><Link to="/dates">Даты сближений</Link><Icon name="chevron" size={13} /><span>{date.designation}</span></div>
    <div className="details-layout"><div className="detail-media-column">
      <div className="detail-image-wrap">{media === 'image' ? <DateImage src={date.imageUrl} alt={`Визуализация астероида ${date.designation}`} loading="eager" /> : <DateVideo src={date.videoUrl} poster={date.imageUrl} designation={date.designation} />}</div>
      <div className="media-toolbar"><ButtonGroup aria-label="Вид медиа"><Button variant={media === 'image' ? 'primary' : 'outline-primary'} onClick={() => setMedia('image')} aria-pressed={media === 'image'}><Icon name="image" size={17} />Изображение</Button><Button variant={media === 'video' ? 'primary' : 'outline-primary'} onClick={() => setMedia('video')} aria-pressed={media === 'video'}><Icon name="play" size={16} />Видео</Button></ButtonGroup><span>Визуализация</span></div>
      {fallback && <p className="default-media-note" role="status">{media === 'image' ? 'Изображение' : 'Видео'} не добавлено. Показано {media === 'image' ? 'изображение' : 'видео'} по умолчанию из проекта.</p>}
    </div><div className="detail-copy"><p className="eyebrow dark">КАРТОЧКА НАБЛЮДЕНИЯ / 2026</p><h1 id="detail-title">{date.designation}</h1><span className="published-label"><i />Опубликовано</span><p className="detail-description">{date.shortDescription}</p><dl className="detail-facts"><div><dt>Дата сближения</dt><dd>{formatApproach(date.approachDay, date.approachMonth)} 2026</dd></div><div><dt>Минимальное расстояние</dt><dd>{formatDistance(date.minimumDistanceAu)}<small>{formatKilometers(date.minimumDistanceAu)}</small></dd></div></dl><div className="detail-likes"><Icon name="heart" size={19} /><span>{date.likesCount} отметок «Нравится»</span><span className="guest-note">Просмотр для гостя</span></div><Link className="detail-feed-button btn btn-primary" to={`/feed?id=${date.id}`}>Смотреть в ленте<Icon name="arrow" size={19} /></Link><p className="detail-disclaimer">Учебные данные. Изображения и видео — иллюстрации сближения.</p></div></div>
  </section>;
}
