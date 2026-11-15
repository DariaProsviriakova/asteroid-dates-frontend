import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { AsteroidDate } from '../types/date';
import { formatApproach, formatDistance } from '../lib/format';
import { deleteAsteroidDate } from '../store/asteroidDatesThunks';
import { useAppDispatch, useAppSelector } from '../store/store';
import { DateImage } from './DateMedia';
import { DateLike } from './DateLike';

export function DateCard({ date }: { date: AsteroidDate }) {
  const isUser = useAppSelector(state => state.auth.status === 'creator');
  const dispatch = useAppDispatch();
  const canDelete = isUser && date.isCreator === 1;
  const href = '/dates/feed/' + date.id;
  return <Card as="article" className="asteroid-card" data-date-id={date.id} data-can-delete={canDelete}>
    <Link className="card-main" to={href} aria-label={'Открыть ленту для ' + date.designation}>
      <DateImage src={date.imageUrl} alt={date.designation} />
    </Link>
    <Card.Body>
      <Link className="card-object" to={href}>{date.designation}</Link>
      <span className="card-date">{formatApproach(date.approachDay, date.approachMonth)}</span>
      <strong>{formatDistance(date.minimumDistanceAu)}</strong>
      <div className="card-row">
        <DateLike date={date} />
        <button type="button" className="card-delete" disabled={!canDelete} aria-label={'Удалить ' + date.designation}
          title={canDelete ? 'Удалить дату' : 'Удаление доступно автору даты'}
          onClick={() => {
            if (window.confirm(`Удалить дату «${date.designation}»?`)) void dispatch(deleteAsteroidDate(date.id));
          }}>×</button>
      </div>
    </Card.Body>
  </Card>;
}
