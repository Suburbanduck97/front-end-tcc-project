// src/pages/MeusEmprestimosPage
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../context/AuthContext';
import { getEmprestimosPorUsuario } from '../services/emprestimoService';
import { jwtDecode } from 'jwt-decode';

function MeusEmprestimosPage() {
    const { user } = useContext(AuthContext); // Usamos o contexto para saber se estamos logados
    const [emprestimos, setEmprestimos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmprestimo = async () => {
            if (!user) {
                setError("Autenticação necessária para ver os empréstimos.");
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
                setEmprestimos(data);
            
            } catch (err) {
                console.error("Erro ao buscar empréstimos:", err);
                setError("Não foi possível carregar seus empréstimos.")
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

  if (loading) {
    return <p>Carregando seus empréstimos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
        <h2>Meus Empréstimos</h2>
        {emprestimos.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0}}>
                {emprestimos.map((emprestimo) => (
                    <li key={emprestimo.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px'}}>
                        <strong>Livro:</strong> {emprestimo.livro.titulo} <br />
                        <strong>Data do Empréstimo:</strong> {formatarData(emprestimo.dataEmprestimo)} <br />
                        <strong>Data de Devolução Prevista:</strong> {formatarData(emprestimo.dataDevolucaoPrevista)} <br />
                        <strong>Status:</strong> {emprestimo.statusEmprestimo}
                    </li>
                ))}
            </ul>
        ) : (
            <p>Você não possui nenhum empréstimo no momento.</p>
        )}
    </div>
  );
}

export default MeusEmprestimosPage;