// Small fetch wrapper for the Express API. In development Vite proxies /api to :5000.

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const session = {
    getToken() {
        return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    },
    getUser() {
        const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
        try {
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },
    // "Remember me" keeps the login in localStorage; otherwise it ends with the browser session.
    save(token, user, remember) {
        this.clear();
        const store = remember ? localStorage : sessionStorage;
        store.setItem(TOKEN_KEY, token);
        store.setItem(USER_KEY, JSON.stringify(user));
    },
    updateUser(user) {
        const store = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
        store.setItem(USER_KEY, JSON.stringify(user));
    },
    clear() {
        for (const store of [localStorage, sessionStorage]) {
            store.removeItem(TOKEN_KEY);
            store.removeItem(USER_KEY);
        }
    }
};

export async function api(path, { method = 'GET', body, signal } = {}) {
    const headers = {};
    const token = session.getToken();
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
        res = await fetch(`/api${path}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
            signal
        });
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error('Could not reach the server. Please check your connection.');
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        if (res.status === 401 && token) {
            window.dispatchEvent(new Event('auth:expired'));
        }
        const error = new Error(data?.message || `Request failed (${res.status})`);
        error.status = res.status;
        throw error;
    }
    return data;
}

export const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

export function itemImageUrl(item) {
    if (!item?.hasImage) return PLACEHOLDER_IMAGE;
    const version = item.updatedAt ? new Date(item.updatedAt).getTime() : '';
    return `/api/items/${item._id}/image?v=${version}`;
}
