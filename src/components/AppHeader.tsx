import { Badge, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export function AppHeader() {
  return <header className="app-header">
    <Container className="header-inner">
      <Link className="brand" to="/dates" aria-label="Asteroid Dates — каталог">
        <span className="brand-symbol"><Icon name="orbit" size={32} /></span>
        <span>ASTEROID<span className="brand-light">DATES</span></span>
      </Link>
      <span className="header-caption">КАТАЛОГ СБЛИЖЕНИЙ С ЗЕМЛЁЙ</span>
      <div className="header-meta"><span className="demo-label"><i />Демо-каталог</span><Badge className="guest-badge" bg="light" text="dark"><Icon name="user" size={15} /> Гость</Badge></div>
    </Container>
  </header>;
}
