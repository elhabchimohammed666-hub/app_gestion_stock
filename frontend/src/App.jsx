import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Inventory from './pages/Inventory';
import PosSessions from './pages/PosSessions';
import PosTerminal from './pages/PosTerminal';
import Contacts from './pages/Contacts';

function AppLayout({ children }) {
  const location = useLocation();
  const isPosCaisse = location.pathname.startsWith('/pos/caisse');

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {!isPosCaisse && <Navbar />}
      <main className={isPosCaisse ? 'flex-1' : 'flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8'}>
        {children}
      </main>
      {!isPosCaisse && (
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-slate-700">
              Odoo Service Maroc • Système ERP MERN Stack (Stock, Facturation & POS)
            </span>
            <span className="text-[11px] text-slate-400">
              Devise: MAD (Dirham Marocain) • Multi-utilisateurs & Synchronisation temps réel
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/facturation" element={<Invoices />} />
          <Route path="/inventaire" element={<Inventory />} />
          <Route path="/pos" element={<PosSessions />} />
          <Route path="/pos/caisse" element={<PosTerminal />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
