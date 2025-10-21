import React, { createContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../components/Shared/Toast.css'; // Certifique-se que o caminho está correto

// 1. EXPORTE O CONTEXTO para que o hook possa usá-lo
// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext();

// Componente Toast individual (interno a este ficheiro)
const Toast = ({ message, type, onClose }) => {
    const icon = type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />;

    React.useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast ${type}`}>
            <div className="toastIcon">{icon}</div>
            <div className="toastMessage">{message}</div>
            <div className="progressBar"></div>
        </div>
    );
};

// Provider que vai gerir e exibir os toasts
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    }, []);

    const removeToast = useCallback(id => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {createPortal(
                <div className="toastContainer">
                    {toasts.map(toast => (
                        <Toast
                            key={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
