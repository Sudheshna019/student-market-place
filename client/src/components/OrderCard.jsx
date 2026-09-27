import { Link } from 'react-router';
import { formatDate, formatPrice, ORDER_STATUS_BADGE, shortId } from '../utils';
import ItemImage, { orderItemImageUrl } from './ItemImage';

export function StatusBadge({ status, className = '' }) {
    return (
        <span className={`badge ${ORDER_STATUS_BADGE[status] || 'bg-secondary'} text-uppercase px-3 py-2 ${className}`}>
            {status}
        </span>
    );
}

// `perspective` is 'buyer' or 'seller' and decides whose name is shown.
export default function OrderCard({ order, perspective = 'buyer' }) {
    return (
        <div className="card order-card mb-3 border-0">
            <div className="card-header bg-light d-flex flex-wrap gap-2 justify-content-between align-items-center">
                <div>
                    <strong>Order #{shortId(order._id)}</strong>
                    <span className="text-muted ms-2 small">
                        <i className="far fa-clock" /> {formatDate(order.createdAt)}
                    </span>
                </div>
                <StatusBadge status={order.status} />
            </div>
            <div className="card-body">
                <p className="small text-muted mb-3">
                    {perspective === 'seller' ? (
                        <><i className="fas fa-user me-1" /> Buyer: {order.buyerName}</>
                    ) : (
                        <><i className="fas fa-store me-1" /> Seller: {order.sellerName}</>
                    )}
                </p>
                {order.items.map((item) => (
                    <div key={item.itemId} className="d-flex align-items-center mb-2">
                        <ItemImage src={orderItemImageUrl(item.itemId)} alt={item.name} className="rounded me-3 thumb-50" />
                        <div className="flex-grow-1">
                            <h6 className="mb-0">{item.name}</h6>
                            <small className="text-muted">
                                {item.type === 'borrow' ? `Borrow (${item.rentalPeriod || 'rental'})` : 'Purchase'} | {formatPrice(item.price)}
                            </small>
                        </div>
                    </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Total Amount: {formatPrice(order.totalAmount)}</span>
                    <Link to={`/orders/${order._id}`} className="btn btn-outline-primary btn-sm">View Details</Link>
                </div>
            </div>
        </div>
    );
}
