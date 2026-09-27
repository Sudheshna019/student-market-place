import { Link } from 'react-router';
import { CATEGORIES } from '../utils/helpers';

export default function Footer() {
    return (
        <footer className="footer bg-dark text-white py-4">
            <div className="container text-center">
                <nav className="footer-links mb-2" aria-label="Footer">
                    {CATEGORIES.map((c) => (
                        <Link key={c.slug} to={`/category/${c.slug}`}>{c.label}</Link>
                    ))}
                    <Link to="/contact">Contact Us</Link>
                </nav>
                <p className="mb-0">© {new Date().getFullYear()} Student MarketPlace. All rights reserved.</p>
            </div>
        </footer>
    );
}
