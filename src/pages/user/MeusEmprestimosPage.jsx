// src/pages/MeusEmprestimosPage
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../../context/AuthContext';
import { getEmprestimosPorUsuario } from '../../services/emprestimoService';
import { jwtDecode } from 'jwt-decode';
import styles from './MeusEmprestimosPage.module.css';

function MeusEmprestimosPage() {
    const { user } = useContext(AuthContext); // Usamos o contexto para saber se estamos logados
    const [emprestimos, setEmprestimos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmprestimo = async () => {
            if (!user) {
                setError("Você precisa estar logado para ver seus empréstimos.");
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error("Token de autenticação não encontrado.");
                }
                // Decodifica o token para encontrar o ID do usuário
                const decodedToken = jwtDecode(token);
                const idUsuario = decodedToken.id;

                if (!idUsuario) {
                    throw new Error("ID do usuário não encontrado no token.");
                }

                const data = await getEmprestimosPorUsuario(idUsuario);
                setEmprestimos(data || []);
            
            } catch (err) {
                console.error("Erro ao buscar empréstimos:", err);
                const errorMessage = err.response?.data?.message || "Não foi possível carregar seus empréstimos.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchEmprestimo();
    }, [user]);

    const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

    const renderContent = () => {
        if (loading) {
            return <div className={styles.messageContainer}>Carregando seus empréstimos...</div>;
        }

        if (error) {
            return <div className={`${styles.messageContainer} ${styles.errorMessage}`}>{error}</div>;
        }

        if (emprestimos.length === 0) {
            return <div className={`${styles.messageContainer} ${styles.emptyMessage}`}>Você não possui nenhum empréstimo no momento.</div>;
        }
        
        return (
            <div className={styles.grid}>
                    {emprestimos.map((emprestimo) => (
                        <div key={emprestimo.id} className={styles.card}>
                            <h3 className={styles.cardTitle}>{emprestimo.livro.titulo}</h3>
                            <div className={styles.cardContent}>
                                <p><strong>Data do Empréstimo:</strong> {formatarData(emprestimo.dataEmprestimo)}</p>
                                <p><strong>Devolução Prevista:</strong> {formatarData(emprestimo.dataDevolucaoPrevista)}</p>
                            </div>
                            <div className={styles.cardFooter}>
                                <span className={`${styles.status} ${styles[emprestimo.statusEmprestimo.toLowerCase()]}`}>
                                    {emprestimo.statusEmprestimo}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
        );
    };

  return (
    <div className={styles.pageContainer}>
            <h1>Meus Empréstimos</h1>
            {renderContent()}
        </div>
  );
}

export default MeusEmprestimosPage;