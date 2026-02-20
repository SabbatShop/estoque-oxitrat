import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Estoque } from './pages/Estoque';
import { Funcionarios } from './pages/Funcionarios';
import { Clientes } from './pages/Clientes';
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
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/clientes" element={<Clientes />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;