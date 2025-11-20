import React from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, onConfirm, title, children, isLoading }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.header}>
                    <h2 className={styles.modalTitle}>{title}</h2>
                    <button onClick={onClose} disabled={isLoading} className={styles.closeBtn}>
                        X
                    </button>
                </div>
                
                <div className={styles.modalMessage}>
                    {children}
                </div>

                <div className={styles.modalActions}>
                    <button
                        className={`${styles.modalButton} ${styles.cancelButton}`}
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>

                    <button
                        className={`${styles.modalButton} ${styles.confirmButton}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {isLoading ? 'A processar...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;