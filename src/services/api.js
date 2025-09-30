// Conexão com o back-end
import axios from 'axios';

const api = axios.create({
    //URL base da API Spring Boot
    baseURL: 'http://localhost:8080'
});

// Interceptor de Requisição: será executado ANTES de cada requisição sair.
api.interceptors.request.use(
    (config) => {
        // Pega o token no localStorage
        const token = localStorage.getItem('authToken');

        const publicEndpoints = ['/auth/signup', '/auth/login'];

        if (token && !publicEndpoints.some(endpoint => config.url.includes(endpoint))) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config; // Retorna a configuração da requisição (com ou sem token)
    },

    (error) => Promise.reject(error)
);

export default api;