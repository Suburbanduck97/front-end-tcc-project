import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RecuperarSenhaPage.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RecuperarSenhaPage = () => {
    const navigate = useNavigate();

    // Estados para controlar o fluxo
    const [step, setStep] = useState(1); // 1: Inserir e-mail, 2: Inserir nova senha
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfimarSenha] = useState('');
    
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

    // Estados para feedback
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // PASSO 1: Verificar se o e-mail existe no sistema
    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        
        try {
            const response = await fetch('http://localhost:8080/auth/recuperarSenha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                // E-mail verificado com sucesso, avança para o próximo passo
                setStep(2);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'E-mail não encontrado ou inválido.');
            }
        } catch {
            setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    // PASSO 2: Redefinir a senha
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (senha !== confirmarSenha) {
            setError('As senhas não coincidem!');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:8080/auth/novaSenha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, novaSenha: senha }),
            });

            const responseData = await response.json();

            if (response.ok) {
                setMessage(responseData.message + ' Redirecionando para o login em 5 segundos...');
                setTimeout(() => navigate('/login'), 5000);
            } else {
                setError(responseData.message || 'Não foi possível redefinir a senha.');
            }
        } catch {
            setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formBox}>
                {step === 1 ? (
                    // RENDERIZAÇÃO DO PASSO 1
                    <>
                        <h2>Recuperar Senha</h2>
                        <p>Digite seu e-mail para continuar.</p>
                        <form onSubmit={handleVerifyEmail}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu.email@exemplo.com"
                                required
                                className={styles.input}
                            />
                            <button type="submit" disabled={loading} className={styles.button}>
                                {loading ? 'Verificando...' : 'Verificar E-mail'}
                            </button>
                        </form>
                    </>
                ) : (
                    // RENDERIZAÇÃO DO PASSO 2
                    <>
                        <h2>Definir Nova Senha</h2>
                        <p>Digite sua nova senha para o e-mail: <strong>{email}</strong></p>
                        <form onSubmit={handleResetPassword}>
                            <div className={styles.inputWrapper}>
                                <input
                                    // MODIFICADO: Tipo dinâmico
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
                                    // MODIFICADO: Tipo dinâmico
                                    type={showConfirmarSenha ? "text" : "password"}
                                    value={confirmarSenha}
                                    onChange={(e) => setConfimarSenha(e.target.value)}
                                    placeholder="Confirmar Nova Senha"
                                    required
                                    className={styles.input}
                                />
                                <span className={styles.eyeIcon} onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}>
                                    {showConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            <button type="submit" disabled={loading} className={styles.button}>
                                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                            </button>
                        </form>
                    </>
                )}
                
                {/* Exibição de mensagens */}
                {error && <p className={styles.errorMessage}>{error}</p>}
                {message && <p className={styles.successMessage}>{message}</p>}
                
                {!message && <Link to="/login" className={styles.backLink}>Voltar para o Login</Link>}
            </div>
        </div>
    );
};

export default RecuperarSenhaPage;