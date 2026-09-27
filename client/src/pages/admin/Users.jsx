import { useState } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import useAdminData from '../../hooks/useAdminData';

export default function Users() {
    const { user: me } = useAuth();
    const showAlert = useAlert();
    const [search, setSearch] = useState('');
    const { data: users, error, reload } = useAdminData(`/admin/users?search=${encodeURIComponent(search.trim())}`);

    async function changeRole(user, role) {
        const verb = role === 'admin' ? 'Make' : 'Remove';
        if (!window.confirm(`${verb} ${user.fullName} ${role === 'admin' ? 'an admin' : 'as admin'}?`)) return;
        try {
            await api(`/admin/users/${user._id}/role`, { method: 'PATCH', body: { role } });
            showAlert('success', `${user.fullName} is now ${role === 'admin' ? 'an admin' : 'a regular user'}`);
            reload();
        } catch (err) {
            showAlert('danger', err.message);
        }
    }

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <h2 className="mb-0">Users</h2>
                <input type="search" className="form-control admin-search" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {!users ? (
                <Loader />
            ) : (
                <div className="card">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th className="text-center">Listings</th>
                                    <th className="text-center">Orders</th>
                                    <th>Joined</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 && (
                                    <tr><td colSpan="7" className="text-center text-muted py-4">No users found</td></tr>
                                )}
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td>{u.fullName}</td>
                                        <td>{u.email}</td>
                                        <td><span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>{u.role}</span></td>
                                        <td className="text-center">{u.listings}</td>
                                        <td className="text-center">{u.orders}</td>
                                        <td className="text-nowrap">{formatDate(u.createdAt, false)}</td>
                                        <td className="text-end">
                                            {u._id !== me._id &&
                                                (u.role === 'admin' ? (
                                                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => changeRole(u, 'user')}>Remove admin</button>
                                                ) : (
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => changeRole(u, 'admin')}>Make admin</button>
                                                ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
