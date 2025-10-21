import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLivroDetalhes, deletarLivro } from '../../services/livroService';
import { solicitarReserva } from '../../services/reservaService';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/useToast';
import Modal from '../../components/Shared/Modal';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
// CORREÇÃO AQUI: O nome do arquivo CSS agora está no singular para corresponder
import styles from './DetalhesLivroPage.module.css';

function DetalhesLivroPage() {
    // --- HOOKS E CONTEXTOS ---
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // Para saber o papel do usuário
    const { addToast } = useToast(); // Para todas as notificações

    // --- ESTADOS DE DADOS E UI ---
    const [livro, setLivro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Controla o estado de "carregando" das ações
    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    // --- CARREGAMENTO INICIAL DOS DADOS ---
    useEffect(() => {
        const fetchDetalhes = async () => {
            try {
                setLoading(true);
                const data = await getLivroDetalhes(id); // Usa o novo serviço que traz 'usuarioJaReservou'
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

    // Ação de voltar para a página anterior
    const handleVoltar = () => navigate(-1);

    // Ação do LEITOR para solicitar uma reserva
    const handleReservar = async () => {
        setIsSubmitting(true);
        try {
            await solicitarReserva(livro.id);
            addToast(`Reserva para "${livro.titulo}" solicitada com sucesso!`, 'success');
            setLivro(prev => ({ ...prev, usuarioJaReservou: true })); // Atualiza a UI imediatamente
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || "Não foi possível realizar a reserva.";
            addToast(errorMsg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Ação do ADMIN para excluir o livro
    const handleExcluir = () => {
        // 1. Abre o modal de confirmação
        setModalState({
            isOpen: true,
            title: "Confirmar Exclusão",
            message: `Tem certeza que deseja excluir o livro "${livro.titulo}"? Esta ação não pode ser desfeita.`,
            // 2. Define o que acontece se o usuário clicar em "Confirmar"
            onConfirm: async () => {
                setIsSubmitting(true);
                try {
                    await deletarLivro(livro.id);
                    addToast('Livro excluído com sucesso!', 'success');
                    navigate('/livros'); // Redireciona para a lista de livros
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Não foi possível excluir o livro.';
                    addToast(errorMessage, 'error');
                } finally {
                    setIsSubmitting(false);
                    setModalState({ isOpen: false }); // Fecha o modal
                }
            }
        });
    };

    // --- LÓGICA DE RENDERIZAÇÃO ---

    if (loading) return <div className={styles.loading}>Carregando...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!livro) return null;

    // Lógica para desabilitar o botão de reserva do LEITOR
    let disabledReason = '';
    if (user?.role === 'LEITOR') {
        if (livro.usuarioJaReservou) disabledReason = 'Você já possui uma reserva ativa para este livro.';
        else if (livro.qtdDisponivel <= 0) disabledReason = 'Não há exemplares disponíveis para reserva.';
    }
    const isBotaoReservaDisabled = isSubmitting || !!disabledReason;

    return (
        <>
            <div className={styles.pageContainer}>
                <div className={styles.header}>
                    <button onClick={handleVoltar} className={styles.backButton}>
                        <FaArrowLeft />
                        Voltar ao Catálogo
                    </button>
                    {/* Ações que só o ADMIN pode ver */}
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

                <div className={styles.contentGrid}>
                    <div className={styles.cover}>
                        {livro.capa ? (
                            <img src={`data:image/jpeg;base64,${livro.capa}`} alt={`Capa de ${livro.titulo}`} className={styles.coverImage} />
                        ) : (
                            <div className={styles.placeholderImage}>Capa Indisponível</div>
                        )}
                    </div>
                    <div className={styles.info}>
                        <h1>{livro.titulo}</h1>
                        <h2>por {livro.autor}</h2>
                        
                        <ul className={styles.detailsList}>
                            <li><strong>ISBN:</strong> {livro.isbn}</li>
                            <li><strong>Editora:</strong> {livro.editora || 'N/A'}</li>
                            <li><strong>Ano:</strong> {livro.anoPublicacao || 'N/A'}</li>
                            <li><strong>Categoria:</strong> {livro.categoria}</li>
                            <li><strong>Disponíveis:</strong> {livro.qtdDisponivel} de {livro.qtdTotal}</li>
                        </ul>

                        {/* Ações que só o LEITOR pode ver */}
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
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.description}>
                    <h3>Descrição</h3>
                    <p>{livro.descricao || "Nenhuma descrição disponível."}</p>
                </div>
            </div>
            
            {/* O componente Modal fica aqui, invisível até ser ativado */}
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
