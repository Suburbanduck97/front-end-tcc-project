// src/pages/ListaLivros
import { useContext, useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Importa o AuthContext
// Importa as novas funções do nosso serviço de livros
import buscarLivrosPorTermoGeral, { deletarLivro, getTodosLivros } from '../../services/livroService';
import styles from './ListaLivrosPage.module.css';

function ListaLivros() {

  const { user } = useContext(AuthContext); // Pega o usuário logado do contexto
  const [livros, setLivros] = useState([]);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

  // Função para carregar todos os livros inicialmente
  const carregarTodosLivros = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await getTodosLivros();
      setLivros(data);
    } catch (err) {
      console.error("Erro ao carregar livros:", err);
      setLivros([]); // Limpa a lista em caso de erro
      setMessage("Não foi possível carregar os livros.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };
  
  // useEffect agora só carrega os livros na primeira vez que a página abre
  useEffect(() => {
    carregarTodosLivros();
  }, []);

  // Função para lidar com a busca
  const handleBusca = async (e) => {
    e.preventDefault(); // Previne o recarregamento da página pelo formulário
    if (!termoBusca.trim()) {
        carregarTodosLivros();
        return;
    }
    setLoading(true);
    setMessage('');
    try {
      const data = await buscarLivrosPorTermoGeral (termoBusca);
      setLivros(data || []); // Garante que livros seja um array mesmo se a resposta for 204
      if (!data || data.length === 0) {
        setMessage('Nenhum livro encontrado para os critérios de busca.');
        setIsError(false);
      }
    } catch (err) {
      console.error("Erro na busca:", err);
      setLivros([]); // Limpa a lista em caso de erro na busca
      setMessage("Erro ao realizar a busca.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir
  const handleExcluir = async (idLivro) => {
    setMessage('');
    if (window.confirm('Tem certeza que deseja excluir este livro? Esta ação não pode ser desfeita.')) {
      try {
        await deletarLivro(idLivro);
        setMessage('Livro excluído com sucesso!');
        setIsError(false);
        carregarTodosLivros();
      } catch (error) {
        const errorMessage = error.response?.data?.mensagem || 'Não foi possível excluir o livro.';
        setMessage(errorMessage);
        setIsError(true);
      }
    }
  };
  
  const messageClass = isError ? styles.errorMessage : styles.successMessage;

  return (
    <div className={styles.pageContainer}>
      <h1>Catálogo de Livros</h1>
      
      <form onSubmit={handleBusca} className={styles.searchBar}>
        <input 
          type="text"
          placeholder="Buscar por título, autor ou categoria..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>Buscar</button>
        <button type="button" onClick={() => { setTermoBusca(''); carregarTodosLivros(); }} className={styles.clearButton}>Limpar</button>
      </form>

      {message && <p className={messageClass}>{message}</p>}
      
      {loading ? <p>Carregando...</p> : (
        <div className={styles.bookGrid}>
          {livros.map((livro) => (
            <div key={livro.id} className={styles.bookCard}>
              <Link to={`/livros/${livro.id}`} className={styles.cardLink}>
                <div className={styles.cardContent}>
                  <h3>{livro.titulo}</h3>
                  <p>por {livro.autor}</p>
                  <span>Categoria: {livro.categoria}</span>
                  <div className={`${styles.status} ${styles[livro.statusLivro.toLowerCase()]}`}>
                    {livro.statusLivro}
                  </div>
                </div>
              </Link>
              
              {user?.role === 'BIBLIOTECARIO' && (
                <div className={styles.adminActions}>
                  <Link to={`/admin/editar-livro/${livro.id}`} className={`${styles.btn} ${styles.btnEdit}`}>Editar</Link>
                  <button onClick={() => handleExcluir(livro.id, livro.titulo)} className={`${styles.btn} ${styles.btnDelete}`}>
                    Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListaLivros;