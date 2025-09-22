// src/components/AdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // 1. Verifica se existe um usuário E se o role dele é BIBLIOTECARIO
  if (user && user.role === 'BIBLIOTECARIO') {
    // Se for, permite o acesso à página
    return children;
  }

  // 2. Se não estiver logado, redireciona para o login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  // 3. Se estiver logado, MAS NÃO FOR BIBLIOTECARIO, redireciona para outra página (ex: livros)
  // e podemos mostrar um alerta.
  alert("Acesso negado: esta área é restrita para bibliotecários.");
  return <Navigate to="/livros" replace />;
};

export default AdminRoute;