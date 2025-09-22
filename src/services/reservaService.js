// src/services/reservaService.js
import api from './api';

export const getMinhasReservas = async () => {
  const response = await api.get('/reservas/minhas');
  return response.data;
};

export const criarReserva = async (idLivro) => { // <-- GARANTA QUE ESTA FUNÇÃO EXISTA E TENHA O 'export'
  const response = await api.post('/reservas/solicitar', { idLivro });
  return response.data;
};