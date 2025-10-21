// Crie um novo arquivo ou renomeie o seu para: SolicitarRedefinicaoPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './RecuperarSenhaPage.module.css'; // Pode manter o mesmo CSS

const SolicitarRedefinicaoPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            // ATUALIZADO: Chamando o novo endpoint do backend
            const response = await fetch('http://localhost:8080/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            // ATUALIZADO: Lógica de sucesso
            // Por segurança, sempre mostramos uma mensagem genérica para não confirmar se um e-mail existe no sistema.
            if (response.ok) {
                setMessage('Se o e-mail estiver cadastrado, um link de recuperação foi enviado.');
            } else {
                // Mesmo em caso de erro, a mensagem é a mesma por segurança.
                setMessage('Se o e-mail estiver cadastrado, um link de recuperação foi enviado.');
            }
        } catch {
            setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formBox}>
                <h2>Recuperar Senha</h2>
                <p>Digite seu e-mail e enviaremos um link para você redefinir sua senha.</p>
                
                {/* Se uma mensagem de sucesso já foi enviada, não mostramos o formulário */}
                {!message ? (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu.email@exemplo.com"
                            required
                            className={styles.input}
                        />
                        <button type="submit" disabled={loading} className={styles.button}>
                            {loading ? 'Enviando...' : 'Enviar Link'}
                        </button>
                    </form>
                ) : null}

                {error && <p className={`${styles.feedbackMessage} ${styles.errorMessage}`}>{error}</p>}
                {message && <p className={`${styles.feedbackMessage} ${styles.successMessage}`}>{message}</p>}
                
                <Link to="/login" className={styles.backLink}>Voltar para o Login</Link>
            </div>
        </div>
    );
};

export default SolicitarRedefinicaoPage;