import { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { BottomNavbar } from './components/BottomNavbar';
import { NotFoundState } from './components/NotFoundState';
import { LoadingState } from './components/ResourceState';
import { AddDatePage } from './pages/AddDatePage';
import { DatesPage } from './pages/DatesPage';
import { FeedPage } from './pages/FeedPage';
import { LoginPage } from './pages/LoginPage';
import { clearDateActionError } from './store/asteroidDatesSlice';
import { AUTH_STATUS, clearAuthError } from './store/authSlice';
import { selectBusy, useAppDispatch, useAppSelector } from './store/store';

function FeedAlias() {
  const { search } = useLocation();
  return <Navigate to={'/dates/feed' + search} replace />;
}

function DateAlias() {
  const { id } = useParams();
  const { search } = useLocation();
  return <Navigate to={'/dates/feed/' + id + search} replace />;
}

function ProtectedAddDate() {
  const isGuest = useAppSelector(state => state.auth.status === AUTH_STATUS.GUEST);
  return isGuest ? <Navigate to="/login" state={{ fromAdd: true }} replace /> : <AddDatePage />;
}

export function App() {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const busy = useAppSelector(selectBusy);
  const authError = useAppSelector(state => state.auth.error);
  const mutationError = useAppSelector(state => state.dates.mutation.error);
  const showAuthError = authError && pathname !== '/login';

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(clearDateActionError());
  }, [dispatch, pathname]);

  return <div className="app-shell">
    <div className="app-content" inert={busy} aria-busy={busy}>
      <a className="skip-link" href="#main-content">К содержимому</a>
      <Routes>
        <Route path="/" element={<Navigate to="/dates" replace />} />
        <Route path="/dates" element={<DatesPage />} />
        <Route path="/dates/add" element={<ProtectedAddDate />} />
        <Route path="/dates/feed" element={<FeedPage />} />
        <Route path="/dates/feed/:id" element={<FeedPage />} />
        <Route path="/feed" element={<FeedAlias />} />
        <Route path="/dates/:id" element={<DateAlias />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundState />} />
      </Routes>
      <BottomNavbar />
      {(mutationError || showAuthError) && <Alert className="app-request-error" variant="danger" dismissible onClose={() => {
        dispatch(clearDateActionError());
        dispatch(clearAuthError());
      }}>{mutationError || showAuthError}</Alert>}
    </div>
    {busy && <div className="request-overlay"><LoadingState /></div>}
  </div>;
}
