import { useState } from 'react';
import { api } from '../api';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';

export default function Contact() {
    const { user } = useAuth();
    const showAlert = useAlert();
    const [form, setForm] = useState({ name: user?.fullName || '', email: user?.email || '', subject: '', message: '' });
    const [busy, setBusy] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    async function handleSubmit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const data = await api('/contact', { method: 'POST', body: form });
            showAlert('success', data.message);
            setSent(true);
            setForm((f) => ({ ...f, subject: '', message: '' }));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="contact-section">
            <div className="container">
                <div className="row justify-content-center align-items-center">
                    <div className="col-lg-7 d-flex flex-column align-items-center">
                        <h1 className="mb-4 text-center">Get in Touch</h1>
                        <p className="lead mb-4 text-center">We're here to help! Reach out to us for any questions, feedback, or support.</p>
                        <div className="contact-form w-100">
                            {sent && (
                                <div className="alert alert-success py-2">
                                    <i className="fas fa-check-circle me-1" /> Message sent! We'll reply to {form.email}.
                                </div>
                            )}
                            {error && <div className="alert alert-danger py-2">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Your Name</label>
                                    <input type="text" className="form-control" id="name" value={form.name} onChange={set('name')} placeholder="Enter your name" required maxLength={60} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Your Email</label>
                                    <input type="email" className="form-control" id="email" value={form.email} onChange={set('email')} placeholder="Enter your email" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="subject" className="form-label">Subject</label>
                                    <input type="text" className="form-control" id="subject" value={form.subject} onChange={set('subject')} placeholder="Enter subject" required minLength={3} maxLength={120} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="message" className="form-label">Your Message</label>
                                    <textarea className="form-control" id="message" rows="5" value={form.message} onChange={set('message')} placeholder="Enter your message" required minLength={10} maxLength={2000} />
                                </div>
                                <button type="submit" className="btn btn-primary w-100" disabled={busy}>
                                    {busy ? 'Sending…' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
