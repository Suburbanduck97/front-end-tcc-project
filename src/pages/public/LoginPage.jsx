import React, {useState, useContext} from 'react'; // Importando o useContext
import { useNavigate, Link } from 'react-router-dom';
import {login} from '../../services/authService'; //Importa a função de login
import { AuthContext } from '../../context/AuthContext'; // 2. Importando o AuthContext
import styles from './LoginPage.module.css';
import { FaUser, FaLock,FaEye, FaEyeSlash } from 'react-icons/fa';
import logoImage from '../../assets/logoEstanteGira.png'; 

function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const navigate = useNavigate();
    const { loginContext } = useContext(AuthContext); // 3. Pega a função loginContext do contexto

    const handleSubmit = async (event) => {
        event.preventDefault(); // Impede o recarregamento da página
        setError(null); // Limpa erros anteriores
        setSuccess(null);
        setIsLoading(true);


        try {
            // 1. Chama a função loginn do nosso serviço com as credenciais
            const data = await login({email, senha});

            // 2. Se o login for bem-sucedido, a API retornará o token
            if (data.token) {
                // Salvará os dados no local storage e atualizara o esdado global
                loginContext(data.token);
                setSuccess('Login realizado com sucesso! Redirecionando...');

                setTimeout(() => {
                    navigate('/livros');
                }, 1500); 

            }
        } catch (err) {
            console.error("Erro no login:", err);
             let errorMessage = 'E-mail ou senha inválidos.'; // Mensagem padrão
            if (err.response?.data) {
                if (typeof err.response.data.message === 'string') {
                    errorMessage = err.response.data.message;
                } else if (typeof err.response.data.errors === 'object') {
                    // Concatena múltiplos erros, se houver
                    errorMessage = Object.values(err.response.data.errors).join(' ');
                }
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return(
         <div className={styles.loginPage}>
            <div className={styles.leftPanel}>
                <div className={styles.logoContainer}>
                    {/* Renderiza a imagem da logo */}
                    <img src={logoImage} alt="Estante Gira Logo" className={styles.logoImage} />
                    {/* Renderiza o texto da logo, se parte da imagem não for */}
                    <h1 className={styles.logoText}>Estante Gira</h1>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.loginBox}>
                    <h2 className={styles.title}>LOGIN</h2>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <div className={styles.inputWrapper}>
                                <FaUser className={styles.inputIcon} /> 
                                <input 
                                    type="email" 
                                    id="email" 
                                    className={styles.input}
                                    placeholder="Digite seu email"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <div className={styles.inputWrapper}>
                                <FaLock className={styles.inputIcon} />
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    id='senha' 
                                    className={styles.input}
                                    placeholder="Digite sua senha"
                                    value={senha} 
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                                <span 
                                    className={styles.eyeIcon} 
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>
                        <p className={styles.forgotPasswordLink}>
                            Esqueceu a senha? <Link to="/recuperarSenha">recuperar</Link>
                        </p>
                        <button type="submit" className={styles.mainButton} disabled={isLoading}>
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>
                    
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {success && <p className={styles.successMessage}>{success}</p>}

                    <p className={styles.signupLink}>
                        Não possui uma conta? <Link to="/cadastro">cadastre-se</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;