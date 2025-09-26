// src/pages/MinhasReservasPage.jsx
import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getMinhasReservas } from '../../services/reservaService'; // Importa nosso novo serviço
import styles from './MinhasReservasPage.module.css';

function MinhasReservasPage() {
  const { user } = useContext(AuthContext);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservas = async () => {
      if (!user) {
        setError("Autenticação necessária para ver as reservas.");
        setLoading(false);
        return;
      }

      try {
        // A chamada de API agora é mais simples, não precisamos do ID!
        const data = await getMinhasReservas();
        setReservas(data);
      } catch (err) {
        console.error("Erro ao buscar reservas:", err);
        // Verifica se a resposta é a mensagem "Você não possui nenhuma reserva."
        if (err.response && err.response.status === 200) {
            setReservas([]);
        } else {
            setError("Não foi possível carregar suas reservas.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [user]);

  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return <p>Carregando suas reservas...</p>;
  }

  if (error) {
    return <p className={styles.errorMessage}>{error}</p>;
  }

  return (
   <div className={styles.pageContainer}>
      <h1>Minhas Reservas</h1>
      {reservas.length > 0 ? (
        <div className={styles.grid}>
          {reservas.map((reserva) => (
            <div key={reserva.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{reserva.livro.titulo}</h3>
              <div className={styles.cardContent}>
                <p><strong>Data da Reserva:</strong> {formatarData(reserva.dataReserva)}</p>
              </div>
              <div className={styles.cardFooter}>
                <span className={`${styles.status} ${styles[reserva.statusReserva.toLowerCase()]}`}>
                  {reserva.statusReserva}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.emptyMessage}>Você não possui nenhuma reserva no momento.</p>
      )}
    </div>
  );
}

export default MinhasReservasPage;