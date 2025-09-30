import { useState, useEffect } from 'react';
import { listarTodosUsuarios, buscarUsuarioPorNome, filtrarUsuarioPorRole } from '../../services/usuarioService';
import styles from './GerirUsuariosPage.module.css';

function GerirUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para os controles de busca e filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('TODOS'); // 'TODOS', 'LEITOR', 'BIBLIOTECARIO'

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listarTodosUsuarios();
      setUsuarios(response.data);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      const errorMessage = err.response?.data?.message || 'Não foi possível carregar os usuários.';
      setError(errorMessage);
      setUsuarios([]); // Limpa a lista em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // Carrega a lista inicial de usuários quando o componente é montado
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Função para lidar com a busca por nome
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchUsuarios(); // Se a busca estiver vazia, carrega todos
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await buscarUsuarioPorNome(searchTerm);
      setUsuarios(response.data);
    } catch (err) {
      console.error("Erro na busca:", err);
      const errorMessage = err.response?.data?.message || 'Nenhum usuário encontrado.';
      setError(errorMessage);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a mudança no filtro de tipo
  const handleFilterChange = async (role) => {
    setFilterRole(role);
    setLoading(true);
    setError(null);
    try {
      let response;
      if (role === 'TODOS') {
        response = await listarTodosUsuarios();
      } else {
        response = await filtrarUsuarioPorRole(role);
      }
      setUsuarios(response.data);
    } catch (err) {
      console.error("Erro ao filtrar:", err);
      const errorMessage = err.response?.data?.message || `Nenhum usuário do tipo ${role} encontrado.`;
      setError(errorMessage);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>Gerenciar Usuários</h2>

      {/* Controles de Busca e Filtro */}
      <div className={styles.controlsContainer}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>Buscar</button>
        </form>

        <div className={styles.filterGroup}>
          <label htmlFor="role-filter">Filtrar por tipo:</label>
          <select
            id="role-filter"
            value={filterRole}
            onChange={(e) => handleFilterChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="TODOS">Todos</option>
            <option value="LEITOR">Leitores</option>
            <option value="BIBLIOTECARIO">Bibliotecários</option>
          </select>
        </div>
      </div>

      {/* Exibição da Lista de Usuários */}
      <div className={styles.content}>
        {loading ? (
          <p>Carregando usuários...</p>
        ) : error ? (
          <p className={styles.errorMessage}>{error}</p>
        ) : usuarios.length === 0 ? (
          <p>Nenhum usuário encontrado.</p>
        ) : (
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>CPF</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.cpf}> {/* Usando CPF como chave única */}
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.cpf}</td>
                  <td>{usuario.role === 'LEITOR' ? 'Leitor' : 'Bibliotecário'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default GerirUsuariosPage;