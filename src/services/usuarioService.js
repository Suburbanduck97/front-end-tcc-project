import api from './api';

export const listarTodosUsuarios = () => {
  return api.get('/admin/listarUsuarios');
};

export const buscarUsuarioPorNome = (nome) => {
  return api.get(`/admin/buscar?nome=${encodeURIComponent(nome)}`);
};

export const filtrarUsuarioPorRole = (role) => {
  return api.get(`/admin/filtrar/${role}`);
};