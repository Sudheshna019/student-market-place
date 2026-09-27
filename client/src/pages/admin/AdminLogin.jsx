import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { api } from '../../api';
import PasswordInput from '../../components/PasswordInput';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
    const { isAdmin, startSession } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const target = location.state?.from?.startsWith('/admin') ? location.state.from : '/admin';

    if (isAdmin) return <Navigate to={target} replace />;

    async function handleSubmit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const data = await api('/auth/login', { method: 'POST', body: { email: email.trim(), password } });
            // Only keep the session if this account really is an admin.
            if (data.user.role !== 'admin') throw new Error('Unauthorized access. Admin privileges required.');
            startSession(data, true);
            navigate(target, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="container">
            <div className="admin-login-container">
                <div className="admin-header">
                    <i className="fas fa-user-shield mb-3" />
                    <h2>Admin Login</h2>
                    <p className="text-muted">Access the admin dashboard</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="adminEmail" className="form-label">Email</label>
                        <input type="email" className="form-control" id="adminEmail" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                    </div>
                    <PasswordInput id="adminPassword" label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
                    </div>
                </form>
                {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
                <div className="text-center mt-3">
                    <Link to="/" className="small"><i className="fas fa-arrow-left" /> Back to Student MarketPlace</Link>
                </div>
            </div>
        </div>
    );
}
