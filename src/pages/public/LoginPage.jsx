import React, {useState, useContext} from 'react'; // Importando o useContext
import { useNavigate, Link } from 'react-router-dom';
import {login} from '../../services/authService'; //Importa a função de login
import { AuthContext } from '../../context/AuthContext'; // 2. Importando o AuthContext
import styles from './LoginPage.module.css';
import { FaUser, FaLock } from 'react-icons/fa';
import logoImage from '../../assets/logoEstanteGira.png'; 

function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const { loginContext } = useContext(AuthContext); // 3. Pega a função loginContext do contexto

    const handleSubmit = async (event) => {
        event.preventDefault(); // Impede o recarregamento da página
        setError(null); // Limpa erros anteriores

        try {
            // 1. Chama a função loginn do nosso serviço com as credenciais
            const data = await login({email, senha});

            // 2. Se o login for bem-sucedido, a API retornará o token
            if (data.token) {
                // Salvará os dados no local storage e atualizara o esdado global
                loginContext(data.token);
                

                alert('login realizado com sucesso!');
                // 4. Redirecionamos o usuário para a página de livros
                navigate('/livros');
            }
        } catch (err) {
            console.error("Erro no login:", err);
            const errorMenssage = err.response?.data?.message || 'E-mail ou senha inválidos.'
            setError(errorMenssage);
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
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <div className={styles.inputWrapper}>
                                <FaLock className={styles.inputIcon} />
                                <input 
                                    type="password" 
                                    id='senha' 
                                    className={styles.input}
                                    placeholder="Digite sua senha"
                                    value={senha} 
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <p className={styles.forgotPasswordLink}>
                            Esqueceu a senha? <Link to="/recuperarSenha">recuperar</Link>
                        </p>
                        <button type="submit" className={styles.mainButton}>Entrar</button>
                    </form>

                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <p className={styles.signupLink}>
                        Não possui uma conta? <Link to="/cadastro">cadastre-se</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;