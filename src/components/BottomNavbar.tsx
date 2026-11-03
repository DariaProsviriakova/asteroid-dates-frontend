import { Nav, Navbar } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';

export function BottomNavbar() {
  const { pathname } = useLocation();
  return <Navbar className="tab-bar" aria-label="Основная навигация">
    <Nav.Link as={NavLink} to="/dates/feed" className="tab-link">Лента</Nav.Link>
    <Nav.Link as={NavLink} to="/dates/add" className="tab-link">Добавление</Nav.Link>
    <Nav.Link as={NavLink} to="/dates" end className="tab-link">Плитка</Nav.Link>
    <Nav.Link as={NavLink} to="/login" className={pathname === '/register' ? 'tab-link active' : 'tab-link'}>Вход</Nav.Link>
  </Navbar>;
}
