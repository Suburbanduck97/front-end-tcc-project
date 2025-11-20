import { useContext } from 'react';
import { ToastContext } from './ToastContext'; 

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast deve ser usado dentro de um ToastProvider');
    }
    return context;
};