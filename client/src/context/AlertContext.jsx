import { createContext, useCallback, useContext, useRef, useState } from 'react';

const AlertContext = createContext(null);

// Toast-style Bootstrap alerts pinned to the top of the page, like the original showAlert().
export function AlertProvider({ children }) {
    const [alerts, setAlerts] = useState([]);
    const nextId = useRef(0);

    const dismiss = useCallback((id) => {
        setAlerts((list) => list.filter((a) => a.id !== id));
    }, []);

    const showAlert = useCallback(
        (type, message) => {
            const id = ++nextId.current;
            setAlerts((list) => [...list.slice(-2), { id, type, message }]);
            setTimeout(() => dismiss(id), 5000);
        },
        [dismiss]
    );

    return (
        <AlertContext.Provider value={showAlert}>
            {children}
            <div className="alert-stack" aria-live="polite">
                {alerts.map((a) => (
                    <div key={a.id} className={`alert alert-${a.type} alert-dismissible fade show shadow-sm`} role="alert">
                        {a.message}
                        <button type="button" className="btn-close" aria-label="Close" onClick={() => dismiss(a.id)} />
                    </div>
                ))}
            </div>
        </AlertContext.Provider>
    );
}

export function useAlert() {
    return useContext(AlertContext);
}
