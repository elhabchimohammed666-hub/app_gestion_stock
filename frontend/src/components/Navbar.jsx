import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Boxes, 
  Store, 
  Users, 
  Bell, 
  User, 
  ChevronDown,
  Layers,
  Sparkles,
  FileDown
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Tableau de Bord', path: '/', icon: LayoutDashboard },
    { name: 'Facturation', path: '/facturation', icon: Receipt },
    { name: 'Inventaire & Stock', path: '/inventaire', icon: Boxes },
    { name: 'Point de Vente (POS)', path: '/pos', icon: Store },
    { name: 'Contacts', path: '/contacts', icon: Users },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-[#714B67] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Brand matching video */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white font-bold group-hover:bg-white/25 transition">
                <Layers className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
                  odoo <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded">MAROC</span>
                </span>
                <span className="text-[10px] text-purple-200 -mt-1 font-medium">Gestion Stock & Facturation</span>
              </div>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-1 ml-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      active
                        ? 'bg-black/25 text-white shadow-inner border-b-2 border-amber-400'
                        : 'text-purple-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-black/20 text-xs px-2.5 py-1 rounded-full text-purple-200 border border-purple-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Devise: <strong>MAD (DH)</strong></span>
            </div>

            {/* Guide PDF Download button */}
            <a
              href="/Guide_Complet_Utilisation_ERP_Odoo_Maroc.pdf"
              download="Guide_Complet_Utilisation_ERP_Odoo_Maroc.pdf"
              className="bg-purple-900/60 hover:bg-purple-900 text-amber-300 border border-purple-400/40 text-xs font-semibold px-2.5 py-1.5 rounded-md shadow flex items-center gap-1.5 transition active:scale-95"
              title="Télécharger le Guide d'Utilisation PDF"
            >
              <FileDown className="w-4 h-4" />
              <span>Guide PDF</span>
            </a>

            {/* Quick POS button */}
            <Link
              to="/pos/caisse"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow flex items-center gap-1.5 transition active:scale-95"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Accès Rapide</span> Caisse POS
            </Link>

            {/* Notification & User Profile */}
            <button className="p-1.5 rounded-full text-purple-200 hover:bg-white/10 transition relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
            </button>

            <div className="flex items-center space-x-2 pl-2 border-l border-purple-500/50">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-xs shadow">
                AD
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight">Admin Maroc</span>
                <span className="text-[10px] text-purple-200">Administrateur</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex overflow-x-auto bg-[#5d3c54] px-2 py-1.5 border-t border-purple-800 space-x-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium ${
                active ? 'bg-black/30 text-white font-bold' : 'text-purple-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
