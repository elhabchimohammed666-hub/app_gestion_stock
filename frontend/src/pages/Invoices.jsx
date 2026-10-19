import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  CreditCard
} from 'lucide-react';
import api, { formatDH, formatDate } from '../api';
import NewInvoiceModal from '../components/NewInvoiceModal';
import InvoiceDetailModal from '../components/InvoiceDetailModal';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('client'); // 'client' or 'fournisseur'
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'paye', 'non_paye', 'partiel'
  const [search, setSearch] = useState('');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [activeTab, paymentFilter, search]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      let url = `/invoices?type=${activeTab}`;
      if (paymentFilter !== 'all') {
        url += `&paymentStatus=${paymentFilter}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await api.get(url);
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (invoiceId) => {
    try {
      const res = await api.get(`/invoices/${invoiceId}`);
      setSelectedInvoice(res.data.invoice);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header bar with Odoo Breadcrumb & Action Button */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium">Facturation /</div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#714B67]" />
            {activeTab === 'client' ? 'Factures Clients' : 'Factures Fournisseurs'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Créer une Facture
          </button>
        </div>
      </div>

      {/* Control bar: Type Tabs, Payment status filter, Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Main type toggle (Client vs Fournisseur) */}
          <div className="flex rounded-lg bg-slate-100 p-1 w-fit border border-slate-200">
            <button
              onClick={() => setActiveTab('client')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                activeTab === 'client'
                  ? 'bg-white text-[#714B67] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Factures Clients
            </button>
            <button
              onClick={() => setActiveTab('fournisseur')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                activeTab === 'fournisseur'
                  ? 'bg-white text-[#714B67] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Factures Fournisseurs
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par numéro, partenaire, vendeur..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-[#714B67] focus:outline-none transition"
            />
          </div>

        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Statut paiement:
          </span>
          <button
            onClick={() => setPaymentFilter('all')}
            className={`px-2.5 py-1 rounded-full font-medium ${
              paymentFilter === 'all' ? 'bg-[#714B67] text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setPaymentFilter('paye')}
            className={`px-2.5 py-1 rounded-full font-medium ${
              paymentFilter === 'paye' ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Payé
          </button>
          <button
            onClick={() => setPaymentFilter('partiel')}
            className={`px-2.5 py-1 rounded-full font-medium ${
              paymentFilter === 'partiel' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Partiel
          </button>
          <button
            onClick={() => setPaymentFilter('non_paye')}
            className={`px-2.5 py-1 rounded-full font-medium ${
              paymentFilter === 'non_paye' ? 'bg-rose-600 text-white font-bold' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Non payé
          </button>
        </div>
      </div>

      {/* Main Table view (identical to video at 00:00 - 00:15) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date de Facture</th>
                <th className="py-3 px-4">Numéro</th>
                <th className="py-3 px-4">{activeTab === 'client' ? 'Client' : 'Fournisseur'}</th>
                <th className="py-3 px-4">Échéance</th>
                <th className="py-3 px-4">Vendeur</th>
                <th className="py-3 px-4 text-right">Montant HT</th>
                <th className="py-3 px-4 text-right">Montant Total</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Paiement</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    Chargement des factures...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    Aucune facture trouvée pour ces critères.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr 
                    key={inv._id}
                    onClick={() => handleRowClick(inv._id)}
                    className="hover:bg-purple-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {formatDate(inv.date)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#714B67] whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {inv.contactName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {inv.salesperson || 'Administrateur'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                      {formatDH(inv.subtotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatDH(inv.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        inv.status === 'comptabilise'
                          ? 'bg-purple-100 text-[#714B67]'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inv.paymentStatus === 'paye'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : inv.paymentStatus === 'partiel'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          inv.paymentStatus === 'paye' ? 'bg-emerald-600' : (inv.paymentStatus === 'partiel' ? 'bg-amber-600' : 'bg-rose-600')
                        }`}></span>
                        {inv.paymentStatus === 'paye' ? 'Payé' : (inv.paymentStatus === 'partiel' ? 'Partiel' : 'Non payé')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleRowClick(inv._id)}
                        className="text-slate-400 hover:text-[#714B67] p-1.5 rounded-full hover:bg-slate-100 transition"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <NewInvoiceModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={fetchInvoices}
        defaultType={activeTab}
      />

      <InvoiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        invoice={selectedInvoice}
        onUpdated={fetchInvoices}
      />

    </div>
  );
}
