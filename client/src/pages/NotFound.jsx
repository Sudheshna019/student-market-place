import { Link } from 'react-router';

export default function NotFound() {
    return (
        <div className="container page-top text-center py-5">
            <h1 className="display-1 fw-bold text-primary">404</h1>
            <h3>Page not found</h3>
            <p className="text-muted">The page you're looking for doesn't exist or was moved.</p>
            <Link to="/" className="btn btn-primary">
                <i className="fas fa-home" /> Back to Home
            </Link>
        </div>
    );
}
