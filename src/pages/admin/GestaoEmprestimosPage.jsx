import React, { useState, useEffect } from 'react';
import { getTodosEmprestimos, registrarEmprestimo, confirmarRetirada, devolverLivro } from '../../services/emprestimoService';
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
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        if (isSubmitting) return;

        setIsSubmitting(true);
        setSubmittingAction({ type: 'conceder', id: reserva.id });
        try {
            await registrarEmprestimo(reserva.usuario.id, reserva.livro.id);
            addToast('Empréstimo concedido com sucesso!', 'success');
            await fetchDados(); 
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Não foi possível conceder o empréstimo.';
            addToast(errorMsg, 'error');
        } finally {
            setIsSubmitting(false);
            setSubmittingAction({ type: null, id: null });
            setModalState({ isOpen: false });
        }
        
    };

    // Lógica de confirmar retirada do livro
    const handleConfirmarRetirada = async (emprestimo) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSubmittingAction({ type: 'retirar', id: emprestimo.id});

        try{
            await confirmarRetirada(emprestimo.id);
            addToast('Retirada confirmada! O prazo do empréstimo começou.', 'success');
            await fetchDados();
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Não foi possível confirmar a retirada.';
            addToast(errorMsg, 'error');
        } finally {
            setIsSubmitting(false);
            setSubmittingAction({ type: null, id: null});
            setModalState({ isOpen: false});
        }
    };

    const handleDevolverLivro = async (emprestimo) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setSubmittingAction({ type: 'devolver', id: emprestimo.id });
        try {
            await devolverLivro(emprestimo.id);
            addToast(`Devolução registrada com sucesso!`, 'success');
            await fetchDados();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Não foi possível registrar a devolução.';
            addToast(errorMsg, 'error');
        } finally {
            setIsSubmitting(false);
            setSubmittingAction({ type: null, id: null });
            setModalState({ isOpen: false }); 
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

    const openConfirmarRetiradaModal = (emprestimo) => {
        setModalState({
            isOpen: true,
            onConfirm: () => handleConfirmarRetirada(emprestimo),
            title: 'Confirmar Retirada',
            message: `Confirmar que o usuário "${emprestimo.usuario.nome}" retirou o livro "${emprestimo.livro.titulo}"? O prazo de devolução começará a contar agora.`
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

            <section className={styles.section}>
                <h2>Fila de Reservas Ativas</h2>
                {reservas.length > 0 ? (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Prioridade</th>
                                    <th>Livro</th>
                                    <th>Usuário</th>
                                    <th>Data Reserva</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservas.map((reserva, index) => (
                                    <tr key={reserva.id}>
                                        <td className={styles.priorityCell}>{index + 1}</td>
                                        <td>{reserva.livro.titulo}</td>
                                        <td>{reserva.usuario.nome}</td>
                                        <td>{formatarData(reserva.dataReserva)}</td>
                                        <td>
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
                           <thead>
                              <tr>
                                <th>ID</th>
                                <th>Livro</th>
                                <th>Usuário</th>
                                <th>Data Empréstimo</th>
                                <th>Devolução Prevista</th>
                                <th>Status</th>
                                <th>Ação</th>
                              </tr>
                           </thead>
                            <tbody>
                                {emprestimos.map((emprestimo) => (
                                    <tr key={emprestimo.id}>
                                        <td>{emprestimo.id}</td>
                                        <td>{emprestimo.livro.titulo}</td>
                                        <td>{emprestimo.usuario.nome}</td>
                                        <td>{formatarData(emprestimo.dataEmprestimo)}</td>
                                        <td>{emprestimo.statusEmprestimo !== 'FINALIZADO' ? formatarData(emprestimo.dataPrevistaDevolucao) : '---'}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[emprestimo.statusEmprestimo.toLowerCase()]}`}>
                                                {emprestimo.statusEmprestimo.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            {emprestimo.statusEmprestimo === 'AGUARDANDO_RETIRADA' && (
                                                <button 
                                                    className={`${styles.btn} ${styles.btnPrimary}`} 
                                                    onClick={() => openConfirmarRetiradaModal(emprestimo)}
                                                    disabled={submittingAction.id === emprestimo.id}
                                                >
                                                    {submittingAction.type === 'retirar' && submittingAction.id === emprestimo.id ? 'Confirmando...' : 'Confirmar Retirada'}
                                                </button>
                                            )}

                                            {(emprestimo.statusEmprestimo === 'ATIVO' || emprestimo.statusEmprestimo === 'ATRASADO') && (
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

