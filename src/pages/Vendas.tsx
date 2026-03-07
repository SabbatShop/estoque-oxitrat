import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ShoppingCart, ArrowDownRight, PackageCheck, Building2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface Cliente {
  id: string;
  nome_empresa: string;
}

interface ProdutoAcabado {
  id: string;
  nome: string;
  massa_total: number;
  volume_total: number;
  densidade_final: number;
}

interface Venda {
  id: string;
  created_at: string;
  quantidade_kg: number;
  valor_venda: number;
  clientes: { nome_empresa: string };
  produtos_acabados: { nome: string };
}

export function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<ProdutoAcabado[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados do formulário
  const [clienteId, setClienteId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidadeKg, setQuantidadeKg] = useState<number | ''>('');
  const [valorVenda, setValorVenda] = useState<number | ''>(''); // Novo estado para o preço

  useEffect(() => {
    buscarDados();
  }, []);

  async function buscarDados() {
    // Busca Clientes
    const { data: cliData } = await supabase.from('clientes').select('id, nome_empresa').order('nome_empresa');
    if (cliData) setClientes(cliData);

    // Busca Produtos Acabados que tenham saldo no estoque
    const { data: prodData } = await supabase.from('produtos_acabados').select('*').gt('massa_total', 0).order('nome');
    if (prodData) setProdutos(prodData);

    // Busca Histórico de Vendas incluindo o valor_venda
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
    if (vendasData) setVendas(vendasData as any);
  }

  const handleVender = async () => {
    if (!clienteId) return toast.error("Selecione um cliente!");
    if (!produtoId) return toast.error("Selecione um produto!");
    if (!quantidadeKg || Number(quantidadeKg) <= 0) return toast.error("Digite uma quantidade válida em KG!");
    if (!valorVenda || Number(valorVenda) <= 0) return toast.error("Digite um valor de venda válido!"); // Validação do preço

    const qtd = Number(quantidadeKg);
    const valor = Number(valorVenda);
    const produtoSelecionado = produtos.find(p => p.id === produtoId);

    if (!produtoSelecionado) return toast.error("Produto não encontrado.");
    
    if (qtd > produtoSelecionado.massa_total) {
      return toast.error(`Estoque insuficiente! Disponível: ${produtoSelecionado.massa_total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG`);
    }

    const toastId = toast.loading('Processando venda e atualizando estoque...');
    setLoading(true);

    try {
      // 1. Registra a Venda com o valor incluído
      const { error: erroVenda } = await supabase.from('vendas').insert([{
        cliente_id: clienteId,
        produto_id: produtoId,
        quantidade_kg: qtd,
        valor_venda: valor
      }]);

      if (erroVenda) throw erroVenda;

      // 2. Calcula os novos valores para dar baixa no estoque
      const novaMassa = produtoSelecionado.massa_total - qtd;
      const novoVolume = produtoSelecionado.densidade_final > 0 
        ? novaMassa / produtoSelecionado.densidade_final 
        : 0;

      // 3. Atualiza o Produto Acabado
      const { error: erroUpdate } = await supabase.from('produtos_acabados').update({
        massa_total: novaMassa,
        volume_total: novoVolume
      }).eq('id', produtoId);

      if (erroUpdate) throw erroUpdate;

      toast.success("Venda registrada com sucesso!", { id: toastId });
      
      // Limpa os campos
      setClienteId('');
      setProdutoId('');
      setQuantidadeKg('');
      setValorVenda(''); // Limpa o preço
      
      // Atualiza as tabelas na tela
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
        {/* Formulário de Venda */}
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

        {/* Tabela de Vendas */}
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
                      <td><strong>{venda.clientes?.nome_empresa}</strong></td>
                      <td>{venda.produtos_acabados?.nome}</td>
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