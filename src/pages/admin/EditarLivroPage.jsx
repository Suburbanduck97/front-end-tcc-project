import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { atualizarLivro, getLivroPorId } from '../../services/livroService';
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
          descricao: data.descricao || '',
          capa: null 
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
    const { id, value, type, files } = e.target;

    if(type === 'file'){
      setFormData(prevState => ({ ...prevState, [id]: files[0]}));
    }else{
      setFormData(prevState => ({ ...prevState, [id]: value}));
    }

  };

  const handleCancel = () => {
    navigate('/livros');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setIsSubmitting(true);

    const dadosAtualizados = {};
    let mudancasTexto = false;

    for (const key in formData) {
      if(key === 'capa') continue;

      // Converte valores numéricos para comparação correta
      const formValue = (key === 'anoPublicacao' || key === 'qtdTotal') ? Number(formData[key]) : formData[key];
      const originalValue = (key === 'anoPublicacao' || key === 'qtdTotal') ? Number(livroOriginal[key]) : livroOriginal[key];

      if (formValue !== originalValue) {
        dadosAtualizados[key] = formValue;
        mudancasTexto = true;
      }
    }

    const novaCapa = formData.capa instanceof File;

    if(!mudancasTexto && !novaCapa){
      setError("Nenhuma alteração foi feita.");
      setIsSubmitting(false);
      return;
    }

    try{
      const dadosParaEnvio = new FormData();

      for(const key in dadosAtualizados){
        dadosParaEnvio.append(key, dadosAtualizados[key]);
      }

      if(novaCapa){
        dadosParaEnvio.append('capa', formData.capa);
      }

      await atualizarLivro(id, dadosParaEnvio);

      setSuccess('Livro atualizado com sucesso! Redirecionando...');

      const novoOriginal = { ...livroOriginal, ...dadosAtualizados};
      setLivroOriginal(novoOriginal);
      setFormData({ ...novoOriginal, capa: null});

      setTimeout(() => navigate(`/livros/${id}`), 2000);
    }catch (err){
      console.error("Erro ao atualizar livro:", err);
      setError(err.response?.data?.message || 'Não foi possível atualizar o livro.');
    }finally{
      setIsSubmitting(false);
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
          <div className={styles.formGroup}>
            <label htmlFor="capa">Capa do Livro</label>
            <input type="file" id="capa" onChange={handleChange} accept="image/png, image/jpeg" />
          </div>
        </div>
        <div className={styles.formActions}>
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