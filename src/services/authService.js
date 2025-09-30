import api from './api';

export const signup = async (userData) => {
    const response = await api.post('/auth/signup', userData,{
        headers: {
            'Authorization':null
        }
    });
    return response.data;
}

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const logout = () => {
    // Remove o token do localStorage
    localStorage.removeItem('authToken');
};