import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router';
import Footer from './components/Footer';
import { RequireAdmin } from './components/RequireAuth';
import SiteNavbar from './components/SiteNavbar';
import Cart from './pages/Cart';
import Category from './pages/Category';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Home from './pages/Home';
import ItemDetails from './pages/ItemDetails';
import MyOrders from './pages/MyOrders';
import NotFound from './pages/NotFound';
import OrderDetails from './pages/OrderDetails';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import Search from './pages/Search';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Messages from './pages/admin/Messages';
import Orders from './pages/admin/Orders';
import Products from './pages/admin/Products';
import Users from './pages/admin/Users';

const TITLES = {
    '/': 'Student MarketPlace',
    '/cart': 'Shopping Cart',
    '/checkout': 'Checkout',
    '/orders': 'My Orders',
    '/profile': 'My Profile',
    '/contact': 'Contact Us',
    '/search': 'Search',
    '/order-success': 'Thank You'
};

function ScrollAndTitle() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
        const title =
            TITLES[pathname] ||
            (pathname.startsWith('/admin') && 'Admin') ||
            (pathname.startsWith('/orders/') && 'Order Details') ||
            (pathname.startsWith('/items/') && 'Item Details') ||
            (pathname.startsWith('/category/') && 'Shop by Category') ||
            null;
        document.title = title && pathname !== '/' ? `${title} - Student MarketPlace` : 'Student MarketPlace';
    }, [pathname]);
    return null;
}

function SiteLayout() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <SiteNavbar />
            <main className="flex-grow-1 site-main">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <>
            <ScrollAndTitle />
            <Routes>
                <Route element={<SiteLayout />}>
                    <Route index element={<Home />} />
                    <Route path="category/:slug" element={<Category />} />
                    <Route path="search" element={<Search />} />
                    <Route path="items/:id" element={<ItemDetails />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="order-success" element={<OrderSuccess />} />
                    <Route path="orders" element={<MyOrders />} />
                    <Route path="orders/:id" element={<OrderDetails />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="*" element={<NotFound />} />
                </Route>

                <Route path="admin/login" element={<AdminLogin />} />
                <Route
                    path="admin"
                    element={
                        <RequireAdmin>
                            <AdminLayout />
                        </RequireAdmin>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="products" element={<Products />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="messages" element={<Messages />} />
                </Route>
            </Routes>
        </>
    );
}
