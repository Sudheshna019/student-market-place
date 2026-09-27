import { Link } from 'react-router';
import ItemGrid from '../components/ItemGrid';
import { useUI } from '../context/UIContext';
import { CATEGORIES } from '../utils';

export default function Home() {
    const { openSell } = useUI();

    return (
        <>
            <section className="hero-section hero-home">
                <div className="container text-center">
                    <div className="hero-home-content">
                        <h1 className="display-4 fw-bold">Welcome to Student MarketPlace</h1>
                        <p className="lead mb-0">Buy, Sell academic items securely here!</p>
                    </div>
                </div>
            </section>

            <section className="py-5 bg-light">
                <div className="container">
                    <h2 className="text-center mb-5">Shop by Category</h2>
                    <div className="row g-4">
                        {CATEGORIES.map((c) => (
                            <div key={c.slug} className="col-6 col-md-4 col-lg-2">
                                <div className="card category-card h-100 shadow-sm">
                                    <img src={`/images/cat-${c.slug}.webp`} className="card-img-top category-img" alt={c.label} />
                                    <div className="card-body text-center">
                                        <h5 className="card-title">{c.label}</h5>
                                        <Link to={`/category/${c.slug}`} className="stretched-link" aria-label={c.label} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-5">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0">Featured Products</h2>
                        <button type="button" className="btn btn-outline-primary" onClick={() => openSell()}>
                            <i className="fas fa-plus" /> Sell Item
                        </button>
                    </div>
                    <ItemGrid limit={12} />
                </div>
            </section>
        </>
    );
}
