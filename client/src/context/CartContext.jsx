import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useAlert } from './AlertContext';
import { useUI } from './UIContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const showAlert = useAlert();
    const { openLogin } = useUI();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!user) {
            setItems([]);
            return;
        }
        setLoading(true);
        try {
            const cart = await api('/cart');
            setItems(cart.items);
        } catch {
            // The navbar badge just stays as it was; pages show their own errors.
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addToCart = useCallback(
        async (item) => {
            if (!user) {
                showAlert('warning', 'Please log in to add items to your cart');
                openLogin();
                return false;
            }
            try {
                const cart = await api(`/cart/${item._id}`, { method: 'POST' });
                setItems(cart.items);
                showAlert('success', `"${item.name}" added to cart!`);
                return true;
            } catch (error) {
                showAlert('danger', error.message);
                return false;
            }
        },
        [user, showAlert, openLogin]
    );

    const removeFromCart = useCallback(
        async (itemId) => {
            try {
                const cart = await api(`/cart/${itemId}`, { method: 'DELETE' });
                setItems(cart.items);
                showAlert('success', 'Item removed from cart');
            } catch (error) {
                showAlert('danger', error.message);
            }
        },
        [showAlert]
    );

    const value = useMemo(() => {
        const ids = new Set(items.map((i) => i._id));
        return { items, loading, count: items.length, inCart: (id) => ids.has(id), refresh, addToCart, removeFromCart };
    }, [items, loading, refresh, addToCart, removeFromCart]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    return useContext(CartContext);
}
