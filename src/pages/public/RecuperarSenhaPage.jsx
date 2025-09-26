import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './RecuperarSenhaPage.module.css'; // Importando o CSS Module

const RecuperarSenhaPage = () => {
    const [email, setEmail] =useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:8080/auth/recuperarSenha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.text();
            setMessage(data);

        } catch{
            setMessage('Erro ao tentar conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formBox}>
                <h2>Recuperar Senha</h2>
                <p>Digite seu e-mail para receber um link de redefinição.</p>
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
                {message && <p className={styles.message}>{message}</p>}
                <Link to="/login" className={styles.backLink}>Voltar para o Login</Link>
            </div>
        </div>
    );
};

export default RecuperarSenhaPage;