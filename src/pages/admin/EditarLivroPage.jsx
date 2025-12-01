import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { atualizarLivro, getLivroPorId } from '../../services/livroService';
import styles from './EditarLivroPage.module.css';

const LIMITES = {
    TITULO: 200,
    AUTOR: 100,
    CATEGORIA: 50,
    EDITORA: 100,
    DESCRICAO: 2000,
    CAPA_TAMANHO_MB: 5
};

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
      const file = files[0];
      if(file){
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if(!validTypes.includes(file.type)){
          setError('Formato de capa inválido. Use JPG ou PNG.');
          e.target.value = null;
          return;
        }

        const maxSize = LIMITES.CAPA_TAMANHO_MB * 1024 * 1024;
        if(file.size > maxSize){
          setError(`A capa é muito grande. Máximo de ${LIMITES.CAPA_TAMANHO_MB}MB.`);
          e.target.value = null;
          return;
        }

        setError('');
        setFormData(prevState => ({ ...prevState, [id]: file}));
      }

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
            <input type="text" id="titulo" value={formData.titulo} onChange={handleChange} maxLength={LIMITES.TITULO}/>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="autor">Autor</label>
            <input type="text" id="autor" value={formData.autor} onChange={handleChange} maxLength={LIMITES.AUTOR}/>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="categoria">Categoria</label>
            <input type="text" id="categoria" value={formData.categoria} onChange={handleChange} maxLength={LIMITES.CATEGORIA}/>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="editora">Editora</label>
            <input type="text" id="editora" value={formData.editora} onChange={handleChange} maxLength={LIMITES.EDITORA}/>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="anoPublicacao">Ano de Publicação</label>
            <input type="number" id="anoPublicacao" value={formData.anoPublicacao} onChange={handleChange} min="1000"
                max={new Date().getFullYear() + 1}/>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="qtdTotal">Quantidade Total</label>
            <input type="number" id="qtdTotal" value={formData.qtdTotal} onChange={handleChange} min="0"
                max="9999"/>
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="descricao">Descrição <span style={{fontSize: '0.8em', color: '#666', float: 'right'}}>
                    {(formData.descricao || '').length}/{LIMITES.DESCRICAO}
                </span></label>
            <textarea id="descricao" value={formData.descricao} onChange={handleChange} maxLength={LIMITES.DESCRICAO}
                style={{minHeight: '120px'}}></textarea>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="capa">Capa do Livro <small>(Máx {LIMITES.CAPA_TAMANHO_MB}MB)</small></label>
            <input type="file" id="capa" onChange={handleChange} accept="image/png, image/jpeg, image/jpg" />
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