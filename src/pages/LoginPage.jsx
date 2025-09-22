import React, {useState, useContext} from 'react'; // Importando o useContext
import { useNavigate } from 'react-router-dom';
import {login} from '../services/authService'; //Importa a função de login
import { AuthContext } from '../context/AuthContext'; // 2. Importando o AuthContext

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
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
                </div>
                <div>
                    <label htmlFor="senha">Senha: </label>
                    <input type="password" id='senha' value={senha} 
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    />
                </div>
                <button type="submit">Entrar</button>
            </form>
            {error && <p style={{color: 'red'}}>{error}</p>}
        </div>
    );
}

export default LoginPage;