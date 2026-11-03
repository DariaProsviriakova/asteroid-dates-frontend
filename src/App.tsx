import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { BottomNavbar } from './components/BottomNavbar';
import { DatesPage } from './pages/DatesPage';
import { FeedPage } from './pages/FeedPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { LoginPage } from './pages/LoginPage';
import { AddDatePage } from './pages/AddDatePage';
import { NotFoundPage } from './pages/NotFoundPage';

function FeedAlias() {
  const { search } = useLocation();
  return <Navigate to={'/dates/feed' + search} replace />;
}

function DateAlias() {
  const { id } = useParams();
  const { search } = useLocation();
  return <Navigate to={'/dates/feed/' + id + search} replace />;
}

export function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">К содержимому</a>
    <Routes>
      <Route path="/" element={<Navigate to="/dates" replace />} />
      <Route path="/dates" element={<DatesPage />} />
      <Route path="/dates/add" element={<AddDatePage />} />
      <Route path="/dates/feed" element={<FeedPage />} />
      <Route path="/dates/feed/:id" element={<FeedPage />} />
      <Route path="/feed" element={<FeedAlias />} />
      <Route path="/dates/:id" element={<DateAlias />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <BottomNavbar />
  </div>;
}
