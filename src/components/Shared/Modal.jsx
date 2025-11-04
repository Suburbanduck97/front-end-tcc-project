import React from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalContent" onClick={e => e.stopPropagation()}>
                <h2 className="modalTitle">{title || 'Confirmação'}</h2>
                <div className="modalMessage">{children}</div>
                <div className="modalActions">
                    <button className="modalButton cancelButton" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="modalButton confirmButton" onClick={onConfirm}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;

