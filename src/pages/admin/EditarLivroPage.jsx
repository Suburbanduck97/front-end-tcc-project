// src/pages/admin/EditarLivroPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLivroPorId, atualizarLivro } from '../../services/livroService'; // 1. Importa a função de atualizar

function EditarLivroPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [livroOriginal, setLivroOriginal] = useState(null); // Guarda o estado original
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
        setLivroOriginal(dadosFormulario); // Salva uma cópia dos dados originais
      } catch (error) {
        console.error("Erro ao carregar livro para edição:", error);
        setMessage('Erro ao carregar dados do livro.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // 2. Compara os dados do formulário com os originais para encontrar o que mudou
    const dadosAtualizados = {};
    for (const key in formData) {
      if (formData[key] !== livroOriginal[key]) {
        dadosAtualizados[key] = formData[key];
      }
    }

    if (Object.keys(dadosAtualizados).length === 0) {
      setMessage("Nenhuma alteração foi feita.");
      return;
    }

    try {
      // 3. Envia apenas os dados que foram alterados para a API
      await atualizarLivro(id, dadosAtualizados);
      alert('Livro atualizado com sucesso!');
      navigate('/livros');
    } catch (error) {
      console.error("Erro ao atualizar livro:", error);
      setMessage(error.response?.data?.message || 'Não foi possível atualizar o livro.');
    }
  };

  if (loading) return <p>Carregando livro para edição...</p>;
  if (!formData) return <p style={{color: 'red'}}>{message}</p>;

  return (
    <div>
      <h2>Editar Livro: {livroOriginal.titulo}</h2>
      <form onSubmit={handleSubmit}>
        {/* Formulário com todos os campos que podem ser editados */}
        <label>Título:</label>
        <input type="text" id="titulo" value={formData.titulo} onChange={handleChange} />
        
        <label>Autor:</label>
        <input type="text" id="autor" value={formData.autor} onChange={handleChange} />

        <label>Categoria:</label>
        <input type="text" id="categoria" value={formData.categoria} onChange={handleChange} />

        <label>Editora:</label>
        <input type="text" id="editora" value={formData.editora} onChange={handleChange} />

        <label>Ano de Publicação:</label>
        <input type="number" id="anoPublicacao" value={formData.anoPublicacao} onChange={handleChange} />

        <label>Quantidade Total:</label>
        <input type="number" id="qtdTotal" value={formData.qtdTotal} onChange={handleChange} />

        <label>Descrição:</label>
        <textarea id="descricao" value={formData.descricao} onChange={handleChange}></textarea>

        <button type="submit">Salvar Alterações</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default EditarLivroPage;