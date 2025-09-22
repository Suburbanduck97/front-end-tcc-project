// src/pages/MinhasReservasPage.jsx
import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMinhasReservas } from '../services/reservaService'; // Importa nosso novo serviço

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
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h2>Minhas Reservas</h2>
      {reservas.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {reservas.map((reserva) => (
            <li key={reserva.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <strong>Livro:</strong> {reserva.livro.titulo} <br />
              <strong>Data da Reserva:</strong> {formatarData(reserva.dataReserva)} <br />
              <strong>Status:</strong> {reserva.statusReserva}
            </li>
          ))}
        </ul>
      ) : (
        <p>Você não possui nenhuma reserva no momento.</p>
      )}
    </div>
  );
}

export default MinhasReservasPage;