// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { AuthContext } from './context/AuthContext.js';

import Sidebar from './components/Sidebar/Sidebar.jsx'; 

// Páginas
import LoginPage from './pages/public/LoginPage.jsx';
import ListaLivros from './pages/shared/ListaLivrosPage.jsx';
import CadastroPage from './pages/public/CadastroPage.jsx';
import MeuPerfilPage from './pages/shared/MeuPerfilPage.jsx';
import MeusEmprestimosPage from './pages/user/MeusEmprestimosPage.jsx';
import MinhasReservasPage from './pages/user/MinhasReservasPage.jsx';
import MinhasMultasPage from './pages/user/MinhasMultas.jsx';
import DetalhesLivroPage from './pages/shared/DetalhesLivrosPage.jsx';
import EditarLivroPage from './pages/admin/EditarLivroPage.jsx';
import GestaoEmprestimosPage from './pages/admin/GestaoEmprestimosPage.jsx';
import RecuperarSenhaPage from './pages/public/RecuperarSenhaPage.jsx';
import NovaSenhaPage from './pages/public/NovaSenhaPage.jsx';

// ADM
import AdminRoute from './components/AdminRoute.jsx';

// ADM PAGES
import CadastrarLivroPage from './pages/admin/CadastrarLivroPage.jsx';

// Guardião
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Estilos do App
import './App.css';


function App() {
  return (
    <Router>
      <div className="appContainer">
        <Sidebar />
        <main className="content">
          <Routes>
            {/* Rotas públicas */}
            <Route path='/login' element={<LoginPage />} />
            <Route path='/cadastro' element={<CadastroPage />} />
            <Route path='/' element={<LoginPage />} />
            <Route path='/recuperarSenha' element={<RecuperarSenhaPage />} />
            <Route path='/novaSenha' element={<NovaSenhaPage />} />
            

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
    </div>
    </Router>
  );
}

export default App;