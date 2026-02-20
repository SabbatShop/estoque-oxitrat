import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Factory, Menu, X, Building2, PackageCheck, ShoppingCart } from 'lucide-react'; // ÍCONE ADICIONADO AQUI
import '../App.css';

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path ? 'active' : '';
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <button className="mobile-menu-btn" onClick={toggleMenu}>
        <Menu size={24} />
      </button>

      <div 
        className={`mobile-overlay ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-square">OX</div>
            <h1>Oxitrat <span style={{fontWeight:300}}>Manager</span></h1>
          </div>
          <button className="close-menu-btn" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="nav-links">
          <Link to="/" className={`nav-item ${isActive('/')}`} onClick={() => setIsOpen(false)}>
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </Link>
          
          <div className="nav-divider">Gestão e Indústria</div>

          <Link to="/estoque" className={`nav-item ${isActive('/estoque')}`} onClick={() => setIsOpen(false)}>
            <Package size={20} /> <span>Estoque M.P.</span>
          </Link>
          <Link to="/producao" className={`nav-item ${isActive('/producao')}`} onClick={() => setIsOpen(false)}>
            <Factory size={20} /> <span>Produção</span>
          </Link>
          <Link to="/produtos-acabados" className={`nav-item ${isActive('/produtos-acabados')}`} onClick={() => setIsOpen(false)}>
            <PackageCheck size={20} /> <span>Produtos Acabados</span>
          </Link>

          <Link to="/vendas" className={`nav-item ${isActive('/vendas')}`} onClick={() => setIsOpen(false)}>
            <ShoppingCart size={20} /> <span>Vendas</span>
          </Link>
        
          <div className="nav-divider">Cadastros</div>
          
          <Link to="/funcionarios" className={`nav-item ${isActive('/funcionarios')}`} onClick={() => setIsOpen(false)}>
            <Users size={20} /> <span>Funcionários</span>
          </Link>
          <Link to="/clientes" className={`nav-item ${isActive('/clientes')}`} onClick={() => setIsOpen(false)}>
            <Building2 size={20} /> <span>Clientes</span>
          </Link>
        </div>
      </nav>
    </>
  );
}