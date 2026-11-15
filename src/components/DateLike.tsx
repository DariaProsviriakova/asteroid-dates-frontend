import { setAsteroidDateLike } from '../store/asteroidDatesThunks';
import { useAppDispatch, useAppSelector } from '../store/store';
import type { AsteroidDate } from '../types/date';

export function DateLike({ date, inFeed = false }: { date: AsteroidDate; inFeed?: boolean }) {
  const isUser = useAppSelector(state => state.auth.status === 'authenticated');
  const dispatch = useAppDispatch();
  const liked = isUser && date.isLiked === 1;
  const className = inFeed ? 'like-stack' : 'card-like';
  const contents = <>
    <span aria-hidden="true" className={inFeed ? 'heart-icon' : 'card-heart'}>{liked ? '♥' : '♡'}</span>
    <span className={inFeed ? 'like-count' : undefined}>{date.likesCount}</span>
  </>;
  if (!isUser) return <span className={className} aria-label={`Лайков: ${date.likesCount}`}>{contents}</span>;
  return <button type="button" className={`${className} like-button`} aria-pressed={liked}
    aria-label={`${liked ? 'Снять лайк' : 'Поставить лайк'}: ${date.designation}, лайков ${date.likesCount}`}
    onClick={() => void dispatch(setAsteroidDateLike({ id: date.id, like: liked ? 0 : 1 }))}>{contents}</button>;
}
