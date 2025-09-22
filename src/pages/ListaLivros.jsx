// src/pages/ListaLivros
import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
// Importa as novas funções do nosso serviço de livros
import { getTodosLivros, buscarLivrosPorTermoGeral} from '../services/livroService';

function ListaLivros() {
  const [livros, setLivros] = useState([]);
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
  
  return (
    <div>
      <h2>Catálogo de Livros</h2>
      
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
              // 2. Envolvemos o item da lista em um componente Link
              <Link to={`/livros/${livro.id}`} key={livro.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <li style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                  <strong>{livro.titulo}</strong> ({livro.anoPublicacao})<br />
                  <em>por {livro.autor}</em><br />
                  <span>Categoria: {livro.categoria} | Status: {livro.statusLivro}</span>
                </li>
              </Link>
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