const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const IMAGE_DATA_URL_RE = /^data:image\/(jpeg|jpg|png|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/;

// ~1.5 MB of binary once decoded; the client compresses images well below this.
const MAX_IMAGE_LENGTH = 2 * 1024 * 1024;

const CATEGORIES = ['textbooks', 'gadgets', 'stationery', 'lab-equipment', 'other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const ITEM_TYPES = ['sale', 'borrow'];

function str(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function isEmail(value) {
    return EMAIL_RE.test(value);
}

function isPhone(value) {
    return PHONE_RE.test(value.replace(/\s/g, ''));
}

function isImageDataUrl(value) {
    return typeof value === 'string' && value.length <= MAX_IMAGE_LENGTH && IMAGE_DATA_URL_RE.test(value);
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Returns an error message, or null when the item fields are valid.
// With partial=true only the fields present in `data` are checked (for updates).
function validateItem(data, { partial = false } = {}) {
    const has = (key) => !partial || data[key] !== undefined;

    if (has('name')) {
        const name = str(data.name);
        if (name.length < 2 || name.length > 100) return 'Item name must be 2-100 characters';
    }
    if (has('description')) {
        const description = str(data.description);
        if (description.length < 5 || description.length > 1000) return 'Description must be 5-1000 characters';
    }
    if (has('price')) {
        const price = Number(data.price);
        if (!Number.isFinite(price) || price < 0 || price > 1000000) return 'Enter a valid price';
    }
    if (has('category') && !CATEGORIES.includes(data.category)) return 'Select a valid category';
    if (data.condition !== undefined && !CONDITIONS.includes(data.condition)) return 'Select a valid condition';
    if (data.type !== undefined && !ITEM_TYPES.includes(data.type)) return 'Type must be sale or borrow';
    if (data.deposit !== undefined && data.deposit !== '') {
        const deposit = Number(data.deposit);
        if (!Number.isFinite(deposit) || deposit < 0 || deposit > 1000000) return 'Enter a valid deposit';
    }
    if (data.rentalPeriod !== undefined && str(data.rentalPeriod).length > 50) return 'Rental period is too long';
    if (data.image !== undefined && data.image !== '' && !isImageDataUrl(data.image)) {
        return 'Image must be a JPEG, PNG, WEBP, GIF or AVIF under 1.5 MB';
    }
    return null;
}

module.exports = {
    str,
    isEmail,
    isPhone,
    isImageDataUrl,
    escapeRegex,
    validateItem,
    CATEGORIES,
    CONDITIONS,
    ITEM_TYPES
};
