import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useUI } from '../context/UIContext';
import PasswordInput from './PasswordInput';

export function LoginModal({ show, onHide }) {
    const { login } = useAuth();
    const { openRegister } = useUI();
    const showAlert = useAlert();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const user = await login(email.trim(), password, remember);
            showAlert('success', `Welcome back, ${user.fullName}!`);
            setPassword('');
            onHide();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title as="h5">Login to Your Account</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <div className="mb-3">
                        <label htmlFor="loginEmail" className="form-label">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="loginEmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            autoComplete="email"
                            required
                        />
                    </div>
                    <PasswordInput
                        id="loginPassword"
                        label="Password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Enter password"
                        autoComplete="current-password"
                    />
                    <div className="mb-3 form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="rememberMe"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={busy}>
                        {busy ? 'Logging in…' : 'Login'}
                    </button>
                </form>
                <div className="form-switch-container">
                    <button type="button" className="btn btn-link p-0" onClick={openRegister}>
                        Create an account
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    );
}

const NAME_RE = /^[A-Za-z][A-Za-z.' ]{1,59}$/;

export function RegisterModal({ show, onHide }) {
    const { register } = useAuth();
    const { openLogin } = useUI();
    const showAlert = useAlert();
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

    async function handleSubmit(e) {
        e.preventDefault();
        const fullName = form.fullName.trim().replace(/\s+/g, ' ');

        if (!NAME_RE.test(fullName)) return setError('Full name should contain letters and spaces only');
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        if (form.password !== form.confirm) return setError('Passwords do not match');

        setBusy(true);
        setError('');
        try {
            const user = await register(fullName, form.email.trim(), form.password);
            showAlert('success', `Account created. Welcome, ${user.fullName}!`);
            setForm({ fullName: '', email: '', password: '', confirm: '' });
            onHide();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title as="h5">Create New Account</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <div className="mb-3">
                        <label htmlFor="registerName" className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="registerName"
                            value={form.fullName}
                            onChange={(e) => set('fullName')(e.target.value)}
                            placeholder="Enter full name"
                            autoComplete="name"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="registerEmail" className="form-label">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="registerEmail"
                            value={form.email}
                            onChange={(e) => set('email')(e.target.value)}
                            placeholder="Enter email"
                            autoComplete="email"
                            required
                        />
                    </div>
                    <PasswordInput
                        id="registerPassword"
                        label="Password"
                        value={form.password}
                        onChange={set('password')}
                        placeholder="Create password (min 6 characters)"
                        autoComplete="new-password"
                        minLength={6}
                    />
                    <PasswordInput
                        id="confirmPassword"
                        label="Confirm Password"
                        value={form.confirm}
                        onChange={set('confirm')}
                        placeholder="Confirm password"
                        autoComplete="new-password"
                    />
                    <button type="submit" className="btn btn-primary w-100" disabled={busy}>
                        {busy ? 'Creating account…' : 'Register'}
                    </button>
                </form>
                <div className="form-switch-container">
                    <button type="button" className="btn btn-link p-0" onClick={openLogin}>
                        Already have an account?
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    );
}
