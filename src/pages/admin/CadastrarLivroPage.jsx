// src/pages/admin/CadastrarLivroPage
import React, { useState } from 'react';
import { cadastrarLivro } from '../../services/livroService'; // 1. Importamos a função

function CadastrarLivroPage() {
  const [formData, setFormData] = useState({
    titulo: '', autor: '', isbn: '', categoria: '', editora: '',
    anoPublicacao: '', qtdTotal: '', descricao: '' // <- Campo qtdTotal adicionado ao estado
  });
  const [capa, setCapa] = useState(null);
  const [message, setMessage] = useState('');

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
    <div>
      <h2>Cadastrar Novo Livro</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" id="titulo" placeholder="Título" value={formData.titulo} onChange={handleChange} required />
        <input type="text" id="autor" placeholder="Autor" value={formData.autor} onChange={handleChange} />
        <input type="text" id="isbn" placeholder="ISBN" value={formData.isbn} onChange={handleChange} />
        <input type="text" id="categoria" placeholder="Categoria" value={formData.categoria} onChange={handleChange} required />
        <input type="text" id="editora" placeholder="Editora" value={formData.editora} onChange={handleChange} />
        <input type="number" id="anoPublicacao" placeholder="Ano de Publicação" value={formData.anoPublicacao} onChange={handleChange} />
        
        {/* 3. CAMPO FALTANTE ADICIONADO AQUI */}
        <input type="number" id="qtdTotal" placeholder="Quantidade Total" value={formData.qtdTotal} onChange={handleChange} required />
        
        <textarea id="descricao" placeholder="Descrição" value={formData.descricao} onChange={handleChange}></textarea>

        <div>
          <label htmlFor="capa">Capa do Livro:</label>
          <input type="file" id="capa" onChange={handleFileChange} accept="image/png, image/jpeg" />
        </div>
        
        <button type="submit">Cadastrar Livro</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CadastrarLivroPage;