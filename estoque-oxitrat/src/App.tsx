import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './App.css';

// 1. Interface corrigida para bater com as colunas do banco de dados (SQL)
interface MateriaPrima {
  id: string;
  nome: string;
  massa: number;      // Antes era massa_kg
  densidade: number;
  volume: number;     // Antes era volume_litros
  data_entrada: string;
}

function App() {
  const [estoque, setEstoque] = useState<MateriaPrima[]>([]);
  const [nome, setNome] = useState('');
  const [massa, setMassa] = useState<number | ''>('');
  const [densidade, setDensidade] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { buscarDados(); }, []);

  async function buscarDados() {
    // O select vai trazer as colunas "massa" e "volume" automaticamente
    const { data } = await supabase.from('estoque').select('*').order('created_at', { ascending: false });
    if (data) setEstoque(data);
  }

  const handleEntrada = async () => {
    if (!nome || !massa || !densidade) return alert("Preencha tudo!");
    setLoading(true);
    
    const massaNum = Number(massa);
    const densidadeNum = Number(densidade);
    const volumeCalculado = massaNum / densidadeNum;

    // 2. Insert corrigido enviando os nomes exatos das colunas do banco
    const { error } = await supabase.from('estoque').insert([{
      nome: nome,
      massa: massaNum,        // Coluna 'massa' no banco
      densidade: densidadeNum,
      volume: volumeCalculado // Coluna 'volume' no banco
    }]);

    if (error) {
      alert("Erro ao salvar: " + error.message);
      console.error(error); // Ajuda a debugar se tiver erro de RLS ou conexão
    } else {
      setNome(''); setMassa(''); setDensidade('');
      buscarDados();
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="logo-container">
          <div className="logo-square">OX</div>
          <h1 style={{margin:0}}>Oxitrat <span style={{color:'#16a34a', fontWeight:300}}>Inventory</span></h1>
        </div>
      </header>

      <main className="main-content">
        <aside>
          <div className="form-card">
            <h2>Lançar Item</h2>
            <div className="input-field">
              <label>PRODUTO</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do material" />
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div className="input-field">
                <label>MASSA (KG)</label>
                <input type="number" value={massa} onChange={e => setMassa(Number(e.target.value))} />
              </div>
              <div className="input-field">
                <label>DENSIDADE</label>
                <input type="number" value={densidade} onChange={e => setDensidade(Number(e.target.value))} />
              </div>
            </div>
            <button className="btn-primary" onClick={handleEntrada} disabled={loading}>
              {loading ? 'SALVANDO...' : 'CONFIRMAR'}
            </button>
          </div>
        </aside>

        <section>
          <div className="table-card">
            <div className="table-header">Materiais Registrados</div>
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Massa</th>
                  <th style={{textAlign: 'right'}}>Volume (L)</th>
                </tr>
              </thead>
              <tbody>
                {estoque.map((item) => (
                  <tr key={item.id}>
                    <td style={{fontWeight: 'bold'}}>{item.nome}</td>
                    {/* 3. Leitura das propriedades corrigidas */}
                    <td>{item.massa} kg</td>
                    <td style={{textAlign: 'right'}}>
                      <div className="volume-badge">
                        {item.volume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} L
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;