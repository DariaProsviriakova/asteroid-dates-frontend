import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { AsteroidDate } from '../types/date';
import { formatApproach, formatDistance } from '../lib/format';
import { DateImage } from './DateMedia';
import { Icon } from './Icon';

export function DateCard({ date, index }: { date: AsteroidDate; index: number }) {
  return <Card as="article" className="date-card">
    <Link to={`/dates/${date.id}`} className="card-media" aria-label={`Подробнее о ${date.designation}`}>
      <DateImage src={date.imageUrl} alt={`Визуализация астероида ${date.designation}`} />
      <span className="card-index">{String(index + 1).padStart(2, '0')} / НАБЛЮДЕНИЕ</span>
      {!date.imageUrl?.trim() && <span className="fallback-label">Изображение по умолчанию</span>}
    </Link>
    <Card.Body>
      <div className="card-heading"><Card.Title as="h3"><Link to={`/dates/${date.id}`}>{date.designation}</Link></Card.Title><span className="date-year">2026</span></div>
      <div className="card-facts"><div><span>Дата сближения</span><strong>{formatApproach(date.approachDay, date.approachMonth)}</strong></div><div><span>Расстояние до Земли</span><strong>{formatDistance(date.minimumDistanceAu)}</strong></div></div>
      <div className="card-footer-row"><span className="likes" aria-label={`Лайков: ${date.likesCount}`}><Icon name="heart" size={17} />{date.likesCount}</span><Link className="card-open" to={`/dates/${date.id}`}>Подробнее<Icon name="arrow" size={18} /></Link></div>
    </Card.Body>
  </Card>;
}
