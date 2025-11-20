import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';

// 1. Importe os componentes necessários
import Layout from './components/Layout/Layout.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Páginas Públicas
import LoginPage from './pages/public/LoginPage.jsx';
import CadastroPage from './pages/public/CadastroPage.jsx';
import SolicitarRedefinicaoPage from './pages/public/SolicitarRedefinicaoPage.jsx';
import ResetarSenhaPage from './pages/public/ResetarSenhaPage.jsx';


// Páginas Protegidas
import ListaLivrosPage from './pages/shared/ListaLivrosPage.jsx';
import DetalhesLivroPage from './pages/shared/DetalhesLivrosPage.jsx';
import MeuPerfilPage from './pages/shared/MeuPerfilPage.jsx';
import MeusEmprestimosPage from './pages/user/MeusEmprestimosPage.jsx';
import MinhasReservasPage from './pages/user/MinhasReservasPage.jsx';
import MinhasMultasPage from './pages/user/MinhasMultasPage.jsx';
import NotificacaoPage from './pages/shared/NotificacaoPage.jsx';

// Páginas de Admin
import CadastrarLivroPage from './pages/admin/CadastrarLivroPage.jsx';
import EditarLivroPage from './pages/admin/EditarLivroPage.jsx';
import GestaoEmprestimosPage from './pages/admin/GestaoEmprestimosPage.jsx';
import GerirUsuarioPage from './pages/admin/GerirUsuariosPage.jsx';
import GerirMultasPage from './pages/admin/GerirMultasPage.jsx';

// Estilos do App
import './App.css';


function App() {
  return (
    <ToastProvider> 
    <Router>
      <Routes>
        {/* === ROTAS PÚBLICAS (Sem Sidebar) === */}
        <Route path='/login' element={<LoginPage />} />
        <Route path='/cadastro' element={<CadastroPage />} />
        <Route path='/' element={<LoginPage />} />
        <Route path='/solicitar-redefinicao' element={<SolicitarRedefinicaoPage />} />
        <Route path='/resetar-senha' element={<ResetarSenhaPage />} />
    
        {/* === ROTAS PROTEGIDAS (Com Sidebar, envolvidas pelo Layout) === */}
        <Route path='/livros' element={<ProtectedRoute><Layout><ListaLivrosPage /></Layout></ProtectedRoute>} />
        <Route path='/livros/:id' element={<ProtectedRoute><Layout><DetalhesLivroPage /></Layout></ProtectedRoute>} />
        <Route path='/meu-perfil' element={<ProtectedRoute><Layout><MeuPerfilPage /></Layout></ProtectedRoute>} />
        <Route path='/meus-emprestimos' element={<ProtectedRoute><Layout><MeusEmprestimosPage /></Layout></ProtectedRoute>} />
        <Route path='/minhas-reservas' element={<ProtectedRoute><Layout><MinhasReservasPage /></Layout></ProtectedRoute>} />
        <Route path='/minhas-multas' element={<ProtectedRoute><Layout><MinhasMultasPage /></Layout></ProtectedRoute>} />
        <Route path='/notificacoes' element={<ProtectedRoute><Layout><NotificacaoPage /></Layout></ProtectedRoute>} />
        
        {/* === ROTAS DE ADMIN (Com Sidebar, envolvidas pelo Layout) === */}
        <Route path="/admin/cadastrar-livro" element={<AdminRoute><Layout><CadastrarLivroPage /></Layout></AdminRoute>} />
        <Route path="/admin/editar-livro/:id" element={<AdminRoute><Layout><EditarLivroPage /></Layout></AdminRoute>} />
        <Route path="/admin/emprestimos" element={<AdminRoute><Layout><GestaoEmprestimosPage /></Layout></AdminRoute>} />
        <Route path='/admin/usuarios' element={<AdminRoute><Layout><GerirUsuarioPage /></Layout></AdminRoute>} />
        <Route path='/admin/multas' element={<AdminRoute><Layout><GerirMultasPage /></Layout></AdminRoute>} />
        {/* Adicione aqui as novas rotas de admin que você criar, sempre dentro do Layout */}

      </Routes>
    </Router>
    </ToastProvider>
  );
}

export default App;