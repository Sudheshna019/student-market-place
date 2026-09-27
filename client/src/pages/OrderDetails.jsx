import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Link, useParams } from 'react-router';
import { api } from '../services/api';
import ItemImage, { orderItemImageUrl } from '../components/ItemImage';
import Loader from '../components/Loader';
import { StatusBadge } from '../components/OrderCard';
import { RequireAuth } from '../components/RequireAuth';
import { useAlert } from '../context/AlertContext';
import { formatDate, formatPrice, shortId } from '../utils/helpers';

// Buttons shown for each role and status; mirrors the rules enforced by the API.
const ACTIONS = {
    buyer: {
        pending: [{ status: 'cancelled', label: 'Cancel Order', className: 'btn-outline-danger', confirm: true }],
        confirmed: [{ status: 'cancelled', label: 'Cancel Order', className: 'btn-outline-danger', confirm: true }]
    },
    seller: {
        pending: [
            { status: 'confirmed', label: 'Confirm Order', className: 'btn-primary' },
            { status: 'cancelled', label: 'Reject Order', className: 'btn-outline-danger', confirm: true }
        ],
        confirmed: [
            { status: 'delivered', label: 'Mark as Delivered', className: 'btn-success' },
            { status: 'cancelled', label: 'Cancel Order', className: 'btn-outline-danger', confirm: true }
        ]
    }
};
ACTIONS.admin = ACTIONS.seller;

const STATUS_HELP = {
    pending: 'Waiting for the seller to confirm.',
    confirmed: 'The seller confirmed this order. Arrange a meetup to hand over the item and pay in cash.',
    delivered: 'Item handed over and paid for.',
    cancelled: 'This order was cancelled and the items are back on the marketplace.'
};

function Details() {
    const { id } = useParams();
    const showAlert = useAlert();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState('');
    const [pending, setPending] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api(`/orders/${id}`)
            .then(setOrder)
            .catch((err) => setError(err.status === 404 || err.status === 400 ? 'Order not found' : err.message));
    }, [id]);

    async function updateStatus(status) {
        setBusy(true);
        try {
            const updated = await api(`/orders/${id}/status`, { method: 'PATCH', body: { status } });
            setOrder(updated);
            showAlert('success', `Order ${status}`);
        } catch (err) {
            showAlert('danger', err.message);
        } finally {
            setBusy(false);
            setPending(null);
        }
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <i className="fas fa-receipt fa-3x text-muted mb-3" />
                <h3>{error}</h3>
                <Link to="/orders" className="btn btn-primary mt-2">Back to My Orders</Link>
            </div>
        );
    }
    if (!order) return <Loader />;

    const actions = ACTIONS[order.viewerRole]?.[order.status] || [];
    const address = order.shippingAddress || {};

    return (
        <div className="order-details">
            <h2 className="text-center mb-4">Order Details</h2>

            <div className="row mb-3">
                <div className="col-sm-6">
                    <p><strong>Order ID:</strong> #{shortId(order._id)}</p>
                    <p><strong>Order Status:</strong> <StatusBadge status={order.status} /></p>
                    <p><strong>Order Date:</strong> {formatDate(order.createdAt)}</p>
                </div>
                <div className="col-sm-6">
                    <p><strong>Seller:</strong> {order.sellerName}</p>
                    <p><strong>Buyer:</strong> {order.buyerName}</p>
                    <p><strong>Payment:</strong> {order.paymentMethod}</p>
                </div>
            </div>
            <div className="alert alert-light border small">{STATUS_HELP[order.status]}</div>

            <h4>Ordered Items</h4>
            <ul className="list-group mb-4">
                {order.items.map((item) => (
                    <li key={item.itemId} className="list-group-item">
                        <div className="d-flex align-items-center">
                            <ItemImage src={orderItemImageUrl(item.itemId)} alt={item.name} className="me-3 rounded thumb-60" />
                            <div>
                                <h6 className="mb-1">{item.name}</h6>
                                <small className="text-muted">
                                    {item.type === 'borrow'
                                        ? `Borrow for ${item.rentalPeriod || 'rental period'}${item.deposit ? ` · deposit ${formatPrice(item.deposit)}` : ''}`
                                        : 'Purchase'}
                                </small>
                            </div>
                        </div>
                        <span className="badge bg-primary rounded-pill">{formatPrice(item.price)}</span>
                    </li>
                ))}
            </ul>

            <h4>Order Summary</h4>
            <ul className="list-group mb-4">
                <li className="list-group-item">
                    Subtotal ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
                    <span>{formatPrice(order.subtotal)}</span>
                </li>
                {order.depositTotal > 0 && (
                    <li className="list-group-item">
                        Refundable deposits
                        <span>{formatPrice(order.depositTotal)}</span>
                    </li>
                )}
                <li className="list-group-item">
                    <strong>Total Amount</strong>
                    <span className="badge bg-success rounded-pill fs-6">{formatPrice(order.totalAmount)}</span>
                </li>
            </ul>

            <h4>{order.viewerRole === 'buyer' ? 'Shipping Address' : 'Buyer Contact & Address'}</h4>
            <div className="mb-4">
                <p className="mb-1"><strong>Name:</strong> {address.fullName || order.buyerName}</p>
                <p className="mb-1"><strong>Email:</strong> {address.email || order.buyerEmail}</p>
                <p className="mb-1"><strong>Phone:</strong> {address.phone || 'N/A'}</p>
                <p className="mb-1"><strong>Address:</strong> {address.address || 'N/A'}</p>
            </div>

            <div className="d-flex flex-wrap justify-content-center gap-2">
                {actions.map((a) => (
                    <button
                        key={a.status}
                        type="button"
                        className={`btn ${a.className}`}
                        disabled={busy}
                        onClick={() => (a.confirm ? setPending(a) : updateStatus(a.status))}
                    >
                        {a.label}
                    </button>
                ))}
                <Link to={order.viewerRole === 'seller' ? '/orders?view=sales' : '/orders'} className="btn btn-outline-secondary">
                    <i className="fas fa-arrow-left" /> Back to Orders
                </Link>
            </div>

            <Modal show={Boolean(pending)} onHide={() => setPending(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title as="h5">{pending?.label}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to cancel this order?</p>
                    <p className="text-danger mb-0">This action cannot be undone. The items will be listed as available again.</p>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary" onClick={() => setPending(null)}>No, Keep Order</button>
                    <button type="button" className="btn btn-danger" disabled={busy} onClick={() => updateStatus('cancelled')}>
                        Yes, Cancel Order
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default function OrderDetails() {
    return (
        <div className="container page-top pb-5">
            <RequireAuth message="Log in to view this order.">
                <Details />
            </RequireAuth>
        </div>
    );
}
