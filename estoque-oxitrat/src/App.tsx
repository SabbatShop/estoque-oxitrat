import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface MateriaPrima {
  id: string;
  nome: string;
  massa_kg: number;
  densidade: number;
  volume_litros: number;
  data_entrada: string;
}

function App() {
  const [estoque, setEstoque] = useState<MateriaPrima[]>([]);
  const [nome, setNome] = useState('');
  const [massa, setMassa] = useState<number | ''>('');
  const [densidade, setDensidade] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    buscarEstoque();
  }, []);

  async function buscarEstoque() {
    const { data, error } = await supabase
      .from('estoque')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setEstoque(data);
    if (error) console.error('Erro:', error);
  }

  const handleEntrada = async () => {
    if (!nome || !massa || !densidade || Number(densidade) <= 0) {
      alert("Preencha os campos corretamente. A densidade deve ser maior que zero.");
      return;
    }

    setLoading(true);
    const massaNum = Number(massa);
    const densidadeNum = Number(densidade);
    // Lógica original: Volume = Massa / Densidade
    const volumeCalculado = massaNum / densidadeNum;

    const { error } = await supabase.from('estoque').insert([
      { 
        nome, 
        massa_kg: massaNum, 
        densidade: densidadeNum, 
        volume_litros: volumeCalculado 
      }
    ]);

    if (!error) {
      setNome(''); setMassa(''); setDensidade('');
      buscarEstoque();
    } else {
      alert("Erro ao salvar no Supabase");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b-4 border-green-600 p-6 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-green-700">💧 Oxitrat <span className="text-slate-400 font-light">| Gestão Industrial</span></h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário lateral */}
        <aside className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-green-600">🚚</span> Nova Entrada
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Produto Químico</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none" placeholder="Nome do produto" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Peso NF (KG)</label>
                <input type="number" value={massa} onChange={e => setMassa(Number(e.target.value))} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Densidade (kg/L)</label>
                <input type="number" value={densidade} onChange={e => setDensidade(Number(e.target.value))} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <button onClick={handleEntrada} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-all disabled:bg-slate-300">
                {loading ? 'Salvando...' : 'Registrar e Calcular'}
              </button>
            </div>
          </div>
        </aside>

        {/* Tabela de resultados */}
        <section className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between">
              <h2 className="font-bold text-slate-700">Histórico de Tanques</h2>
              <span className="text-sm text-slate-500">{estoque.length} registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="p-4">Data</th>
                    <th className="p-4">Produto</th>
                    <th className="p-4">Massa</th>
                    <th className="p-4 bg-green-50 text-green-800 font-bold">Volume Real</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {estoque.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-sm">{new Date(item.data_entrada).toLocaleDateString('pt-BR')}</td>
                      <td className="p-4 font-medium">{item.nome}</td>
                      <td className="p-4 text-sm">{item.massa_kg} kg</td>
                      <td className="p-4 font-bold text-green-600">{item.volume_litros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;