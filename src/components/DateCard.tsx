import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { AsteroidDate } from '../types/date';
import { formatApproach, formatDistance } from '../lib/format';
import { DateImage } from './DateMedia';

interface DateCardProps {
  date: AsteroidDate;
  pending: boolean;
  onDelete: (date: AsteroidDate) => void;
  onLike: (date: AsteroidDate) => void;
}

export function DateCard({ date, pending, onDelete, onLike }: DateCardProps) {
  const href = '/dates/feed/' + date.id;
  return <Card as="article" className="asteroid-card" data-date-id={date.id}>
    <Link className="card-main" to={href} aria-label={'Открыть ленту для ' + date.designation}>
      <DateImage src={date.imageUrl} alt={date.designation} />
    </Link>
    <Card.Body>
      <Link className="card-object" to={href}>{date.designation}</Link>
      <span className="card-date">{formatApproach(date.approachDay, date.approachMonth)}</span>
      <strong>{formatDistance(date.minimumDistanceAu)}</strong>
      <div className="card-row">
        <button className="card-like" type="button" aria-label={'Нравится ' + date.designation} aria-pressed={Boolean(date.isLiked)} disabled={pending} onClick={() => onLike(date)}><span className="card-heart">{date.isLiked ? '♥' : '♡'}</span><span>{date.likesCount}</span></button>
        <form onSubmit={event => { event.preventDefault(); onDelete(date); }}><button type="submit" className="card-delete" disabled={pending} aria-label={'Удалить ' + date.designation}>×</button></form>
      </div>
    </Card.Body>
  </Card>;
}
