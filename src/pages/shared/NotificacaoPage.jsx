import { useEffect, useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import notificacaoService from '../../services/notificacaoService';
import { NotificationContext } from '../../context/NotificationContext.js';
import styles from './NotificacaoPage.module.css';

const ChevronDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>;
const ChevronUp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>;
const ArrowRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;

const NotificacaoPage = () => {
    const [notificacoes, setNotificacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const navigate = useNavigate();

    const { atualizarContagem } = useContext(NotificationContext);

    useEffect(() => {
        carregarNotificacoes();
        atualizarContagem();
    }, []);

    const carregarNotificacoes = async () => {
        try {
            const dados = await notificacaoService.getMinhas();
            setNotificacoes(dados);
        } catch (error) {
            console.error("Erro ao carregar notificações", error);
        } finally {
            setLoading(false);
        }
    };

    const getLinkDestino = (texto) => {
        const t = texto.toLowerCase();
        if (t.includes("empréstimo") || t.includes("emprestimo") || t.includes("retirou")) return "/meus-emprestimos";
        if (t.includes("multa") || t.includes("atraso")) return "/minhas-multas";
        if (t.includes("reserva")) return "/minhas-reservas";
        return null;
    };

    const handleCardClick = async (notif) => {
        if (!notif.lida) {
            try {
                await notificacaoService.marcarComoLida(notif.id);

                setNotificacoes(prev =>
                    prev.map(n => n.id === notif.id ? { ...n, lida: true } : n)
                );

                atualizarContagem();

            } catch (error) {
                console.error("Erro ao marcar como lida", error);
            }
        }

        setExpandedId(expandedId === notif.id ? null : notif.id);
    };

    const handleNavigation = (e, texto) => {
        e.stopPropagation();
        const destino = getLinkDestino(texto);
        if (destino) navigate(destino);
    };

    if (loading) return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
        </div>
    );

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <h1>Suas Notificações</h1>
            </div>

            <div className={styles.listContainer}>
                {notificacoes.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>Você não tem notificações no momento.</p>
                    </div>
                ) : (
                    notificacoes.map((notif) => {
                        const linkDestino = getLinkDestino(notif.mensagem);
                        const isExpanded = expandedId === notif.id;

                        return (
                            <div
                                key={notif.id}
                                className={`${styles.card} ${!notif.lida ? styles.unread : ''} ${isExpanded ? styles.expanded : ''}`}
                                onClick={() => handleCardClick(notif)}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.infoPrincipal}>
                                        {!notif.lida && <span className={styles.badgeNovo}>Novo</span>}
                                        <span className={styles.date}>
                                            {notif.dataCriacao ? new Date(notif.dataCriacao).toLocaleString('pt-BR') : ''}
                                        </span>
                                    </div>
                                    <div className={styles.iconToggle}>
                                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                    </div>
                                </div>

                                <div className={styles.cardBody}>
                                    <p className={styles.message}>{notif.mensagem}</p>

                                    {isExpanded && linkDestino && (
                                        <button
                                            className={styles.actionButton}
                                            onClick={(e) => handleNavigation(e, notif.mensagem)}
                                        >
                                            Ver Detalhes <ArrowRight />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default NotificacaoPage;
