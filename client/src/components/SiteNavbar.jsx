import { useEffect, useState } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useUI } from '../context/UIContext';
import { CATEGORIES } from '../utils';

export default function SiteNavbar() {
    const { user } = useAuth();
    const { count } = useCart();
    const { openLogin, openProfile, openSell } = useUI();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState(false);

    // Keep the search box in sync with /search?q=… and collapse the mobile menu on navigation.
    useEffect(() => {
        setQuery(location.pathname === '/search' ? searchParams.get('q') || '' : '');
        setExpanded(false);
    }, [location.pathname, searchParams]);

    function handleSearch(e) {
        e.preventDefault();
        const q = query.trim();
        if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    }

    const categoryActive = location.pathname.startsWith('/category/');

    return (
        <header>
            <Navbar expand="lg" bg="light" fixed="top" className="shadow-sm" expanded={expanded} onToggle={setExpanded}>
                <Container>
                    <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
                        <i className="fas fa-graduation-cap" /> Student MarketPlace
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarContent" />
                    <Navbar.Collapse id="navbarContent">
                        <Nav className="me-auto mb-2 mb-lg-0">
                            <Nav.Link as={NavLink} to="/" end>Home</Nav.Link>
                            <NavDropdown title="Categories" id="categoriesDropdown" active={categoryActive}>
                                {CATEGORIES.map((c) => (
                                    <NavDropdown.Item as={Link} key={c.slug} to={`/category/${c.slug}`}>
                                        {c.label}
                                    </NavDropdown.Item>
                                ))}
                            </NavDropdown>
                            <Nav.Link as="button" type="button" className="btn btn-link text-start" onClick={() => { setExpanded(false); openSell(); }}>
                                Sell Items
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/contact">Contact Us</Nav.Link>
                        </Nav>
                        <form className="d-flex me-lg-2 mb-2 mb-lg-0" role="search" onSubmit={handleSearch}>
                            <div className="input-group">
                                <input
                                    className="form-control"
                                    type="search"
                                    placeholder="Search products..."
                                    aria-label="Search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button className="btn btn-outline-primary" type="submit" aria-label="Search">
                                    <i className="fas fa-search" />
                                </button>
                            </div>
                        </form>
                        <div className="d-flex">
                            {user ? (
                                <button type="button" className="btn btn-outline-secondary me-2" onClick={() => { setExpanded(false); openProfile(); }}>
                                    <i className="fas fa-user" /> Profile
                                </button>
                            ) : (
                                <button type="button" className="btn btn-outline-secondary me-2" onClick={() => { setExpanded(false); openLogin(); }}>
                                    <i className="fas fa-user" /> Account
                                </button>
                            )}
                            <Link to="/cart" className="btn btn-primary position-relative" aria-label={`Cart, ${count} items`}>
                                <i className="fas fa-shopping-cart" />
                                {count > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count">
                                        {count}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}
