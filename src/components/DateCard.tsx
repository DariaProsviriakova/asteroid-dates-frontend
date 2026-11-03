import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { AsteroidDate } from '../types/date';
import { formatApproach, formatDistance } from '../lib/format';
import { DateImage } from './DateMedia';

export function DateCard({ date }: { date: AsteroidDate }) {
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
        <span className="card-like" aria-label={'Лайков: ' + date.likesCount}><span className="card-heart">♡</span><span>{date.likesCount}</span></span>
        <button type="button" className="card-delete" disabled aria-label={'Удалить ' + date.designation} title="Удаление недоступно гостю">×</button>
      </div>
    </Card.Body>
  </Card>;
}
