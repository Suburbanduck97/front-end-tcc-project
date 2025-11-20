import api from './api';

const notificacaoService = {
    getMinhas: async () => {
        const response = await api.get('/notificacoes/minhas');
        return response.data;
    },

    getContagemNaoLidas: async () => {
        const response = await api.get('/notificacoes/naoLidas/contagem');
        return response.data;
    },

    marcarComoLida: async (id) => {
        const response = await api.put(`/notificacoes/${id}/lida`);
        return response.data;
    }
};

export default notificacaoService;