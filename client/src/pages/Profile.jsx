import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { api, itemImageUrl } from '../api';
import Avatar from '../components/Avatar';
import { PriceLabel } from '../components/ItemCard';
import ItemImage from '../components/ItemImage';
import Loader from '../components/Loader';
import PasswordInput from '../components/PasswordInput';
import { RequireAuth } from '../components/RequireAuth';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { categoryLabel, compressImage } from '../utils';
import { OrdersList } from './MyOrders';

const STATUS_BADGE = { available: 'bg-success', sold: 'bg-secondary', borrowed: 'bg-warning text-dark' };

function MyListings() {
    const showAlert = useAlert();
    const { openSell, listingsVersion } = useUI();
    const [items, setItems] = useState(null);
    const [error, setError] = useState('');

    const load = useCallback(() => {
        api('/items/mine').then(setItems).catch((err) => setError(err.message));
    }, []);

    useEffect(load, [load, listingsVersion]);

    async function setStatus(item, status) {
        try {
            await api(`/items/${item._id}`, { method: 'PUT', body: { status } });
            showAlert('success', status === 'available' ? 'Listing is available again' : `Marked as ${status}`);
            load();
        } catch (err) {
            showAlert('danger', err.message);
        }
    }

    async function remove(item) {
        if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
        try {
            await api(`/items/${item._id}`, { method: 'DELETE' });
            showAlert('success', 'Listing deleted');
            load();
        } catch (err) {
            showAlert('danger', err.message);
        }
    }

    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!items) return <Loader />;

    if (items.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                <i className="fas fa-list fa-3x mb-3" />
                <h4>No listings yet</h4>
                <p>You haven't listed any items for sale or borrow yet.</p>
                <button type="button" className="btn btn-primary" onClick={() => openSell()}>
                    <i className="fas fa-plus me-1" /> List an Item
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">{items.length} {items.length === 1 ? 'listing' : 'listings'}</span>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => openSell()}>
                    <i className="fas fa-plus me-1" /> New Listing
                </button>
            </div>
            <div className="row g-4">
                {items.map((item) => (
                    <div key={item._id} className="col-md-6 col-lg-4">
                        <div className="card h-100 shadow-sm border-0 listing-card">
                            <Link to={`/items/${item._id}`} className="position-relative d-block">
                                <ItemImage src={itemImageUrl(item)} alt={item.name} className="card-img-top listing-img" />
                                <span className={`badge ${STATUS_BADGE[item.status]} position-absolute top-0 start-0 m-2 text-capitalize`}>{item.status}</span>
                                <span className="badge bg-dark position-absolute top-0 end-0 m-2">{item.type === 'borrow' ? 'For Borrow' : 'For Sale'}</span>
                            </Link>
                            <div className="card-body d-flex flex-column">
                                <h6 className="card-title text-truncate mb-1">{item.name}</h6>
                                <small className="text-muted mb-2">{categoryLabel(item.category)} · {item.views} views</small>
                                <PriceLabel item={item} className="fw-bold text-primary mb-3" />
                                <div className="mt-auto d-flex flex-wrap gap-2">
                                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openSell(item)}>
                                        <i className="fas fa-edit" /> Edit
                                    </button>
                                    {item.status === 'available' ? (
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setStatus(item, item.type === 'borrow' ? 'borrowed' : 'sold')}>
                                            Mark {item.type === 'borrow' ? 'borrowed' : 'sold'}
                                        </button>
                                    ) : (
                                        <button type="button" className="btn btn-outline-success btn-sm" onClick={() => setStatus(item, 'available')}>
                                            {item.status === 'borrowed' ? 'Returned · relist' : 'Relist'}
                                        </button>
                                    )}
                                    <button type="button" className="btn btn-outline-danger btn-sm ms-auto" onClick={() => remove(item)} aria-label={`Delete ${item.name}`}>
                                        <i className="fas fa-trash" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

function EditProfile() {
    const { user, updateUser } = useAuth();
    const showAlert = useAlert();
    const [fullName, setFullName] = useState(user.fullName);
    const [phone, setPhone] = useState(user.phone || '');
    const [photo, setPhoto] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    async function handlePhoto(e) {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setPhoto(await compressImage(file, 256, 0.8));
            setError('');
        } catch (err) {
            e.target.value = '';
            setError(err.message);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const body = { fullName: fullName.trim(), phone: phone.trim() };
            if (photo !== null) body.photoURL = photo;
            const { user: updated } = await api('/auth/profile', { method: 'PUT', body });
            updateUser(updated);
            setPhoto(null);
            showAlert('success', 'Profile updated');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    const previewUser = photo !== null ? { ...user, photoURL: photo } : user;

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <h5 className="card-title mb-3">Edit Profile</h5>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <Avatar user={previewUser} size={72} />
                        <div className="flex-grow-1">
                            <label htmlFor="editProfileImage" className="form-label">Profile Image</label>
                            <input type="file" className="form-control" id="editProfileImage" accept="image/*" onChange={handlePhoto} />
                        </div>
                        {(user.photoURL || photo) && (
                            <button type="button" className="btn btn-link text-danger align-self-end" onClick={() => setPhoto('')}>Remove</button>
                        )}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="editProfileName" className="form-label">Full Name</label>
                        <input type="text" className="form-control" id="editProfileName" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} maxLength={60} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="editProfilePhone" className="form-label">Mobile Number</label>
                        <input type="tel" className="form-control" id="editProfilePhone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" maxLength={16} placeholder="Used to pre-fill checkout" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={user.email} disabled />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</button>
                </form>
            </div>
        </div>
    );
}

function ChangePassword() {
    const showAlert = useAlert();
    const [form, setForm] = useState({ current: '', next: '', confirm: '' });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

    async function handleSubmit(e) {
        e.preventDefault();
        if (form.next.length < 6) return setError('New password must be at least 6 characters');
        if (form.next !== form.confirm) return setError('New passwords do not match');
        setBusy(true);
        setError('');
        try {
            await api('/auth/password', { method: 'PUT', body: { currentPassword: form.current, newPassword: form.next } });
            setForm({ current: '', next: '', confirm: '' });
            showAlert('success', 'Password changed');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <h5 className="card-title mb-3">Change Password</h5>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <PasswordInput id="currentPassword" label="Current Password" value={form.current} onChange={set('current')} autoComplete="current-password" />
                    <PasswordInput id="newPassword" label="New Password" value={form.next} onChange={set('next')} autoComplete="new-password" minLength={6} />
                    <PasswordInput id="confirmNewPassword" label="Confirm New Password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
                    <button type="submit" className="btn btn-outline-primary" disabled={busy}>{busy ? 'Updating…' : 'Update Password'}</button>
                </form>
            </div>
        </div>
    );
}

const TABS = [
    { key: 'listings', label: 'My Listings' },
    { key: 'orders', label: 'My Orders' },
    { key: 'edit', label: 'Edit Profile' }
];

function ProfileContent() {
    const { user, logout } = useAuth();
    const showAlert = useAlert();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'listings';

    function handleLogout() {
        logout();
        showAlert('info', 'Logged out successfully');
        navigate('/');
    }

    return (
        <>
            <div className="profile-header text-center">
                <Avatar user={user} size={150} className="profile-image mb-3" />
                <h2 className="mb-1">{user.fullName}</h2>
                <p className="mb-3 opacity-75">{user.email}</p>
                <button type="button" className="btn btn-outline-light" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt" /> Logout
                </button>
            </div>

            <div className="container pb-5">
                <ul className="nav nav-tabs mb-4" role="tablist">
                    {TABS.map((t) => (
                        <li key={t.key} className="nav-item" role="presentation">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={tab === t.key}
                                className={`nav-link ${tab === t.key ? 'active' : ''}`}
                                onClick={() => setParams({ tab: t.key }, { replace: true })}
                            >
                                {t.label}
                            </button>
                        </li>
                    ))}
                </ul>

                {tab === 'listings' && <MyListings />}
                {tab === 'orders' && <OrdersList />}
                {tab === 'edit' && (
                    <div className="row g-4">
                        <div className="col-lg-7"><EditProfile /></div>
                        <div className="col-lg-5"><ChangePassword /></div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function Profile() {
    return (
        <RequireAuth message="Log in to see your profile.">
            <ProfileContent />
        </RequireAuth>
    );
}
