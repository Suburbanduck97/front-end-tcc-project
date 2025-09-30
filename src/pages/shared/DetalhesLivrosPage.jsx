// src/pages/DetalhesLivroPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLivroPorId } from '../../services/livroService';
import { criarReserva } from '../../services/reservaService';
import styles from './DetalhesLivroPage.module.css';

function DetalhesLivroPage() {
  const { id } = useParams(); // Pega o 'id' da URL (ex: /livros/1 -> id = 1)
  const navigate = useNavigate();
  
  const [livro, setLivro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservaMessage, setReservaMessage] = useState('');
  const [isErrorOnReserve, setIsErrorOnReserve] = useState(false);

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
    setIsErrorOnReserve(false);

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
      setIsErrorOnReserve(true);
    }
  };

  if (loading) return <p className={styles.loadingMessage}>Carregando detalhes do livro...</p>;
  if (error) return <p  className={styles.errorMessage}>{error}</p>;
  if (!livro) return <p>Livro não encontrado.</p>;

  const messageClass = isErrorOnReserve ? styles.errorMessage : styles.successMessage;
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.coverContainer}>
        <img 
          src={`http://localhost:8080/livros/${id}/capa`} 
          alt={`Capa do livro ${livro.titulo}`} 
          className={styles.coverImage}
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x450.png?text=Capa+Indisponivel'; }}
        />
      </div>
      <div className={styles.detailsContainer}>
        <h1 className={styles.title}>{livro.titulo}</h1>
        <p className={styles.author}>por {livro.autor}</p>
        
        <div className={styles.infoGrid}>
          <p><strong>Editora:</strong> {livro.editora || 'N/A'}</p>
          <p><strong>Ano:</strong> {livro.anoPublicacao || 'N/A'}</p>
          <p><strong>ISBN:</strong> {livro.isbn || 'N/A'}</p>
          <p><strong>Categoria:</strong> {livro.categoria}</p>
        </div>
        
        <div className={styles.statusContainer}>
            <p><strong>Status:</strong> <span className={`${styles.status} ${styles[livro.statusLivro.toLowerCase()]}`}>{livro.statusLivro}</span></p>
            <p><strong>Disponíveis:</strong> {livro.qdtDisponivel}</p>
        </div>
        
        <hr className={styles.separator} />

        <div className={styles.actions}>
            <button 
              onClick={handleReservar} 
              disabled={livro.statusLivro !== 'DISPONIVEL' || livro.qtdDisponivel <= 0}
              className={styles.reserveButton}
            >
              Reservar Livro
            </button>
            {reservaMessage && <p className={`${styles.reservaMessage} ${messageClass}`}>{reservaMessage}</p>}
        </div>
      </div>
    </div>
    );
}

export default DetalhesLivroPage;