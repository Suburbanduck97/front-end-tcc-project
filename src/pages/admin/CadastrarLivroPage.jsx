import React, { useState } from 'react';
import { cadastrarLivro } from '../../services/livroService';
import { useToast } from '../../context/useToast'; // 1. Importar o useToast
import styles from './CadastrarLivroPage.module.css';

function CadastrarLivroPage() {
    const [formData, setFormData] = useState({
        titulo: '', autor: '', isbn: '', categoria: '', editora: '',
        anoPublicacao: '', qtdTotal: '', descricao: ''
    });
    const [capa, setCapa] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast(); // 2. Inicializar o hook de toast

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({ ...prevState, [id]: value }));
    };

    const handleFileChange = (e) => {
        setCapa(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const livroCadastrado = await cadastrarLivro(formData, capa);
            // 3. Usa o toast para a mensagem de sucesso
            addToast(`Livro "${livroCadastrado.titulo}" cadastrado com sucesso!`, 'success');
            
            // Limpa o formulário
            setFormData({
                titulo: '', autor: '', isbn: '', categoria: '', editora: '',
                anoPublicacao: '', qtdTotal: '', descricao: ''
            });
            setCapa(null);
            document.getElementById('capa').value = null;

        } catch (err) {
            console.error("Erro ao cadastrar livro:", err);
            // 4. Extrai a mensagem de erro específica do backend
            const errorMessage = err.response?.data?.message || 'Ocorreu um erro no cadastro.';
            // 5. Usa o toast para a mensagem de erro
            addToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false); 
        }
    };

    return (
        <div className={styles.pageContainer}>
            <h1>Cadastrar Novo Livro</h1>
            
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                    {/* ... seus inputs e labels continuam exatamente iguais ... */}
                    <div className={styles.formGroup}>
                        <label htmlFor="titulo">Título</label>
                        <input type="text" id="titulo" value={formData.titulo} onChange={handleChange} required disabled={isSubmitting} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="autor">Autor</label>
                        <input type="text" id="autor" value={formData.autor} onChange={handleChange} required disabled={isSubmitting}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="isbn">ISBN</label>
                        <input type="text" id="isbn" value={formData.isbn} onChange={handleChange} required disabled={isSubmitting}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="categoria">Categoria</label>
                        <input type="text" id="categoria" value={formData.categoria} onChange={handleChange} required disabled={isSubmitting} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="editora">Editora</label>
                        <input type="text" id="editora" value={formData.editora} onChange={handleChange} required disabled={isSubmitting}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="anoPublicacao">Ano de Publicação</label>
                        <input type="number" id="anoPublicacao" value={formData.anoPublicacao} onChange={handleChange} required disabled={isSubmitting}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="qtdTotal">Quantidade Total</label>
                        <input type="number" id="qtdTotal" value={formData.qtdTotal} onChange={handleChange} required disabled={isSubmitting}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="capa">Capa do Livro</label>
                        <input type="file" id="capa" onChange={handleFileChange} accept="image/png, image/jpeg" />
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="descricao">Descrição</label>
                        <textarea id="descricao" value={formData.descricao} onChange={handleChange} required disabled={isSubmitting}></textarea>
                    </div>
                </div>
                
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? 'Cadastrando...' : 'Cadastrar Livro'}
                </button>
            </form>

            {/* 6. REMOVEMOS as mensagens estáticas daqui, pois o Toast agora cuida disso */}
        </div>
    );
}
 
export default CadastrarLivroPage;

