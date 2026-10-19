import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Receipt, 
  Boxes, 
  Store, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRightLeft,
  CheckCircle2,
  ChevronRight,
  Plus
} from 'lucide-react';
import api, { formatDH, formatDate } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#714B67]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#714B67] to-[#4e3146] text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Odoo Service Maroc - Système Actif
          </div>
          <h1 className="text-2xl font-black">Tableau de Bord & Vue d'Ensemble</h1>
          <p className="text-sm text-purple-200 mt-1">
            Suivi centralisé des ventes, facturation, inventaire de stock et caisses Point de Vente.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/pos/caisse"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition active:scale-95"
          >
            <Store className="w-4 h-4" /> Ouvrir Caisse POS
          </Link>
          <Link
            to="/facturation"
            className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-2.5 rounded-lg backdrop-blur-sm border border-white/20 flex items-center gap-2 transition"
          >
            <Receipt className="w-4 h-4" /> Facturation
          </Link>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales Invoices */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Facturation Ventes</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-[#714B67] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3 font-mono">
            {formatDH(stats?.totalInvoiceSales || 0)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Encaissé: {formatDH(stats?.totalCollected || 0)}</span>
          </div>
        </div>

        {/* Pending Due */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Créances Clients</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-3 font-mono">
            {formatDH(stats?.totalDue || 0)}
          </p>
          <p className="text-xs text-slate-500 mt-2">À recouvrer sur factures échues</p>
        </div>

        {/* POS Sales Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ventes Caisse POS</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3 font-mono">
            {formatDH(stats?.totalPosSales || 0)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span>{stats?.totalPosOrders || 0} tickets enregistrés</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alertes Stock</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              (stats?.lowStockCount || 0) > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-3 font-mono ${
            (stats?.lowStockCount || 0) > 0 ? 'text-rose-600' : 'text-slate-900'
          }`}>
            {stats?.lowStockCount || 0} articles
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Sur un total de {stats?.totalProducts || 0} références
          </p>
        </div>

      </div>

      {/* Odoo Style Operations Kanban (directly mirroring video at 00:18 - 00:20) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#714B67]" />
            Opérations d'Inventaire (Aperçu Odoo)
          </h2>
          <Link to="/inventaire" className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-1">
            Voir tout l'inventaire <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Receptions Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Réceptions Fournisseurs
                </span>
                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
                  WH/IN
                </span>
              </div>
              <div className="py-4">
                <div className="text-3xl font-black text-slate-900 font-mono">
                  {stats?.pendingReceptions || 1}
                </div>
                <span className="text-xs text-slate-500">Opération(s) en attente de traitement</span>
              </div>
            </div>
            <Link
              to="/inventaire?tab=receptions"
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg text-center transition block shadow"
            >
              Traiter les Réceptions
            </Link>
          </div>

          {/* Deliveries Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Bons de Livraison
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">
                  WH/OUT
                </span>
              </div>
              <div className="py-4">
                <div className="text-3xl font-black text-slate-900 font-mono">
                  {stats?.pendingDeliveries || 1}
                </div>
                <span className="text-xs text-slate-500">Livraison(s) clients à préparer</span>
              </div>
            </div>
            <Link
              to="/inventaire?tab=livraisons"
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg text-center transition block shadow"
            >
              Préparer les Livraisons
            </Link>
          </div>

          {/* POS Sessions Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Point de Vente Caisse
                </span>
                <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded">
                  POS/MAROC
                </span>
              </div>
              <div className="py-4">
                <div className="text-3xl font-black text-[#714B67] font-mono">
                  {formatDH(stats?.posTodaySales || 0)}
                </div>
                <span className="text-xs text-slate-500">Recette totale caisse enregistrée</span>
              </div>
            </div>
            <Link
              to="/pos/caisse"
              className="mt-2 w-full bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs font-bold py-2 rounded-lg text-center transition block shadow"
            >
              Accéder au Terminal Caisse
            </Link>
          </div>

        </div>
      </div>

      {/* Recent Invoices & POS Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#714B67]" /> Dernières Factures
            </h3>
            <Link to="/facturation" className="text-xs text-[#714B67] hover:underline font-semibold">
              Toutes les factures →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stats?.recentInvoices && stats.recentInvoices.map((inv) => (
              <div key={inv._id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{inv.invoiceNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      inv.paymentStatus === 'paye'
                        ? 'bg-emerald-100 text-emerald-700'
                        : inv.paymentStatus === 'partiel'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {inv.paymentStatus === 'paye' ? 'Payé' : (inv.paymentStatus === 'partiel' ? 'Partiel' : 'Non payé')}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{inv.contactName} • {formatDate(inv.date)}</p>
                </div>
                <div className="text-right font-mono font-bold text-slate-900">
                  {formatDH(inv.totalAmount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent POS Tickets */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" /> Récents Tickets de Caisse
            </h3>
            <Link to="/pos" className="text-xs text-[#714B67] hover:underline font-semibold">
              Historique des ventes →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stats?.recentPosOrders && stats.recentPosOrders.map((order) => (
              <div key={order._id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{order.orderNumber}</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {order.clientName} • {order.items?.length || 0} article(s)
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-700 block">
                    {formatDH(order.total)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Reçu: {formatDH(order.amountReceived)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
