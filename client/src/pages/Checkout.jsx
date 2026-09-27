import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../api';
import { RequireAuth } from '../components/RequireAuth';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils';
import { cartTotals } from './Cart';

function CheckoutForm() {
    const { user } = useAuth();
    const { items, refresh } = useCart();
    const showAlert = useAlert();
    const navigate = useNavigate();
    const [form, setForm] = useState({ fullName: user.fullName, email: user.email, phone: user.phone || '', address: '' });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const available = items.filter((i) => i.available);
    const totals = cartTotals(items);
    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    async function handleSubmit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const orders = await api('/orders', { method: 'POST', body: { shippingAddress: form } });
            await refresh();
            showAlert('success', 'Order placed successfully!');
            navigate('/order-success', { replace: true, state: { orderIds: orders.map((o) => o._id) } });
        } catch (err) {
            setError(err.message);
            refresh();
        } finally {
            setBusy(false);
        }
    }

    if (available.length === 0 && !busy) {
        return (
            <div className="text-center py-5">
                <i className="fas fa-shopping-cart fa-3x text-muted mb-3" />
                <h4>Your cart is empty</h4>
                <Link to="/" className="btn btn-primary mt-2">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="row g-4">
            <div className="col-lg-5 order-lg-2">
                <div className="checkout-summary">
                    <h4>Order Summary</h4>
                    {available.map((item) => (
                        <div key={item._id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                            <div>
                                <strong>{item.name}</strong>
                                <small className="text-muted d-block">
                                    {item.type === 'borrow' ? `Borrow · ${item.rentalPeriod || 'rental'}` : 'Purchase'} · {item.sellerName}
                                </small>
                            </div>
                            <span className="text-nowrap ms-2">{formatPrice(item.price)}</span>
                        </div>
                    ))}
                    <div className="mt-3">
                        <p className="d-flex justify-content-between mb-1"><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></p>
                        {totals.deposits > 0 && (
                            <p className="d-flex justify-content-between mb-1"><span>Refundable deposits</span><span>{formatPrice(totals.deposits)}</span></p>
                        )}
                        <p className="d-flex justify-content-between fw-bold fs-5 mb-0"><span>Total</span><span>{formatPrice(totals.total)}</span></p>
                    </div>
                </div>
            </div>

            <div className="col-lg-7 order-lg-1">
                <h4>Contact Information</h4>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <div className="mb-3">
                        <label htmlFor="fullName" className="form-label">Full Name</label>
                        <input type="text" className="form-control" id="fullName" value={form.fullName} onChange={set('fullName')} required autoComplete="name" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" className="form-control" id="email" value={form.email} onChange={set('email')} required autoComplete="email" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone Number</label>
                        <input type="tel" className="form-control" id="phone" value={form.phone} onChange={set('phone')} required inputMode="tel" maxLength={16} placeholder="10-digit mobile number" autoComplete="tel" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="address" className="form-label">Address / Campus pickup location</label>
                        <textarea className="form-control" id="address" rows="3" value={form.address} onChange={set('address')} required minLength={10} placeholder="Hostel, block, room number or full address" />
                    </div>

                    <h4 className="mt-4">Payment Method</h4>
                    <div className="payment-method">
                        <div className="form-check border rounded p-3 ps-5 mb-2">
                            <input className="form-check-input" type="radio" name="payment" id="cod" defaultChecked />
                            <label className="form-check-label" htmlFor="cod">
                                <i className="fas fa-money-bill-wave text-success me-2" />
                                <strong>Cash on Delivery</strong>
                                <small className="d-block text-muted">Pay the seller when you receive the item.</small>
                            </label>
                        </div>
                        <div className="form-check border rounded p-3 ps-5 bg-light">
                            <input className="form-check-input" type="radio" name="payment" id="online" disabled />
                            <label className="form-check-label text-muted" htmlFor="online">
                                <i className="fas fa-credit-card me-2" />
                                Online Payment (UPI / Cards)
                                <span className="badge bg-secondary ms-2">Coming soon</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-success w-100 mt-2" disabled={busy}>
                        {busy ? 'Placing order…' : `Place Order · ${formatPrice(totals.total)}`}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function Checkout() {
    return (
        <div className="container page-top pb-5">
            <h1 className="text-center mb-4">Checkout</h1>
            <RequireAuth message="Log in to check out.">
                <CheckoutForm />
            </RequireAuth>
        </div>
    );
}
