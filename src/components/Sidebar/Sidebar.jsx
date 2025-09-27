import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logoEstanteGira.png'; // 1. Importe a imagem
import { AuthContext } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

// Ícones simples para o menu (opcional, mas melhora a UI)
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


const Sidebar = () => {
  const { user, logoutContext } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Estado para o menu mobile


  const handleLogout = () => {
    logoutContext();
    alert('Você foi desconectado.');
    navigate('/login');
  };
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  }

  return (
    <>
      <button className={styles.menuToggle} onClick={toggleMenu}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logoContainer}>
            <img src={logo} alt="Estante Gira Logo" className={styles.logo} />
            <h2>Estante Gira</h2>
          </div>
          
          <nav className={styles.navigation}>
             {user && (
                 <div className={styles.userInfo}>
                    <span>Olá, <strong>{user.nome}</strong></span>
                    <small>{user.role.replace('_', ' ')}</small>
                 </div>
            )}
            <ul>
              {user && (
                // ✅ LÓGICA CORRIGIDA: Renderiza um menu ou outro baseado na role
                user.role === 'BIBLIOTECARIO' ? (
                  <>
                    {/* Menu do Bibliotecário */}
                    <li className={styles.separator}>Visão Global</li>
                    <li><NavLink to="/livros" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Livros</NavLink></li>
              
                    
                    <li className={styles.separator}>Gestão</li>
                    <li><NavLink to="/admin/cadastrar-livro" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Adicionar Livro</NavLink></li>
                    <li><NavLink to="/admin/emprestimos" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Gerir Empréstimos</NavLink></li>
                    <li><NavLink to="/admin/reservas" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Gerir Reservas</NavLink></li>
                    <li><NavLink to="/admin/multas" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Gerir Multas</NavLink></li>
                    <li><NavLink to="/admin/usuarios" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Gerir Usuários</NavLink></li>
                    <li className={styles.separator}></li>
                    <li><NavLink to="/meu-perfil" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Meu Perfil</NavLink></li>
                  </>
                ) : (
                  <>
                    {/* Menu do Leitor */}
                    <li><NavLink to="/livros" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Livros</NavLink></li>
                    <li><NavLink to="/meus-emprestimos" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Meus Empréstimos</NavLink></li>
                    <li><NavLink to="/minhas-reservas" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Minhas Reservas</NavLink></li>
                    <li><NavLink to="/minhas-multas" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Minhas Multas</NavLink></li>
                    <li className={styles.separator}></li>
                    <li><NavLink to="/meu-perfil" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Meu Perfil</NavLink></li>
                  </>
                )
              )}
            </ul>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <button onClick={handleLogout} className={styles.logoutButton}>Sair</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;