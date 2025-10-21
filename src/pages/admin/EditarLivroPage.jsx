import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLivroPorId, atualizarLivro } from '../../services/livroService';
import styles from './EditarLivroPage.module.css';

function EditarLivroPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [livroOriginal, setLivroOriginal] = useState(null); 
  const [formData, setFormData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- Estado de envio
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLivro = async () => {
      try {
        const data = await getLivroPorId(id);
        const dadosFormulario = {
          titulo: data.titulo || '', autor: data.autor || '',
          categoria: data.categoria || '', editora: data.editora || '',
          anoPublicacao: data.anoPublicacao || '', qtdTotal: data.qtdTotal || 0,
          descricao: data.descricao || ''
        };
        setFormData(dadosFormulario);
        setLivroOriginal(dadosFormulario); 
      } catch (error) {
        console.error("Erro ao carregar livro para edição:", error);
        setError(error.response?.data?.message || 'Erro ao carregar dados do livro.');
      } finally {
        setLoading(false);
      }
    };
    fetchLivro();
  }, [id]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({ ...prevState, [id]: value }));
  };

  // <-- CORRIGIDO 1: Adicionada a função de cancelar
  const handleCancel = () => {
    navigate(-1); // Simplesmente volta para a página anterior
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setIsSubmitting(true); // <-- CORRIGIDO 2: Ativa o estado de envio

    const dadosAtualizados = {};
    for (const key in formData) {
      // Converte valores numéricos para comparação correta
      const formValue = (key === 'anoPublicacao' || key === 'qtdTotal') ? Number(formData[key]) : formData[key];
      const originalValue = (key === 'anoPublicacao' || key === 'qtdTotal') ? Number(livroOriginal[key]) : livroOriginal[key];

      if (formValue !== originalValue) {
        dadosAtualizados[key] = formValue;
      }
    }

    if (Object.keys(dadosAtualizados).length === 0) {
      setError("Nenhuma alteração foi feita.");
      setIsSubmitting(false); // <-- Importante: parar o envio aqui também
      return;
    }

    try {
      await atualizarLivro(id, dadosAtualizados);
      setSuccess('Livro atualizado com sucesso! Redirecionando...');
      
      // Atualiza o "livroOriginal" para que o usuário não possa salvar de novo sem novas mudanças
      setLivroOriginal(formData); 
      
      setTimeout(() => navigate(`/livros/${id}`), 2000); // Redireciona para a pág. de detalhes
    } catch (err) {
      console.error("Erro ao atualizar livro:", err);
      setError(err.response?.data?.message  || 'Não foi possível atualizar o livro.');
    } finally {
      setIsSubmitting(false); // Desativa o estado de envio, ocorrendo sucesso ou erro
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!formData) return <p className={styles.errorMessage}>Erro ao carregar dados do livro.</p>;

  return (
    <div className={styles.pageContainer}>
      <h1>Editar Livro: <strong>{livroOriginal.titulo}</strong></h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="titulo">Título</label>
            <input type="text" id="titulo" value={formData.titulo} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="autor">Autor</label>
            <input type="text" id="autor" value={formData.autor} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="categoria">Categoria</label>
            <input type="text" id="categoria" value={formData.categoria} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="editora">Editora</label>
            <input type="text" id="editora" value={formData.editora} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="anoPublicacao">Ano de Publicação</label>
            <input type="number" id="anoPublicacao" value={formData.anoPublicacao} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="qtdTotal">Quantidade Total</label>
            <input type="number" id="qtdTotal" value={formData.qtdTotal} onChange={handleChange} />
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="descricao">Descrição</label>
            <textarea id="descricao" value={formData.descricao} onChange={handleChange}></textarea>
          </div>
        </div>
        <div className={styles.formActions}>
          {/* <-- CORRIGIDO 3: Botões agora usam 'isSubmitting' --> */}
          <button type="submit" className={styles.saveButton} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <button type="button" onClick={handleCancel} className={styles.cancelButton} disabled={isSubmitting}>
            Cancelar
          </button>
        </div>
      </form>
      {success && <p className={styles.successMessage}>{success}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}

export default EditarLivroPage;