import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { itemImageUrl } from '../api';
import ItemImage from '../components/ItemImage';
import Loader from '../components/Loader';
import { RequireAuth } from '../components/RequireAuth';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils';

export function cartTotals(items) {
    const available = items.filter((i) => i.available);
    const subtotal = available.reduce((sum, i) => sum + i.price, 0);
    const deposits = available.reduce((sum, i) => sum + (i.type === 'borrow' ? i.deposit : 0), 0);
    return { count: available.length, subtotal, deposits, total: subtotal + deposits };
}

function CartContents() {
    const { items, loading, refresh, removeFromCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        refresh();
    }, [refresh]);

    if (loading && items.length === 0) return <Loader />;

    const totals = cartTotals(items);
    const hasUnavailable = items.some((i) => !i.available);

    return (
        <>
            {items.length === 0 ? (
                <div className="text-center py-5">
                    <i className="fas fa-shopping-cart fa-3x text-muted mb-3" />
                    <h4>Your cart is empty</h4>
                    <Link to="/" className="btn btn-primary mt-2">Start Shopping</Link>
                </div>
            ) : (
                <div className="cart-items">
                    {items.map((item) => (
                        <div key={item._id} className="cart-item row g-2 align-items-center mb-3 p-3 bg-light rounded mx-0">
                            <div className="col-3 col-md-2">
                                <Link to={`/items/${item._id}`}>
                                    <ItemImage src={itemImageUrl(item)} alt={item.name} className="img-fluid rounded cart-thumb" />
                                </Link>
                            </div>
                            <div className="col-9 col-md-5">
                                <h5 className="mb-1">
                                    <Link to={`/items/${item._id}`} className="text-reset text-decoration-none">{item.name}</Link>
                                </h5>
                                <small className="text-muted d-block">
                                    {item.type === 'borrow' ? `Borrow for ${item.rentalPeriod || 'rental period'}` : 'Purchase'} · Seller: {item.sellerName}
                                </small>
                                {!item.available && <span className="badge bg-danger mt-1">No longer available</span>}
                            </div>
                            <div className="col-8 col-md-3">
                                <p className="fw-bold mb-0">{formatPrice(item.price)}</p>
                                {item.type === 'borrow' && item.deposit > 0 && (
                                    <small className="text-muted">+ {formatPrice(item.deposit)} deposit</small>
                                )}
                            </div>
                            <div className="col-4 col-md-2 text-end">
                                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeFromCart(item._id)} aria-label={`Remove ${item.name}`}>
                                    <i className="fas fa-trash" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="cart-summary mt-4">
                <h4>Order Summary</h4>
                <p className="mb-1">Subtotal ({totals.count} items): <span className="fw-bold">{formatPrice(totals.subtotal)}</span></p>
                {totals.deposits > 0 && (
                    <p className="mb-1">Refundable deposits: <span className="fw-bold">{formatPrice(totals.deposits)}</span></p>
                )}
                <p>Total: <span className="fw-bold">{formatPrice(totals.total)}</span></p>
                {hasUnavailable && (
                    <div className="alert alert-warning py-2">Remove the items that are no longer available to continue.</div>
                )}
                <button
                    type="button"
                    className="btn btn-success w-100"
                    disabled={totals.count === 0 || hasUnavailable}
                    onClick={() => navigate('/checkout')}
                >
                    Proceed to Checkout
                </button>
            </div>
        </>
    );
}

export default function Cart() {
    return (
        <div className="container page-top pb-5">
            <h1 className="text-center mb-4">Shopping Cart</h1>
            <RequireAuth message="Log in to view your cart.">
                <CartContents />
            </RequireAuth>
        </div>
    );
}
