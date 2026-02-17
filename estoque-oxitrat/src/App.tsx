import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './App.css';

interface MateriaPrima {
  id: string;
  nome: string;
  massa: number;
  densidade: number;
  volume: number;
  preco: number;
  data_entrada: string;
}

function App() {
  const [estoque, setEstoque] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados do Formulário de Cadastro
  const [nome, setNome] = useState('');
  const [massa, setMassa] = useState<number | ''>('');
  const [densidade, setDensidade] = useState<number | ''>('');
  const [preco, setPreco] = useState<number | ''>('');

  // Estados do Modal de Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editMassa, setEditMassa] = useState<number | ''>('');
  const [editDensidade, setEditDensidade] = useState<number | ''>('');
  const [editPreco, setEditPreco] = useState<number | ''>('');

  useEffect(() => { buscarDados(); }, []);

  async function buscarDados() {
    const { data } = await supabase
      .from('estoque')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setEstoque(data);
  }

  // --- CADASTRO ---
  const handleEntrada = async () => {
    if (!nome || !massa || !densidade || !preco) return alert("Preencha todos os campos!");
    setLoading(true);
    
    const massaNum = Number(massa);
    const densidadeNum = Number(densidade);
    const volumeCalculado = massaNum / densidadeNum;

    const { error } = await supabase.from('estoque').insert([{
      nome: nome,
      massa: massaNum,
      densidade: densidadeNum,
      volume: volumeCalculado,
      preco: Number(preco)
    }]);

    if (error) alert("Erro ao salvar: " + error.message);
    else {
      setNome(''); setMassa(''); setDensidade(''); setPreco('');
      buscarDados();
    }
    setLoading(false);
  };

  // --- EXCLUSÃO ---
  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      const { error } = await supabase.from('estoque').delete().eq('id', id);
      if (error) alert("Erro ao excluir: " + error.message);
      else buscarDados();
    }
  };

  // --- EDIÇÃO ---
  const openEditModal = (item: MateriaPrima) => {
    setEditId(item.id);
    setEditNome(item.nome);
    setEditMassa(item.massa);
    setEditDensidade(item.densidade);
    setEditPreco(item.preco);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editId || !editNome || !editMassa || !editDensidade || !editPreco) return alert("Preencha tudo!");
    
    const massaNum = Number(editMassa);
    const densidadeNum = Number(editDensidade);
    const volumeCalculado = massaNum / densidadeNum; // Recalcula o volume

    const { error } = await supabase.from('estoque').update({
      nome: editNome,
      massa: massaNum,
      densidade: densidadeNum,
      volume: volumeCalculado,
      preco: Number(editPreco)
    }).eq('id', editId);

    if (error) alert("Erro ao atualizar: " + error.message);
    else {
      setIsModalOpen(false);
      buscarDados();
    }
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
        {/* Formulário Lateral */}
        <aside>
          <div className="form-card">
            <h2>Nova Entrada</h2>
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
            <div className="input-field">
              <label>CUSTO (R$)</label>
              <input type="number" value={preco} onChange={e => setPreco(Number(e.target.value))} />
            </div>
            <button className="btn-primary" onClick={handleEntrada} disabled={loading}>
              {loading ? 'SALVANDO...' : 'REGISTRAR'}
            </button>
          </div>
        </aside>

        {/* Tabela */}
        <section>
          <div className="table-card">
            <div className="table-header">Estoque Atual</div>
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Massa</th>
                  <th style={{textAlign: 'right'}}>Volume</th>
                  <th style={{textAlign: 'right'}}>Custo</th>
                  <th style={{textAlign: 'center'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {estoque.map((item) => (
                  <tr key={item.id}>
                    <td style={{fontWeight: 'bold'}}>{item.nome}</td>
                    <td>{item.massa} kg <br/><span style={{fontSize:'0.7rem', color:'#64748b'}}>{item.densidade} g/cm³</span></td>
                    <td style={{textAlign: 'right'}}>
                      <div className="volume-badge">{item.volume.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} L</div>
                    </td>
                    <td style={{textAlign: 'right', fontWeight:'bold', color:'#475569'}}>
                      {item.preco ? item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                    </td>
                    <td style={{textAlign: 'center'}}>
                      <button className="btn-small btn-edit" onClick={() => openEditModal(item)}>EDITAR</button>
                      <button className="btn-small btn-delete" onClick={() => handleDelete(item.id)}>X</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* MODAL DE EDIÇÃO */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Material</h3>
              <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer'}}>✕</button>
            </div>
            
            <div className="input-field">
              <label>Nome do Produto</label>
              <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)} />
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div className="input-field">
                <label>Massa (kg)</label>
                <input type="number" value={editMassa} onChange={e => setEditMassa(Number(e.target.value))} />
              </div>
              <div className="input-field">
                <label>Densidade</label>
                <input type="number" value={editDensidade} onChange={e => setEditDensidade(Number(e.target.value))} />
              </div>
            </div>

            <div className="input-field">
              <label>Custo (R$)</label>
              <input type="number" value={editPreco} onChange={e => setEditPreco(Number(e.target.value))} />
            </div>

            <div className="modal-actions">
              <button className="btn-small btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-small btn-edit" onClick={handleUpdate} style={{padding: '10px 20px'}}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;