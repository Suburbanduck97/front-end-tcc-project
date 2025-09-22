// src/pages/MinhasMultasPage
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMultasPorUsuario } from '../services/multaService'; // Importa nosso novo serviço
import { jwtDecode } from 'jwt-decode';

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
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h2>Minhas Multas</h2>
      {multas.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {multas.map((multa) => (
            <li key={multa.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <strong>Livro:</strong> {multa.tituloLivro} <br />
              <strong>Valor:</strong> R$ {multa.valor.toFixed(2).replace('.', ',')} <br />
              <strong>Status:</strong> {multa.statusMulta}
              {/* No futuro, podemos adicionar um botão de pagamento aqui se o status for PENDENTE */}
            </li>
          ))}
        </ul>
      ) : (
        <p>Você não possui nenhuma multa pendente.</p>
      )}
    </div>
  );
}

export default MinhasMultasPage;