// src/service/emprestimoService.js
import api from "./api";

export const getEmprestimosPorUsuario = async (idUsuario) => {
    const response = await api.get(`/emprestimos/usuario/${idUsuario}`);
    return response.data;
};

