export default function Loader({ label = 'Loading…' }) {
    return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{label}</span>
            </div>
        </div>
    );
}
