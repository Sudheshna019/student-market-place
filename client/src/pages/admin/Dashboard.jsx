import { Link } from 'react-router';
import Loader from '../../components/Loader';
import { StatusBadge } from '../../components/OrderCard';
import { formatDate, formatPrice, shortId } from '../../utils';
import useAdminData from './useAdminData';

export default function Dashboard() {
    const { data: stats, error } = useAdminData('/admin/stats');

    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!stats) return <Loader />;

    const cards = [
        { title: 'Total Users', value: stats.totalUsers, note: 'Registered accounts', color: 'bg-primary', to: '/admin/users' },
        { title: 'Total Products', value: stats.availableItems, note: `Available now · ${stats.totalItems} listed in total`, color: 'bg-success', to: '/admin/products' },
        { title: 'Total Orders', value: stats.totalOrders, note: `Delivered sales: ${formatPrice(stats.deliveredSales)}`, color: 'bg-info', to: '/admin/orders' },
        { title: 'Pending Orders', value: stats.pendingOrders, note: 'Awaiting seller confirmation', color: 'bg-warning', to: '/admin/orders?status=pending' }
    ];

    return (
        <>
            <h2 className="mb-4">Dashboard Overview</h2>
            <div className="row g-3 mb-4">
                {cards.map((c) => (
                    <div key={c.title} className="col-sm-6 col-xl-3">
                        <Link to={c.to} className="text-decoration-none">
                            <div className={`card stats-card ${c.color} text-white h-100`}>
                                <div className="card-body">
                                    <h5 className="card-title">{c.title}</h5>
                                    <h3>{c.value}</h3>
                                    <p className="mb-0"><small>{c.note}</small></p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {stats.newMessages > 0 && (
                <div className="alert alert-info d-flex justify-content-between align-items-center">
                    <span><i className="fas fa-envelope me-2" /> {stats.newMessages} new contact {stats.newMessages === 1 ? 'message' : 'messages'}</span>
                    <Link to="/admin/messages" className="btn btn-sm btn-info">View</Link>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Recent Activity</h5>
                </div>
                <div className="card-body p-0">
                    {stats.recentOrders.length === 0 ? (
                        <p className="text-muted text-center py-4 mb-0">No orders yet.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Order</th>
                                        <th>Buyer</th>
                                        <th>Seller</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders.map((o) => (
                                        <tr key={o._id}>
                                            <td><Link to={`/orders/${o._id}`}>#{shortId(o._id)}</Link></td>
                                            <td>{o.buyerName}</td>
                                            <td>{o.sellerName}</td>
                                            <td>{formatPrice(o.totalAmount)}</td>
                                            <td><StatusBadge status={o.status} className="px-2 py-1" /></td>
                                            <td className="text-nowrap">{formatDate(o.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
