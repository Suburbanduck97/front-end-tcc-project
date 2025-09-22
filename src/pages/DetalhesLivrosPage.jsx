// src/pages/DetalhesLivroPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLivroPorId } from '../services/livroService';
import { criarReserva } from '../services/reservaService';

function DetalhesLivroPage() {
  const { id } = useParams(); // Pega o 'id' da URL (ex: /livros/1 -> id = 1)
  const navigate = useNavigate();
  
  const [livro, setLivro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservaMessage, setReservaMessage] = useState('');

  useEffect(() => {
    const fetchLivro = async () => {
      try {
        const data = await getLivroPorId(id);
        setLivro(data);
      } catch (err) {
        console.error("Erro ao buscar detalhes do livro:", err);
        setError("Não foi possível encontrar o livro.");
      } finally {
        setLoading(false);
      }
    };
    fetchLivro();
  }, [id]); // O [id] garante que a busca seja refeita se a URL mudar

  const handleReservar = async () => {
    setReservaMessage('');
    try {
      await criarReserva(livro.id);
      setReservaMessage('Livro reservado com sucesso! Você será redirecionado para a página de reservas.');
      // Redireciona o usuário para a página de "Minhas Reservas" após um tempo
      setTimeout(() => {
        navigate('/minhas-reservas');
      }, 3000); // 3 segundos
    } catch (err) {
      console.error("Erro ao criar reserva:", err);
      setReservaMessage(err.response?.data?.message || 'Não foi possível fazer a reserva.');
    }
  };

  if (loading) return <p>Carregando detalhes do livro...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!livro) return <p>Livro não encontrado.</p>;

  return (
    <div>
        <img 
        src={`http://localhost:8080/livros/${id}/capa`} 
        alt={`Capa do livro ${livro.titulo}`} 
        style={{ width: '200px', float: 'left', marginRight: '20px' }}
        // Adiciona uma imagem padrão caso a capa não carregue
        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/200x300.png?text=Capa+Indisponivel'; }}
        />
        <h2>{livro.titulo}</h2>
        <p><strong>Autor:</strong> {livro.autor}</p>
        <p><strong>Editora:</strong> {livro.editora}</p>
        <p><strong>Ano de Publicação:</strong> {livro.anoPublicacao}</p>
        <p><strong>ISBN:</strong> {livro.isbn}</p>
        <p><strong>Categoria:</strong> {livro.categoria}</p>
        <p><strong>Status:</strong> {livro.statusLivro}</p>
        <p><strong>Disponíveis:</strong> {livro.qdtDisponivel}</p>
        <hr />
        <button 
            onClick={handleReservar} 
            disabled={livro.statusLivro !== 'DISPONIVEL' || livro.qdtDisponivel <= 0}
        >
            Reservar Livro
        </button>
        {reservaMessage && <p>{reservaMessage}</p>}
        </div>
    );
}

export default DetalhesLivroPage;