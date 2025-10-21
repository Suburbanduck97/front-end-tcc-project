import React, { useState, useEffect } from 'react';
import { getTodosEmprestimos, registrarEmprestimo, devolverLivro } from '../../services/emprestimoService';
import { getTodasAsReservas } from '../../services/reservaService';
import styles from './GestaoEmprestimosPage.module.css';
import Modal from '../../components/Shared/Modal';      // 1. Importa o Modal
import { useToast } from '../../context/useToast';      // 2. CORREÇÃO: Importa o useToast do arquivo correto

function GestaoEmprestimosPage() {
    const [emprestimos, setEmprestimos] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submittingAction, setSubmittingAction] = useState({ type: null, id: null });
    
    // 3. Estado para controlar o Modal (se está aberto, qual a mensagem, etc.)
    const [modalState, setModalState] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });
    const { addToast } = useToast(); // Hook para as notificações (toasts)

    const fetchDados = async () => {
        try {
            const [emprestimosData, reservasData] = await Promise.all([
                getTodosEmprestimos(),
                getTodasAsReservas()
            ]);
            
            setEmprestimos(emprestimosData || []);
            setReservas((reservasData || []).filter(r => r.statusReserva === 'ATIVA'));
        } catch (err) {
            console.error("Erro ao buscar dados de gestão:", err);
            addToast("Não foi possível carregar os dados da página.", 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDados();
    }, []);

    // 4. Lógica de "Conceder" foi separada: agora ela é chamada APÓS a confirmação no modal
    const handleConcederEmprestimo = async (reserva) => {
        setSubmittingAction({ type: 'conceder', id: reserva.id });
        try {
            await registrarEmprestimo(reserva.usuario.id, reserva.livro.id);
            addToast('Empréstimo concedido com sucesso!', 'success');
            await fetchDados(); // Recarrega os dados
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Não foi possível conceder o empréstimo.';
            addToast(errorMsg, 'error');
        } finally {
            setSubmittingAction({ type: null, id: null });
            setModalState({ isOpen: false }); // Fecha o modal
        }
    };

    // 5. Lógica de "Devolver" também foi separada
    const handleDevolverLivro = async (emprestimo) => {
        setSubmittingAction({ type: 'devolver', id: emprestimo.id });
        try {
            await devolverLivro(emprestimo.id);
            addToast(`Devolução registrada com sucesso!`, 'success');
            await fetchDados(); // Recarrega os dados
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Não foi possível registrar a devolução.';
            addToast(errorMsg, 'error');
        } finally {
            setSubmittingAction({ type: null, id: null });
            setModalState({ isOpen: false }); // Fecha o modal
        }
    };

    // 6. Funções para ABRIR o modal com a pergunta e a ação correta
    const openConcederModal = (reserva) => {
        setModalState({
            isOpen: true,
            onConfirm: () => handleConcederEmprestimo(reserva),
            title: 'Confirmar Empréstimo',
            message: `Deseja realmente conceder o livro "${reserva.livro.titulo}" para o usuário "${reserva.usuario.nome}"?`
        });
    };

    const openDevolverModal = (emprestimo) => {
        setModalState({
            isOpen: true,
            onConfirm: () => handleDevolverLivro(emprestimo),
            title: 'Confirmar Devolução',
            message: `Deseja realmente registrar a devolução do livro "${emprestimo.livro.titulo}"?`
        });
    };

    const formatarData = (dataString) => {
        if (!dataString) return 'N/A';
        return new Date(dataString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return <p className={styles.loadingMessage}>Carregando dados de gestão...</p>;
    }

    return (
        <div className={styles.pageContainer}>
            <h1>Gestão de Empréstimos e Reservas</h1>
            
            {/* O conteúdo é renderizado normalmente */}
            <section className={styles.section}>
                <h2>Fila de Reservas Ativas</h2>
                {reservas.length > 0 ? (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            {/* ... cabeçalho da tabela ... */}
                            <tbody>
                                {reservas.map(reserva => (
                                    <tr key={reserva.id}>
                                        <td>{reserva.livro.titulo}</td>
                                        <td>{reserva.usuario.nome}</td>
                                        <td>{formatarData(reserva.dataReserva)}</td>
                                        <td>
                                            {/* 7. O OnClick agora chama a função para ABRIR o modal */}
                                            <button 
                                                className={`${styles.btn} ${styles.btnPrimary}`} 
                                                onClick={() => openConcederModal(reserva)}
                                                disabled={submittingAction.id === reserva.id}
                                            >
                                                {submittingAction.type === 'conceder' && submittingAction.id === reserva.id ? 'Concedendo...' : 'Conceder Empréstimo'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className={styles.emptyMessage}>Nenhuma reserva ativa no momento.</p>}
            </section>

            <section className={styles.section}>
                <h2>Histórico de Todos os Empréstimos</h2>
                {emprestimos.length > 0 ? (
                    <div className={styles.tableContainer}>
                         <table className={styles.table}>
                            {/* ... cabeçalho da tabela ... */}
                            <tbody>
                                {emprestimos.map((emprestimo) => (
                                    <tr key={emprestimo.id}>
                                        <td>{emprestimo.id}</td>
                                        <td>{emprestimo.livro.titulo}</td>
                                        <td>{emprestimo.usuario.nome}</td>
                                        <td>{formatarData(emprestimo.dataEmprestimo)}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[emprestimo.statusEmprestimo.toLowerCase()]}`}>
                                                {emprestimo.statusEmprestimo}
                                            </span>
                                        </td>
                                        <td>
                                            {emprestimo.statusEmprestimo !== 'FINALIZADO' && (
                                                // 8. O OnClick aqui também chama a função para abrir o modal
                                                <button 
                                                    className={`${styles.btn} ${styles.btnSecondary}`} 
                                                    onClick={() => openDevolverModal(emprestimo)}
                                                    disabled={submittingAction.id === emprestimo.id}
                                                >
                                                    {submittingAction.type === 'devolver' && submittingAction.id === emprestimo.id ? 'Processando...' : 'Devolver'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className={styles.emptyMessage}>Nenhum empréstimo encontrado no sistema.</p>}
            </section>
            
            {/* 9. O componente Modal é renderizado aqui. Ele fica invisível até que isOpen seja true */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false })}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
            >
                <p>{modalState.message}</p>
            </Modal>
        </div>
    );
}

export default GestaoEmprestimosPage;

