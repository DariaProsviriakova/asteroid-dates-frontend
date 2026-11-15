import { Alert, Button, Spinner } from 'react-bootstrap';

export function LoadingState() {
  return <div className="resource-state" role="status"><Spinner animation="border" size="sm" /><span>Выполняем запрос…</span></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Alert variant="danger" className="error-state"><h2>Не удалось загрузить данные</h2><p>{message}</p><Button variant="outline-danger" onClick={onRetry}>Повторить</Button></Alert>;
}
