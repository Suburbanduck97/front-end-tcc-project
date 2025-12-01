import { useState } from 'react';
import { useToast } from '../../context/useToast';
import { cadastrarLivro } from '../../services/livroService';
import styles from './CadastrarLivroPage.module.css';


// Definição de limites para campos de entrada
const LIMITES = {
    TITULO: 200,
    AUTOR: 100,
    ISBN: 13,
    CATEGORIA: 50,
    EDITORA: 100,
    DESCRICAO: 2000,
    CAPA_TAMANHO_MB: 5
};

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
        const file = e.target.files[0];

        if(file){
            // Validação de formato
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if(!validTypes.includes(file.type)){
                addToast('Formato de arquivo inválido. Use apenas PNG ou JPG.', 'error');
                e.target.value = null;
                setCapa(null);
                return;
            }
            
            // Validação de tamanho
            const maxSizeInBytes = LIMITES.CAPA_TAMANHO_MB * 1024 * 1024;
            if(file.size > maxSizeInBytes){
                addToast(`a imagem é muito grande. O limite é de ${LIMITES.CAPA_TAMANHO_MB}MB.`, 'error');
                e.target.value = null;
                setCapa(null);
                return;
            }

            setCapa(file);
        }
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
                        <input type="text" id="titulo" value={formData.titulo} onChange={handleChange} required disabled={isSubmitting} maxLength={LIMITES.TITULO}
                            placeholder={`Máx. ${LIMITES.TITULO} caracteres`} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="autor">Autor</label>
                        <input type="text" id="autor" value={formData.autor} onChange={handleChange} required disabled={isSubmitting} maxLength={LIMITES.AUTOR}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="isbn">ISBN</label>
                        <input type="text" id="isbn" value={formData.isbn} onChange={handleChange} required disabled={isSubmitting} maxLength={LIMITES.ISBN} placeholder="apenas números" />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="categoria">Categoria</label>
                        <input type="text" id="categoria" value={formData.categoria} onChange={handleChange} required disabled={isSubmitting} maxLength={LIMITES.CATEGORIA} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="editora">Editora</label>
                        <input type="text" id="editora" value={formData.editora} onChange={handleChange} required disabled={isSubmitting} maxLength={LIMITES.EDITORA}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="anoPublicacao">Ano de Publicação</label>
                        <input type="number" id="anoPublicacao" value={formData.anoPublicacao} onChange={handleChange} required disabled={isSubmitting} min="1000"
                            max={new Date().getFullYear() + 1}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="qtdTotal">Quantidade Total</label>
                        <input type="number" id="qtdTotal" value={formData.qtdTotal} onChange={handleChange} required disabled={isSubmitting} min="0"
                            max="9999"/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="capa">Capa do Livro <small>(Máx {LIMITES.CAPA_TAMANHO_MB}MB - JPG/PNG)</small></label>
                        <input type="file" id="capa" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" />
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="descricao">Descrição <span style={{fontSize: '0.8em', color: '#666', float: 'right'}}>
                                {formData.descricao.length}/{LIMITES.DESCRICAO}
                            </span></label>
                        <textarea id="descricao" value={formData.descricao} onChange={handleChange} required disabled={isSubmitting} maxLength={LIMITES.DESCRICAO}
                            style={{minHeight: '120px'}}></textarea>
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

