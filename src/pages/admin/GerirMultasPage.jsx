import React, { useState, useEffect } from 'react';
import { listarTodasMultas, buscarMultaPorId, filtrarMultasPorStatus } from '../../services/multaService';
import styles from './GerirMultasPage.module.css';

function GerirMultasPage() {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para os controles de busca e filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODAS'); // 'TODAS', 'PENDENTE', 'PAGO'

  // Função genérica para buscar a lista inicial de todas as multas
  const fetchTodasMultas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listarTodasMultas();
      setMultas(response.data);
    } catch (err) {
      console.error("Erro ao buscar multas:", err);
      setError(err.response?.data?.message || 'Não foi possível carregar as multas.');
      setMultas([]);
    } finally {
      setLoading(false);
    }
  };

  // Carrega a lista inicial quando o componente é montado
  useEffect(() => {
    fetchTodasMultas();
  }, []);

  // Função para lidar com a busca por ID
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchTodasMultas(); // Se a busca estiver vazia, carrega todas
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await buscarMultaPorId(searchTerm);
      // A API retorna um único objeto, mas o state espera um array para a tabela.
      setMultas([response.data]); 
    } catch (err) {
      console.error("Erro na busca por ID:", err);
      setError(err.response?.status === 404 ? `Nenhuma multa encontrada com o ID: ${searchTerm}` : 'Erro ao buscar multa.');
      setMultas([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a mudança no filtro de status
  const handleFilterChange = async (status) => {
    setFilterStatus(status);
    setLoading(true);
    setError(null);
    try {
      let response;
      if (status === 'TODAS') {
        response = await listarTodasMultas();
      } else {
        response = await filtrarMultasPorStatus(status);
      }
      setMultas(response.data);
    } catch (err) {
      console.error("Erro ao filtrar multas:", err);
      setError(err.response?.data?.message || 'Erro ao aplicar o filtro.');
      setMultas([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Função para formatar a data
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const renderContent = () => {
        if (loading) {
            return <div className={styles.messageContainer}>Carregando...</div>;
        }
        if (error) {
            return <div className={`${styles.messageContainer} ${styles.errorMessage}`}>{error}</div>;
        }
        if (multas.length === 0) { // ou usuarios.length === 0
            return <div className={`${styles.messageContainer} ${styles.emptyMessage}`}>Nenhum item encontrado.</div>;
        }

        return (
            <table className={styles.multasTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>Livro</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {multas.map((multa) => (
                <tr key={multa.id}>
                  <td>{multa.id}</td>
                  <td>{multa.usuarioNome}</td>
                  <td>{multa.livroTitulo}</td>
                  <td>{`R$ ${multa.valor.toFixed(2)}`}</td>
                  <td>{formatarData(multa.dataMulta)}</td>
                  <td>
                    <span className={`${styles.status} ${multa.statusMulta === 'PENDENTE' ? styles.statusPendente : styles.statusPago}`}>
                      {multa.statusMulta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      };


  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>Gerenciar Multas</h2>

      {/* Controles de Busca e Filtro */}
      <div className={styles.controlsContainer}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="number"
            placeholder="Buscar por ID da multa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>Buscar</button>
        </form>

        <div className={styles.filterGroup}>
          <label htmlFor="status-filter">Filtrar por status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="TODAS">Todas</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="PAGO">Pagas</option>
          </select>
        </div>
      </div>
      <div className={styles.content}>
          {renderContent()}
      </div>
      </div>
  );
}

export default GerirMultasPage;