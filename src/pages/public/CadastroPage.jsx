// src/pages/CadastroPage.jsx
import { useState, useEffect } from 'react';
// 1. Importe o hook 'useNavigate' para redirecionamento
import { useNavigate } from 'react-router-dom';
// 2. Importe nossa nova função de signup
import { signup } from '../../services/authService';
import styles from './CadastroPage.module.css';
import { getEstados, getCidadesPorEstado } from '../../services/ibgeService';
// No topo do arquivo, importe os ícones
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function CadastroPage() {

  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [loadingCidades, setLoadingCidades] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    sexo: 'MASCULINO', // Pré-seleciona um valor padrão
    cpf: '',
    email: '',
    senha: '',
    telefone: '',
    estado: '',
    cidade: '',
    bairro: '',
    dataNascimento: '',
    role:'LEITOR',
    codigoAdministrativo: '' 
  });

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [showCodigoAdmin, setShowCodigoAdmin] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 3. Inicialize o hook de navegação
  const navigate = useNavigate();

  useEffect(() => {
    getEstados().then(data => {
      setEstados(data);
    });
  }, []);

  useEffect(() => {
    const estadoSelecionado = formData.estado;
    if (estadoSelecionado) {
      setLoadingCidades(true); // Mostra o feedback de carregamento
      getCidadesPorEstado(estadoSelecionado).then(data => {
        setCidades(data);
        setLoadingCidades(false); // Esconde o feedback de carregamento
      });
    } else {
      // Se nenhum estado for selecionado, limpa a lista de cidades
      setCidades([]);
    }
  }, [formData.estado]);

  const handleChange = (event) => {
    const { id, value } = event.target;

    setFormData(prevState => {
      const newState = { ...prevState, [id]: value };

      // 5. Se o usuário mudou o estado, reseta a cidade selecionada.
      if (id === 'estado') {
        newState.cidade = '';
      }

      return newState;
    });
  };

  // 4. Transformamos o handleSubmit em uma função assíncrona
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    
    const dadosParaEnviar = { ...formData };
    if (dadosParaEnviar.role !== 'BIBLIOTECARIO') {
        delete dadosParaEnviar.codigoAdministrativo;
    }

    try {
      // 5. Chamamos a função do nosso serviço com os dados do formulário
      await signup(dadosParaEnviar);
      
      // 6. Se o cadastro for bem-sucedido:
      setSuccess('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
      setTimeout(() => {
          navigate('/login');
      }, 2000); // Redireciona o usuário para /login

    } catch (err) {
      // 7. Se a API retornar um erro:
      console.error("Erro no cadastro:", err);

      let errorMessage = 'Ocorreu um erro. Verifique os dados e tente novamente.';
      if (err.response?.data) {
                // Se a API retorna uma única mensagem de erro
          if (typeof err.response.data.message === 'string') {
              errorMessage = err.response.data.message;
                // Se a API retorna um objeto com múltiplos erros de validação
          } else if (typeof err.response.data.errors === 'object') {
              const errorMessages = Object.values(err.response.data.errors).map(msg => `- ${msg}`);
              errorMessage = `Por favor, corrija os seguintes erros:\n${errorMessages.join('\n')}`;
          }
      }
      setError(errorMessage);
    } finally {
            // --- MELHORIA: Desativar o loading no final ---
        setIsSubmitting(false);
    }

  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Crie sua Conta</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            
            <div className={`${styles.formGroup}`}>
              <label htmlFor="nome" className={styles.label}>Nome Completo:</label>
              <input type="text" id="nome" className={styles.input} value={formData.nome} onChange={handleChange} required disabled={isSubmitting}/>
            </div>

            <div className={`${styles.formGroup}`}>
              <label htmlFor="email" className={styles.label}>E-mail:</label>
              <input type="email" id="email" className={styles.input} value={formData.email} onChange={handleChange} required disabled={isSubmitting}/>
            </div>
            
           <div className={styles.formGroup}>
              <label htmlFor="senha" className={styles.label}>Senha:</label>
              {/* NOVO: Wrapper para posicionar o ícone */}
              <div className={styles.inputWrapper}>
                <input 
                  // MODIFICADO: Tipo dinâmico
                  type={showSenha ? 'text' : 'password'}
                  id="senha" 
                  className={styles.input} 
                  value={formData.senha} 
                  onChange={handleChange} 
                  required 
                />
                {/* NOVO: Ícone de olho */}
                <span 
                  className={styles.eyeIcon}
                  onClick={() => setShowSenha(!showSenha)}
                >
                  {showSenha ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            
            <div className={styles.formGroup}>
                <label htmlFor="confirmarSenha" className={styles.label}>Confirmar Senha:</label>
                <div className={styles.inputWrapper}>
                    <input
                    type={showConfirmarSenha ? 'text' : 'password'}
                    id="confirmarSenha"
                    className={styles.input}
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    />
                    <span className={styles.eyeIcon} onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}>
                        {showConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
                    </span>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="cpf" className={styles.label}>CPF:</label>
              <input type="text" id="cpf" className={styles.input} placeholder="Somente números" value={formData.cpf} onChange={handleChange} required disabled={isSubmitting}/>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="telefone" className={styles.label}>Telefone:</label>
              <input type="tel" id="telefone" className={styles.input} placeholder="DDD999999999" value={formData.telefone} onChange={handleChange} required disabled={isSubmitting}/>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="dataNascimento" className={styles.label}>Data de Nascimento:</label>
              <input type="date" id="dataNascimento" className={styles.input} value={formData.dataNascimento} onChange={handleChange} required disabled={isSubmitting}/>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="sexo" className={styles.label}>Sexo:</label>
              <select id="sexo" className={styles.select} value={formData.sexo} onChange={handleChange} required disabled={isSubmitting}>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="estado" className={styles.label}>Estado:</label>
              {/* 6. SUBSTITUÍDO: de input para select */}
              <select id="estado" className={styles.select} value={formData.estado} onChange={handleChange} required disabled={isSubmitting}>
                <option value="">Selecione um estado...</option>
                {estados.map(estado => (
                  <option key={estado.id} value={estado.sigla}>
                    {estado.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
             <label htmlFor="cidade" className={styles.label}>Cidade:</label>
              {/* 7. SUBSTITUÍDO: de input para select */}
              <select id="cidade" className={styles.select} value={formData.cidade} onChange={handleChange} required disabled={!formData.estado || loadingCidades}>
                <option value="">
                  {loadingCidades ? 'Carregando cidades...' : (formData.estado ? 'Selecione uma cidade...' : 'Selecione um estado primeiro')}
                </option>
                {cidades.map(cidade => (
                  <option key={cidade.id} value={cidade.nome}>
                    {cidade.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bairro" className={styles.label}>Bairro:</label>
              <input type="text" id="bairro" className={styles.input} value={formData.bairro} onChange={handleChange} required disabled={isSubmitting}/>
            </div>

            <div className={`${styles.formGroup}`}>
              <label htmlFor="role" className={styles.label}>Tipo de Conta:</label>
              <select id="role" className={styles.select} value={formData.role} onChange={handleChange} required disabled={isSubmitting}>
                <option value="LEITOR">Leitor</option>
                <option value="BIBLIOTECARIO">Bibliotecário</option>
              </select>
            </div>
            
            {formData.role === 'BIBLIOTECARIO' && (
              <div className={`${styles.formGroup}`}>
                <label htmlFor="codigoAdministrativo" className={styles.label}>Código Administrativo:</label>
                {/* NOVO: Wrapper para posicionar o ícone */}
                <div className={styles.inputWrapper}>
                  <input
                    // MODIFICADO: Tipo dinâmico
                    type={showCodigoAdmin ? 'text' : 'password'}
                    id="codigoAdministrativo"
                    className={styles.input}
                    placeholder="Digite o código secreto"
                    value={formData.codigoAdministrativo}
                    onChange={handleChange}
                    required
                  />
                  {/* NOVO: Ícone de olho */}
                  <span
                    className={styles.eyeIcon}
                    onClick={() => setShowCodigoAdmin(!showCodigoAdmin)}
                  >
                    {showCodigoAdmin ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            )}
            
            <div className={styles.fullWidth}>
              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? 'Cadastrando...' : 'Cadastrar'}</button>
            </div>

          </div>
        </form>
        
        {error && <p className={styles.errorMessage} style={{ whiteSpace: 'pre-line' }}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

      </div>
    </div>
  );
}
export default CadastroPage;