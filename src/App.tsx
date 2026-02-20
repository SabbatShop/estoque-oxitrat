import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Estoque } from './pages/Estoque';
import { Funcionarios } from './pages/Funcionarios';
import { Clientes } from './pages/Clientes';
import { Producao } from './pages/Producao';
import { ProdutosAcabados } from './pages/ProdutosAcabados';
import { Vendas } from './pages/Vendas';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-viewport">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/producao" element={<Producao />} />
            <Route path="/produtos-acabados" element={<ProdutosAcabados />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/vendas" element={<Vendas />} />
          </Routes>
        </main>
      </div>
      
      {/* Configure a posição das notificações (ex: canto superior direito) */}
      <Toaster position="top-right" reverseOrder={false} />
    </Router>
  );
}

export default App;