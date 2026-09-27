import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ItemGrid from '../components/ItemGrid';
import NotFound from './NotFound';

// Hero text and styling for each category page, carried over from the original site.
const PAGES = {
    textbooks: {
        title: 'Find Your Textbooks',
        subtitle: 'Buy or sell used textbooks at affordable prices.',
        heading: 'Available Textbooks'
    },
    gadgets: {
        title: 'Gadgets',
        subtitle: 'Find the best gadgets for your academic and personal needs.',
        heading: 'Available Gadgets'
    },
    stationery: {
        title: 'Stationery',
        subtitle: 'Find the best deals on quality stationery for your academic needs.',
        heading: 'Available Stationery'
    },
    'lab-equipment': {
        title: 'Lab Equipment',
        subtitle: 'Find the best lab equipment for your experiments and research.',
        heading: 'Available Lab Equipment'
    }
};

const TYPE_FILTERS = [
    { value: '', label: 'All' },
    { value: 'sale', label: 'For Sale' },
    { value: 'borrow', label: 'For Borrow' }
];

export default function Category() {
    const { slug } = useParams();
    const [type, setType] = useState('');
    const page = PAGES[slug];

    useEffect(() => setType(''), [slug]);

    if (!page) return <NotFound />;

    return (
        <>
            <section className={`hero-section category-hero hero-${slug}`}>
                <div className="container text-center hero-content">
                    <h1 className="display-4 fw-bold">{page.title}</h1>
                    <p className="lead mb-0">{page.subtitle}</p>
                </div>
            </section>

            <section className="py-5">
                <div className="container">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                        <h2 className="mb-0">{page.heading}</h2>
                        <div className="btn-group" role="group" aria-label="Filter by listing type">
                            {TYPE_FILTERS.map((f) => (
                                <button
                                    key={f.value}
                                    type="button"
                                    className={`btn btn-sm ${type === f.value ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setType(f.value)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ItemGrid category={slug} type={type} emptyText="No items available in this category" />
                </div>
            </section>
        </>
    );
}
