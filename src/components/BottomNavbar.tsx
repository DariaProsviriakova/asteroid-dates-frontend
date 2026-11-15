import { Nav, Navbar } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiErrorMessage, apiStatus } from '../api/errors';
import { logoutObserver } from '../api/observers';
import { AUTH_STATUS, clearAuthError, requestFailed, requestStarted, signedOut } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/store';

export function BottomNavbar() {
  const isGuest = useAppSelector(state => state.auth.status === AUTH_STATUS.GUEST);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  async function logout() {
    dispatch(requestStarted('logout'));
    try {
      await logoutObserver();
    } catch (error) {
      if (apiStatus(error) !== 401) {
        dispatch(requestFailed(apiErrorMessage(error, 'Не удалось выйти. Попробуйте ещё раз.')));
        return;
      }
    }
    dispatch(signedOut());
    navigate('/dates', { replace: true });
  }

  return <Navbar className="tab-bar" aria-label="Основная навигация">
    <Nav.Link as={NavLink} to="/dates/feed" className="tab-link">Лента</Nav.Link>
    {isGuest
      ? <button type="button" disabled className="tab-link disabled" title="Войдите, чтобы добавить дату">Добавление</button>
      : <Nav.Link as={NavLink} to="/dates/add" className="tab-link">Добавление</Nav.Link>}
    <Nav.Link as={NavLink} to="/dates" end className="tab-link">Плитка</Nav.Link>
    {isGuest
      ? <Nav.Link as={NavLink} to="/login" className="tab-link" onClick={() => dispatch(clearAuthError())}>Вход</Nav.Link>
      : <button type="button" className="tab-link" onClick={logout}>Выход</button>}
  </Navbar>;
}
