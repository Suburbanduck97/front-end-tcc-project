// src/pages/admin/GestaoEmprestimosPage.jsx
import React, { useState, useEffect } from 'react';
import { getTodosEmprestimos, registrarEmprestimo, devolverLivro } from '../../services/emprestimoService';
import { getTodasAsReservas } from '../../services/reservaService'; // Importa o serviço de reservas
import styles from './GestaoEmprestimosPage.module.css';

function GestaoEmprestimosPage() {
    const [emprestimos, setEmprestimos] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    // Função única para buscar todos os dados necessários para a página
    const fetchDados = async () => {
        setLoading(true);
        setMessage('');
        setError(null);
        try {
            const [emprestimosData, reservasData] = await Promise.all([
                getTodosEmprestimos(),
                getTodasAsReservas()
            ]);
            
            setEmprestimos(emprestimosData);
            // Filtramos para mostrar apenas as reservas que estão com status ATIVA
            setReservas(reservasData.filter(r => r.statusReserva === 'ATIVA'));
        } catch (err) {
            console.error("Erro ao buscar dados de gestão:", err);
            setError("Não foi possível carregar os dados da página.");
        } finally {
            setLoading(false);
        }
    };

    // useEffect agora chama a função única para carregar tudo
    useEffect(() => {
        fetchDados();
    }, []);

    // função para conceder um empréstimo a partir de uma reserva
    const handleConcederEmprestimo = async (idUsuario, idLivro, tituloLivro, nomeUsuario) => {
        setMessage('');
        if (!window.confirm(`Confirmar empréstimo do livro "${tituloLivro}" para o usuário "${nomeUsuario}"?`)) {
            return;
        }

        try {
            await registrarEmprestimo(idUsuario, idLivro);
            setMessage('Empréstimo concedido com sucesso!');
            // Recarrega todos os dados da página para atualizar as listas
            fetchDados();
        } catch (err) {
            console.error("Erro ao conceder empréstimo:", err);
            setMessage(err.response?.data?.message || err.response?.data || 'Não foi possível conceder o empréstimo.');
        }
    };

    // função para devolução
    const handleDevolverLivro = async (idEmprestimo) => {
        setMessage('');
        if (!window.confirm(`Confirmar a devolução para o empréstimo de ID ${idEmprestimo}?`)) {
            return;
        }
        try {
            await devolverLivro(idEmprestimo);
            setMessage(`Devolução do empréstimo ${idEmprestimo} registrada com sucesso!`);
            // Recarrega todos os dados para atualizar a lista
            fetchDados();
        } catch (err) {
            console.error("Erro ao registrar devolução:", err);
            setMessage(err.response?.data?.message || 'Não foi possível registrar a devolução.');
        }
    };

    const formatarData = (dataString) => {
        if (!dataString) return 'N/A';
        // Ajustado para formatar data e hora
        return new Date(dataString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (error) {
        return <p className={styles.errorMessage}>{error}</p>;
    }

    return (
        <div className={styles.pageContainer}>
            <h1>Gestão de Empréstimos e Reservas</h1>
            {message && <p className={styles.successMessage}>{message}</p>}

            <section className={styles.section}>
                <h2>Fila de Reservas Ativas</h2>
                {loading ? <p>Carregando reservas...</p> : (
                    reservas.length > 0 ? (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Livro</th>
                                        <th>Usuário</th>
                                        <th>Data da Reserva</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservas.map(reserva => (
                                        <tr key={reserva.id}>
                                            <td>{reserva.livro.titulo}</td>
                                            <td>{reserva.usuario.nome}</td>
                                            <td>{formatarData(reserva.dataReserva)}</td>
                                            <td>
                                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleConcederEmprestimo(reserva.usuario.id, reserva.livro.id, reserva.livro.titulo, reserva.usuario.nome)}>
                                                    Conceder Empréstimo
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className={styles.emptyMessage}>Nenhuma reserva ativa no momento.</p>
                )}
            </section>

            <section className={styles.section}>
                <h2>Histórico de Todos os Empréstimos</h2>
                {loading ? <p>Carregando histórico de empréstimos...</p> : (
                    emprestimos.length > 0 ? (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Livro</th>
                                        <th>Usuário</th>
                                        <th>Data Empréstimo</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
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
                                                    <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => handleDevolverLivro(emprestimo.id)}>
                                                        Devolver
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className={styles.emptyMessage}>Nenhum empréstimo encontrado no sistema.</p>
                )}
            </section>
        </div>
    );
}

export default GestaoEmprestimosPage;