import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from '../../services/api'; // Usa-se a instância do Axios
import styles from './MeuPerfilPage.module.css';

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

const formatarSexo = (sexo) => {
    if (!sexo) return 'Não informado';
    return sexo.charAt(0).toUpperCase() + sexo.slice(1).toLowerCase();
}


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
        return <p className={styles.errorMessage}>{error}</p>
    }

    if (!perfil) {
        return <p>Nenhum dado de perfil encontrado.</p>
    }

    const idade = calcularIdade(perfil.dataNascimento);

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileCard}>
                <div className={styles.cardHeader}>
                    <h2>Meu Perfil</h2>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Nome Completo</span>
                        <span className={styles.value}>{perfil.nome}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>E-mail</span>
                        <span className={styles.value}>{perfil.email}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Sexo</span>
                        <span className={styles.value}>{formatarSexo(perfil.sexo)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Idade</span>
                        <span className={styles.value}>{idade !== null ? `${idade} anos` : 'Não informada'}</span>
                    </div>
                     <div className={styles.infoItem}>
                        <span className={styles.label}>Telefone</span>
                        <span className={styles.value}>{perfil.telefone}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Localização</span>
                        <span className={styles.value}>{`${perfil.cidade}, ${perfil.estado}`}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MeuPerfilPage;