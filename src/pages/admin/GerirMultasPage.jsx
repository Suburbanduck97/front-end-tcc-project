import { useEffect, useState } from 'react';
import Modal from '../../components/Shared/Modal';
import { useToast } from '../../context/useToast';
import useDebounce from '../../hooks/useDebounce';
import { buscarMultaPorId, filtrarMultasPorStatus, listarTodasMultas, pagarMulta } from '../../services/multaService';
import styles from './GerirMultasPage.module.css';

function GerirMultasPage() {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para os controles de busca e filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODAS');

  const [modalState, setModalState] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingId, setSubmittingId] = useState(null); 
  const { addToast } = useToast(); 

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
    fetchData();
  }, [debouncedSearchTerm, filterStatus]);
  
  // Função para formatar a data
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const handlePagarMulta = async (idMulta) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmittingId(idMulta);

    try {
      await pagarMulta(idMulta);
      addToast(`Baixa registrada com sucesso para a multa ID: ${idMulta}!`, 'success'); // NOVO: Toast

      if (filterStatus === 'PENDENTE') {
        setMultas(prevMultas => prevMultas.filter(m => m.id !== idMulta));
      } else {
        setMultas(prevMultas => prevMultas.map(multa => 
            multa.id === idMulta ? { ...multa, statusMulta: 'PAGO' } : multa
        ));
      }
    } catch (err) {
      console.error("Erro ao dar baixa na multa:", err);
      const errorMsg = err.response?.data?.message || 'Erro ao processar baixa.';
      addToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
      setSubmittingId(null);
      setModalState({ isOpen: false }); 
    }
  };

  const openPagarMultaModal = (multa) => {
    setModalState({
      isOpen: true,
      onConfirm: () => handlePagarMulta(multa.id), // Ação que será executada
      title: 'Confirmar Baixa de Multa',
      message: `Deseja realmente dar baixa no pagamento da multa ID: ${multa.id}? (Usuário: ${multa.nomeUsuario} | Valor: R$ ${multa.valor.toFixed(2)})`
    });
  };

  const renderContent = () => {
        if (loading) {
            return <div className={styles.messageContainer}>Carregando...</div>;
        }
        if (error) {
            return <div className={`${styles.messageContainer} ${styles.errorMessage}`}>{error}</div>;
        }
        if (multas.length === 0) {
            return <div className={`${styles.messageContainer} ${styles.emptyMessage}`}>Nenhum item encontrado.</div>;
        }

        return (
          <div className={styles.tableScrollWrapper}>
            <table className={styles.multasTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>Livro</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {multas.map((multa) => (
                <tr key={multa.id}>
                  <td>{multa.id}</td>
                  <td>{multa.nomeUsuario}</td>
                  <td>{multa.tituloLivro}</td>
                  <td>{`R$ ${multa.valor.toFixed(2)}`}</td>
                  <td>{formatarData(multa.dataMulta)}</td>
                  <td>
                    <span className={`${styles.status} ${multa.statusMulta === 'PENDENTE' ? styles.statusPendente : styles.statusPago}`}>
                      {multa.statusMulta}
                    </span>
                  </td>
                  <td>
                    {multa.statusMulta === 'PENDENTE' && (
                      <button
                        className={styles.payButton}
                        onClick={() => openPagarMultaModal(multa)}
                        disabled={submittingId === multa.id}
                        >
                          {submittingId === multa.id ? 'Processando...' : 'Dar Baixa'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        );
      };


  return (
   <div className={styles.pageContainer}>
     <h2 className={styles.title}>Gerenciar Multas</h2>

     <div className={styles.controlsContainer}>
       <input
       type="number"
       placeholder="Buscar por ID da multa..."
       value={searchTerm}
       onChange={(e) => setSearchTerm(e.target.value)}
       className={styles.searchInput}
      />

     <div className={styles.filterGroup}>
       <label htmlFor="status-filter">Filtrar por status:</label>
         <select
             id="status-filter"
             value={filterStatus}
             onChange={(e) => {
              setFilterStatus(e.target.value);
              setSearchTerm('');
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

      <Modal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false })}
          onConfirm={modalState.onConfirm}
          title={modalState.title}
          isSubmitting={isSubmitting}
      >
          <p>{modalState.message}</p>
      </Modal>

    </div>
    );
}

export default GerirMultasPage;