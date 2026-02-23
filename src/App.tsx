import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Toaster } from 'react-hot-toast';
import { supabase } from './supabaseClient';
import './App.css'; // Garantindo a importação do CSS

// Importação das páginas
import { Dashboard } from './pages/Dashboard';
import { Estoque } from './pages/Estoque';
import { Producao } from './pages/Producao';
import { ProdutosAcabados } from './pages/ProdutosAcabados';
import { Clientes } from './pages/Clientes';
import { Vendas } from './pages/Vendas';
import { Funcionarios } from './pages/Funcionarios';
import { Login } from './pages/Login'; 

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica a sessão atual logo que o app abre
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Fica "escutando" se o usuário logou ou deslogou
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando sistema...</div>;
  }

  // Se NÃO houver sessão (usuário não logado), mostra apenas a tela de Login
  if (!session) {
    return (
      <>
        <Toaster position="top-right" />
        <Login />
      </>
    );
  }

  // Se houver sessão (usuário logado), mostra o sistema completo com as classes originais!
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
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      
      <Toaster position="top-right" reverseOrder={false} />
    </Router>
  );
}

export default App;