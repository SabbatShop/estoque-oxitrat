import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Package, Pencil, Trash2, X } from 'lucide-react';

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

  // Formulário de Criação
  const [nome, setNome] = useState('');
  const [massa, setMassa] = useState<number | ''>('');
  const [densidade, setDensidade] = useState<number | ''>('');
  const [preco, setPreco] = useState<number | ''>('');
  const [dataEntrada, setDataEntrada] = useState('');

  // Estados de Edição (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editMassa, setEditMassa] = useState<number | ''>('');
  const [editDensidade, setEditDensidade] = useState<number | ''>('');
  const [editPreco, setEditPreco] = useState<number | ''>('');
  const [editDataEntrada, setEditDataEntrada] = useState('');

  useEffect(() => { buscarDados(); }, []);

  async function buscarDados() {
    const { data } = await supabase
      .from('estoque')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setEstoque(data);
  }

  const handleEntrada = async () => {
    if (!nome || !massa || !densidade || !preco || !dataEntrada) return alert("Preencha todos os campos!");
    setLoading(true);
    
    const massaNum = Number(massa);
    const densidadeNum = Number(densidade);
    const volumeCalc = densidadeNum > 0 ? massaNum / densidadeNum : 0;

    const { error } = await supabase.from('estoque').insert([{
      nome, 
      massa: massaNum, 
      densidade: densidadeNum, 
      volume: volumeCalc, 
      preco: Number(preco),
      data_entrada: dataEntrada
    }]);

    if (error) {
      alert(error.message);
    } else { 
      setNome(''); setMassa(''); setDensidade(''); setPreco(''); setDataEntrada('');
      buscarDados(); 
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      await supabase.from('estoque').delete().eq('id', id);
      buscarDados();
    }
  };

  const openEdit = (item: MateriaPrima) => {
    setEditId(item.id);
    setEditNome(item.nome);
    setEditMassa(item.massa);
    setEditDensidade(item.densidade);
    setEditPreco(item.preco);
    setEditDataEntrada(item.data_entrada || '');
    setIsModalOpen(true);
  }

  const handleUpdate = async () => {
    if (!editId) return;
    const m = Number(editMassa);
    const d = Number(editDensidade);
    const v = d > 0 ? m / d : 0;

    const { error } = await supabase.from('estoque').update({
      nome: editNome, 
      massa: m, 
      densidade: d, 
      volume: v, 
      preco: Number(editPreco),
      data_entrada: editDataEntrada
    }).eq('id', editId);

    if (!error) {
      setIsModalOpen(false);
      buscarDados();
    } else {
      alert("Erro ao atualizar: " + error.message);
    }
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return '--';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const editVolumePreview = (Number(editMassa) > 0 && Number(editDensidade) > 0) 
    ? (Number(editMassa) / Number(editDensidade)).toFixed(2) 
    : '--';

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Estoque de Matéria-Prima</h2>
        <p>Gerencie o estoque, densidade e custos.</p>
      </header>
      
      <div className="content-grid">
        <div className="card form-section">
          <h3><Package size={18} style={{marginRight:8}}/> Nova Entrada</h3>
          
          <div className="form-group">
            <label>Nome do Produto</label>
            <input 
              type="text" 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              placeholder="Ex: Ácido Sulfúrico" 
            />
          </div>

          <div className="row-2">
            <div className="form-group">
              <label>Massa (kg)</label>
              <input 
                type="number" 
                value={massa} 
                onChange={e => setMassa(Number(e.target.value))} 
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Densidade</label>
              <input 
                type="number" 
                value={densidade} 
                onChange={e => setDensidade(Number(e.target.value))} 
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="row-2">
            <div className="form-group">
              <label>Custo Total (R$)</label>
              <input 
                type="number" 
                value={preco} 
                onChange={e => setPreco(Number(e.target.value))} 
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Data de Chegada</label>
              <input 
                type="date" 
                value={dataEntrada} 
                onChange={e => setDataEntrada(e.target.value)} 
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handleEntrada} disabled={loading}>
            {loading ? 'Processando...' : 'Adicionar ao Estoque'}
          </button>
        </div>

        <div className="card table-section">
          <h3>Itens em Estoque</h3>
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
                {estoque.length === 0 ? (
                  <tr>
                    {/* Alterado colSpan para 7 devido à volta da coluna Densidade */}
                    <td colSpan={7} style={{textAlign: 'center', color: '#999', padding: '20px'}}>
                      Nenhum item cadastrado.
                    </td>
                  </tr>
                ) : (
                  estoque.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.nome}</strong></td>
                      <td>{item.massa}</td>
                      <td>{item.densidade}</td>
                      <td style={{color: '#16a34a', fontWeight: 'bold'}}>
                        {item.volume?.toFixed(2)}
                      </td>
                      <td>R$ {item.preco?.toFixed(2)}</td>
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
              <h3>Editar Item</h3>
              <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', cursor:'pointer'}}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Nome do Material</label>
              <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)} />
            </div>

            <div className="row-2">
              <div className="form-group">
                <label>Massa (Kg)</label>
                <input type="number" value={editMassa} onChange={e => setEditMassa(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Densidade</label>
                <input type="number" value={editDensidade} onChange={e => setEditDensidade(Number(e.target.value))} />
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '8px', marginBottom: '15px', color: '#166534', fontSize: '0.9rem', textAlign: 'center' }}>
              Volume Recalculado: <strong>{editVolumePreview} Litros</strong>
            </div>

            <div className="row-2">
              <div className="form-group">
                <label>Preço (R$)</label>
                <input type="number" value={editPreco} onChange={e => setEditPreco(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Data de Chegada</label>
                <input type="date" value={editDataEntrada} onChange={e => setEditDataEntrada(e.target.value)} />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleUpdate} style={{marginTop:0}}>
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}