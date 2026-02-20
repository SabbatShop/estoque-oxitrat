import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Building2, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Cliente {
  id: string;
  nome_empresa: string;
  endereco: string;
  telefone: string;
}

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados do Formulário de Criação
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');

  // Estados de Edição (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNomeEmpresa, setEditNomeEmpresa] = useState('');
  const [editEndereco, setEditEndereco] = useState('');
  const [editTelefone, setEditTelefone] = useState('');

  useEffect(() => { buscarDados(); }, []);

  async function buscarDados() {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .order('nome_empresa', { ascending: true });
    if (data) setClientes(data);
  }

  const handleCadastrar = async () => {
    if (!nomeEmpresa || !endereco || !telefone) {
      toast.error("Preencha todos os campos!");
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('clientes').insert([{
      nome_empresa: nomeEmpresa, 
      endereco, 
      telefone
    }]);

    if (error) {
      toast.error(error.message);
    } else { 
      setNomeEmpresa(''); setEndereco(''); setTelefone(''); 
      toast.success("Cliente cadastrado com sucesso!");
      buscarDados(); 
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      await supabase.from('clientes').delete().eq('id', id);
      toast.success("Cliente removido com sucesso!");
      buscarDados();
    }
  };

  const openEdit = (item: Cliente) => {
    setEditId(item.id);
    setEditNomeEmpresa(item.nome_empresa);
    setEditEndereco(item.endereco);
    setEditTelefone(item.telefone);
    setIsModalOpen(true);
  }

  const handleUpdate = async () => {
    if (!editId) return;
    
    const { error } = await supabase.from('clientes').update({
      nome_empresa: editNomeEmpresa, 
      endereco: editEndereco, 
      telefone: editTelefone
    }).eq('id', editId);

    if (!error) {
      setIsModalOpen(false);
      toast.success("Dados do cliente atualizados!");
      buscarDados();
    } else {
      toast.error("Erro ao atualizar: " + error.message);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Gestão de Clientes</h2>
        <p>Cadastre e gerencie as informações dos seus clientes e empresas parceiras.</p>
      </header>
      
      <div className="content-grid">
        {/* Formulário de Adição */}
        <div className="card form-section">
          <h3><Building2 size={18} style={{marginRight:8}}/> Novo Cliente</h3>
          
          <div className="form-group">
            <label>Nome da Empresa</label>
            <input 
              type="text" 
              value={nomeEmpresa} 
              onChange={e => setNomeEmpresa(e.target.value)} 
              placeholder="Ex: Indústrias Acme" 
            />
          </div>

          <div className="form-group">
            <label>Endereço Completo</label>
            <input 
              type="text" 
              value={endereco} 
              onChange={e => setEndereco(e.target.value)} 
              placeholder="Ex: Rua das Flores, 123 - Centro" 
            />
          </div>

          <div className="form-group">
            <label>Telefone para Contato</label>
            <input 
              type="text" 
              value={telefone} 
              onChange={e => setTelefone(e.target.value)} 
              placeholder="Ex: (00) 00000-0000" 
            />
          </div>

          <button className="btn-primary" onClick={handleCadastrar} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </button>
        </div>

        {/* Tabela de Visualização */}
        <div className="card table-section">
          <h3>Lista de Clientes</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Endereço</th>
                  <th>Telefone</th>
                  <th style={{textAlign: 'center'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{textAlign: 'center', color: '#999', padding: '20px'}}>
                      Nenhum cliente cadastrado.
                    </td>
                  </tr>
                ) : (
                  clientes.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.nome_empresa}</strong></td>
                      <td>{item.endereco}</td>
                      <td>{item.telefone}</td>
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
              <h3>Editar Cliente</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{background:'none', border:'none', cursor:'pointer'}}
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Nome da Empresa</label>
              <input 
                type="text" 
                value={editNomeEmpresa} 
                onChange={e => setEditNomeEmpresa(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Endereço Completo</label>
              <input 
                type="text" 
                value={editEndereco} 
                onChange={e => setEditEndereco(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Telefone para Contato</label>
              <input 
                type="text" 
                value={editTelefone} 
                onChange={e => setEditTelefone(e.target.value)} 
              />
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