import { useRef, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { jsonRequest } from '../api/request';
import { DateImage, DateVideo } from '../components/DateMedia';
import { ErrorState, LoadingState } from '../components/ResourceState';
import { useDates } from '../hooks/useDates';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMediaPreview } from '../hooks/useMediaPreview';
import { useRequest } from '../hooks/useRequest';
import { DEFAULT_IMAGE, DEFAULT_VIDEO, resolveMedia } from '../lib/media';
import type { AsteroidDate, DraftDate } from '../types/date';

export function AddDatePage() {
  useDocumentTitle('Добавление');
  const navigate = useNavigate();
  const pageRef = useRef<HTMLElement | null>(null);
  const { data: savedDraft, loading, error: loadError, reload } = useDates<DraftDate | null>('/api/dates/draft');
  const [createdDraft, setCreatedDraft] = useState<DraftDate | null>(null);
  const [editing, setEditing] = useState(false);
  const draft = createdDraft ?? savedDraft;
  const [designation, setDesignation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [month, setMonth] = useState('5');
  const [day, setDay] = useState('12');
  const imagePreview = useMediaPreview(image, resolveMedia(draft?.imageUrl, DEFAULT_IMAGE));
  const videoPreview = useMediaPreview(video, resolveMedia(draft?.videoUrl, DEFAULT_VIDEO));
  const { run, pending, error } = useRequest();

  return <main className="form-page" id="main-content" ref={pageRef}>
    <header className="page-header"><h1>ДОБАВЛЕНИЕ</h1></header>
    {loading && <LoadingState />}
    {loadError && <ErrorState message={loadError} onRetry={reload} />}
    {!loading && !loadError && (!draft || editing) && <Form className="draft-form create-draft-form" onSubmit={async event => {
      event.preventDefault();
      if (pending) return;
      const form = new FormData();
      form.set('designation', designation);
      if (image) form.set('image', image);
      if (video) form.set('video', video);
      const result = await run<DraftDate>('/api/dates', { method: 'POST', body: form });
      if (result) { setCreatedDraft(result); setEditing(false); pageRef.current?.scrollTo({ top: 0 }); }
    }}>
      <section className="field-group media-fields"><h2>Фото объекта</h2><label className="upload-box"><DateImage src={imagePreview} alt="Фото астероида" /><strong>Выбрать фото</strong><input name="image" aria-label="Выбрать фото" className="file-control" type="file" accept="image/*" disabled={pending} onChange={event => setImage(event.target.files?.[0] ?? null)} /></label></section>
      <section className="field-group media-fields"><h2>Видео объекта</h2><label className="upload-box"><div className="upload-video"><DateVideo src={videoPreview} poster={imagePreview} designation="предпросмотр" ambient /></div><strong>Выбрать видео</strong><input name="video" aria-label="Выбрать видео" className="file-control" type="file" accept="video/*" disabled={pending} onChange={event => setVideo(event.target.files?.[0] ?? null)} /></label></section>
      <label className="field-block"><span>Название астероида</span><input name="designation" type="text" placeholder="Например: 2026 KJ" value={designation} maxLength={120} required disabled={pending} onChange={event => setDesignation(event.target.value)} /></label>
      <Button type="submit" className="primary-button" disabled={pending}>{pending ? 'Сохраняем…' : 'Далее'}</Button>
    </Form>}
    {!loading && !loadError && draft && !editing && <Form className="draft-form publish-draft-form" onSubmit={async event => {
      event.preventDefault();
      if (pending) return;
      const date = await run<AsteroidDate>('/api/dates/publish', jsonRequest('PUT', { shortDescription: description, approachMonth: Number(month), approachDay: Number(day) }));
      if (date) navigate('/dates/feed/' + date.id);
    }}>
      <section className="field-group media-fields"><h2>Фото объекта</h2><div className="upload-box readonly-media"><DateImage src={draft.imageUrl} alt={draft.designation} /></div></section>
      <section className="field-group media-fields"><h2>Видео объекта</h2><div className="upload-box readonly-media"><div className="upload-video"><DateVideo src={draft.videoUrl} poster={draft.imageUrl} designation={draft.designation} ambient /></div></div></section>
      <p className="draft-name">{draft.designation}</p>
      <label className="field-block compact-field"><span>Описание</span><textarea name="shortDescription" rows={4} value={description} maxLength={700} required disabled={pending} onChange={event => setDescription(event.target.value)} /></label>
      <div className="topic-fields"><label className="field-block"><span>Месяц сближения</span><input name="approachMonth" type="number" min={1} max={12} step={1} value={month} required disabled={pending} onChange={event => setMonth(event.target.value)} /></label><label className="field-block"><span>День сближения</span><input name="approachDay" type="number" min={1} max={31} step={1} value={day} required disabled={pending} onChange={event => setDay(event.target.value)} /></label></div>
      <Button type="submit" className="primary-button" disabled={pending}>{pending ? 'Публикуем…' : 'Опубликовать'}</Button>
      <button className="plain-link" type="button" disabled={pending} onClick={() => { setDesignation(draft.designation); setImage(null); setVideo(null); setEditing(true); pageRef.current?.scrollTo({ top: 0 }); }}>Изменить фото и название</button>
    </Form>}
    {error && <Alert variant="danger" role="alert" className="action-error">{error}</Alert>}
  </main>;
}
