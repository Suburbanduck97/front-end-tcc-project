// src/pages/admin/CadastrarLivroPage
import React, { useState } from 'react';
import { cadastrarLivro } from '../../services/livroService'; // 1. Importamos a função
import styles from './CadastrarLivroPage.module.css';

function CadastrarLivroPage() {
  const [formData, setFormData] = useState({
    titulo: '', autor: '', isbn: '', categoria: '', editora: '',
    anoPublicacao: '', qtdTotal: '', descricao: ''  // <- Campo qtdTotal adicionado ao estado
  });
  const [capa, setCapa] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({ ...prevState, [id]: value }));
  };

  const handleFileChange = (e) => {
    setCapa(e.target.files[0]);
  };

  // 2. Atualizamos o handleSubmit para ser assíncrono e chamar o serviço
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      // Chamamos nosso serviço com os dados do estado
      const livroCadastrado = await cadastrarLivro(formData, capa);
      setMessage(`Livro "${livroCadastrado.titulo}" cadastrado com sucesso!`);
      // Opcional: Limpar o formulário após o sucesso
      setFormData({
        titulo: '', autor: '', isbn: '', categoria: '', editora: '',
        anoPublicacao: '', qtdTotal: '', descricao: ''
      });
      setCapa(null);
      document.getElementById('capa').value = null; // Limpa o input de arquivo

    } catch (err) {
      console.error("Erro ao cadastrar livro:", err);
      setMessage(err.response?.data?.message || 'Ocorreu um erro no cadastro.');
    }
  };


  return (
    <div className={styles.pageContainer}>
      <h1>Cadastrar Novo Livro</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="titulo">Título</label>
            <input type="text" id="titulo" value={formData.titulo} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="autor">Autor</label>
            <input type="text" id="autor" value={formData.autor} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="isbn">ISBN</label>
            <input type="text" id="isbn" value={formData.isbn} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="categoria">Categoria</label>
            <input type="text" id="categoria" value={formData.categoria} onChange={handleChange} required />
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
            <input type="number" id="qtdTotal" value={formData.qtdTotal} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="capa">Capa do Livro</label>
            <input type="file" id="capa" onChange={handleFileChange} accept="image/png, image/jpeg" />
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="descricao">Descrição</label>
            <textarea id="descricao" value={formData.descricao} onChange={handleChange}></textarea>
          </div>
        </div>
        
        <button type="submit" className={styles.submitButton}>Cadastrar Livro</button>
      </form>

      {message && <p className={styles.successMessage}>{message}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}

export default CadastrarLivroPage;