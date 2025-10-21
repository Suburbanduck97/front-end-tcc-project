// Crie este novo arquivo: ResetarSenhaPage.js
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './RecuperarSenhaPage.module.css'; // Reutilize o mesmo estilo

const ResetarSenhaPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); // Hook para ler os parâmetros da URL

    // Estados do componente
    const [token, setToken] = useState(null);
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

    // Estados de feedback
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Efeito para pegar o token da URL assim que a página carregar
    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError('Token não encontrado ou inválido. Por favor, solicite um novo link.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (senha !== confirmarSenha) {
            setError('As senhas não coincidem!');
            return;
        }
        if (!token) {
            setError('Token é inválido. Não é possível continuar.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            // ATUALIZADO: Chamando o endpoint de redefinição com o token
            const response = await fetch('http://localhost:8080/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, novaSenha: senha }),
            });

            if (response.ok) {
                setMessage('Senha redefinida com sucesso! Redirecionando para o login em 5 segundos...');
                setTimeout(() => navigate('/login'), 5000);
            } else {
                const errorData = await response.text();
                setError(errorData || 'Não foi possível redefinir a senha. O token pode ser inválido ou ter expirado.');
            }
        } catch  {
            setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formBox}>
                <h2>Definir Nova Senha</h2>
                
                {/* Só mostra o formulário se não houver mensagem de sucesso e se o token for válido */}
                {!message && token && (
                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputWrapper}>
                            <input
                                type={showSenha ? "text" : "password"}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="Nova Senha"
                                required
                                className={styles.input}
                            />
                            <span className={styles.eyeIcon} onClick={() => setShowSenha(!showSenha)}>
                                {showSenha ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        
                        <div className={styles.inputWrapper}>
                            <input
                                type={showConfirmarSenha ? "text" : "password"}
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                placeholder="Confirmar Nova Senha"
                                required
                                className={styles.input}
                            />
                            <span className={styles.eyeIcon} onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}>
                                {showConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <button type="submit" disabled={loading || !token} className={styles.button}>
                            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                        </button>
                    </form>
                )}
                
                {error && <p className={`${styles.feedbackMessage} ${styles.errorMessage}`}>{error}</p>}
                {message && <p className={`${styles.feedbackMessage} ${styles.successMessage}`}>{message}</p>}
            </div>
        </div>
    );
};

export default ResetarSenhaPage;