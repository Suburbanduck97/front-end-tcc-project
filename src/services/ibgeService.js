import axios from 'axios';

// Cria uma instância do Axios específica para a API do IBGE
const ibgeApi = axios.create({
    baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades'
});

// Função para buscar todos os estados (UFs)
export const getEstados = async () => {
    try {
        // Usamos ?orderBy=nome para que a lista venha em ordem alfabética
        const response = await ibgeApi.get('/estados?orderBy=nome');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar estados:", error);
        // Retorna um array vazio em caso de erro para não quebrar a aplicação
        return [];
    }
};

// Função para buscar os municípios de um estado específico pela sua sigla (UF)
export const getCidadesPorEstado = async (uf) => {
    // Se não for passada uma UF, retorna um array vazio
    if (!uf) return [];

    try {
        const response = await ibgeApi.get(`/estados/${uf}/municipios`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar cidades para o estado ${uf}:`, error);
        return [];
    }
};