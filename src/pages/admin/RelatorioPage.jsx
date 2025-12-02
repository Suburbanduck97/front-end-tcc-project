import { useEffect, useState } from 'react';
import { getDashboardStats, getTopEmprestimos, getTopReservas } from '../../services/relatorioService';
import './RelatorioPage.css';

// Componentes de ícones fictícios para um visual mais moderno
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-3-3.87"></path><path d="M17.5 7a4 4 0 0 1 0 8"></path></svg>;
const LoanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const ReserveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;


const RelatorioPage = () => {
    // Adicionando estados para o filtro de data
    const [stats, setStats] = useState(null);
    const [topEmprestimos, setTopEmprestimos] = useState([]);
    const [topReservas, setTopReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchReports = async (start, end) => {
        setLoading(true);
        setError(null);
        try {
            const params = { startDate: start, endDate: end }; 
            
            const dashboardStats = await getDashboardStats(params);
            setStats(dashboardStats);

            const emprestimos = await getTopEmprestimos(params);
            setTopEmprestimos(emprestimos);

            const reservas = await getTopReservas(params);
            setTopReservas(reservas);

        } catch (err) {
            console.error("Erro ao buscar dados de relatórios:", err);
            setError("Não foi possível carregar os dados dos relatórios. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports(startDate, endDate); 
    }, [startDate, endDate]);

    if (loading) {
        return <div className="relatorio-container loading"><div className="spinner"></div> Carregando relatórios...</div>;
    }

    if (error) {
        return <div className="relatorio-container error-message">{error}</div>;
    }
    
    // Mapeamento dos cartões de estatísticas
    const statsCardsData = stats ? [
        { title: "Total de Livros", value: stats.totalLivros, icon: <BookIcon /> },
        { title: "Total de Usuários", value: stats.totalUsuarios, icon: <UsersIcon /> },
        { title: "Empréstimos Ativos", value: stats.emprestimosAtivos, icon: <LoanIcon /> },
        { title: "Reservas Ativas", value: stats.reservasAtivas, icon: <ReserveIcon /> },
    ] : [];


    return (
        <div className="relatorio-page">
            <header className="relatorio-header">
                <h1 className="relatorio-title">Relatórios da Biblioteca 📚</h1>
                <div className="actions-bar">
                    <div className="date-filter">
                        <CalendarIcon />
                        <label htmlFor="startDate">De:</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <label htmlFor="endDate">Até:</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Estatísticas Gerais */}
            <section className="data-section dashboard-stats">
                <h2 className="section-title">Estatísticas Gerais</h2>
                {stats ? (
                    <div className="stats-cards">
                        {statsCardsData.map((card, index) => (
                            <div className="stat-card" key={index}>
                                <div className="card-header">
                                    <div className="icon-wrapper">{card.icon}</div>
                                    <h3>{card.title}</h3>
                                </div>
                                <p className="stat-value">{card.value}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Nenhuma estatística geral disponível.</p>
                )}
            </section>

            {/* Listas Top 5 */}
            <section className="data-section top-lists">
                <div className="top-list-card top-emprestimos">
                    <h2 className="section-title">Top 5 Livros Mais Emprestados 📈</h2>
                    {topEmprestimos.length > 0 ? (
                        <ul className="item-list">
                            {topEmprestimos.map((item, index) => (
                                <li key={index} className="list-item">
                                    <span className="list-index">#{index + 1}</span>
                                    <span className="item-title">{item.titulo}</span>
                                    <span className="item-count">{item.quantidade} empréstimos</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-data">Nenhum livro emprestado no período selecionado.</p>
                    )}
                </div>

                <div className="top-list-card top-reservas">
                    <h2 className="section-title">Top 5 Livros Mais Reservados 🔖</h2>
                    {topReservas.length > 0 ? (
                        <ul className="item-list">
                            {topReservas.map((item, index) => (
                                <li key={index} className="list-item">
                                    <span className="list-index">#{index + 1}</span>
                                    <span className="item-title">{item.titulo}</span>
                                    <span className="item-count">{item.quantidade} reservas</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-data">Nenhum livro reservado no período selecionado.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default RelatorioPage;