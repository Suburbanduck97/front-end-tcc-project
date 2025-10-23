import { useState, useEffect } from 'react';
import { listarTodosUsuarios, buscarUsuarioPorNome, filtrarUsuarioPorRole } from '../../services/usuarioService';
import useDebounce from '../../hooks/useDebounce';
import styles from './GerirUsuariosPage.module.css';

function GerirUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para os controles de busca e filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('TODOS'); // 'TODOS', 'LEITOR', 'BIBLIOTECARIO'

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Carrega a lista inicial de usuários quando o componente é montado
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;

        // Prioridade 1: Busca por nome (se o termo "atrasado" não estiver vazio)
        if (debouncedSearchTerm.trim()) {
          response = await buscarUsuarioPorNome(debouncedSearchTerm);
        }
        // Prioridade 2: Filtro por tipo (se não houver busca)
        else if (filterRole !== 'TODOS') {
          response = await filtrarUsuarioPorRole(filterRole);
        }
        // Prioridade 3: Carregar todos (sem busca e sem filtro)
        else {
          response = await listarTodosUsuarios();
        }
        setUsuarios(response.data);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        const errorMessage = err.response?.data?.message || 'Nenhum item encontrado.';
        setError(errorMessage);
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearchTerm, filterRole]);



  const renderContent = () => {
        if (loading) {
            return <div className={styles.messageContainer}>Carregando...</div>;
        }
        if (error) {
            return <div className={`${styles.messageContainer} ${styles.errorMessage}`}>{error}</div>;
        }
        if (usuarios.length === 0) {
            return <div className={`${styles.messageContainer} ${styles.emptyMessage}`}>Nenhum item encontrado.</div>;
        }

        return (
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.email}> {/* Usando email como chave única */}
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.role === 'LEITOR' ? 'Leitor' : 'Bibliotecário'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      };
  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>Gerenciar Usuários</h2>

      <div className={styles.controlsContainer}>
        {/* MUDANÇA: Removemos o <form> e o onSubmit */}
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={searchTerm}
                      // Apenas atualiza o estado. O useEffect/debounce faz o resto.
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        {/* MUDANÇA: Removemos o botão "Buscar" */}

        <div className={styles.filterGroup}>
          <label htmlFor="role-filter">Filtrar por tipo:</label>
          <select
            id="role-filter"
            value={filterRole}
            // MUDANÇA: Ao trocar o filtro, limpamos a busca
            onChange={(e) => {
                        setFilterRole(e.target.value);
                        setSearchTerm(''); // Limpa a busca
                        }}
              className={styles.filterSelect}
            >
              <option value="TODOS">Todos</option>
              <option value="LEITOR">Leitores</option>
              <option value="BIBLIOTECARIO">Bibliotecários</option>
                </select>
              </div>
            </div>
            <div className={styles.content}>
                {renderContent()}
            </div>
          </div>
        );
}

export default GerirUsuariosPage;