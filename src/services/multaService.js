// src/services/multaService.js
import api from './api';


export const getMultasPorUsuario = async (idUsuario) => {
  const response = await api.get(`/multas/usuario/${idUsuario}`);
  return response.data;
};

export const pagarMulta = async (idMulta) => {
  // A rota é PUT /multas/pagar/{id}
  const response = await api.put(`/multas/pagar/${idMulta}`);
  return response.data;
};