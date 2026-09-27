import OrdersList from '../components/OrdersList';
import { RequireAuth } from '../components/RequireAuth';

export default function MyOrders() {
    return (
        <>
            <section className="page-banner">
                <div className="container text-center">
                    <h1 className="display-4 fw-bold">My Orders</h1>
                    <p className="lead mb-0">Track and manage your orders</p>
                </div>
            </section>
            <section className="container mb-5">
                <RequireAuth message="Log in to view your order history.">
                    <OrdersList />
                </RequireAuth>
            </section>
        </>
    );
}
