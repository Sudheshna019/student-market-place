import { useSearchParams } from 'react-router';
import ItemGrid from '../components/ItemGrid';

export default function Search() {
    const [params] = useSearchParams();
    const q = (params.get('q') || '').trim();

    return (
        <section className="container page-top pb-5">
            <h2 className="mb-1">Search results</h2>
            <p className="text-muted mb-4">
                {q ? <>Showing items matching “{q}”</> : 'Type something in the search box to find items.'}
            </p>
            {q && <ItemGrid search={q} emptyText="No items found matching your search" />}
        </section>
    );
}
