import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { BottomNavbar } from './components/BottomNavbar';
import { DatesPage } from './pages/DatesPage';
import { FeedPage } from './pages/FeedPage';
import { DateDetailsPage } from './pages/DateDetailsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);

  return <>
    <a className="skip-link" href="#main-content">К содержимому</a>
    <AppHeader />
    <Container as="main" id="main-content" className="main-content">
      <Routes>
        <Route path="/" element={<Navigate to="/dates" replace />} />
        <Route path="/dates" element={<DatesPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/dates/:id" element={<DateDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Container>
    <BottomNavbar />
  </>;
}
