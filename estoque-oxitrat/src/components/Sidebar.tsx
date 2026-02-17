import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Factory, ScrollText, Menu, X } from 'lucide-react';
import '../App.css';

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path ? 'active' : '';
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Botão Hamburger (Só aparece no Mobile) */}
      <button className="mobile-menu-btn" onClick={toggleMenu}>
        <Menu size={24} />
      </button>

      {/* Fundo escuro quando menu está aberto no mobile */}
      <div 
        className={`mobile-overlay ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      {/* A Sidebar em si */}
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-square">OX</div>
            <h1>Oxitrat <span style={{fontWeight:300}}>Manager</span></h1>
          </div>
          {/* Botão de Fechar (Só aparece no Mobile dentro do menu) */}
          <button className="close-menu-btn" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="nav-links">
          <Link to="/" className={`nav-item ${isActive('/')}`} onClick={() => setIsOpen(false)}>
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </Link>
          <Link to="/estoque" className={`nav-item ${isActive('/estoque')}`} onClick={() => setIsOpen(false)}>
            <Package size={20} /> <span>Estoque M.P.</span>
          </Link>
          <Link to="/funcionarios" className={`nav-item ${isActive('/funcionarios')}`} onClick={() => setIsOpen(false)}>
            <Users size={20} /> <span>Funcionários</span>
          </Link>
          
          <div className="nav-divider">Em Breve</div>
          
          <div className="nav-item disabled">
            <Factory size={20} /> <span>Produção</span>
          </div>
          <div className="nav-item disabled">
            <ScrollText size={20} /> <span>Receitas</span>
          </div>
        </div>
      </nav>
    </>
  );
}