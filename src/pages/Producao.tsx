import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Factory, Plus, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { MateriaPrima, Ingrediente } from '../types';

export function Producao() {
  const [estoqueMP, setEstoqueMP] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados do Formulário de Produção
  const [codigoProduto, setCodigoProduto] = useState('');
  const [nomeMistura, setNomeMistura] = useState('');
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);

  useEffect(() => {
    buscarDados();
  }, []);

  async function buscarDados() {
    const { data: mpData, error } = await supabase
      .from('estoque')
      .select('id, nome, massa, densidade, volume')
      .order('nome', { ascending: true });
    
    if (error) {
      toast.error("Erro ao carregar matérias-primas.");
      return;
    }
    if (mpData) setEstoqueMP(mpData);
  }

  const adicionarIngrediente = () => {
    setIngredientes([
      ...ingredientes,
      { id_local: Math.random().toString(), estoque_id: '', litros: '' }
    ]);
  };

  const removerIngrediente = (id_local: string) => {
    setIngredientes(ingredientes.filter(ing => ing.id_local !== id_local));
  };

  const atualizarIngrediente = (id_local: string, campo: keyof Ingrediente, valor: any) => {
    setIngredientes(ingredientes.map(ing => 
      ing.id_local === id_local ? { ...ing, [campo]: valor } : ing
    ));
  };

  const totais = ingredientes.reduce(
    (acc, ing) => {
      const mp = estoqueMP.find(item => item.id === ing.estoque_id);
      const volumeIngrediente = Number(ing.litros) || 0;
      
      if (mp && volumeIngrediente > 0) {
        acc.volume += volumeIngrediente;
        acc.massa += volumeIngrediente * mp.densidade;
      }
      return acc;
    },
    { volume: 0, massa: 0 }
  );

  const densidadeFinal = totais.volume > 0 ? totais.massa / totais.volume : 0;

  const handleProduzir = async () => {
    if (!codigoProduto || !nomeMistura) {
      toast.error("Preencha o Código e Nome da mistura!");
      return;
    }
    if (ingredientes.length === 0) {
      toast.error("Adicione pelo menos um ingrediente!");
      return;
    }
    
    try {
      const ingredientesFormatados = ingredientes.map(ing => {
        if (!ing.estoque_id || !ing.litros || Number(ing.litros) <= 0) {
          throw new Error("Preencha todos os campos dos ingredientes corretamente.");
        }
        const mp = estoqueMP.find(item => item.id === ing.estoque_id);
        if (mp && Number(ing.litros) > mp.volume) {
          throw new Error(`Estoque insuficiente para: ${mp.nome}. Disponível: ${mp.volume.toFixed(2)}L`);
        }
        return { id: ing.estoque_id, volume: Number(ing.litros) };
      });

      const toastId = toast.loading('Processando produção atômica...');
      setLoading(true);

      const { error: rpcError } = await supabase.rpc('registrar_producao', {
        p_codigo: codigoProduto,
        p_nome: nomeMistura,
        p_massa_total: totais.massa,
        p_volume_total: totais.volume,
        p_densidade_final: densidadeFinal,
        p_ingredientes: ingredientesFormatados
      });

      if (rpcError) throw rpcError;

      toast.success("Produção finalizada com sucesso!", { id: toastId });
      setCodigoProduto('');
      setNomeMistura('');
      setIngredientes([]);
      buscarDados();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Área de Produção</h2>
        <p>Misture matérias-primas para fabricar produtos. A baixa no estoque M.P. é automática.</p>
      </header>

      <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card form-section" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h3><Factory size={18} style={{marginRight:8}}/> Nova Fórmula de Produção</h3>
          
          <div className="row-2" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label>Código do Produto</label>
              <input 
                type="text" 
                value={codigoProduto} 
                onChange={e => setCodigoProduto(e.target.value)} 
                placeholder="Ex: PROD-001" 
                style={{ padding: '12px' }}
              />
            </div>
            <div className="form-group">
              <label>Nome do Produto Acabado</label>
              <input 
                type="text" 
                value={nomeMistura} 
                onChange={e => setNomeMistura(e.target.value)} 
                placeholder="Ex: Desengraxante Industrial 5L" 
                style={{ padding: '12px' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#4b5563' }}>Ingredientes (Matéria-Prima)</h4>
              <button 
                className="btn-primary" 
                onClick={adicionarIngrediente}
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Plus size={16} /> Adicionar
              </button>
            </div>

            {ingredientes.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                Clique em "Adicionar" para incluir matérias-primas nesta mistura.
              </p>
            ) : (
              ingredientes.map((ing) => (
                <div key={ing.id_local} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '15px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                    <label>Selecione a M.P.</label>
                    <select 
                      value={ing.estoque_id}
                      onChange={e => atualizarIngrediente(ing.id_local, 'estoque_id', e.target.value)}
                    >
                      <option value="">-- Escolha --</option>
                      {estoqueMP.map(mp => (
                        <option key={mp.id} value={mp.id}>
                          {mp.nome} (Disp: {mp.volume?.toFixed(2)}L)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Quantidade (Litros)</label>
                    <input 
                      type="number" 
                      value={ing.litros} 
                      onChange={e => atualizarIngrediente(ing.id_local, 'litros', Number(e.target.value))} 
                      placeholder="0.00"
                    />
                  </div>

                  <button 
                    className="btn-icon delete" 
                    onClick={() => removerIngrediente(ing.id_local)}
                    style={{ padding: '10px' }}
                    title="Remover Ingrediente"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: '#3b82f6', textTransform: 'uppercase', fontWeight: 600 }}>Volume Total</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8' }}>{totais.volume.toFixed(2)} L</span>
            </div>
            <ArrowRight size={24} color="#60a5fa" />
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: '#16a34a', textTransform: 'uppercase', fontWeight: 600 }}>Massa Estimada</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>{totais.massa.toFixed(2)} KG</span>
            </div>
          </div>

          <button className="btn-primary" onClick={handleProduzir} disabled={loading || ingredientes.length === 0} style={{ padding: '15px', fontSize: '1.1rem' }}>
            {loading ? 'A processar...' : 'Finalizar Produção'}
          </button>
        </div>
      </div>
    </div>
  );
}
