import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import ItemCard from './ItemCard';
import Loader from './Loader';

// Loads and renders listings from GET /api/items with the given filters.
export default function ItemGrid({ category, type, search, limit, emptyText = 'No items available' }) {
    const { listingsVersion, openSell } = useUI();
    const [items, setItems] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (type) params.set('type', type);
        if (search) params.set('search', search);
        if (limit) params.set('limit', limit);

        setItems(null);
        setError('');
        api(`/items?${params}`, { signal: controller.signal })
            .then(setItems)
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message);
            });

        return () => controller.abort();
    }, [category, type, search, limit, listingsVersion]);

    if (error) {
        return (
            <div className="text-center py-5 text-danger">
                <i className="fas fa-exclamation-triangle fa-2x mb-2" />
                <p className="mb-0">Failed to load items. {error}</p>
            </div>
        );
    }

    if (!items) return <Loader />;

    if (items.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                <i className="fas fa-box-open fa-3x mb-3" />
                <h4>{emptyText}</h4>
                {!search && (
                    <>
                        <p>Be the first to list an item here!</p>
                        <button type="button" className="btn btn-primary" onClick={() => openSell()}>
                            <i className="fas fa-plus me-1" /> List an Item
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="row g-4">
            {items.map((item) => (
                <ItemCard key={item._id} item={item} />
            ))}
        </div>
    );
}
