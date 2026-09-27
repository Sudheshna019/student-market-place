import { Link } from 'react-router';
import { itemImageUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils';
import ItemImage from './ItemImage';

export function PriceLabel({ item, className = 'h5 mb-0 text-primary' }) {
    return (
        <span className={className}>
            {formatPrice(item.price)}
            {item.type === 'borrow' && (
                <small className="text-muted fs-6 fw-normal"> / {item.rentalPeriod || 'rental'}</small>
            )}
        </span>
    );
}

export function CartButton({ item, className = 'btn-sm' }) {
    const { user } = useAuth();
    const { inCart, addToCart } = useCart();

    if (user && item.sellerId === user._id) {
        return (
            <button type="button" className={`btn btn-outline-secondary ${className}`} disabled>
                <i className="fas fa-user-tag me-1" /> Your listing
            </button>
        );
    }
    if (item.status && item.status !== 'available') {
        return (
            <button type="button" className={`btn btn-outline-secondary ${className}`} disabled>
                {item.status === 'borrowed' ? 'Currently borrowed' : 'Sold'}
            </button>
        );
    }
    if (inCart(item._id)) {
        return (
            <Link to="/cart" className={`btn btn-success ${className}`}>
                <i className="fas fa-check me-1" /> In Cart
            </Link>
        );
    }
    return (
        <button type="button" onClick={() => addToCart(item)} className={`btn btn-outline-primary ${className}`}>
            <i className="fas fa-cart-plus me-1" /> Add to Cart
        </button>
    );
}

export default function ItemCard({ item }) {
    const isBorrow = item.type === 'borrow';

    return (
        <div className="col-md-4 col-sm-6">
            <div className="card product-card h-100 shadow-sm border-0">
                <Link to={`/items/${item._id}`} className="position-relative d-block">
                    <ItemImage src={itemImageUrl(item)} alt={item.name} className="card-img-top product-img" />
                    <span className={`badge ${isBorrow ? 'bg-warning text-dark' : 'bg-success'} position-absolute top-0 end-0 m-2 px-3 py-2 fs-6`}>
                        {isBorrow ? 'For Borrow' : 'For Sale'}
                    </span>
                </Link>
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-truncate">
                        <Link to={`/items/${item._id}`} className="stretched-link-title">{item.name}</Link>
                    </h5>
                    <p className="card-text text-muted small text-truncate">{item.description}</p>
                    <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <PriceLabel item={item} />
                            <span className="badge bg-light text-dark border">{item.condition || 'Good'}</span>
                        </div>
                        {isBorrow && item.deposit > 0 && (
                            <small className="text-muted d-block mb-2">Refundable deposit: {formatPrice(item.deposit)}</small>
                        )}
                        <div className="d-grid gap-2">
                            <CartButton item={item} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
