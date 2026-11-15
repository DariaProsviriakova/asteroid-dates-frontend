import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DateImage } from '../components/DateMedia';
import { ErrorState } from '../components/ResourceState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { loadAsteroidDateDraft, publishAsteroidDate, saveAsteroidDateDraft } from '../store/asteroidDatesThunks';
import { useAppDispatch, useAppSelector } from '../store/store';

const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

export function AddDatePage() {
  useDocumentTitle('Добавление даты');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: draft, error, status } = useAppSelector(state => state.dates.draft);
  const [revision, refresh] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const request = dispatch(loadAsteroidDateDraft());
    return () => request.abort();
  }, [dispatch, revision]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const designation = String(data.get('designation') ?? '').trim();
    const image = data.get('image');
    const video = data.get('video');
    setNotice(null);
    setFormError(null);
    if (!designation) return setFormError('Введите обозначение астероида.');
    if ([image, video].some(file => file instanceof File && file.size > MAX_MEDIA_BYTES)) {
      return setFormError('Каждый файл должен быть не больше 50 МБ.');
    }
    const result = await dispatch(saveAsteroidDateDraft({ designation,
      ...(image instanceof File && image.name ? { image } : {}),
      ...(video instanceof File && video.name ? { video } : {}),
    }));
    if (saveAsteroidDateDraft.fulfilled.match(result)) {
      form.reset();
      setNotice('Черновик сохранён. Заполните параметры сближения и опубликуйте дату.');
    }
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const shortDescription = String(data.get('shortDescription') ?? '').trim();
    const approachMonth = Number(data.get('approachMonth'));
    const approachDay = Number(data.get('approachDay'));
    const distance = String(data.get('minimumDistanceAu') ?? '');
    setNotice(null);
    setFormError(null);
    if (!shortDescription) return setFormError('Введите описание сближения.');
    if (new Date(Date.UTC(2026, approachMonth - 1, approachDay)).getUTCMonth() + 1 !== approachMonth) {
      return setFormError('Проверьте месяц и день сближения.');
    }
    const result = await dispatch(publishAsteroidDate({ shortDescription, approachMonth, approachDay,
      ...(distance === '' ? {} : { minimumDistanceAu: Number(distance) }),
    }));
    if (publishAsteroidDate.fulfilled.match(result)) navigate(`/dates/feed/${result.payload.id}`, { replace: true });
  }

  return <main className="form-page add-date-page" id="main-content">
    <header className="page-header"><h1>ДОБАВЛЕНИЕ ДАТЫ</h1></header>
    {error && <ErrorState message={error} onRetry={() => refresh(previous => previous + 1)} />}
    {status === 'succeeded' && <>
      <p className="form-intro">Сохраните черновик. Карточка появится в плитке и ленте после публикации.</p>
      {formError && <Alert variant="danger">{formError}</Alert>}
      {notice && <Alert variant="success" role="status">{notice}</Alert>}
      <Form key={`${draft?.id ?? 'new'}:${draft?.designation ?? ''}`} className="observer-form draft-form" onSubmit={save}>
        <h2>{draft ? `Черновик: ${draft.designation}` : 'Новый черновик'}</h2>
        {draft && <DateImage src={draft.imageUrl} alt={draft.designation} className="draft-thumbnail" />}
        <Form.Group controlId="date-designation" className="field-block">
          <Form.Label>Обозначение астероида</Form.Label>
          <Form.Control name="designation" defaultValue={draft?.designation} maxLength={120} required placeholder="2026 LAB6" />
        </Form.Group>
        <div className="date-form-columns">
          <Form.Group controlId="date-image" className="field-block">
            <Form.Label>Изображение</Form.Label>
            <Form.Control name="image" type="file" accept="image/png,image/jpeg,image/gif,image/webp" />
          </Form.Group>
          <Form.Group controlId="date-video" className="field-block">
            <Form.Label>Видео</Form.Label>
            <Form.Control name="video" type="file" accept="video/mp4,video/webm,video/quicktime" />
          </Form.Group>
        </div>
        <Form.Text>Файлы необязательны, до 50 МБ каждый.</Form.Text>
        <Button type="submit" className="primary-button">Сохранить черновик</Button>
      </Form>
      {draft && <Form key={draft.id} className="observer-form publish-form" onSubmit={publish}>
        <h2>Публикация</h2>
        <Form.Group controlId="date-description" className="field-block">
          <Form.Label>Краткое описание</Form.Label>
          <Form.Control as="textarea" rows={3} name="shortDescription" defaultValue={draft.shortDescription ?? ''} required maxLength={700} />
        </Form.Group>
        <div className="date-form-columns">
          <Form.Group controlId="date-day" className="field-block">
            <Form.Label>День</Form.Label>
            <Form.Control name="approachDay" type="number" min={1} max={31} step={1} defaultValue={draft.approachDay ?? undefined} required />
          </Form.Group>
          <Form.Group controlId="date-month" className="field-block">
            <Form.Label>Месяц</Form.Label>
            <Form.Control name="approachMonth" type="number" min={1} max={12} step={1} defaultValue={draft.approachMonth ?? undefined} required />
          </Form.Group>
        </div>
        <Form.Group controlId="date-distance" className="field-block">
          <Form.Label>Минимальное расстояние, а.е.</Form.Label>
          <Form.Control name="minimumDistanceAu" type="number" min="0.00001" max="999.99999" step="0.00001" defaultValue={draft.minimumDistanceAu ?? undefined} />
        </Form.Group>
        <Button type="submit" className="primary-button">Опубликовать дату</Button>
      </Form>}
    </>}
  </main>;
}
