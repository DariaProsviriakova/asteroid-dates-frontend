import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Дата не найдена');
  return <main className="form-page not-found-page" id="main-content"><h1>Эта дата не найдена</h1><p>Дата удалена или недоступна.</p></main>;
}
