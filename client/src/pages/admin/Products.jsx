import { useState } from 'react';
import { Link } from 'react-router';
import { api, itemImageUrl } from '../../services/api';
import ItemImage from '../../components/ItemImage';
import Loader from '../../components/Loader';
import { useAlert } from '../../context/AlertContext';
import { categoryLabel, formatDate, formatPrice } from '../../utils/helpers';
import useAdminData from '../../hooks/useAdminData';

const STATUS_BADGE = { available: 'bg-success', sold: 'bg-secondary', borrowed: 'bg-warning text-dark' };

export default function Products() {
    const showAlert = useAlert();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const params = new URLSearchParams({ search: search.trim(), status });
    const { data: items, error, reload } = useAdminData(`/admin/items?${params}`);

    async function remove(item) {
        if (!window.confirm(`Remove "${item.name}" by ${item.sellerName}? This cannot be undone.`)) return;
        try {
            await api(`/admin/items/${item._id}`, { method: 'DELETE' });
            showAlert('success', 'Listing removed');
            reload();
        } catch (err) {
            showAlert('danger', err.message);
        }
    }

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <h2 className="mb-0">Products</h2>
                <div className="d-flex gap-2">
                    <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
                        <option value="">All statuses</option>
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="borrowed">Borrowed</option>
                    </select>
                    <input type="search" className="form-control admin-search" placeholder="Search name, seller, category" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {!items ? (
                <Loader />
            ) : (
                <div className="card">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Item</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Seller</th>
                                    <th>Status</th>
                                    <th>Listed</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 && (
                                    <tr><td colSpan="8" className="text-center text-muted py-4">No products found</td></tr>
                                )}
                                {items.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <ItemImage src={itemImageUrl(item)} alt="" className="rounded me-2 thumb-40" />
                                                <Link to={`/items/${item._id}`} className="text-truncate admin-item-name">{item.name}</Link>
                                            </div>
                                        </td>
                                        <td>{categoryLabel(item.category)}</td>
                                        <td className="text-capitalize">{item.type}</td>
                                        <td>{formatPrice(item.price)}</td>
                                        <td>{item.sellerName}</td>
                                        <td><span className={`badge ${STATUS_BADGE[item.status]} text-capitalize`}>{item.status}</span></td>
                                        <td className="text-nowrap">{formatDate(item.createdAt, false)}</td>
                                        <td className="text-end">
                                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(item)} aria-label={`Remove ${item.name}`}>
                                                <i className="fas fa-trash" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
