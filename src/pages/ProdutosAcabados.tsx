import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PackageCheck, Trash2 } from 'lucide-react';

interface ProdutoAcabado {
  id: string;
  nome: string;
  massa_total: number;
  volume_total: number;
  densidade_final: number;
  created_at: string;
}

export function ProdutosAcabados() {
  const [produtos, setProdutos] = useState<ProdutoAcabado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarDados();
  }, []);

  async function buscarDados() {
    setLoading(true);
    const { data } = await supabase
      .from('produtos_acabados')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setProdutos(data);
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja excluir este registo? (Isto não devolverá as matérias-primas ao estoque M.P.)")) {
      await supabase.from('produtos_acabados').delete().eq('id', id);
      buscarDados();
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Estoque de Produtos Acabados</h2>
        <p>Acompanhe os produtos que já foram fabricados e estão prontos.</p>
      </header>

      <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card table-section">
          <h3><PackageCheck size={18} style={{marginRight:8, display: 'inline-block', verticalAlign: 'middle'}}/> Lista de Produtos</h3>
          
          {loading ? (
            <p style={{textAlign: 'center', padding: '20px'}}>Carregando estoque...</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Massa Total (kg)</th>
                    <th>Volume Total (L)</th>
                    <th>Densidade Final</th>
                    <th>Data de Produção</th>
                    <th style={{textAlign: 'center'}}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{textAlign: 'center', color: '#999', padding: '20px'}}>
                        Nenhum produto acabado no estoque.
                      </td>
                    </tr>
                  ) : (
                    produtos.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.nome}</strong></td>
                        <td>{item.massa_total?.toFixed(2)} kg</td>
                        <td style={{color: '#1d4ed8', fontWeight: 'bold'}}>{item.volume_total?.toFixed(2)} L</td>
                        <td>{item.densidade_final?.toFixed(3)}</td>
                        <td>{new Date(item.created_at).toLocaleDateString('pt-PT')}</td>
                        <td style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                          <button className="btn-icon delete" onClick={() => handleDelete(item.id)} title="Excluir Registo">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}