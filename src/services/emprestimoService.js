// src/service/emprestimoService.js
import api from "./api";

export const getEmprestimosPorUsuario = async (idUsuario) => {
    const response = await api.get(`/emprestimos/usuario/${idUsuario}`);
    return response.data;
};

// Responsável por receber todos os dados de empréstimo do back-end
export const getTodosEmprestimos = async () => {
  const response = await api.get('/emprestimos');
  return response.data;
};

// Registra os emprestimos
export const registrarEmprestimo = async (idUsuario, idLivro) => {
  const response = await api.post('/emprestimos/registrar', { idUsuario, idLivro });
  return response.data;
};

// Registra a devolução de um livro a partir de um empréstimo
export const devolverLivro = async (idEmprestimo) => {
  const response = await api.put(`/emprestimos/devolver/${idEmprestimo}`);
  return response.data;
};