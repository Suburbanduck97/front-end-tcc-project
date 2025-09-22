// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Form, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    
    const { user } = useContext(AuthContext);

    const location = useLocation();

    //1. Se Não houver um usuário logado
    if (!user) {
        // 2. ...redirecionamos para a página de login.
        // O 'replace' evita que o usuário possa usar o botão "voltar" do navegador para acessar a página protegida.
        // O 'state' guarda a página original que ele tentou acessar, para podermos redirecioná-lo de volta após o login (uma melhoria futura!).
        return <Navigate to='/login' replace state={{from: location}} />;
    }

    // 3. Se houver um usuário logado, simplesmente renderizamos a página solicitada
    return children;
};

export default ProtectedRoute;