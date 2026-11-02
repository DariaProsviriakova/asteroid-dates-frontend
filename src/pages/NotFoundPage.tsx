import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';

export function NotFoundPage() {
  return <section className="empty-state not-found"><Icon name="orbit" size={48} /><p className="eyebrow dark">ВНЕ ОРБИТЫ / 404</p><h1>Эта дата не найдена</h1><p>Вернитесь в каталог, чтобы выбрать другое наблюдение.</p><Link className="btn btn-primary" to="/dates">К датам сближений</Link></section>;
}
