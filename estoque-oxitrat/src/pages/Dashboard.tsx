import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { DollarSign, Package, Users } from 'lucide-react';

export function Dashboard() {
  const dataAtual = new Date();
  const [mes, setMes] = useState(dataAtual.getMonth() + 1); // 1 a 12
  const [ano, setAno] = useState(dataAtual.getFullYear());

  const [gastoMP, setGastoMP] = useState(0);
  const [custoFolha, setCustoFolha] = useState(0);
  const [totalFuncionarios, setTotalFuncionarios] = useState(0);
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
    
    // 1. Calcular Gasto com Matéria-Prima no mês selecionado
    const { data: estoqueData } = await supabase.from('estoque').select('preco, data_entrada');
    let somaMP = 0;
    
    if (estoqueData) {
      estoqueData.forEach(item => {
        if (item.data_entrada) {
          // Separar a data para evitar bugs de fuso horário no JavaScript
          const [anoItem, mesItem] = item.data_entrada.split('-');
          if (parseInt(mesItem) === mes && parseInt(anoItem) === ano) {
            somaMP += Number(item.preco) || 0;
          }
        }
      });
    }
    setGastoMP(somaMP);

    // 2. Calcular Dados de Funcionários (Folha e Quantidade Ativa)
    const { data: funcData } = await supabase.from('funcionarios').select('salario, data_admissao, ativo');
    let somaFolha = 0;
    let ativos = 0;

    if (funcData) {
      funcData.forEach(func => {
        if (!func.data_admissao) return;
        
        const [anoAdmissao, mesAdmissao] = func.data_admissao.split('-');
        const admissaoValida = parseInt(anoAdmissao) < ano || (parseInt(anoAdmissao) === ano && parseInt(mesAdmissao) <= mes);
        
        // Se o funcionário estava ativo e já havia sido contratado neste mês/ano
        if (func.ativo && admissaoValida) {
          ativos++;
          somaFolha += Number(func.salario) || 0;
        }
      });
    }
    setCustoFolha(somaFolha);
    setTotalFuncionarios(ativos);
    
    setLoading(false);
  }

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2>Visão Geral</h2>
          <p>Acompanhe os custos e dados da empresa por período.</p>
        </div>
        
        {/* Filtros de Data com as novas classes CSS */}
        <div className="filter-container">
          <div className="custom-select-wrapper">
            <select 
              value={mes} 
              onChange={e => setMes(Number(e.target.value))}
              className="custom-select"
            >
              {meses.map(m => <option key={m.valor} value={m.valor}>{m.nome}</option>)}
            </select>
          </div>
          
          <div className="custom-select-wrapper">
            <select 
              value={ano} 
              onChange={e => setAno(Number(e.target.value))}
              className="custom-select"
            >
              {anos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <p style={{ color: '#666' }}>A carregar dados...</p>
      ) : (
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          
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
              <h3 style={{ margin: 0, color: '#475569', fontSize: '1rem' }}>Funcionários Ativos</h3>
              <Users size={20} color="#3b82f6" />
            </div>
            <p style={{ fontSize: '2rem', margin: '0 0 5px 0', fontWeight: 'bold', color: '#1e293b' }}>
              {totalFuncionarios}
            </p>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Trabalhadores na empresa</span>
          </div>

        </div>
      )}
    </div>
  );
}