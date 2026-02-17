import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface MateriaPrima {
  id: string;
  nome: string;
  massa: number;
  densidade: number;
  volume: number;
  preco: number;
  data_entrada: string;
}

export function Estoque() {
  const [estoque, setEstoque] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(false);

  // Formulário
  const [nome, setNome] = useState('');
  const [massa, setMassa] = useState<number | ''>('');
  const [densidade, setDensidade] = useState<number | ''>('');
  const [preco, setPreco] = useState<number | ''>('');

  // Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editMassa, setEditMassa] = useState<number | ''>('');
  const [editDensidade, setEditDensidade] = useState<number | ''>('');
  const [editPreco, setEditPreco] = useState<number | ''>('');

  useEffect(() => { buscarDados(); }, []);

  async function buscarDados() {
    const { data } = await supabase.from('estoque').select('*').order('created_at', { ascending: false });
    if (data) setEstoque(data);
  }

  const handleEntrada = async () => {
    if (!nome || !massa || !densidade || !preco) return alert("Preencha tudo!");
    setLoading(true);
    const massaNum = Number(massa);
    const densidadeNum = Number(densidade);
    const { error } = await supabase.from('estoque').insert([{
      nome, massa: massaNum, densidade: densidadeNum, volume: massaNum / densidadeNum, preco: Number(preco)
    }]);
    if (error) alert(error.message);
    else { setNome(''); setMassa(''); setDensidade(''); setPreco(''); buscarDados(); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir item?")) {
      await supabase.from('estoque').delete().eq('id', id);
      buscarDados();
    }
  };

  const handleUpdate = async () => {
    if (!editId) return;
    const m = Number(editMassa);
    const d = Number(editDensidade);
    await supabase.from('estoque').update({
      nome: editNome, massa: m, densidade: d, volume: m/d, preco: Number(editPreco)
    }).eq('id', editId);
    setIsModalOpen(false);
    buscarDados();
  };

  const openEdit = (item: MateriaPrima) => {
    setEditId(item.id); setEditNome(item.nome); setEditMassa(item.massa);
    setEditDensidade(item.densidade); setEditPreco(item.preco); setIsModalOpen(true);
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Controle de Matéria-Prima</h2>
      </header>
      
      <div className="content-grid">
        {/* Formulário */}
        <div className="card form-section">
          <h3>Nova Entrada</h3>
          <div className="form-group">
            <label>Produto</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome..." />
          </div>
          <div className="row-2">
            <div><label>Massa (kg)</label><input type="number" value={massa} onChange={e => setMassa(Number(e.target.value))} /></div>
            <div><label>Densidade</label><input type="number" value={densidade} onChange={e => setDensidade(Number(e.target.value))} /></div>
          </div>
          <div><label>Custo (R$)</label><input type="number" value={preco} onChange={e => setPreco(Number(e.target.value))} /></div>
          <button className="btn-primary" onClick={handleEntrada} disabled={loading}>{loading ? '...' : 'Lançar'}</button>
        </div>

        {/* Tabela */}
        <div className="card table-section">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Massa/Vol</th>
                  <th>Custo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {estoque.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.nome}</strong></td>
                    <td>{item.massa}kg <br/><small>{item.volume.toFixed(1)}L</small></td>
                    <td>R$ {item.preco?.toFixed(2)}</td>
                    <td>
                      <button className="btn-icon edit" onClick={() => openEdit(item)}>✎</button>
                      <button className="btn-icon delete" onClick={() => handleDelete(item.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar</h3>
            <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)} />
            <div className="row-2">
              <input type="number" value={editMassa} onChange={e => setEditMassa(Number(e.target.value))} placeholder="Kg" />
              <input type="number" value={editDensidade} onChange={e => setEditDensidade(Number(e.target.value))} placeholder="Dens" />
            </div>
            <input type="number" value={editPreco} onChange={e => setEditPreco(Number(e.target.value))} placeholder="R$" />
            <div className="modal-actions">
              <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleUpdate}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}