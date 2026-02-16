import { useState } from 'react'
// Removendo o import do CSS padrão para não atrapalhar nossos estilos inline
// import './App.css' 

// Definição do tipo do nosso produto no estoque
interface MateriaPrima {
  id: number;
  nome: string;
  massaKg: number;
  densidade: number;
  volumeLitros: number;
  dataEntrada: string;
}

function App() {
  // --- ESTADOS (Memória) ---
  const [estoque, setEstoque] = useState<MateriaPrima[]>([]);

  // Formulário de Entrada
  const [nome, setNome] = useState('');
  const [massa, setMassa] = useState<number | ''>('');
  const [densidade, setDensidade] = useState<number | ''>('');

  // --- FUNÇÃO DE ADICIONAR (COM A LÓGICA KG -> LITROS) ---
  const handleEntrada = () => {
    // Validação simples
    if (!nome || !massa || !densidade || Number(densidade) <= 0) {
      alert("Por favor, preencha todos os campos corretamente. A densidade deve ser maior que zero.");
      return;
    }

    const massaNum = Number(massa);
    const densidadeNum = Number(densidade);
    // A MÁGICA: Volume = Massa / Densidade
    const volumeCalculado = massaNum / densidadeNum;

    const novoItem: MateriaPrima = {
      id: Date.now(),
      nome: nome,
      massaKg: massaNum,
      densidade: densidadeNum,
      volumeLitros: volumeCalculado,
      dataEntrada: new Date().toLocaleDateString('pt-BR') // Guarda a data de hoje
    };

    // Adiciona no topo da lista (mais recente primeiro)
    setEstoque([novoItem, ...estoque]);
    
    // Limpa o formulário
    setNome('');
    setMassa('');
    setDensidade('');
  };

  // --- ESTILOS (Cores e Formatos) ---
  const colors = {
    primaryGreen: '#008000', // Verde Oxitrat (ajuste se quiser outro tom)
    darkText: '#1a1a1a',     // Preto quase absoluto para textos
    lightBg: '#f8f9fa',      // Fundo cinza muito claro para a página
    whiteBg: '#ffffff',      // Branco puro para os cartões
    borderColor: '#dee2e6'   // Cinza claro para bordas
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.whiteBg,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)', // Sombra suave profissional
    padding: '25px',
    marginBottom: '30px',
    border: `1px solid ${colors.borderColor}`
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: colors.darkText,
    fontSize: '14px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: `1px solid #ced4da`,
    fontSize: '16px',
    color: '#000000', // Texto preto explicitamente
    backgroundColor: colors.whiteBg,
    boxSizing: 'border-box', // Garante que o padding não estoure a largura
    outline: 'none'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: colors.lightBg, 
      padding: '40px 20px', 
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' 
    }}>
      
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* --- CABEÇALHO --- */}
        <header style={{ marginBottom: '30px', borderBottom: `3px solid ${colors.primaryGreen}`, paddingBottom: '15px' }}>
          <h1 style={{ color: colors.primaryGreen, margin: 0, fontSize: '28px' }}>
            💧 Oxitrat <span style={{ color: colors.darkText, fontWeight: '300' }}>| Gestão de Estoque</span>
          </h1>
        </header>

        {/* --- CARTÃO 1: FORMULÁRIO DE ENTRADA --- */}
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: colors.darkText, borderLeft: `5px solid ${colors.primaryGreen}`, paddingLeft: '15px' }}>
            🚚 Entrada de Nota Fiscal (Matéria-Prima)
          </h2>
          <p style={{ color: '#666', marginBottom: '25px' }}>Preencha os dados da NF em KG e Densidade para calcular o volume real em Litros.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            
            {/* Input Nome */}
            <div>
              <label style={labelStyle}>Nome do Produto Químico</label>
              <input 
                type="text" 
                placeholder="Ex: Hipoclorito de Sódio"
                value={nome}
                onChange={e => setNome(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Input Massa (KG) */}
            <div>
              <label style={labelStyle}>Peso na Nota (KG)</label>
              <input 
                type="number" 
                placeholder="Ex: 1000"
                value={massa}
                onChange={e => setMassa(Number(e.target.value))}
                style={inputStyle}
              />
            </div>

             {/* Input Densidade */}
             <div>
              <label style={labelStyle}>Densidade (g/cm³ ou kg/L)</label>
              <input 
                type="number" 
                placeholder="Ex: 1.2"
                step="0.01"
                value={densidade}
                onChange={e => setDensidade(Number(e.target.value))}
                style={inputStyle}
              />
            </div>

          </div>

          {/* Botão de Confirmar */}
          <button 
            onClick={handleEntrada}
            style={{ 
              marginTop: '25px', 
              width: '100%', 
              padding: '15px', 
              backgroundColor: colors.primaryGreen, 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontSize: '18px', 
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#006400'} // Efeito ao passar o mouse
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primaryGreen}
          >
            Confirmar Entrada e Calcular Litros
          </button>
        </div>

        {/* --- CARTÃO 2: TABELA DE ESTOQUE --- */}
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: colors.darkText, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📦 Estoque Atual (Tanques)</span>
            <span style={{ fontSize: '16px', color: '#666', fontWeight: 'normal' }}>{estoque.length} itens cadastrados</span>
          </h2>

          {estoque.length === 0 ? (
             <div style={{ padding: '30px', textAlign: 'center', color: '#999', fontStyle: 'italic', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                Nenhuma matéria-prima deu entrada ainda.
             </div>
          ) : (
            <div style={{ overflowX: 'auto' }}> {/* Para rolar em telas pequenas */}
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', marginTop: '20px', border: `1px solid ${colors.borderColor}`, borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.primaryGreen, color: 'white', textAlign: 'left' }}>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Data Entrada</th>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Produto</th>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Peso NF (KG)</th>
                    <th style={{ padding: '15px', fontWeight: '600' }}>Densidade</th>
                    <th style={{ padding: '15px', fontWeight: 'bold', backgroundColor: '#006400' }}>Volume Real (LITROS)</th>
                  </tr>
                </thead>
                <tbody>
                  {estoque.map((item, index) => (
                    <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? colors.whiteBg : '#f9f9f9', color: colors.darkText }}>
                      <td style={{ padding: '15px', borderBottom: `1px solid ${colors.borderColor}` }}>{item.dataEntrada}</td>
                      <td style={{ padding: '15px', borderBottom: `1px solid ${colors.borderColor}`, fontWeight: '600' }}>{item.nome}</td>
                      <td style={{ padding: '15px', borderBottom: `1px solid ${colors.borderColor}` }}>{item.massaKg} kg</td>
                      <td style={{ padding: '15px', borderBottom: `1px solid ${colors.borderColor}` }}>{item.densidade}</td>
                      <td style={{ padding: '15px', borderBottom: `1px solid ${colors.borderColor}`, fontWeight: 'bold', color: colors.primaryGreen, fontSize: '1.1em' }}>
                        {item.volumeLitros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default App