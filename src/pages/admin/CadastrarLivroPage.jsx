import { useState } from 'react';
import { useToast } from '../../context/useToast';
import { cadastrarLivro } from '../../services/livroService';
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
            let errorMessage = 'Ocorreu um erro. Verifique os dados e tente novamente.';

            const data = err.response?.data;

            if (data) {
                if (data.mensagem) { 
                    errorMessage = data.mensagem;
                } else if (data.message) { 
                    errorMessage = data.message;
                } else if (data.erro) {
                    errorMessage = data.erro;
                } else if (typeof data.errors === 'object') {
                    const errorMessages = Object.values(data.errors).map(msg => `${msg}`);
                    errorMessage = `Por favor, corrija os seguintes erros:\n${errorMessages.join('\n')}`;
                }
            }

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
        </div>
    );
}
 
export default CadastrarLivroPage;

