import { Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import Avatar from './Avatar';

export default function ProfileModal({ show, onHide }) {
    const { user, isAdmin, logout } = useAuth();
    const showAlert = useAlert();
    const navigate = useNavigate();

    if (!user) return null;

    function handleLogout() {
        logout();
        onHide();
        showAlert('info', 'Logged out successfully');
        navigate('/');
    }

    const links = [
        { to: '/orders', icon: 'fa-shopping-bag', label: 'My Orders' },
        { to: '/profile?tab=listings', icon: 'fa-list', label: 'My Listings' },
        { to: '/profile?tab=edit', icon: 'fa-user-edit', label: 'Edit Profile' }
    ];
    if (isAdmin) links.push({ to: '/admin', icon: 'fa-user-shield', label: 'Admin Panel' });

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title as="h5">My Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center mb-4">
                    <Avatar user={user} size={120} className="mb-3" />
                    <h4 className="mb-1">{user.fullName}</h4>
                    <p className="text-muted mb-0">{user.email}</p>
                </div>
                <div className="list-group">
                    {links.map((l) => (
                        <Link key={l.to} to={l.to} className="list-group-item list-group-item-action" onClick={onHide}>
                            <i className={`fas ${l.icon} me-2`} /> {l.label}
                        </Link>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-secondary" onClick={onHide}>Close</button>
                <button type="button" className="btn btn-danger" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-1" /> Logout
                </button>
            </Modal.Footer>
        </Modal>
    );
}
