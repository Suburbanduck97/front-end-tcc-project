// src/pages/ListaLivros
import React, { useState, useEffect, useContext } from 'react';

import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Importa o AuthContext
// Importa as novas funções do nosso serviço de livros
import { getTodosLivros, buscarLivrosPorTermoGeral, deletarLivro} from '../services/livroService';

function ListaLivros() {

  const { user } = useContext(AuthContext); // Pega o usuário logado do contexto
  const [livros, setLivros] = useState([]);
  const [message, setMessage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para controlar os campos de busca
  const [termoBusca, setTermoBusca] = useState('');

  // Função para carregar todos os livros inicialmente
  const carregarTodosLivros = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodosLivros();
      setLivros(data);
    } catch (err) {
      console.error("Erro ao carregar livros:", err);
      setLivros([]); // Limpa a lista em caso de erro
      setError("Não foi possível carregar os livros.");
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
    setError(null);
    try {
      const data = await buscarLivrosPorTermoGeral (termoBusca);
      setLivros(data || []); // Garante que livros seja um array mesmo se a resposta for 204
    } catch (err) {
      console.error("Erro na busca:", err);
      setLivros([]); // Limpa a lista em caso de erro na busca
      setError("Nenhum livro encontrado ou erro na busca.");
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir
  const handleExcluir = async (idLivro) => {
    setMessage('');
    if (window.confirm('Tem certeza que deseja excluir este livro? Esta ação não pode ser desfeita.')) {
      try {
        const response = await deletarLivro(idLivro);
        setMessage(response.mensagem || 'Livro excluído com sucesso!'); // Ajustado para "mensagem" também no sucesso
        carregarTodosLivros(); 
      } catch (error) {
        console.error("Erro ao excluir livro:", error);
      
        const errorMessage = error.response?.data?.mensagem || 
                           error.response?.data?.message || 
                           'Não foi possível excluir o livro.';
        setMessage(errorMessage);
      }
    }
  };
  
  return (
    <div>
      <h2>Catálogo de Livros</h2>
      {message && <p>{message}</p>}
      
      {/* Formulário de Busca */}
      <form onSubmit={handleBusca} style={{ marginBottom: '20px' }}>
        <input 
          type="text"
          placeholder="Buscar por título, autor ou categoria..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          style={{ width: '300px' }}
        />
        <button type="submit">Buscar</button>
        <button type="button" onClick={() => {setTermoBusca(''); carregarTodosLivros()}} style={{ marginLeft: '10px' }}>Limpar Busca</button>
      </form>

      {/* Exibição dos Resultados */}
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !error && (
        livros.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {livros.map((livro) => (
               <li key={livro.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                {/* Usamos um div para agrupar o link e os botões */}
                <div>
                  <Link to={`/livros/${livro.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <strong>{livro.titulo}</strong> ({livro.anoPublicacao})<br />
                    <em>por {livro.autor}</em><br />
                    <span>Categoria: {livro.categoria} | Status: {livro.statusLivro}</span>
                  </Link>
                </div>
                
                {/* 4. Botões de Ação que só aparecem para o Bibliotecário */}
                {user && user.role === 'BIBLIOTECARIO' && (
                  <div style={{ marginTop: '10px' }}>
                    <Link to={`/admin/editar-livro/${livro.id}`}>
                      <button>Editar</button>
                    </Link>
                    <button onClick={() => handleExcluir(livro.id)} style={{ marginLeft: '10px' }}>
                      Excluir
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum livro encontrado para os critérios de busca.</p>
        )
      )}
    </div>
  );
}

export default ListaLivros;