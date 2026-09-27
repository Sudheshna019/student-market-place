import { PLACEHOLDER_IMAGE } from '../api';

// <img> that falls back to the placeholder when the image is missing (e.g. a deleted listing).
export default function ItemImage({ src, alt, className, style }) {
    return (
        <img
            src={src || PLACEHOLDER_IMAGE}
            alt={alt}
            className={className}
            style={style}
            loading="lazy"
            onError={(e) => {
                if (!e.currentTarget.src.endsWith(PLACEHOLDER_IMAGE)) e.currentTarget.src = PLACEHOLDER_IMAGE;
            }}
        />
    );
}

export function orderItemImageUrl(itemId) {
    return itemId ? `/api/items/${itemId}/image` : PLACEHOLDER_IMAGE;
}
