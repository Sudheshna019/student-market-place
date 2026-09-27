import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { api, itemImageUrl } from '../services/api';
import { CartButton, PriceLabel } from '../components/ItemCard';
import ItemImage from '../components/ItemImage';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { categoryLabel, formatDate, formatPrice } from '../utils/helpers';

export default function ItemDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const { openSell, listingsVersion } = useUI();
    const [item, setItem] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        setError('');
        api(`/items/${id}`)
            .then(setItem)
            .catch((err) => setError(err.status === 404 || err.status === 400 ? 'This item could not be found.' : err.message));
    }, [id, listingsVersion]);

    if (error) {
        return (
            <div className="container page-top text-center py-5">
                <i className="fas fa-box-open fa-3x text-muted mb-3" />
                <h3>{error}</h3>
                <Link to="/" className="btn btn-primary mt-2">Back to Home</Link>
            </div>
        );
    }
    if (!item) return <div className="page-top"><Loader /></div>;

    const isBorrow = item.type === 'borrow';
    const isOwner = user && item.sellerId === user._id;

    return (
        <div className="container page-top pb-5">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to={`/category/${item.category}`}>{categoryLabel(item.category)}</Link></li>
                    <li className="breadcrumb-item active text-truncate" aria-current="page">{item.name}</li>
                </ol>
            </nav>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="position-relative">
                        <ItemImage src={itemImageUrl(item)} alt={item.name} className="img-fluid rounded shadow-sm w-100 detail-img" />
                        <span className={`badge ${isBorrow ? 'bg-warning text-dark' : 'bg-success'} position-absolute top-0 end-0 m-3 px-3 py-2 fs-6`}>
                            {isBorrow ? 'For Borrow' : 'For Sale'}
                        </span>
                    </div>
                </div>
                <div className="col-md-6">
                    <h1 className="h2">{item.name}</h1>
                    <div className="mb-3">
                        <PriceLabel item={item} className="h3 text-primary" />
                    </div>
                    {isBorrow && item.deposit > 0 && (
                        <p className="mb-2">
                            <i className="fas fa-shield-alt text-muted me-2" />
                            Refundable deposit: <strong>{formatPrice(item.deposit)}</strong>
                        </p>
                    )}
                    {item.status !== 'available' && (
                        <div className="alert alert-secondary py-2">
                            This item is currently {item.status === 'borrowed' ? 'borrowed' : 'sold'}.
                        </div>
                    )}

                    <table className="table table-sm detail-table mb-4">
                        <tbody>
                            <tr><th scope="row">Condition</th><td>{item.condition}</td></tr>
                            <tr><th scope="row">Category</th><td>{categoryLabel(item.category)}</td></tr>
                            {isBorrow && <tr><th scope="row">Borrow period</th><td>{item.rentalPeriod || 'Ask seller'}</td></tr>}
                            <tr><th scope="row">Seller</th><td>{item.sellerName}</td></tr>
                            <tr><th scope="row">Listed on</th><td>{formatDate(item.createdAt, false)}</td></tr>
                            <tr><th scope="row">Views</th><td>{item.views}</td></tr>
                        </tbody>
                    </table>

                    <h5>Description</h5>
                    <p className="text-body-secondary description-text">{item.description}</p>

                    <div className="d-flex flex-wrap gap-2 mt-4">
                        {isOwner ? (
                            <>
                                <button type="button" className="btn btn-primary" onClick={() => openSell(item)}>
                                    <i className="fas fa-edit me-1" /> Edit Listing
                                </button>
                                <Link to="/profile?tab=listings" className="btn btn-outline-secondary">My Listings</Link>
                            </>
                        ) : (
                            <>
                                <CartButton item={item} className="btn-lg" />
                                <Link to="/cart" className="btn btn-lg btn-outline-secondary">
                                    <i className="fas fa-shopping-cart me-1" /> Go to Cart
                                </Link>
                            </>
                        )}
                    </div>
                    <p className="small text-muted mt-3 mb-0">
                        <i className="fas fa-money-bill-wave me-1" /> Payment: Cash on Delivery. Meet the seller on campus to collect the item.
                    </p>
                </div>
            </div>
        </div>
    );
}
