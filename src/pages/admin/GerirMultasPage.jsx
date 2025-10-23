import React, { useState, useEffect } from 'react';
import { listarTodasMultas, buscarMultaPorId, filtrarMultasPorStatus } from '../../services/multaService';
import useDebounce from '../../hooks/useDebounce';
import styles from './GerirMultasPage.module.css';

function GerirMultasPage() {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para os controles de busca e filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODAS'); // 'TODAS', 'PENDENTE', 'PAGO'

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        
        // Prioridade 1: Busca por ID
        if (debouncedSearchTerm.trim()) {
          response = await buscarMultaPorId(debouncedSearchTerm);
          // A API retorna um objeto, mas a tabela espera um array
          setMultas([response.data]); 
        } 
        // Prioridade 2: Filtro por Status
        else if (filterStatus !== 'TODAS') {
          response = await filtrarMultasPorStatus(filterStatus);
          setMultas(response.data);
        } 
        // Prioridade 3: Carregar todas
        else {
          response = await listarTodasMultas();
          setMultas(response.data);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        const idNotFound = err.response?.status === 404 && debouncedSearchTerm.trim();
        const errorMessage = idNotFound
          ? `Nenhuma multa encontrada com o ID: ${debouncedSearchTerm}`
          : (err.response?.data?.message || 'Nenhum item encontrado.');
        setError(errorMessage);
        setMultas([]);
      } finally {
        setLoading(false);
      }
    };

    // A API de ID só é chamada se o "debouncedSearchTerm" existir.
    // Se não existir, a lógica de filtro/todos é chamada.
    fetchData();
  }, [debouncedSearchTerm, filterStatus]);
  
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

     <div className={styles.controlsContainer}>
      {/* MUDANÇA: Removemos o <form> e o onSubmit */}
       <input
       type="number"
       placeholder="Buscar por ID da multa..."
       value={searchTerm}
       onChange={(e) => setSearchTerm(e.target.value)}
       className={styles.searchInput}
      />
      {/* MUDANÇA: Removemos o botão "Buscar" */}

     <div className={styles.filterGroup}>
       <label htmlFor="status-filter">Filtrar por status:</label>
         <select
             id="status-filter"
             value={filterStatus}
             // MUDANÇA: Ao trocar o filtro, limpamos a busca
             onChange={(e) => {
              setFilterStatus(e.target.value);
              setSearchTerm(''); // Limpa a busca
            }}
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