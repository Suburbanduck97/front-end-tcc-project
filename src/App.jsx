// src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext.js';

// Páginas
import LoginPage from './pages/LoginPage.jsx';
import ListaLivros from './pages/ListaLivros.jsx';
import CadastroPage from './pages/CadastroPage.jsx';
import MeuPerfilPage from './pages/MeuPerfilPage.jsx';
import MeusEmprestimosPage from './pages/MeusEmprestimosPage.jsx';
import MinhasReservasPage from './pages/MinhaReservasPage.jsx';
import MinhasMultasPage from './pages/MinhasMultas.jsx';
import DetalhesLivroPage from './pages/DetalhesLivrosPage.jsx';
import EditarLivroPage from './pages/admin/EditarLivroPage.jsx';
import GestaoEmprestimosPage from './pages/admin/GestaoEmprestimosPage.jsx';

// ADM
import AdminRoute from './components/AdminRoute.jsx';

// ADM PAGES
import CadastrarLivroPage from './pages/admin/CadastrarLivroPage.jsx';

// Guardião
import ProtectedRoute from './components/ProtectedRoute.jsx';


// Componentes de navegação para organizar o código
const Navigation = () => {
  const { user, logoutContext } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutContext();
    alert('Você foi desconectado.');
    navigate('/login');
  };

  return (
     <header>
      <h1>Sistema de Biblioteca</h1>
      <nav>
        {user ? (
          <>
            <span>Olá, {user.sub}</span>
            
            <span style={{ margin: '0 8px' }}>|</span>
            
            <Link to="/livros">Livros</Link>
            <span style={{ margin: '0 8px' }}>|</span>
            
            <Link to="/meus-emprestimos">Meus Empréstimos</Link>
            <span style={{ margin: '0 8px' }}>|</span>
            
            <Link to="/minhas-reservas">Minhas Reservas</Link>
            <span style={{ margin: '0 8px' }}>|</span>
            
            <Link to="/minhas-multas">Minhas Multas</Link>
            <span style={{ margin: '0 8px' }}>|</span>
            
            <Link to="/meu-perfil">Meu Perfil</Link>
            <span style={{ margin: '0 8px' }}>|</span>

            {user.role === 'BIBLIOTECARIO' && (
              <>
                | <Link to="/admin/cadastrar-livro">Adicionar Livro</Link>
                | <Link to="/admin/emprestimos">Gerir Empréstimos</Link> {/* 2. Adicione o link */}
              </>
            )}
            <button onClick={handleLogout}>Sair</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <span style={{ margin: '0 8px' }}>|</span>
            <Link to="/cadastro">Cadastre-se</Link>
          </>
        )}
      </nav>
    </header>
  );
};

function App() {
  return (
    <Router>
      <Navigation />
      <main>
        <Routes>
          {/* Rotas públicas */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/cadastro' element={<CadastroPage />} />
          <Route path='/' element={<LoginPage />} />
          

          {/* Rotas Protegidas */}
          <Route
            path='/livros'
            element={
              <ProtectedRoute>
                <ListaLivros />
              </ProtectedRoute>
            }
          />
          <Route
            path='/meu-perfil'
            element={
              <ProtectedRoute>
                <MeuPerfilPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path='/meus-emprestimos' 
            element={
              <ProtectedRoute>
                <MeusEmprestimosPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/minhas-reservas" 
            element={<ProtectedRoute><MinhasReservasPage /></ProtectedRoute>} 
          />
          <Route 
            path="/minhas-multas" 
            element={<ProtectedRoute><MinhasMultasPage /></ProtectedRoute>} 
          />
          <Route 
            path="/livros/:id" 
            element={<ProtectedRoute><DetalhesLivroPage /></ProtectedRoute>} 
          />
          {/* Rotas de Adimin*/}
          <Route 
            path="/admin/cadastrar-livro"
            element={
              <AdminRoute>
                <CadastrarLivroPage />
              </AdminRoute>
            }
          />
          <Route 
            path="/admin/editar-livro/:id"
            element={<AdminRoute><EditarLivroPage /></AdminRoute>}
          />
          <Route 
            path="/admin/emprestimos"
            element={<AdminRoute><GestaoEmprestimosPage /></AdminRoute>}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;