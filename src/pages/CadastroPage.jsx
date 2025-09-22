// src/pages/CadastroPage.jsx
import React, { useState } from 'react';
// 1. Importe o hook 'useNavigate' para redirecionamento
import { useNavigate } from 'react-router-dom';
// 2. Importe nossa nova função de signup
import { signup } from '../services/authService';

function CadastroPage() {
  const [formData, setFormData] = useState({
    nome: '',
    sexo: 'MASCULINO', // Pré-seleciona um valor padrão
    cpf: '',
    email: '',
    senha: '',
    telefone: '',
    estado: '',
    cidade: '',
    bairro: '',
    dataNascimento: ''
  });
  
  const [error, setError] = useState(null);
  // 3. Inicialize o hook de navegação
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  // 4. Transformamos o handleSubmit em uma função assíncrona
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    
    try {
      // 5. Chamamos a função do nosso serviço com os dados do formulário
      await signup(formData);
      
      // 6. Se o cadastro for bem-sucedido:
      alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
      navigate('/login'); // Redireciona o usuário para /login

    } catch (err) {
      // 7. Se a API retornar um erro:
      console.error("Erro no cadastro:", err);
      // Tenta pegar uma mensagem de erro específica do back-end, senão, usa uma genérica
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao tentar cadastrar. Verifique os dados e tente novamente.';
      setError(errorMessage);
    }
  };

  return (
    <div>
      <h2>Crie sua Conta</h2>
      {/* O formulário continua o mesmo */}
      <form onSubmit={handleSubmit}>
        <input type="text" id="nome" placeholder="Nome Completo" value={formData.nome} onChange={handleChange} required />
        <input type="email" id="email" placeholder="E-mail" value={formData.email} onChange={handleChange} required />
        <input type="password" id="senha" placeholder="Senha" value={formData.senha} onChange={handleChange} required />
        <input type="text" id="cpf" placeholder="CPF (somente números)" value={formData.cpf} onChange={handleChange} required />
        <input type="tel" id="telefone" placeholder="Telefone (com DDD)" value={formData.telefone} onChange={handleChange} required />
        
        <label htmlFor="dataNascimento">Data de Nascimento:</label>
        <input type="date" id="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required />

        <label htmlFor="sexo">Sexo:</label>
        <select id="sexo" value={formData.sexo} onChange={handleChange} required>
          <option value="MASCULINO">Masculino</option>
          <option value="FEMININO">Feminino</option>
          <option value="OUTRO">Outro</option>
        </select>
        
        <input type="text" id="estado" placeholder="Estado" value={formData.estado} onChange={handleChange} required />
        <input type="text" id="cidade" placeholder="Cidade" value={formData.cidade} onChange={handleChange} required />
        <input type="text" id="bairro" placeholder="Bairro" value={formData.bairro} onChange={handleChange} required />

        <button type="submit">Cadastrar</button>
      </form>
      {/* Exibe a mensagem de erro vinda do back-end, se houver */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default CadastroPage;