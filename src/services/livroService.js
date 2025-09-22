// src/services/livrosService
import api from './api';

export const getTodosLivros = async () => {
  const response = await api.get('/livros');
  return response.data;
};

/*
export const buscarLivrosPorTitulo = async (titulo) => {
  // A rota é /livros/buscar/titulo/{titulo}
  const response = await api.get(`/livros/buscar/titulo/${titulo}`);
  return response.data;
};

export const buscarLivrosPorAutor = async (autor) => {
  // A rota é /livros/buscar/autor/{autor}
  const response = await api.get(`/livros/buscar/autor/${autor}`);
  return response.data;
};
*/

export const buscarLivrosPorTermoGeral = async (termo) => {
  // Isso irá gerar a URL: /livros/buscar?termo=valor_do_termo
  const response = await api.get('/livros/buscar', { params: { termo } });
  return response.data;
};

export const getLivroPorId = async (idLivro) => {
  // Supõe que a rota GET /livros/{id} existe no back-end
  const response = await api.get(`/livros/${idLivro}`);
  return response.data;
};

export const cadastrarLivro = async (livroData, capaFile) => {
  // 1. Criamos um objeto FormData. É assim que se envia arquivos.
  const formData = new FormData();

  // 2. Adicionamos cada campo de texto ao formData.
  // As chaves ('titulo', 'autor', etc.) devem ser EXATAMENTE as mesmas
  // que o @RequestParam espera no seu LivroController.
  Object.keys(livroData).forEach(key => {
    formData.append(key, livroData[key]);
  });

  // 3. Adicionamos o arquivo da capa, se ele existir.
  if (capaFile) {
    formData.append('capa', capaFile);
  }

  // 4. Fazemos a chamada POST, enviando o formData.
  // É CRUCIAL definir o Content-Type como 'multipart/form-data'.
  const response = await api.post('/livros/cadastrar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};