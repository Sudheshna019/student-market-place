import { Link, useSearchParams } from 'react-router';
import { api } from '../../api';
import Loader from '../../components/Loader';
import { StatusBadge } from '../../components/OrderCard';
import { useAlert } from '../../context/AlertContext';
import { formatDate, formatPrice, shortId } from '../../utils';
import useAdminData from './useAdminData';

const NEXT = {
    pending: [{ status: 'confirmed', label: 'Confirm', className: 'btn-outline-primary' }],
    confirmed: [{ status: 'delivered', label: 'Delivered', className: 'btn-outline-success' }]
};

export default function Orders() {
    const showAlert = useAlert();
    const [params, setParams] = useSearchParams();
    const status = params.get('status') || '';
    const { data: orders, error, reload } = useAdminData(`/admin/orders?status=${status}`);

    async function update(order, next) {
        if (next === 'cancelled' && !window.confirm(`Cancel order #${shortId(order._id)}? Items will be relisted.`)) return;
        try {
            await api(`/orders/${order._id}/status`, { method: 'PATCH', body: { status: next } });
            showAlert('success', `Order #${shortId(order._id)} ${next}`);
            reload();
        } catch (err) {
            showAlert('danger', err.message);
        }
    }

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <h2 className="mb-0">Orders</h2>
                <select
                    className="form-select w-auto"
                    value={status}
                    onChange={(e) => setParams(e.target.value ? { status: e.target.value } : {})}
                    aria-label="Filter by status"
                >
                    <option value="">All orders</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {!orders ? (
                <Loader />
            ) : (
                <div className="card">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Order</th>
                                    <th>Items</th>
                                    <th>Buyer</th>
                                    <th>Seller</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 && (
                                    <tr><td colSpan="8" className="text-center text-muted py-4">No orders found</td></tr>
                                )}
                                {orders.map((o) => (
                                    <tr key={o._id}>
                                        <td><Link to={`/orders/${o._id}`}>#{shortId(o._id)}</Link></td>
                                        <td className="small">{o.items.map((i) => i.name).join(', ')}</td>
                                        <td>{o.buyerName}</td>
                                        <td>{o.sellerName}</td>
                                        <td>{formatPrice(o.totalAmount)}</td>
                                        <td><StatusBadge status={o.status} className="px-2 py-1" /></td>
                                        <td className="text-nowrap">{formatDate(o.createdAt)}</td>
                                        <td className="text-end text-nowrap">
                                            {(NEXT[o.status] || []).map((a) => (
                                                <button key={a.status} type="button" className={`btn btn-sm ${a.className} me-1`} onClick={() => update(o, a.status)}>
                                                    {a.label}
                                                </button>
                                            ))}
                                            {['pending', 'confirmed'].includes(o.status) && (
                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => update(o, 'cancelled')}>Cancel</button>
                                            )}
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
