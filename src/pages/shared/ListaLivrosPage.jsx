// src/pages/ListaLivros
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buscarLivrosPorTermoGeral, getTodosLivros } from '../../services/livroService';
import useDebounce from '../../hooks/useDebounce';
import styles from './ListaLivrosPage.module.css';

const API_BASE_URL = 'http://localhost:8080';

function ListaLivros() {

  const [livros, setLivros] = useState([]);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

  const debouncedTermoBusca = useDebounce(termoBusca, 500);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setMessage('');
      setIsError(false);
      
      try {
        let data;
        // Prioridade 1: Busca por termo
        if (debouncedTermoBusca.trim()) {
          data = await buscarLivrosPorTermoGeral(debouncedTermoBusca);
        } 
        // Prioridade 2: Carregar todos
        else {
          data = await getTodosLivros();
        }
        
        setLivros(data || []);
        if (!data || data.length === 0) {
          setMessage('Nenhum livro encontrado.');
        }
      } catch (err) {
        console.error("Erro ao buscar livros:", err);
        setLivros([]);
        setMessage("Erro ao realizar a busca.");
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedTermoBusca]);

  const messageClass = isError ? styles.errorMessage : styles.successMessage;

  return (
    <div className={styles.pageContainer}>
      <h1>Catálogo de Livros</h1>
      <div className={styles.searchBar}>
        <input 
          type="text"
          placeholder="Buscar por título, autor ou categoria..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className={styles.searchInput}
        />
        <button 
          type="button" 
          onClick={() => setTermoBusca('')} // Apenas limpa o estado
          className={styles.clearButton}
        >
          Limpar
        </button>
      </div>

      {message && <p className={messageClass}>{message}</p>}
      
      {loading ? <p>Carregando...</p> : (
        <div className={styles.bookGrid}>
          {livros.map((livro) => (
          <div key={livro.id} className={styles.bookCard}>
          <Link to={`/livros/${livro.id}`} className={styles.cardLink}>
          <div className={styles.cardImageContainer}>
          <img
          className={styles.cardImage}
          src={`${API_BASE_URL}/livros/${livro.id}/capa`} 
          alt={`Capa do livro ${livro.titulo}`}
                                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x420/f1f5f9/64748b?text=Sem+Capa' }}
          />
          </div>
          <div className={styles.cardContent}>
            <h3>{livro.titulo}</h3>
            <p>por {livro.autor}</p>
            <span>Categoria: {livro.categoria}</span>
            <div className={`${styles.status} ${styles[livro.statusLivro.toLowerCase()]}`}>
                {livro.statusLivro}
            </div>
          </div>
          </Link>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListaLivros;