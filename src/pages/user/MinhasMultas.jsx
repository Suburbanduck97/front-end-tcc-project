// src/pages/MinhasMultasPage
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getMultasPorUsuario } from '../../services/multaService'; // Importa nosso novo serviço
import { jwtDecode } from 'jwt-decode';
import styles from './MinhasMultasPage.module.css';

function MinhasMultasPage() {
  const { user } = useContext(AuthContext);
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMultas = async () => {
      if (!user) {
        setError("Autenticação necessária para ver as multas.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("Token não encontrado.");

        const decodedToken = jwtDecode(token);
        const idUsuario = decodedToken.id; // Pega o ID do usuário do token
        if (!idUsuario) throw new Error("ID do usuário não encontrado no token.");

        const data = await getMultasPorUsuario(idUsuario);
        setMultas(data);
      } catch (err) {
        console.error("Erro ao buscar multas:", err);
        setError("Não foi possível carregar suas multas.");
      } finally {
        setLoading(false);
      }
    };

    fetchMultas();
  }, [user]);

  if (loading) {
    return <p>Carregando suas multas...</p>;
  }

  if (error) {
    return <p className={styles.errorMessage}>{error}</p>;
  }

  return (
    <div className={styles.pageContainer}>
      <h1>Minhas Multas</h1>
      {multas.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Livro</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {multas.map((multa) => (
                <tr key={multa.id}>
                  <td>{multa.tituloLivro}</td>
                  <td>R$ {multa.valor.toFixed(2).replace('.', ',')}</td>
                  <td>
                    <span className={`${styles.status} ${styles[multa.statusMulta.toLowerCase()]}`}>
                      {multa.statusMulta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.emptyMessage}>Você não possui nenhuma multa no momento.</p>
      )}
    </div>
  );
}

export default MinhasMultasPage;