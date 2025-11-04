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
        setReservas(data || []);
      } catch (err) {
        console.error("Erro ao buscar reservas:", err);
        const errorMessage = err.response?.data?.message || "Não foi possível carregar suas reservas.";
        setError(errorMessage);
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

  const RenderReservasGrid = ({ listaReservas }) => (
    <div className={styles.grid}>
      {listaReservas.map((reserva) => (
        <div key={reserva.id} className={styles.card}>
          <h3 className={styles.cardTitle}>{reserva.livro.titulo}</h3>
          <div className={styles.cardContent}>
            <p><strong>Autor:</strong> {reserva.livro.autor || 'Desconhecido'}</p>
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
  );

  const renderContent = () => {
        if (loading) {
            return <div className={styles.messageContainer}>Carregando suas reservas...</div>;
        }
        if (error) {
            return <div className={`${styles.messageContainer} ${styles.errorMessage}`}>{error}</div>;
        }
        if (reservas.length === 0) {
            return <div className={`${styles.messageContainer} ${styles.emptyMessage}`}>Você não possui nenhuma reserva no momento.</div>;
        }

        const reservasAtivas = reservas.filter(r => r.statusReserva === 'ATIVA');
        const reservasHistorico = reservas.filter(r => r.statusReserva !== 'ATIVA');

        return (
          <>
            <div className={styles.sectionContainer}>
              <h2 className={styles.sectionTitle}>Reservas Ativas</h2>
              {reservasAtivas.length > 0 ? (
                <RenderReservasGrid listaReservas={reservasAtivas} />
              ) : (
                <div className={styles.emptySectionMessage}>Você não possui reservas ativas.</div>
              )}
            </div>

            <div className={styles.sectionContainer}>
              <h2 className={styles.sectionTitle}>Histórico de Reservas</h2>
              {reservasHistorico.length > 0 ? (
                <RenderReservasGrid listaReservas={reservasHistorico} />
              ) : (
                <div className={styles.emptySectionMessage}>Você não possui histórico de reservas.</div>
              )}
            </div>
          </>
        );
    };

  return (
   <div className={styles.pageContainer}>
      <h1>Minhas Reservas</h1>
        {renderContent()}
    </div>
  );
}

export default MinhasReservasPage;