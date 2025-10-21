import api from './api';

/**
 * Busca todos os livros cadastrados, ordenados por título.
 * @returns {Promise<Array>} Uma lista de livros.
 */
export const getTodosLivros = async () => {
    const response = await api.get('/livros');
    return response.data;
};

/**
 * Busca os detalhes completos de um livro por ID, incluindo se o usuário atual já o reservou.
 * @param {number} id O ID do livro.
 * @returns {Promise<object>} Os detalhes completos do livro.
 */
export const getLivroDetalhes = async (id) => {
    const response = await api.get(`/livros/detalhes/${id}`);
    return response.data;
};

/**
 * Busca um livro por seu ID (versão simplificada).
 * @param {number} idLivro O ID do livro.
 * @returns {Promise<object>} Os dados do livro.
 */
export const getLivroPorId = async (idLivro) => {
    const response = await api.get(`/livros/${idLivro}`);
    return response.data;
};

/**
 * Realiza uma busca geral por título, autor ou categoria.
 * @param {string} termo O termo a ser buscado.
 * @returns {Promise<Array>} Uma lista de livros que correspondem ao termo.
 */
export const buscarLivrosPorTermoGeral = async (termo) => {
    // A rota no backend deve ser capaz de receber este parâmetro
    const response = await api.get('/livros/buscar', { params: { termo } });
    return response.data;
};


/**
 * Cadastra um novo livro, incluindo a imagem da capa.
 * @param {object} livroData Os dados textuais do livro.
 * @param {File} capaFile O arquivo de imagem da capa.
 * @returns {Promise<object>} O livro recém-cadastrado.
 */
export const cadastrarLivro = async (livroData, capaFile) => {
    const formData = new FormData();

    Object.keys(livroData).forEach(key => {
        formData.append(key, livroData[key]);
    });

    if (capaFile) {
        formData.append('capa', capaFile);
    }

    const response = await api.post('/livros/cadastrar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Atualiza os dados de um livro existente.
 * @param {number} idLivro O ID do livro a ser atualizado.
 * @param {object} dadosAtualizados Os campos a serem atualizados.
 * @returns {Promise<object>} O livro com os dados atualizados.
 */
export const atualizarLivro = async (idLivro, dadosAtualizados) => {
    const response = await api.put(`/livros/atualizar/${idLivro}`, dadosAtualizados);
    return response.data;
};

/**
 * Deleta um livro pelo seu ID.
 * @param {number} idLivro O ID do livro a ser deletado.
 * @returns {Promise<object>} A resposta da API.
 */
export const deletarLivro = async (idLivro) => {
    const response = await api.delete(`/livros/remover/${idLivro}`);
    return response.data;
};

