import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { api } from '../services/api';
import { shortId } from '../utils/helpers';
import Loader from './Loader';
import OrderCard from './OrderCard';

// Purchases / sales tabs with search. Used on the My Orders page and the profile's orders tab.
function matches(order, q) {
    if (!q) return true;
    const text = [shortId(order._id), order.status, order.buyerName, order.sellerName, ...order.items.map((i) => i.name)]
        .join(' ')
        .toLowerCase();
    return text.includes(q.toLowerCase());
}

export default function OrdersList() {
    const [params, setParams] = useSearchParams();
    const tab = params.get('view') === 'sales' ? 'sales' : 'purchases';
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');

    useEffect(() => {
        api('/orders/my-orders').then(setData).catch((err) => setError(err.message));
    }, []);

    const orders = useMemo(() => (data ? data[tab].filter((o) => matches(o, query.trim())) : []), [data, tab, query]);

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Error Loading Orders</h4>
                <p className="mb-0">{error}</p>
            </div>
        );
    }
    if (!data) return <Loader />;

    // Keep other query params (the profile page uses ?tab=orders) when switching views.
    const setTab = (view) =>
        setParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                if (view === 'sales') next.set('view', 'sales');
                else next.delete('view');
                return next;
            },
            { replace: true }
        );

    return (
        <>
            <ul className="nav nav-pills mb-3">
                <li className="nav-item">
                    <button type="button" className={`nav-link ${tab === 'purchases' ? 'active' : ''}`} onClick={() => setTab('purchases')}>
                        <i className="fas fa-shopping-bag me-1" /> My Purchases <span className="badge bg-light text-dark ms-1">{data.purchases.length}</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button type="button" className={`nav-link ${tab === 'sales' ? 'active' : ''}`} onClick={() => setTab('sales')}>
                        <i className="fas fa-store me-1" /> Orders for My Items <span className="badge bg-light text-dark ms-1">{data.sales.length}</span>
                    </button>
                </li>
            </ul>

            <div className="input-group mb-4">
                <input type="search" className="form-control" placeholder="Search orders by item, order ID or status..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search orders" />
                <span className="input-group-text bg-white"><i className="fas fa-search text-primary" /></span>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-5">
                    <i className="fas fa-shopping-bag fa-3x text-muted mb-3" />
                    <h4>No orders found</h4>
                    <p className="text-muted">
                        {query
                            ? 'No orders match your search.'
                            : tab === 'sales'
                              ? 'Nobody has ordered your listings yet.'
                              : "You haven't placed any orders yet."}
                    </p>
                    {tab === 'purchases' && !query && <Link to="/" className="btn btn-primary">Start Shopping</Link>}
                </div>
            ) : (
                orders.map((order) => (
                    <OrderCard key={order._id} order={order} perspective={tab === 'sales' ? 'seller' : 'buyer'} />
                ))
            )}
        </>
    );
}
