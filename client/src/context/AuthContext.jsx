import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, session } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => (session.getToken() ? session.getUser() : null));

    const logout = useCallback(() => {
        session.clear();
        setUser(null);
    }, []);

    // Refresh the stored profile on load, and sign out when the API says the token expired.
    useEffect(() => {
        if (session.getToken()) {
            api('/auth/me')
                .then(({ user: fresh }) => {
                    session.updateUser(fresh);
                    setUser(fresh);
                })
                .catch(() => {});
        }

        window.addEventListener('auth:expired', logout);
        return () => window.removeEventListener('auth:expired', logout);
    }, [logout]);

    const startSession = useCallback(({ token, user: nextUser }, remember = true) => {
        session.save(token, nextUser, remember);
        setUser(nextUser);
        return nextUser;
    }, []);

    const login = useCallback(
        async (email, password, remember) => {
            const data = await api('/auth/login', { method: 'POST', body: { email, password } });
            return startSession(data, remember);
        },
        [startSession]
    );

    const register = useCallback(
        async (fullName, email, password) => {
            const data = await api('/auth/register', { method: 'POST', body: { fullName, email, password } });
            return startSession(data, true);
        },
        [startSession]
    );

    const updateUser = useCallback((nextUser) => {
        session.updateUser(nextUser);
        setUser(nextUser);
    }, []);

    const value = useMemo(
        () => ({ user, isAdmin: user?.role === 'admin', login, register, logout, updateUser, startSession }),
        [user, login, register, logout, updateUser, startSession]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
