import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { signup } from '../../services/authService';
import { getCidadesPorEstado, getEstados } from '../../services/ibgeService';
import styles from './CadastroPage.module.css';

function CadastroPage() {
    const [estados, setEstados] = useState([]);
    const [cidades, setCidades] = useState([]);
    const [loadingCidades, setLoadingCidades] = useState(false);

    const [formData, setFormData] = useState({
        nome: '', sexo: 'MASCULINO', cpf: '', email: '', senha: '',
        confirmarSenha: '', telefone: '', estado: '', cidade: '', bairro: '',
        dataNascimento: '', role: 'LEITOR', codigoAdministrativo: ''
    });

    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
    const [showCodigoAdmin, setShowCodigoAdmin] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        getEstados().then(data => { setEstados(data); });
    }, []);

    useEffect(() => {
        const estadoSelecionado = formData.estado;
        if (estadoSelecionado) {
            setLoadingCidades(true);
            getCidadesPorEstado(estadoSelecionado).then(data => {
                setCidades(data);
                setLoadingCidades(false);
            });
        } else {
            setCidades([]);
        }
    }, [formData.estado]);

    const handleChange = (event) => {
        const { id, value } = event.target;
        setFormData(prevState => {
            const newState = { ...prevState, [id]: value };
            if (id === 'estado') newState.cidade = '';
            return newState;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (formData.senha !== formData.confirmarSenha) {
            setError('As senhas não coincidem. Por favor, verifique.');
            return;
        }
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);
        const dadosParaEnviar = { ...formData };
        delete dadosParaEnviar.confirmarSenha;
        if (dadosParaEnviar.role !== 'BIBLIOTECARIO') {
            delete dadosParaEnviar.codigoAdministrativo;
        }
        try {
            await signup(dadosParaEnviar);
            setSuccess('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
            setTimeout(() => { navigate('/login'); }, 2000);
        } catch (err) {
            console.error("Erro no cadastro:", err);
            let errorMessage = 'Ocorreu um erro. Verifique os dados e tente novamente.';
            if (err.response?.data) {
                if (typeof err.response.data.mensagem === 'string') { 
                    errorMessage = err.response.data.mensagem;
                } else if (typeof err.response.data.errors === 'object') {
                    const errorMessages = Object.values(err.response.data.errors).map(msg => `${msg}`);
                    errorMessage = `Por favor, corrija os seguintes erros:\n${errorMessages.join('\n')}`;
                }
            }
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

return (
    <div className={styles.pageContainer}>
        <div className={styles.formContainer}>
            <h2 className={styles.title}>Crie sua Conta</h2>
            
            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    
                    {/* --- SEÇÃO DADOS PESSOAIS --- */}
                    <h3 className={styles.sectionTitle}>Dados Pessoais</h3>

                    {/* Nome (ocupa 2/3) e CPF */}
                    <div className={`${styles.formGroup} ${styles.col_8}`}>
                        <label htmlFor="nome" className={styles.label}>Nome Completo</label>
                        <input type="text" id="nome" className={styles.input} value={formData.nome} onChange={handleChange} required disabled={isSubmitting}/>
                    </div>
                    <div className={`${styles.formGroup} ${styles.col_4}`}>
                        <label htmlFor="cpf" className={styles.label}>CPF</label>
                        <input type="text" id="cpf" className={styles.input} placeholder="Somente números" value={formData.cpf} onChange={handleChange} required disabled={isSubmitting}/>
                    </div>

                    {/* Data, Sexo e Telefone */}
                    <div className={`${styles.formGroup} ${styles.col_4}`}>
                        <label htmlFor="dataNascimento" className={styles.label}>Data de Nascimento</label>
                        <input type="date" id="dataNascimento" className={styles.input} value={formData.dataNascimento} onChange={handleChange} required disabled={isSubmitting}/>
                    </div>
                    <div className={`${styles.formGroup} ${styles.col_4}`}>
                        <label htmlFor="sexo" className={styles.label}>Sexo</label>
                        <select id="sexo" className={styles.select} value={formData.sexo} onChange={handleChange} required disabled={isSubmitting}>
                            <option value="MASCULINO">Masculino</option>
                            <option value="FEMININO">Feminino</option>
                            <option value="OUTRO">Outro</option>
                        </select>
                    </div>
                    <div className={`${styles.formGroup} ${styles.col_4}`}>
                        <label htmlFor="telefone" className={styles.label}>Telefone</label>
                        <input type="tel" id="telefone" className={styles.input} placeholder="Ex: 71999999999" value={formData.telefone} onChange={handleChange} required disabled={isSubmitting}/>
                    </div>
                    
                    {/* --- SEÇÃO ENDEREÇO --- */}
                    <h3 className={styles.sectionTitle}>Endereço</h3>

                     {/* Estado, Cidade e Bairro */}
                    <div className={`${styles.formGroup} ${styles.col_4}`}>
                        <label htmlFor="estado" className={styles.label}>Estado</label>
                        <select id="estado" className={styles.select} value={formData.estado} onChange={handleChange} required disabled={isSubmitting}>
                            <option value="">Selecione um estado...</option>
                            {estados.map(estado => (<option key={estado.id} value={estado.sigla}>{estado.nome}</option>))}
                        </select>
                    </div>
                    <div className={`${styles.formGroup} ${styles.col_4}`}>
                       <label htmlFor="cidade" className={styles.label}>Cidade</label>
                        <select id="cidade" className={styles.select} value={formData.cidade} onChange={handleChange} required disabled={!formData.estado || loadingCidades || isSubmitting}>
                            <option value="">{loadingCidades ? 'Carregando...' : (formData.estado ? 'Selecione uma cidade' : 'Selecione um estado')}</option>
                            {cidades.map(cidade => (<option key={cidade.id} value={cidade.nome}>{cidade.nome}</option>))}
                        </select>
                    </div>
                    <div className={`${styles.formGroup} ${styles.col_4}`}>
                        <label htmlFor="bairro" className={styles.label}>Bairro</label>
                        <input type="text" id="bairro" className={styles.input} value={formData.bairro} onChange={handleChange} required disabled={isSubmitting}/>
                    </div>

                    {/* --- SEÇÃO ACESSO E TIPO DE CONTA --- */}
                    <h3 className={styles.sectionTitle}>Acesso e Tipo de Conta</h3>

                    {/* E-mail, Senha e Confirmar Senha */}
                    <div className={`${styles.formGroup} ${styles.col_12}`}>
                        <label htmlFor="email" className={styles.label}>E-mail</label>
                        <input type="email" id="email" className={styles.input} value={formData.email} onChange={handleChange} required disabled={isSubmitting}/>
                    </div>
                    <div className={`${styles.formGroup} ${styles.col_6}`}>
                        <label htmlFor="senha" className={styles.label}>Senha</label>
                        <div className={styles.inputWrapper}>
                            <input type={showSenha ? 'text' : 'password'} id="senha" className={styles.input} value={formData.senha} onChange={handleChange} required disabled={isSubmitting}/>
                            <span className={styles.eyeIcon} onClick={() => setShowSenha(!showSenha)}>{showSenha ? <FaEyeSlash /> : <FaEye />}</span>
                        </div>
                    </div>
                    <div className={`${styles.formGroup} ${styles.col_6}`}>
                        <label htmlFor="confirmarSenha" className={styles.label}>Confirmar Senha</label>
                        <div className={styles.inputWrapper}>
                            <input type={showConfirmarSenha ? 'text' : 'password'} id="confirmarSenha" className={styles.input} value={formData.confirmarSenha} onChange={handleChange} required disabled={isSubmitting}/>
                            <span className={styles.eyeIcon} onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}>{showConfirmarSenha ? <FaEyeSlash /> : <FaEye />}</span>
                        </div>
                    </div>

                    <div className={`${styles.formGroup} ${styles.col_12}`}>
                        <label htmlFor="role" className={styles.label}>Tipo de Conta</label>
                        <select id="role" className={styles.select} value={formData.role} onChange={handleChange} required disabled={isSubmitting}>
                            <option value="LEITOR">Leitor</option>
                            <option value="BIBLIOTECARIO">Bibliotecário</option>
                        </select>
                    </div>
                    {formData.role === 'BIBLIOTECARIO' && (
                        <div className={`${styles.formGroup} ${styles.col_12}`}>
                            <label htmlFor="codigoAdministrativo" className={styles.label}>Código Administrativo</label>
                            <div className={styles.inputWrapper}>
                                <input type={showCodigoAdmin ? 'text' : 'password'} id="codigoAdministrativo" className={styles.input} placeholder="Digite o código secreto" value={formData.codigoAdministrativo} onChange={handleChange} required disabled={isSubmitting}/>
                                <span className={styles.eyeIcon} onClick={() => setShowCodigoAdmin(!showCodigoAdmin)}>{showCodigoAdmin ? <FaEyeSlash /> : <FaEye />}</span>
                            </div>
                        </div>
                    )}
                    
                    <div className={styles.col_12}>
                        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? 'Cadastrando...' : 'Finalizar Cadastro'}</button>
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

