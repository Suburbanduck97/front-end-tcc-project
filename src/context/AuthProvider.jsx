import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser,] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (token) {
      try {
        const decodedUser = jwtDecode(token);

        // opcional: validar expiração do token
        if (decodedUser.exp && decodedUser.exp * 1000 < Date.now()) {
          console.warn("Token expirado. Limpando...");
          localStorage.removeItem('authToken');
          setUser(null);
        } else {
          setUser(decodedUser); // mantém usuário logado após reload
        }

      } catch (error) {
        console.error("Token inválido:", error);
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }

    setLoadingAuth(false);
  }, []);

  const loginContext = (token) => {
    localStorage.setItem('authToken', token);
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);
  };

  const logoutContext = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loginContext, logoutContext }}>
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
}