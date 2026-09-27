import { api } from '../../api';
import Loader from '../../components/Loader';
import { useAlert } from '../../context/AlertContext';
import { formatDate } from '../../utils';
import useAdminData from './useAdminData';

export default function Messages() {
    const showAlert = useAlert();
    const { data: messages, error, reload } = useAdminData('/admin/messages');

    async function setStatus(message, status) {
        try {
            await api(`/admin/messages/${message._id}`, { method: 'PATCH', body: { status } });
            reload();
        } catch (err) {
            showAlert('danger', err.message);
        }
    }

    async function remove(message) {
        if (!window.confirm('Delete this message?')) return;
        try {
            await api(`/admin/messages/${message._id}`, { method: 'DELETE' });
            showAlert('success', 'Message deleted');
            reload();
        } catch (err) {
            showAlert('danger', err.message);
        }
    }

    return (
        <>
            <h2 className="mb-4">Contact Messages</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {!messages ? (
                <Loader />
            ) : messages.length === 0 ? (
                <p className="text-muted">No messages yet.</p>
            ) : (
                messages.map((m) => (
                    <div key={m._id} className={`card mb-3 ${m.status === 'new' ? 'border-primary' : ''}`}>
                        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2 bg-white">
                            <div>
                                {m.status === 'new' && <span className="badge bg-primary me-2">New</span>}
                                <strong>{m.subject}</strong>
                            </div>
                            <small className="text-muted">{formatDate(m.createdAt)}</small>
                        </div>
                        <div className="card-body">
                            <p className="small text-muted mb-2">
                                From {m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>{m.email}</a>
                            </p>
                            <p className="mb-3 description-text">{m.message}</p>
                            <div className="d-flex gap-2">
                                <a className="btn btn-sm btn-primary" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>
                                    <i className="fas fa-reply me-1" /> Reply
                                </a>
                                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setStatus(m, m.status === 'new' ? 'read' : 'new')}>
                                    Mark as {m.status === 'new' ? 'read' : 'unread'}
                                </button>
                                <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={() => remove(m)} aria-label="Delete message">
                                    <i className="fas fa-trash" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </>
    );
}
