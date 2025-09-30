// src/services/multaService.js
import api from './api';

export const listarTodasMultas = () => {
  return api.get('/multas');
};

export const buscarMultaPorId = (id) => {
  return api.get(`/multas/buscar/${id}`);
};

export const filtrarMultasPorStatus = (status) => {
  return api.get(`/multas/filtrar/statusMulta?status=${status}`);
};

export const getMultasPorUsuario = async (idUsuario) => {
  const response = await api.get(`/multas/usuario/${idUsuario}`);
  return response.data;
};

export const pagarMulta = async (idMulta) => {
  // A rota é PUT /multas/pagar/{id}
  const response = await api.put(`/multas/pagar/${idMulta}`);
  return response.data;
};