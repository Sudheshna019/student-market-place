import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { api, itemImageUrl } from '../api';
import { useAlert } from '../context/AlertContext';
import { useUI } from '../context/UIContext';
import { CATEGORIES, CONDITIONS, compressImage } from '../utils';

const EMPTY = {
    type: 'sale',
    name: '',
    category: '',
    price: '',
    condition: 'Good',
    description: '',
    deposit: '',
    rentalPeriod: ''
};

// Create a new listing, or edit one when `item` is passed.
export default function SellItemModal({ show, onHide, item }) {
    const showAlert = useAlert();
    const { listingSaved } = useUI();
    const [form, setForm] = useState(EMPTY);
    const [image, setImage] = useState('');
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const editing = Boolean(item);

    useEffect(() => {
        if (!show) return;
        setError('');
        setImage('');
        if (item) {
            setForm({
                type: item.type,
                name: item.name,
                category: item.category,
                price: String(item.price),
                condition: item.condition,
                description: item.description,
                deposit: item.deposit ? String(item.deposit) : '',
                rentalPeriod: item.rentalPeriod || ''
            });
            setPreview(item.hasImage ? itemImageUrl(item) : '');
        } else {
            setForm(EMPTY);
            setPreview('');
        }
    }, [show, item]);

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    async function handleImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const dataUrl = await compressImage(file);
            setImage(dataUrl);
            setPreview(dataUrl);
            setError('');
        } catch (err) {
            e.target.value = '';
            setError(err.message);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!editing && !image) return setError('Please add a photo of your item');

        const body = {
            ...form,
            name: form.name.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            deposit: form.type === 'borrow' ? Number(form.deposit || 0) : 0,
            rentalPeriod: form.type === 'borrow' ? form.rentalPeriod.trim() : ''
        };
        if (image) body.image = image;

        setBusy(true);
        setError('');
        try {
            if (editing) {
                await api(`/items/${item._id}`, { method: 'PUT', body });
                showAlert('success', 'Listing updated');
            } else {
                await api('/items', { method: 'POST', body });
                showAlert('success', `Item listed successfully for ${form.type === 'borrow' ? 'borrowing' : 'sale'}!`);
            }
            listingSaved();
            onHide();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    const isBorrow = form.type === 'borrow';

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title as="h5">
                    {editing ? 'Edit Listing' : isBorrow ? 'List Item for Borrowing' : 'List Item for Sale'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger py-2">{error}</div>}

                    <div className="mb-3">
                        <label className="form-label d-block">Listing Type</label>
                        <div className="btn-group w-100" role="group" aria-label="Listing type">
                            <input type="radio" className="btn-check" name="listingType" id="typeSale" checked={!isBorrow} onChange={() => setForm((f) => ({ ...f, type: 'sale' }))} />
                            <label className="btn btn-outline-primary" htmlFor="typeSale"><i className="fas fa-tag me-1" /> Sell</label>
                            <input type="radio" className="btn-check" name="listingType" id="typeBorrow" checked={isBorrow} onChange={() => setForm((f) => ({ ...f, type: 'borrow' }))} />
                            <label className="btn btn-outline-primary" htmlFor="typeBorrow"><i className="fas fa-handshake me-1" /> Lend (Borrow)</label>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="itemImage" className="form-label">Item Image</label>
                        <input type="file" className="form-control" id="itemImage" accept="image/*" onChange={handleImage} />
                        <div className="form-text">
                            {editing ? 'Leave empty to keep the current photo.' : 'Upload a clear image of your item (max 5MB)'}
                        </div>
                        {preview && <img src={preview} alt="Preview" className="img-thumbnail mt-2 sell-preview" />}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="itemName" className="form-label">Item Name</label>
                        <input type="text" className="form-control" id="itemName" value={form.name} onChange={set('name')} required minLength={2} maxLength={100} placeholder="Enter item name" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="itemCategory" className="form-label">Category</label>
                        <select className="form-select" id="itemCategory" value={form.category} onChange={set('category')} required>
                            <option value="">Select category</option>
                            {CATEGORIES.map((c) => (
                                <option key={c.slug} value={c.slug}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="row">
                        <div className="col-sm-6 mb-3">
                            <label htmlFor="itemPrice" className="form-label">{isBorrow ? 'Rent (₹)' : 'Price (₹)'}</label>
                            <input type="number" className="form-control" id="itemPrice" value={form.price} onChange={set('price')} required min="0" step="1" placeholder={isBorrow ? 'Rent for the period' : 'Enter price'} />
                        </div>
                        <div className="col-sm-6 mb-3">
                            <label htmlFor="itemCondition" className="form-label">Condition</label>
                            <select className="form-select" id="itemCondition" value={form.condition} onChange={set('condition')} required>
                                {CONDITIONS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {isBorrow && (
                        <div className="row">
                            <div className="col-sm-6 mb-3">
                                <label htmlFor="itemDeposit" className="form-label">Refundable Deposit (₹)</label>
                                <input type="number" className="form-control" id="itemDeposit" value={form.deposit} onChange={set('deposit')} min="0" step="1" placeholder="e.g. 500" />
                            </div>
                            <div className="col-sm-6 mb-3">
                                <label htmlFor="itemRental" className="form-label">Borrow Period</label>
                                <input type="text" className="form-control" id="itemRental" value={form.rentalPeriod} onChange={set('rentalPeriod')} maxLength={50} placeholder="e.g. 2 weeks" required />
                            </div>
                        </div>
                    )}
                    <div className="mb-3">
                        <label htmlFor="itemDescription" className="form-label">Description</label>
                        <textarea className="form-control" id="itemDescription" rows="3" value={form.description} onChange={set('description')} required minLength={5} maxLength={1000} placeholder="Describe your item" />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={busy}>
                        {busy ? 'Saving…' : editing ? 'Save Changes' : 'List Item'}
                    </button>
                </form>
            </Modal.Body>
        </Modal>
    );
}
