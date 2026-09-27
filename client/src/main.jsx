import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import App from './App';
import { AlertProvider } from './context/AlertContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AlertProvider>
                <AuthProvider>
                    <UIProvider>
                        <CartProvider>
                            <App />
                        </CartProvider>
                    </UIProvider>
                </AuthProvider>
            </AlertProvider>
        </BrowserRouter>
    </StrictMode>
);
