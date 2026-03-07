import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { estoqueService } from '../services/estoqueService';
import type { MateriaPrima } from '../services/estoqueService';
import { Package, Pencil, Trash2, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Esquema de validação para garantir dados 100% corretos
const estoqueSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  massa: z.coerce.number({ 
    required_error: "Informe a massa",
    invalid_type_error: "Informe um número válido" 
  }).positive("A massa deve ser maior que zero"),
  densidade: z.coerce.number({ 
    required_error: "Informe a densidade",
    invalid_type_error: "Informe um número válido" 
  }).positive("A densidade deve ser maior que zero"),
  preco: z.coerce.number({ 
    required_error: "Informe o preço",
    invalid_type_error: "Informe um número válido" 
  }).nonnegative("O preço não pode ser negativo"),
  data_entrada: z.string().min(1, "Selecione a data de entrada"),
});

type EstoqueFormData = z.infer<typeof estoqueSchema>;

export function Estoque() {
  const [estoque, setEstoque] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal de Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MateriaPrima | null>(null);

  // Configuração do formulário de criação
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch,
    formState: { errors } 
  } = useForm<EstoqueFormData>({
    resolver: zodResolver(estoqueSchema)
  });

  // Configuração do formulário de edição (separado para evitar conflitos)
  const { 
    register: registerEdit, 
    handleSubmit: handleSubmitEdit, 
    reset: resetEdit,
    watch: watchEdit,
    formState: { errors: errorsEdit } 
  } = useForm<EstoqueFormData>({
    resolver: zodResolver(estoqueSchema)
  });

  const massaWatch = watch('massa');
  const densidadeWatch = watch('densidade');
  const volumePreview = (massaWatch && densidadeWatch) ? (massaWatch / densidadeWatch).toFixed(2) : '0.00';

  const massaEditWatch = watchEdit('massa');
  const densidadeEditWatch = watchEdit('densidade');
  const volumeEditPreview = (massaEditWatch && densidadeEditWatch) ? (massaEditWatch / densidadeEditWatch).toFixed(2) : '0.00';

  useEffect(() => { 
    carregarEstoque(); 
  }, []);

  async function carregarEstoque() {
    try {
      setLoading(true);
      const data = await estoqueService.getAll();
      setEstoque(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: EstoqueFormData) => {
    try {
      setSubmitting(true);
      const volume = data.massa / data.densidade;
      await estoqueService.add({ ...data, volume });
      
      toast.success("Item adicionado com sucesso!");
      reset();
      carregarEstoque();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onEditSubmit = async (data: EstoqueFormData) => {
    if (!editingItem) return;
    try {
      setSubmitting(true);
      const volume = data.massa / data.densidade;
      await estoqueService.update(editingItem.id, { ...data, volume });
      
      toast.success("Item atualizado com sucesso!");
      setIsModalOpen(false);
      carregarEstoque();
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este item? Esta ação não pode ser desfeita.")) {
      try {
        await estoqueService.delete(id);
        toast.success("Item removido!");
        carregarEstoque();
      } catch (error: any) {
        toast.error("Erro ao excluir: " + error.message);
      }
    }
  };

  const openEdit = (item: MateriaPrima) => {
    setEditingItem(item);
    resetEdit({
      nome: item.nome,
      massa: item.massa,
      densidade: item.densidade,
      preco: item.preco,
      data_entrada: item.data_entrada
    });
    setIsModalOpen(true);
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return '--';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Estoque de Matéria-Prima</h2>
        <p>Controle rigoroso de entrada e densidade de materiais.</p>
      </header>
      
      <div className="content-grid">
        {/* Formulário de Cadastro */}
        <div className="card form-section">
          <h3><Package size={18} style={{marginRight:8}}/> Nova Entrada</h3>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Nome do Produto</label>
              <input 
                {...register('nome')}
                className={errors.nome ? 'input-error' : ''}
                placeholder="Ex: Ácido Sulfúrico" 
              />
              {errors.nome && <span className="error-msg"><AlertCircle size={12}/> {errors.nome.message}</span>}
            </div>

            <div className="row-2">
              <div className="form-group">
                <label>Massa (kg)</label>
                <input 
                  type="number" 
                  step="any"
                  {...register('massa', { valueAsNumber: true })}
                  className={errors.massa ? 'input-error' : ''}
                  placeholder="0.00"
                />
                {errors.massa && <span className="error-msg">{errors.massa.message}</span>}
              </div>
              <div className="form-group">
                <label>Densidade</label>
                <input 
                  type="number" 
                  step="any"
                  {...register('densidade', { valueAsNumber: true })}
                  className={errors.densidade ? 'input-error' : ''}
                  placeholder="0.000"
                />
                {errors.densidade && <span className="error-msg">{errors.densidade.message}</span>}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
              <small style={{color: '#64748b'}}>Volume Calculado Automático:</small><br/>
              <strong style={{color: '#0f172a', fontSize: '1.1rem'}}>{volumePreview} Litros</strong>
            </div>

            <div className="row-2">
              <div className="form-group">
                <label>Custo Total (R$)</label>
                <input 
                  type="number" 
                  step="any"
                  {...register('preco', { valueAsNumber: true })}
                  className={errors.preco ? 'input-error' : ''}
                  placeholder="0.00"
                />
                {errors.preco && <span className="error-msg">{errors.preco.message}</span>}
              </div>
              <div className="form-group">
                <label>Data de Chegada</label>
                <input 
                  type="date" 
                  {...register('data_entrada')}
                  className={errors.data_entrada ? 'input-error' : ''}
                />
                {errors.data_entrada && <span className="error-msg">{errors.data_entrada.message}</span>}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Adicionar ao Estoque'}
            </button>
          </form>
        </div>

        {/* Listagem de Itens */}
        <div className="card table-section">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
             <h3>Itens em Estoque</h3>
             {loading && <span style={{fontSize:'0.8rem', color:'#666'}}>Atualizando...</span>}
          </div>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Massa (kg)</th>
                  <th>Densidade</th>
                  <th>Volume (L)</th>
                  <th>Custo (R$)</th>
                  <th>Chegada</th>
                  <th style={{textAlign: 'center'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && estoque.length === 0 ? (
                   <tr><td colSpan={7} style={{textAlign: 'center', padding: '40px'}}>Carregando estoque...</td></tr>
                ) : estoque.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{textAlign: 'center', color: '#999', padding: '40px'}}>
                      Nenhum item cadastrado no estoque.
                    </td>
                  </tr>
                ) : (
                  estoque.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.nome}</strong></td>
                      <td>{item.massa?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td>{item.densidade?.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}</td>
                      <td style={{color: '#16a34a', fontWeight: 'bold'}}>
                        {item.volume?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td>R$ {item.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td>{formatarData(item.data_entrada)}</td>
                      <td style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                        <button className="btn-icon edit" onClick={() => openEdit(item)} title="Editar">
                          <Pencil size={18} />
                        </button>
                        <button className="btn-icon delete" onClick={() => handleDelete(item.id)} title="Excluir">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
              <h3>Editar Material</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit(onEditSubmit)}>
              <div className="form-group">
                <label>Nome do Material</label>
                <input {...registerEdit('nome')} className={errorsEdit.nome ? 'input-error' : ''} />
                {errorsEdit.nome && <span className="error-msg">{errorsEdit.nome.message}</span>}
              </div>

              <div className="row-2">
                <div className="form-group">
                  <label>Massa (Kg)</label>
                  <input type="number" step="any" {...registerEdit('massa', { valueAsNumber: true })} />
                  {errorsEdit.massa && <span className="error-msg">{errorsEdit.massa.message}</span>}
                </div>
                <div className="form-group">
                  <label>Densidade</label>
                  <input type="number" step="any" {...registerEdit('densidade', { valueAsNumber: true })} />
                  {errorsEdit.densidade && <span className="error-msg">{errorsEdit.densidade.message}</span>}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', marginBottom: '15px', color: '#166534', textAlign: 'center' }}>
                Novo Volume: <strong>{volumeEditPreview} Litros</strong>
              </div>

              <div className="row-2">
                <div className="form-group">
                  <label>Preço (R$)</label>
                  <input type="number" step="any" {...registerEdit('preco', { valueAsNumber: true })} />
                  {errorsEdit.preco && <span className="error-msg">{errorsEdit.preco.message}</span>}
                </div>
                <div className="form-group">
                  <label>Data de Chegada</label>
                  <input type="date" {...registerEdit('data_entrada')} />
                  {errorsEdit.data_entrada && <span className="error-msg">{errorsEdit.data_entrada.message}</span>}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
