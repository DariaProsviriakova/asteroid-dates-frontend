import { Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from './Icon';

export function BottomNavbar() {
  const { pathname } = useLocation();
  return <Navbar fixed="bottom" className="bottom-navbar" aria-label="Основная навигация">
    <Container>
      <span className="nav-wordmark"><Icon name="orbit" size={19} /> Небо ближе, чем кажется.</span>
      <Nav className="bottom-nav">
        <Nav.Link as={NavLink} to="/feed" className="bottom-link"><Icon name="feed" /><span>Лента</span></Nav.Link>
        <Nav.Link as="button" type="button" disabled className="bottom-link" title="Добавление недоступно гостю"><Icon name="plus" /><span>Добавление</span></Nav.Link>
        <Nav.Link as={NavLink} to="/dates" className={`bottom-link${pathname.startsWith('/dates/') ? ' active' : ''}`}><Icon name="grid" /><span>Плитка</span></Nav.Link>
        <Nav.Link as="button" type="button" disabled className="bottom-link" title="Вход недоступен в лабораторной №5"><Icon name="user" /><span>Вход</span></Nav.Link>
      </Nav>
      <span className="nav-year">ASTEROID DATES / 2026</span>
    </Container>
  </Navbar>;
}
