export function Dashboard() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Visão Geral</h2>
        <p>Bem-vindo ao sistema de gestão Oxitrat.</p>
      </header>

      <div className="dashboard-grid">
        <div className="card summary-card">
          <h3>Estoque M.P.</h3>
          <p className="big-number">R$ --</p>
          <span className="subtitle">Valor em caixa</span>
        </div>
        <div className="card summary-card">
          <h3>Produção Mensal</h3>
          <p className="big-number">-- L</p>
          <span className="subtitle">Produtos Químicos</span>
        </div>
        <div className="card summary-card">
          <h3>Funcionários</h3>
          <p className="big-number">--</p>
          <span className="subtitle">Ativos</span>
        </div>
      </div>
    </div>
  );
}