import { useContext } from 'react';
import { ToastContext } from './ToastContext'; // Importa o contexto do outro ficheiro

// Hook customizado para facilitar o uso
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast deve ser usado dentro de um ToastProvider');
    }
    return context;
};