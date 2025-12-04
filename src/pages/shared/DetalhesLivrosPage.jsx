import { useContext, useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Modal from '../../components/Shared/Modal';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/useToast';
import { deletarLivro, getLivroDetalhes } from '../../services/livroService';
import { criarReserva } from '../../services/reservaService';
// O nome do arquivo CSS importado está correto
import styles from './DetalhesLivroPage.module.css';

function DetalhesLivroPage() {
    // --- HOOKS E CONTEXTOS ---
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();

    // --- ESTADOS DE DADOS E UI ---
    const [livro, setLivro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    // --- CARREGAMENTO INICIAL DOS DADOS ---
    useEffect(() => {
        const fetchDetalhes = async () => {
            try {
                setLoading(true);
                const data = await getLivroDetalhes(id);
                setLivro(data);
            } catch (err) {
                console.error("Erro ao buscar detalhes do livro:", err);
                setError("Não foi possível carregar os detalhes do livro.");
                addToast("Erro ao carregar o livro.", 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchDetalhes();
    }, [id, addToast]);

    // --- AÇÕES DO USUÁRIO ---

    const handleVoltar = () => navigate('/livros');

    const handleReservar = async () => {
        setIsSubmitting(true);
        try {
            await criarReserva(livro.id);
            addToast(`Reserva para "${livro.titulo}" solicitada com sucesso!`, 'success');
            setLivro(prev => ({ ...prev, usuarioJaReservou: true, qtdDisponivel: prev.qtdDisponivel - 1 })); // Atualiza UI
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || "Não foi possível realizar a reserva.";
            addToast(errorMsg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExcluir = () => {
        setModalState({
            isOpen: true,
            title: "Confirmar Exclusão",
            message: `Tem certeza que deseja excluir o livro "${livro.titulo}"? Esta ação não pode ser desfeita.`,
            onConfirm: async () => {
                setIsSubmitting(true);
                try {
                    await deletarLivro(livro.id);
                    addToast('Livro excluído com sucesso!', 'success');
                    navigate('/livros');
                } catch (error) {
                    const errorMessage =  error.response?.data?.mensagem ||
                    error.response?.data?.message ||
                    error.response?.data || 'Não foi possível excluir o livro.';
                    addToast(errorMessage, 'error');
                } finally {
                    setIsSubmitting(false);
                    setModalState({ isOpen: false });
                }
            }
        });
    };

    // --- LÓGICA DE RENDERIZAÇÃO ---

    if (loading) return <div className={styles.loading}>Carregando...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!livro) return null;

    let disabledReason = '';
    if (user?.role === 'LEITOR') {
        if (livro.usuarioJaReservou) disabledReason = 'Você já possui uma reserva ativa para este livro.';
        else if (livro.qtdDisponivel <= 0) disabledReason = 'Não há exemplares disponíveis para reserva.';
    }
    const isBotaoReservaDisabled = isSubmitting || !!disabledReason;

    // Determina a classe de status
    const statusClass = livro.qtdDisponivel > 0 ? styles.disponivel : styles.indisponivel;
    const statusText = livro.qtdDisponivel > 0 ? 'Disponível' : 'Indisponível';

    return (
        <>
            {/* Botão Voltar agora fica no topo da página */}
            <button onClick={handleVoltar} className={styles.backButton}>
                <FaArrowLeft />
                Voltar ao Catálogo
            </button>
            
            {/* O layout principal é flex (ou grid) como na Imagem 2 */}
            <div className={styles.pageContainer}>
                
                {/* Coluna 1: Capa */}
                <div className={styles.coverContainer}>
                    {livro.capa ? (
                        <img src={`data:image/jpeg;base64,${livro.capa}`} alt={`Capa de ${livro.titulo}`} className={styles.coverImage} />
                    ) : (
                        <div className={styles.placeholderImage}>Capa Indisponível</div>
                    )}
                </div>

                {/* Coluna 2: Detalhes */}
                <div className={styles.detailsContainer}>
                    <h1 className={styles.title}>{livro.titulo}</h1>
                    <h2 className={styles.author}>por {livro.autor}</h2>
                    
                    {/* Grid de Informações (como na Imagem 2) */}
                    <div className={styles.infoGrid}>
                        <div>
                            <p><strong>Editora:</strong> {livro.editora || 'N/A'}</p>
                            <p><strong>ISBN:</strong> {livro.isbn}</p>
                        </div>
                        <div>
                            <p><strong>Ano:</strong> {livro.anoPublicacao || 'N/A'}</p>
                            <p><strong>Categoria:</strong> {livro.categoria}</p>
                        </div>
                    </div>

                    {/* Descrição (movida para cá) */}
                    <div className={styles.description}>
                        <strong>Descrição:</strong>
                        <p>{livro.descricao || "Nenhuma descrição disponível."}</p>
                    </div>

                    {/* Status e Disponíveis (como na Imagem 2) */}
                    <div className={styles.statusContainer}>
                        <p>
                            <strong>Status:</strong>
                            <span className={`${styles.status} ${statusClass}`}>
                                {statusText}
                            </span>
                        </p>
                        <p><strong>Disponíveis:</strong> {livro.qtdDisponivel} de {livro.qtdTotal}</p>
                    </div>

                    <hr className={styles.separator} />

                    {/* Ações do Leitor */}
                    {user?.role === 'LEITOR' && (
                        <div className={styles.actions}>
                            <button 
                                className={styles.reserveButton}
                                onClick={handleReservar}
                                disabled={isBotaoReservaDisabled}
                            >
                                {isSubmitting ? 'Processando...' : 'Solicitar Reserva'}
                            </button>
                            {disabledReason && <p className={styles.disabledReason}>{disabledReason}</p>}
                            {/* Mensagens de sucesso/erro/loading podem ser tratadas pelo useToast, 
                                mas se precisar de mensagens inline, elas viriam aqui. */}
                        </div>
                    )}

                    {/* Ações do Admin (movidas para cá) */}
                    {user?.role === 'BIBLIOTECARIO' && (
                        <div className={styles.adminActions}>
                            <Link to={`/admin/editar-livro/${livro.id}`} className={`${styles.btn} ${styles.btnEdit}`}>
                                <FaEdit /> Editar
                            </Link>
                            <button onClick={handleExcluir} className={`${styles.btn} ${styles.btnDelete}`} disabled={isSubmitting}>
                                {isSubmitting ? 'Excluindo...' : <><FaTrash /> Excluir</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Modal de Confirmação */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false })}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
            />
        </>
    );
}

export default DetalhesLivroPage;