import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { DollarSign, Package, ShoppingCart, Scale, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const dataAtual = new Date();
  const [mes, setMes] = useState(dataAtual.getMonth() + 1);
  const [ano, setAno] = useState(dataAtual.getFullYear());

  const [gastoMP, setGastoMP] = useState(0);
  const [custoFolha, setCustoFolha] = useState(0);
  const [kgVendidos, setKgVendidos] = useState(0);
  
  // Estados para a Auditoria / Balanço do Chefe
  const [balanco, setBalanco] = useState({ producao: 0, vendasTotais: 0, estoquePA: 0 });
  const [loading, setLoading] = useState(true);

  const meses = [
    { valor: 1, nome: 'Janeiro' }, { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' }, { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' }, { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' }, { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' }, { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' }, { valor: 12, nome: 'Dezembro' }
  ];

  const anos = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  useEffect(() => {
    buscarDadosDashboard();
  }, [mes, ano]);

  async function buscarDadosDashboard() {
    setLoading(true);
    
    // 1. Gasto M.P. do Mês
    const { data: estoqueData } = await supabase.from('estoque').select('preco, data_entrada');
    let somaMP = 0;
    if (estoqueData) {
      estoqueData.forEach(item => {
        if (item.data_entrada) {
          const [anoItem, mesItem] = item.data_entrada.split('-');
          if (parseInt(mesItem) === mes && parseInt(anoItem) === ano) {
            somaMP += Number(item.preco) || 0;
          }
        }
      });
    }
    setGastoMP(somaMP);

    // 2. Custo com a Folha de Pagamento
    const { data: funcData } = await supabase.from('funcionarios').select('salario, data_admissao, ativo');
    let somaFolha = 0;
    if (funcData) {
      funcData.forEach(func => {
        if (!func.data_admissao) return;
        const [anoAdmissao, mesAdmissao] = func.data_admissao.split('-');
        const admissaoValida = parseInt(anoAdmissao) < ano || (parseInt(anoAdmissao) === ano && parseInt(mesAdmissao) <= mes);
        if (func.ativo && admissaoValida) {
          somaFolha += Number(func.salario) || 0;
        }
      });
    }
    setCustoFolha(somaFolha);

    // 3. Vendas do Mês
    const { data: vendasData } = await supabase.from('vendas').select('quantidade_kg, created_at');
    let somaKgMes = 0;
    let somaKgTotal = 0; // Para o balanço
    
    if (vendasData) {
      vendasData.forEach(venda => {
        const peso = Number(venda.quantidade_kg) || 0;
        somaKgTotal += peso; // Soma todas as vendas da história
        
        if (venda.created_at) {
          const [anoVenda, mesVenda] = venda.created_at.split('-');
          if (parseInt(mesVenda) === mes && parseInt(anoVenda) === ano) {
            somaKgMes += peso;
          }
        }
      });
    }
    setKgVendidos(somaKgMes);

    // 4. BALANÇO DE MASSA (O cálculo que o chefe pediu)
    // Pega tudo que tem no estoque de P.A. hoje
    const { data: paData } = await supabase.from('produtos_acabados').select('massa_total');
    let somaEstoquePA = 0;
    if (paData) {
      paData.forEach(p => somaEstoquePA += Number(p.massa_total) || 0);
    }

    // Calcula a Produção Total reconstruindo a história: (Estoque que sobrou + O que já saiu)
    const producaoTotal = somaEstoquePA + somaKgTotal;

    setBalanco({
      producao: producaoTotal,
      vendasTotais: somaKgTotal,
      estoquePA: somaEstoquePA
    });
    
    setLoading(false);
  }

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2>Visão Geral</h2>
          <p>Acompanhe os custos e dados da empresa por período.</p>
        </div>
        
        <div className="filter-container">
          <div className="custom-select-wrapper">
            <select value={mes} onChange={e => setMes(Number(e.target.value))} className="custom-select">
              {meses.map(m => <option key={m.valor} value={m.valor}>{m.nome}</option>)}
            </select>
          </div>
          <div className="custom-select-wrapper">
            <select value={ano} onChange={e => setAno(Number(e.target.value))} className="custom-select">
              {anos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <p style={{ color: '#666' }}>A carregar dados...</p>
      ) : (
        <>
          <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div className="card summary-card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#475569', fontSize: '1rem' }}>Gasto Matéria-Prima</h3>
                <Package size={20} color="#f59e0b" />
              </div>
              <p style={{ fontSize: '2rem', margin: '0 0 5px 0', fontWeight: 'bold', color: '#1e293b' }}>
                R$ {gastoMP.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>No mês selecionado</span>
            </div>

            <div className="card summary-card" style={{ padding: '24px', borderLeft: '4px solid #16a34a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#475569', fontSize: '1rem' }}>Custo com Folha</h3>
                <DollarSign size={20} color="#16a34a" />
              </div>
              <p style={{ fontSize: '2rem', margin: '0 0 5px 0', fontWeight: 'bold', color: '#1e293b' }}>
                R$ {custoFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>No mês selecionado</span>
            </div>

            <div className="card summary-card" style={{ padding: '24px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#475569', fontSize: '1rem' }}>Vendas do Mês</h3>
                <ShoppingCart size={20} color="#3b82f6" />
              </div>
              <p style={{ fontSize: '2rem', margin: '0 0 5px 0', fontWeight: 'bold', color: '#1e293b' }}>
                {kgVendidos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG
              </p>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Produtos que saíram no mês</span>
            </div>
          </div>

          {/* PAINEL DE AUDITORIA DO CHEFE */}
          <div className="card" style={{ padding: '24px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <Scale size={24} color="#334155" />
              <h3 style={{ margin: 0, color: '#334155', fontSize: '1.2rem' }}>Auditoria / Balanço de Produtos Acabados (Geral)</h3>
            </div>
            
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Compare o <strong>Estoque do Sistema</strong> com o <strong>Estoque Físico</strong> no galpão para identificar perdas (vazamentos, quebras, etc).
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              
              <div style={{ textAlign: 'center', flex: 1 }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Produto Acabado Produzido</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{balanco.producao.toFixed(2)} KG</span>
              </div>
              
              <div style={{ fontSize: '1.5rem', color: '#94a3b8', fontWeight: 'bold' }}>-</div>
              
              <div style={{ textAlign: 'center', flex: 1 }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Total de produto Vendido</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{balanco.vendasTotais.toFixed(2)} KG</span>
              </div>

              <div style={{ fontSize: '1.5rem', color: '#94a3b8', fontWeight: 'bold' }}>=</div>

              <div style={{ textAlign: 'center', flex: 1, background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#166534', textTransform: 'uppercase', fontWeight: 'bold' }}>Estoque de produto Acabado</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d' }}>{balanco.estoquePA.toFixed(2)} KG</span>
              </div>

            </div>

            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#b45309', background: '#fffbeb', padding: '12px', borderRadius: '6px', border: '1px solid #fde68a', fontSize: '0.85rem' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0 }}>Se o estoque físico no galpão for <strong>menor</strong> que {balanco.estoquePA.toFixed(2)} KG, a diferença é a <strong>perda de produto</strong>.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}