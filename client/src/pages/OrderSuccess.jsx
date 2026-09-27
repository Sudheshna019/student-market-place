import { Link, useLocation } from 'react-router';

export default function OrderSuccess() {
    const { state } = useLocation();
    const orderIds = state?.orderIds || [];
    const detailsLink = orderIds.length === 1 ? `/orders/${orderIds[0]}` : '/orders';

    return (
        <div className="container page-top pb-5 text-center">
            <div className="thank-you-message">
                <i className="fas fa-check-circle fa-4x text-success mb-3" />
                <h1>Thank You for Your Purchase!</h1>
                <p>Your order has been successfully placed.</p>
                <p className="text-muted">
                    {orderIds.length > 1
                        ? `Your items come from ${orderIds.length} different sellers, so we created ${orderIds.length} orders. `
                        : ''}
                    The seller will confirm your order and contact you to arrange delivery. Pay in cash when you receive the item.
                </p>
                <div className="btn-container">
                    <Link to="/" className="btn btn-primary">
                        <i className="fas fa-home" /> Continue Shopping
                    </Link>
                    <Link to={detailsLink} className="btn btn-success">
                        <i className="fas fa-receipt" /> View Order Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
