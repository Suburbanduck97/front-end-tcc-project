import { useContext, useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from "../../context/AuthContext";
import api from '../../services/api';
import { getCidadesPorEstado, getEstados } from '../../services/ibgeService';
import styles from './MeuPerfilPage.module.css';

// Ícones SVG para um visual mais profissional (Componentes locais)
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;


function MeuPerfilPage() {
    const { user, loginContext } = useContext(AuthContext);
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updateMessage, setUpdateMessage] = useState({ type: '', content: '' });
    
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showNovaSenha, setShowNovaSenha] = useState(false);
    const [showConfirmarNovaSenha, setShowConfirmarNovaSenha] = useState(false);

    const [estados, setEstados] = useState([]);
    const [cidades, setCidades] = useState([]);
    const [loadingCidades, setLoadingCidades] = useState(false);

    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        sexo: '',
        estado: '',
        cidade: '',
        bairro: '',
        dataNascimento: '',
        senhaAtual: '',
        novaSenha: '',
        confirmarNovaSenha: ''
    });


    const fetchPerfil = async () => {
        if (!user) { setLoading(false); setError("Você precisa estar logado."); return; }
            try {
                const response = await api.get('/usuario/meuPerfil');
                setPerfil(response.data);
                const dataFormatada = response.data.dataNascimento ? response.data.dataNascimento.split('T')[0] : '';
                setFormData({ ...response.data, dataNascimento: dataFormatada, senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' });
            } catch{
                setError("Não foi possível carregar os dados do perfil.");
            } finally {
                setLoading(false);
            }
    };

    
    useEffect(() => {
        getEstados().then(setEstados);
        fetchPerfil();
    }, [user]);

    useEffect(() => {
        if (formData.estado) {
            setLoadingCidades(true);
            getCidadesPorEstado(formData.estado).then(data => {
                setCidades(data);
                setLoadingCidades(false);
            });
        } else {
            setCidades([]);
        }
    }, [formData.estado]);

    useEffect(() => {
    if (updateMessage.content) {
        const timer = setTimeout(() => {
            setUpdateMessage({ type: '', content: '' });
        }, 3000);

            return () => clearTimeout(timer);
        }
    }, [updateMessage]);


    // Função para lidar com a mudança nos inputs do formulário
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => {
            const newState = { ...prevState, [name]: value };
            if (name === 'estado') newState.cidade = '';
            return newState;
        });
    };

    // Função para submeter as alterações
    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdateMessage({ type: '', content: '' });

        if (formData.novaSenha && formData.novaSenha !== formData.confirmarNovaSenha) {
            setUpdateMessage({ type: 'error', content: 'A nova senha e a confirmação não correspondem.' });
            return;
        }


        setIsSubmitting(true);


        // Envia apenas os campos que podem ser alterados
        const dadosParaAtualizar = {
            nome: formData.nome,
            telefone: formData.telefone,
            sexo: formData.sexo,
            estado: formData.estado,
            cidade: formData.cidade,
            bairro: formData.bairro,
            dataNascimento: formData.dataNascimento,
        };

        if (formData.senhaAtual && formData.novaSenha) {
            dadosParaAtualizar.senhaAtual = formData.senhaAtual;
            dadosParaAtualizar.novaSenha = formData.novaSenha;
        }

        try {
            // A chamada para a API agora corresponde à rota e ao corpo esperado pelo backend
            const response = await api.put('/usuario/meuPerfil', dadosParaAtualizar);
            
            if (response.data.token) {
               loginContext(response.data.token);
            }

            setUpdateMessage({ type: 'success', content: 'Perfil atualizado com sucesso!' });
            setIsEditing(false);
            fetchPerfil();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Não foi possível atualizar o perfil.";
            setUpdateMessage({ type: 'error', content: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <p>Carregando perfil...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;
    if (!perfil) return <p>Nenhum dado de perfil encontrado.</p>;

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileCard}>
                <div className={styles.cardHeader}>
                    <h2>Meu Perfil</h2>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className={styles.editButton}>Editar Perfil</button>
                    )}
                </div>

                {isEditing ? (
                    // MODO DE EDIÇÃO
                    <form onSubmit={handleUpdate} className={styles.cardBody}>
                        <h4>Dados Pessoais</h4>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label htmlFor="nome">Nome Completo</label>
                                <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} className={styles.input}/>
                            </div>
                            <div className={styles.infoItem}>
                                <label htmlFor="telefone">Telefone</label>
                                <input type="tel" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} className={styles.input}/>
                            </div>
                            <div className={styles.infoItem}>
                                <label>E-mail</label>
                                <input type="email" value={perfil.email} className={styles.input} disabled title="O e-mail não pode ser alterado."/>
                            </div>
                            <div className={styles.infoItem}>
                                <label>CPF</label>
                                <input type="text" value={perfil.cpf} className={styles.input} disabled title="O CPF não pode ser alterado."/>
                            </div>
                            <div className={styles.infoItem}>
                                <label htmlFor="sexo">Sexo</label>
                                <input type="text" id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} className={styles.input}/>
                            </div>
                        </div>

                        <hr className={styles.divider} />
                        <h4>Endereço</h4>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label htmlFor="estado" className={styles.label}>Estado</label>
                                <select id="estado" name="estado" className={styles.input} value={formData.estado} onChange={handleChange} required>
                                    <option value="">Selecione um estado...</option>
                                    {estados.map(estado => (
                                        <option key={estado.id} value={estado.sigla}>{estado.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.infoItem}>
                                <label htmlFor="cidade" className={styles.label}>Cidade</label>
                                <select id="cidade" name="cidade" className={styles.input} value={formData.cidade} onChange={handleChange} required disabled={!formData.estado || loadingCidades}>
                                    <option value="">
                                        {loadingCidades ? 'Carregando...' : (formData.estado ? 'Selecione uma cidade...' : 'Selecione um estado primeiro')}
                                    </option>
                                    {cidades.map(cidade => (
                                        <option key={cidade.id} value={cidade.nome}>{cidade.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.infoItem}>
                                <label htmlFor="bairro" className={styles.label}>Bairro</label>
                                <input type="text" id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} className={styles.input} required/>
                            </div>
                        </div>

                        <hr className={styles.divider} />
                        <h4>Alterar Senha (opcional)</h4>
                        <div className={styles.infoGrid}>
                             {/* Campo Nova Senha com ícone de olho */}
                        <div className={styles.infoItem}>
                                <label htmlFor="novaSenha" className={styles.label}>Nova Senha</label>
                                <div className={styles.inputWrapper}>
                                    <input type={showNovaSenha ? 'text' : 'password'} id="novaSenha" name="novaSenha" value={formData.novaSenha} onChange={handleChange} className={styles.input} placeholder="Mínimo 8 caracteres"/>
                                    <span className={styles.eyeIcon} onClick={() => setShowNovaSenha(!showNovaSenha)}>
                                        {showNovaSenha ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <label htmlFor="confirmarNovaSenha" className={styles.label}>Confirmar Nova Senha</label>
                                    <div className={styles.inputWrapper}>
                                        <input type={showConfirmarNovaSenha ? 'text' : 'password'} id="confirmarNovaSenha" name="confirmarNovaSenha" value={formData.confirmarNovaSenha} onChange={handleChange} className={styles.input}/>
                                        <span className={styles.eyeIcon} onClick={() => setShowConfirmarNovaSenha(!showConfirmarNovaSenha)}>
                                            {showConfirmarNovaSenha ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                </div>
                        </div>

                        <div className={styles.formActions}>
                            <button type="button" onClick={() => setIsEditing(false)} className={`${styles.actionButton} ${styles.cancelButton}`}>Cancelar</button>
                            <button type="submit" className={`${styles.actionButton} ${styles.saveButton}`} disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                ) : (
                    // MODO DE VISUALIZAÇÃO
                    <div className={styles.cardBody}>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}><UserIcon /> <div><span className={styles.label}>Nome Completo</span><span className={styles.value}>{perfil.nome}</span></div></div>
                            <div className={styles.infoItem}><MailIcon /> <div><span className={styles.label}>E-mail</span><span className={styles.value}>{perfil.email}</span></div></div>
                            <div className={styles.infoItem}><PhoneIcon /> <div><span className={styles.label}>Telefone</span><span className={styles.value}>{perfil.telefone}</span></div></div>
                            <div className={styles.infoItem}><LocationIcon /> <div><span className={styles.label}>Localização</span><span className={styles.value}>{`${perfil.bairro}, ${perfil.cidade}, ${perfil.estado}`}</span></div></div>
                        </div>
                    </div>
                )}

                {updateMessage.content && (
                    <div className={`${styles.updateMessage} ${styles[updateMessage.type]}`}>
                        {updateMessage.content}
                    </div>
                )}
            </div>
        </div>
    ); 
}

export default MeuPerfilPage;