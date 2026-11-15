import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DateImage, DateVideo } from '../components/DateMedia';
import { ErrorState } from '../components/ResourceState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { clearDateActionError } from '../store/asteroidDatesSlice';
import { loadAsteroidDateDraft, publishAsteroidDate, saveAsteroidDateDraft } from '../store/asteroidDatesThunks';
import { useAppDispatch, useAppSelector } from '../store/store';

const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

function useFilePreview(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const preview = file ? URL.createObjectURL(file) : null;
    setUrl(preview);
    if (preview) return () => URL.revokeObjectURL(preview);
  }, [file]);

  return url;
}

interface MediaFieldProps {
  title: string;
  children: ReactNode;
  control?: ReactNode;
}

function MediaField({ title, children, control }: MediaFieldProps) {
  return <section className="field-group media-fields">
    <h2>{title}</h2>
    {control ? <label className="upload-box">{children}{control}</label>
      : <div className="upload-box readonly-media">{children}</div>}
  </section>;
}

export function AddDatePage() {
  useDocumentTitle('Добавление');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLElement>(null);
  const { data: draft, error, status } = useAppSelector(state => state.dates.draft);
  const [revision, refresh] = useState(0);
  const [editingDraft, setEditingDraft] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const imagePreview = useFilePreview(imageFile);
  const videoPreview = useFilePreview(videoFile);
  const showPublishStep = draft !== null && !editingDraft;

  useEffect(() => {
    const request = dispatch(loadAsteroidDateDraft());
    return () => request.abort();
  }, [dispatch, revision]);

  useEffect(() => { pageRef.current?.scrollTo(0, 0); }, [showPublishStep]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const designation = String(data.get('designation') ?? '').trim();
    setFormError(null);
    if (!designation) return setFormError('Введите название астероида.');
    if ([imageFile, videoFile].some(file => file && file.size > MAX_MEDIA_BYTES)) {
      return setFormError('Каждый файл должен быть не больше 50 МБ.');
    }
    const result = await dispatch(saveAsteroidDateDraft({ designation,
      ...(imageFile ? { image: imageFile } : {}),
      ...(videoFile ? { video: videoFile } : {}),
    }));
    if (saveAsteroidDateDraft.fulfilled.match(result)) {
      setImageFile(null);
      setVideoFile(null);
      setEditingDraft(false);
    }
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const shortDescription = String(data.get('shortDescription') ?? '').trim();
    const approachMonth = Number(data.get('approachMonth'));
    const approachDay = Number(data.get('approachDay'));
    const distance = String(data.get('minimumDistanceAu') ?? '');
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

  function editDraft() {
    setFormError(null);
    dispatch(clearDateActionError());
    setEditingDraft(true);
  }

  return <main className="form-page add-date-page" id="main-content" ref={pageRef}>
    <header className="page-header"><h1>ДОБАВЛЕНИЕ</h1></header>
    {error && <ErrorState message={error} onRetry={() => refresh(previous => previous + 1)} />}
    {status === 'succeeded' && <>
      {formError && <Alert variant="danger">{formError}</Alert>}
      {!showPublishStep && <form className="draft-form create-draft-form" aria-label="Фото, видео и название" onSubmit={save}>
        <MediaField title="Фото объекта" control={<>
          <strong>Выбрать фото</strong>
          <input className="file-control" type="file" aria-label="Выбрать фото" accept="image/png,image/jpeg,image/gif,image/webp" onChange={event => setImageFile(event.target.files?.[0] ?? null)} />
        </>}>
          <DateImage src={imagePreview ?? draft?.imageUrl ?? null} alt="Фото астероида" loading="eager" />
        </MediaField>
        <MediaField title="Видео объекта" control={<>
          <strong>Выбрать видео</strong>
          <input className="file-control" type="file" aria-label="Выбрать видео" accept="video/mp4,video/webm,video/quicktime" onChange={event => setVideoFile(event.target.files?.[0] ?? null)} />
        </>}>
          <DateVideo src={videoPreview ?? draft?.videoUrl ?? null} poster={imagePreview ?? draft?.imageUrl ?? null}
            designation={draft?.designation ?? 'из формы добавления'} className="upload-video" ambient />
        </MediaField>
        <label className="field-block">
          <span>Название астероида</span>
          <input name="designation" defaultValue={draft?.designation} maxLength={120} required placeholder="Например: 2026 KJ" />
        </label>
        <Button type="submit" className="primary-button">Далее</Button>
      </form>}
      {draft && <form key={draft.id} hidden={!showPublishStep} className="draft-form publish-draft-form" aria-label="Публикация даты" onSubmit={publish}>
        <MediaField title="Фото объекта"><DateImage src={draft.imageUrl} alt={draft.designation} loading="eager" /></MediaField>
        <MediaField title="Видео объекта">
          <DateVideo src={draft.videoUrl} poster={draft.imageUrl} designation={draft.designation} className="upload-video" ambient />
        </MediaField>
        <p className="draft-name">{draft.designation}</p>
        <label className="field-block compact-field">
          <span>Описание</span>
          <textarea name="shortDescription" rows={4} defaultValue={draft.shortDescription ?? ''} required maxLength={700} />
        </label>
        <div className="topic-fields">
          <label className="field-block">
            <span>Месяц сближения</span>
            <input name="approachMonth" type="number" min={1} max={12} step={1} defaultValue={draft.approachMonth ?? undefined} placeholder="5" required />
          </label>
          <label className="field-block">
            <span>День сближения</span>
            <input name="approachDay" type="number" min={1} max={31} step={1} defaultValue={draft.approachDay ?? undefined} placeholder="12" required />
          </label>
        </div>
        <label className="field-block">
          <span>Минимальное расстояние, а.е.</span>
          <input name="minimumDistanceAu" type="number" min="0.00001" max="999.99999" step="0.00001" defaultValue={draft.minimumDistanceAu ?? undefined} />
        </label>
        <Button type="submit" className="primary-button">Опубликовать</Button>
        <button type="button" className="return-to-draft" onClick={editDraft}>Назад</button>
      </form>}
    </>}
  </main>;
}
