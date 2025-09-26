import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './NovaSenhaPage.module.css';

const NovaSenhaPage = () => {
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const [token, setToken] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenFromUrl = params.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError('Token de redefinição não encontrado na URL.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (senha !== confirmarSenha) {
            setError('As senhas não coincidem!');
            return;
        }
        if (!token) {
            setError('Token inválido ou ausente.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:8080/auth/novaSenha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, novaSenha: senha }),
            });

            const responseText = await response.text();

            if (response.ok) {
                setMessage(responseText + ' Você será redirecionado para o login em 5 segundos.');
                setTimeout(() => navigate('/login'), 5000);
            } else {
                setError(responseText);
            }
        } catch {
            setError('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formBox}>
                <h2>Definir Nova Senha</h2>
                {error && <p className={styles.errorMessage}>{error}</p>}
                {message && <p className={styles.successMessage}>{message}</p>}
                
                {!message && (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Nova Senha"
                            required
                            style={styles.input}
                        />
                        <input
                            type="password"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            placeholder="Confirmar Nova Senha"
                            required
                            style={styles.input}
                        />
                        <button type="submit" disabled={!token || loading} style={styles.button}>
                            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default NovaSenhaPage;
