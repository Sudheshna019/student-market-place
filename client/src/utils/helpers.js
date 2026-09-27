export const CATEGORIES = [
    { slug: 'textbooks', label: 'Textbooks' },
    { slug: 'gadgets', label: 'Gadgets' },
    { slug: 'stationery', label: 'Stationery' },
    { slug: 'lab-equipment', label: 'Lab Equipment' }
];

export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export function categoryLabel(slug) {
    return CATEGORIES.find((c) => c.slug === slug)?.label || 'Other';
}

const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export function formatPrice(value) {
    return rupees.format(Number(value) || 0);
}

// Totals for the items in the cart that can still be bought.
export function cartTotals(items) {
    const available = items.filter((i) => i.available);
    const subtotal = available.reduce((sum, i) => sum + i.price, 0);
    const deposits = available.reduce((sum, i) => sum + (i.type === 'borrow' ? i.deposit : 0), 0);
    return { count: available.length, subtotal, deposits, total: subtotal + deposits };
}

export function formatDate(value, withTime = true) {
    if (!value) return '';
    return new Date(value).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
    });
}

export function shortId(id) {
    return id ? id.slice(-8).toUpperCase() : '';
}

export const ORDER_STATUS_BADGE = {
    pending: 'bg-warning text-dark',
    confirmed: 'bg-primary',
    delivered: 'bg-success',
    cancelled: 'bg-danger'
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Resizes an image in the browser and returns a JPEG data URL, so uploads stay small.
export function compressImage(file, maxSize = 800, quality = 0.75) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('Please choose an image file'));
            return;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
            reject(new Error('Image must be smaller than 5 MB'));
            return;
        }

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Couldn't read that image. Try a JPG or PNG."));
        };
        img.src = url;
    });
}
