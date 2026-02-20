import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, Pencil, Trash2, X, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  salario: number;
  data_admissao: string;
  ativo: boolean;
}

export function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados do Formulário de Criação
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [salario, setSalario] = useState<number | ''>('');
  const [dataAdmissao, setDataAdmissao] = useState('');

  // Estados de Edição (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editCargo, setEditCargo] = useState('');
  const [editSalario, setEditSalario] = useState<number | ''>('');
  const [editDataAdmissao, setEditDataAdmissao] = useState('');
  const [editAtivo, setEditAtivo] = useState<boolean>(true);

  useEffect(() => { buscarDados(); }, []);

  async function buscarDados() {
    const { data } = await supabase
      .from('funcionarios')
      .select('*')
      .order('nome', { ascending: true });
    if (data) setFuncionarios(data);
  }

  const handleEntrada = async () => {
    if (!nome || !cargo || !salario || !dataAdmissao) {
      toast.error("Preencha todos os campos!");
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('funcionarios').insert([{
      nome, 
      cargo, 
      salario: Number(salario), 
      data_admissao: dataAdmissao,
      ativo: true
    }]);

    if (error) {
      toast.error(error.message);
    } else { 
      setNome(''); setCargo(''); setSalario(''); setDataAdmissao(''); 
      toast.success("Funcionário cadastrado!");
      buscarDados(); 
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      await supabase.from('funcionarios').delete().eq('id', id);
      toast.success("Funcionário removido do sistema!");
      buscarDados();
    }
  };

  const openEdit = (item: Funcionario) => {
    setEditId(item.id);
    setEditNome(item.nome);
    setEditCargo(item.cargo);
    setEditSalario(item.salario);
    setEditDataAdmissao(item.data_admissao || '');
    setEditAtivo(item.ativo);
    setIsModalOpen(true);
  }

  const handleUpdate = async () => {
    if (!editId) return;
    
    const { error } = await supabase.from('funcionarios').update({
      nome: editNome, 
      cargo: editCargo, 
      salario: Number(editSalario), 
      data_admissao: editDataAdmissao,
      ativo: editAtivo
    }).eq('id', editId);

    if (!error) {
      setIsModalOpen(false);
      toast.success("Dados do funcionário atualizados!");
      buscarDados();
    } else {
      toast.error("Erro ao atualizar: " + error.message);
    }
  };

  // Função utilitária para formatar a data (YYYY-MM-DD para DD/MM/YYYY)
  const formatarData = (dataString: string) => {
    if (!dataString) return '--';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Gestão de Funcionários</h2>
        <p>Cadastre os colaboradores e gerencie salários e status.</p>
      </header>
      
      <div className="content-grid">
        {/* Formulário de Adição */}
        <div className="card form-section">
          <h3><Users size={18} style={{marginRight:8}}/> Novo Funcionário</h3>
          
          <div className="form-group">
            <label>Nome Completo</label>
            <input 
              type="text" 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              placeholder="Ex: João da Silva" 
            />
          </div>

          <div className="form-group">
            <label>Cargo / Função</label>
            <input 
              type="text" 
              value={cargo} 
              onChange={e => setCargo(e.target.value)} 
              placeholder="Ex: Operador Químico" 
            />
          </div>

          <div className="row-2">
            <div className="form-group">
              <label>Salário (R$)</label>
              <input 
                type="number" 
                value={salario} 
                onChange={e => setSalario(Number(e.target.value))} 
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Data de Admissão</label>
              <input 
                type="date" 
                value={dataAdmissao} 
                onChange={e => setDataAdmissao(e.target.value)} 
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handleEntrada} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar Funcionário'}
          </button>
        </div>

        {/* Tabela de Visualização */}
        <div className="card table-section">
          <h3>Equipe</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th>Salário</th>
                  <th>Admissão</th>
                  <th style={{textAlign: 'center'}}>Status</th>
                  <th style={{textAlign: 'center'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{textAlign: 'center', color: '#999', padding: '20px'}}>
                      Nenhum funcionário cadastrado.
                    </td>
                  </tr>
                ) : (
                  funcionarios.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.nome}</strong></td>
                      <td>{item.cargo}</td>
                      <td>R$ {item.salario?.toFixed(2)}</td>
                      <td>{formatarData(item.data_admissao)}</td>
                      <td style={{textAlign: 'center'}}>
                        {item.ativo ? (
                          <span style={{color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold'}}>
                            <CheckCircle size={16} /> Ativo
                          </span>
                        ) : (
                          <span style={{color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold'}}>
                            <XCircle size={16} /> Inativo
                          </span>
                        )}
                      </td>
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
              <h3>Editar Funcionário</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{background:'none', border:'none', cursor:'pointer'}}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Nome Completo</label>
              <input 
                type="text" 
                value={editNome} 
                onChange={e => setEditNome(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Cargo / Função</label>
              <input 
                type="text" 
                value={editCargo} 
                onChange={e => setEditCargo(e.target.value)} 
              />
            </div>

            <div className="row-2">
              <div className="form-group">
                <label>Salário (R$)</label>
                <input 
                  type="number" 
                  value={editSalario} 
                  onChange={e => setEditSalario(Number(e.target.value))} 
                />
              </div>
              <div className="form-group">
                <label>Data de Admissão</label>
                <input 
                  type="date" 
                  value={editDataAdmissao} 
                  onChange={e => setEditDataAdmissao(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Status do Funcionário</label>
              <select 
                value={editAtivo ? "true" : "false"}
                onChange={e => setEditAtivo(e.target.value === "true")}
                style={{
                  width: '100%', padding: '12px', border: '1px solid #cbd5e1', 
                  borderRadius: '8px', background: '#f8fafc', fontSize: '16px'
                }}
              >
                <option value="true">Ativo na Empresa</option>
                <option value="false">Desligado / Inativo</option>
              </select>
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