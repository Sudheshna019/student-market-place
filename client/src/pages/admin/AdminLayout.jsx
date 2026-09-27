import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
    { to: '/admin', icon: 'fa-tachometer-alt', label: 'Dashboard', end: true },
    { to: '/admin/users', icon: 'fa-users', label: 'Users' },
    { to: '/admin/products', icon: 'fa-shopping-bag', label: 'Products' },
    { to: '/admin/orders', icon: 'fa-shopping-cart', label: 'Orders' },
    { to: '/admin/messages', icon: 'fa-envelope', label: 'Messages' }
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    function handleLogout() {
        logout();
        navigate('/admin/login');
    }

    return (
        <div className="admin-shell">
            <aside className={`sidebar ${open ? 'open' : ''}`}>
                <div className="d-flex align-items-center justify-content-between px-3 mb-4 sidebar-top">
                    <div className="text-center flex-grow-1">
                        <i className="fas fa-user-shield text-white fa-2x mb-2" />
                        <h5 className="text-white mb-0">Admin Panel</h5>
                        <small className="text-white-50">{user.fullName}</small>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-light d-md-none" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
                        <i className="fas fa-bars" />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {LINKS.map((l) => (
                        <NavLink key={l.to} to={l.to} end={l.end} className="sidebar-link" onClick={() => setOpen(false)}>
                            <i className={`fas ${l.icon} me-2`} /> {l.label}
                        </NavLink>
                    ))}
                    <Link to="/" className="sidebar-link mt-4">
                        <i className="fas fa-store me-2" /> View Site
                    </Link>
                    <button type="button" className="sidebar-link text-danger btn btn-link text-start w-100" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2" /> Logout
                    </button>
                </nav>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
