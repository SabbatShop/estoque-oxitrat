import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ShoppingCart, ArrowDownRight, PackageCheck, Building2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Cliente, ProdutoAcabado, Venda } from '../types';

export function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<ProdutoAcabado[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados do formulário
  const [clienteId, setClienteId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidadeKg, setQuantidadeKg] = useState<number | ''>('');
  const [valorVenda, setValorVenda] = useState<number | ''>(''); 

  useEffect(() => {
    buscarDados();
  }, []);

  async function buscarDados() {
    const { data: cliData } = await supabase.from('clientes').select('id, nome_empresa').order('nome_empresa');
    if (cliData) setClientes(cliData);

    const { data: prodData } = await supabase.from('produtos_acabados').select('*').gt('massa_total', 0).order('nome');
    if (prodData) setProdutos(prodData);

    const { data: vendasData } = await supabase
      .from('vendas')
      .select(`
        id, 
        created_at, 
        quantidade_kg,
        valor_venda,
        clientes ( nome_empresa ), 
        produtos_acabados ( nome )
      `)
      .order('created_at', { ascending: false });
    
    if (vendasData) {
      setVendas(vendasData as unknown as Venda[]);
    }
  }

  const handleVender = async () => {
    if (!clienteId) return toast.error("Selecione um cliente!");
    if (!produtoId) return toast.error("Selecione um produto!");
    if (!quantidadeKg || Number(quantidadeKg) <= 0) return toast.error("Digite uma quantidade válida em KG!");
    if (!valorVenda || Number(valorVenda) <= 0) return toast.error("Digite um valor de venda válido!");

    const qtd = Number(quantidadeKg);
    const valor = Number(valorVenda);
    const produtoSelecionado = produtos.find(p => p.id === produtoId);

    if (!produtoSelecionado) return toast.error("Produto não encontrado.");
    
    if (qtd > produtoSelecionado.massa_total) {
      return toast.error(`Estoque insuficiente! Disponível: ${produtoSelecionado.massa_total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG`);
    }

    const toastId = toast.loading('Processando venda atômica...');
    setLoading(true);

    try {
      const { error: rpcError } = await supabase.rpc('registrar_venda', {
        p_cliente_id: clienteId,
        p_produto_id: produtoId,
        p_quantidade_kg: qtd,
        p_valor_venda: valor
      });

      if (rpcError) throw rpcError;

      toast.success("Venda registrada com sucesso!", { id: toastId });
      
      setClienteId('');
      setProdutoId('');
      setQuantidadeKg('');
      setValorVenda('');
      
      buscarDados();
    } catch (error: any) {
      toast.error("Erro ao registrar venda: " + error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Área de Vendas (Saídas)</h2>
        <p>Registre vendas para clientes e dê baixa automática no estoque de produtos prontos.</p>
      </header>

      <div className="content-grid">
        <div className="card form-section">
          <h3><ShoppingCart size={18} style={{marginRight:8}}/> Nova Venda</h3>
          
          <div className="form-group">
            <label><Building2 size={14} style={{display:'inline', marginRight:4}}/> Selecione o Cliente</label>
            <select value={clienteId} onChange={e => setClienteId(e.target.value)}>
              <option value="">-- Escolha um Cliente --</option>
              {clientes.map(cli => (
                <option key={cli.id} value={cli.id}>{cli.nome_empresa}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label><PackageCheck size={14} style={{display:'inline', marginRight:4}}/> Produto Acabado</label>
            <select value={produtoId} onChange={e => setProdutoId(e.target.value)}>
              <option value="">-- Escolha o Produto --</option>
              {produtos.map(prod => (
                <option key={prod.id} value={prod.id}>
                  {prod.nome} (Estoque: {prod.massa_total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG)
                </option>
              ))}
            </select>
          </div>

          <div className="row-2">
            <div className="form-group">
              <label><ArrowDownRight size={14} style={{display:'inline', marginRight:4}}/> Quantidade Solicitada (KG)</label>
              <input 
                type="number" 
                value={quantidadeKg} 
                onChange={e => setQuantidadeKg(Number(e.target.value))} 
                placeholder="0,00"
              />
            </div>

            <div className="form-group">
              <label><DollarSign size={14} style={{display:'inline', marginRight:4}}/> Valor da Venda (R$)</label>
              <input 
                type="number" 
                value={valorVenda} 
                onChange={e => setValorVenda(Number(e.target.value))} 
                placeholder="0,00"
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handleVender} disabled={loading}>
            {loading ? 'Processando...' : 'Confirmar Venda'}
          </button>
        </div>

        <div className="card table-section">
          <h3>Histórico de Vendas</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Produto Vendido</th>
                  <th>Quantidade (KG)</th>
                  <th>Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                {vendas.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{textAlign: 'center', color: '#999', padding: '20px'}}>
                      Nenhuma venda registrada ainda.
                    </td>
                  </tr>
                ) : (
                  vendas.map(venda => (
                    <tr key={venda.id}>
                      <td>{new Date(venda.created_at).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <strong>
                          {Array.isArray(venda.clientes) ? venda.clientes[0]?.nome_empresa : venda.clientes?.nome_empresa || 'N/A'}
                        </strong>
                      </td>
                      <td>
                        {Array.isArray(venda.produtos_acabados) ? venda.produtos_acabados[0]?.nome : venda.produtos_acabados?.nome || 'N/A'}
                      </td>
                      <td style={{color: '#ef4444', fontWeight: 'bold'}}>- {venda.quantidade_kg.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG</td>
                      <td style={{color: '#16a34a', fontWeight: 'bold'}}>
                        R$ {venda.valor_venda?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
