import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Factory, ScrollText } from 'lucide-react';
import '../App.css';

export function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <nav className="sidebar">
      <div className="logo-container">
        <div className="logo-square">OX</div>
        <h1>Oxitrat <span style={{fontWeight:300}}>Manager</span></h1>
      </div>

      <div className="nav-links">
        <Link to="/" className={`nav-item ${isActive('/')}`}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/estoque" className={`nav-item ${isActive('/estoque')}`}>
          <Package size={20} /> Estoque M.P.
        </Link>
        <Link to="/funcionarios" className={`nav-item ${isActive('/funcionarios')}`}>
          <Users size={20} /> Funcionários
        </Link>
        {/* Futuras abas */}
        <div className="nav-item disabled">
          <Factory size={20} /> Produção (Em breve)
        </div>
        <div className="nav-item disabled">
          <ScrollText size={20} /> Receitas (Em breve)
        </div>
      </div>
    </nav>
  );
}