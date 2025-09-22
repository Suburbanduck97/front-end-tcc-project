import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from '../services/api'; // Usa-se a instância do Axios


const calcularIdade = (dataNascimentoString) => {
    if (!dataNascimentoString) return null;

    const dataNascimento = new Date(dataNascimentoString);
    const hoje = new Date();

    let idade = hoje.getFullYear() - dataNascimento.getFullYear();
    const mes = hoje.getMonth() - dataNascimento.getMonth();

    // Ajusta a idade se o aniverário ainda não ocorreu no ano correte
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
        idade--;
    }

    return idade;
};

function MeuPerfilPage() {
    const { user } = useContext(AuthContext); // Pega o usuário do contexto para exibir o e-mail
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() =>{
        // Função para buscar os dados do perfil na API
        const fetchPerfil = async () => {
            // Se não houver usuário no contexto, não fazemos a chamada
            if (!user) {
                setLoading(false);
                setError("Você precisa estar logado para ver seu perfil.");
                return;
            }

            try {
                // A rota deve ser a mesma protegida no seu SecurityConfig
                const response = await api.get('/usuario/meuPerfil');
                setPerfil(response.data); // Armazena os dados do perfil no estado
            } catch (err) {
                console.error("Erro ao buscar perfil:", err);
                setError("Não foi possível carregar os dados do perfil.");
            } finally {
                setLoading(false);
            }
        };

        fetchPerfil();

    }, [user]); // A dependência user garante que a busca seja refeita se o usuário mudar o (login/logout)   

    if (loading) {
        return <p>Carregando perfil...</p>
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>
    }

    if (!perfil) {
        return <p>Nenhum dado de perfil encontrado.</p>
    }

    const idade = calcularIdade(perfil.dataNascimento);
    /*const formatarData = (data) => {
        if(!data) return 'Não informada';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    };*/

    return (
        <div>
            <h2>Meu Perfil</h2>
            <p><strong>Nome:</strong> {perfil.nome}</p>
            <p><strong>Sexo:</strong>{perfil.sexo}</p>
            <p><strong>Idade:</strong> {idade !== null ? `${idade} anos` : 'Data de nascimento inválida'}</p>
        </div>
    );
}

export default MeuPerfilPage;