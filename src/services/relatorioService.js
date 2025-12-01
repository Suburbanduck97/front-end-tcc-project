import api from "./api";

export const getDashboardStats = async () => {
    const response = await api.get(`/relatorios/dashboard`);
    return response.data;
};


export const getTopEmprestimos = async () => {
    const response = await api.get(`/relatorios/top-emprestimos`);
    return response.data;
};

export const getTopReservas = async () => {
    const response = await api.get(`/relatorios/top-reservas`);
    return response.data;
};

