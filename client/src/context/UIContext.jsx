import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useAlert } from './AlertContext';
import { LoginModal, RegisterModal } from '../components/AuthModals';
import SellItemModal from '../components/SellItemModal';
import ProfileModal from '../components/ProfileModal';

const UIContext = createContext(null);

// Owns the site-wide modals (login, register, profile, sell item) so any page can open them.
export function UIProvider({ children }) {
    const { user } = useAuth();
    const showAlert = useAlert();
    const [modal, setModal] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    // Bumped whenever a listing is created or edited so item lists can reload.
    const [listingsVersion, setListingsVersion] = useState(0);

    const close = useCallback(() => setModal(null), []);
    const openLogin = useCallback(() => setModal('login'), []);
    const openRegister = useCallback(() => setModal('register'), []);
    const openProfile = useCallback(() => setModal('profile'), []);

    const openSell = useCallback(
        (item = null) => {
            if (!user) {
                showAlert('warning', 'Please log in to list an item');
                setModal('login');
                return;
            }
            setEditingItem(item);
            setModal('sell');
        },
        [user, showAlert]
    );

    const listingSaved = useCallback(() => setListingsVersion((v) => v + 1), []);

    const value = useMemo(
        () => ({ openLogin, openRegister, openProfile, openSell, listingsVersion, listingSaved }),
        [openLogin, openRegister, openProfile, openSell, listingsVersion, listingSaved]
    );

    return (
        <UIContext.Provider value={value}>
            {children}
            <LoginModal show={modal === 'login'} onHide={close} />
            <RegisterModal show={modal === 'register'} onHide={close} />
            <ProfileModal show={modal === 'profile'} onHide={close} />
            <SellItemModal show={modal === 'sell'} onHide={close} item={editingItem} />
        </UIContext.Provider>
    );
}

export function useUI() {
    return useContext(UIContext);
}
