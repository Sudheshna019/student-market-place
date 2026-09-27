import { Link, Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export function RequireAuth({ children, message = 'Log in to continue.' }) {
    const { user } = useAuth();
    const { openLogin, openRegister } = useUI();

    if (user) return children;

    return (
        <div className="container page-top text-center py-5">
            <i className="fas fa-lock fa-3x text-muted mb-3" />
            <h3>Please log in</h3>
            <p className="text-muted">{message}</p>
            <button type="button" className="btn btn-primary me-2" onClick={openLogin}>Login</button>
            <button type="button" className="btn btn-outline-primary" onClick={openRegister}>Create an account</button>
        </div>
    );
}

export function RequireAdmin({ children }) {
    const { user, isAdmin } = useAuth();
    const location = useLocation();

    if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    if (!isAdmin) {
        return (
            <div className="container py-5 text-center">
                <i className="fas fa-user-lock fa-3x text-muted mb-3" />
                <h3>Admin access required</h3>
                <p className="text-muted">Your account doesn't have admin privileges.</p>
                <Link to="/" className="btn btn-primary">Back to Home</Link>
            </div>
        );
    }
    return children;
}
