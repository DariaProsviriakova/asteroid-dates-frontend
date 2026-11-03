import { Nav, Navbar } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

export function BottomNavbar() {
  return <Navbar className="tab-bar" aria-label="Основная навигация">
    <Nav.Link as={NavLink} to="/dates/feed" className="tab-link">Лента</Nav.Link>
    <Nav.Link as="button" type="button" disabled className="tab-link" title="Добавление недоступно в гостевом режиме ЛР5">Добавление</Nav.Link>
    <Nav.Link as={NavLink} to="/dates" end className="tab-link">Плитка</Nav.Link>
    <Nav.Link as="button" type="button" disabled className="tab-link" title="Вход недоступен в ЛР5">Вход</Nav.Link>
  </Navbar>;
}
