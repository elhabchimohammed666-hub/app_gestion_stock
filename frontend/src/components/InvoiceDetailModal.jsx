import React, { useState } from 'react';
import { X, Check, CreditCard, Printer, FileText, Calendar, Building, AlertCircle } from 'lucide-react';
import api, { formatDH, formatDate } from '../api';

export default function InvoiceDetailModal({ isOpen, onClose, invoice, onUpdated }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Virement bancaire');
  const [payRef, setPayRef] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !invoice) return null;

  const remaining = invoice.totalAmount - (invoice.amountPaid || 0);

  const handleValidate = async () => {
    try {
      setLoading(true);
      await api.put(`/invoices/${invoice._id}/validate`);
      onUpdated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayModal = () => {
    setPayAmount(remaining > 0 ? remaining.toFixed(2) : '0');
    setShowPaymentModal(true);
  };

  const handleRegisterPayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(`/invoices/${invoice._id}/pay`, {
        amount: Number(payAmount),
        paymentMethod,
        reference: payRef
      });
      setShowPaymentModal(false);
      onUpdated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l’enregistrement du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header toolbar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-extrabold text-[#714B67] text-lg font-mono">
              {invoice.invoiceNumber}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
              invoice.status === 'comptabilise'
                ? 'bg-purple-100 text-[#714B67] border border-purple-200'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {invoice.status}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
              invoice.paymentStatus === 'paye'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : invoice.paymentStatus === 'partiel'
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'bg-rose-100 text-rose-700 border border-rose-300'
            }`}>
              {invoice.paymentStatus === 'paye' ? 'Payé' : (invoice.paymentStatus === 'partiel' ? 'Partiel' : 'Non payé')}
            </span>
          </div>
          
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center gap-2">
          {invoice.status === 'brouillon' && (
            <button
              onClick={handleValidate}
              disabled={loading}
              className="bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow flex items-center gap-1.5 transition"
            >
              <Check className="w-3.5 h-3.5" /> Comptabiliser
            </button>
          )}

          {invoice.status === 'comptabilise' && invoice.paymentStatus !== 'paye' && (
            <button
              onClick={handleOpenPayModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow flex items-center gap-1.5 transition"
            >
              <CreditCard className="w-3.5 h-3.5" /> Enregistrer un paiement
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ml-auto"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimer
          </button>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          
          {/* Parties */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Émetteur</span>
              <h2 className="text-base font-extrabold text-slate-800 mt-1">ODOO SERVICE MAROC SARL</h2>
              <p className="text-xs text-slate-500">Bd Zerktouni, Casablanca, Maroc</p>
              <p className="text-xs text-slate-500">ICE: 002341908000088 | IF: 51203948</p>
            </div>
            
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                {invoice.type === 'client' ? 'Client / Facturé à' : 'Fournisseur'}
              </span>
              <h3 className="text-base font-extrabold text-[#714B67] mt-1">{invoice.contactName}</h3>
              {invoice.contact && (
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>{invoice.contact.address || 'Maroc'}</p>
                  {invoice.contact.ice && <p>ICE: {invoice.contact.ice}</p>}
                  {invoice.contact.phone && <p>Tél: {invoice.contact.phone}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Dates & Reference */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Date de Facture:</span>
              <p className="font-bold text-slate-800">{formatDate(invoice.date)}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Date d'Échéance:</span>
              <p className="font-bold text-slate-800">{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Vendeur:</span>
              <p className="font-bold text-slate-800">{invoice.salesperson || 'Administrateur'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Article & Description</th>
                  <th className="p-2.5 text-center">Qté</th>
                  <th className="p-2.5 text-right">Prix Unitaire</th>
                  <th className="p-2.5 text-center">TVA</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items && invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5">
                      <p className="font-semibold text-slate-800">{item.description}</p>
                      {item.reference && <span className="text-[10px] text-slate-400 font-mono">{item.reference}</span>}
                    </td>
                    <td className="p-2.5 text-center">{item.quantity}</td>
                    <td className="p-2.5 text-right font-mono">{formatDH(item.unitPrice)}</td>
                    <td className="p-2.5 text-center">{item.taxRate}%</td>
                    <td className="p-2.5 text-right font-mono font-semibold">{formatDH(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total HT:</span>
                <span className="font-mono">{formatDH(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total TVA (20%):</span>
                <span className="font-mono">{formatDH(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Total TTC:</span>
                <span className="font-mono text-[#714B67]">{formatDH(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-100">
                <span>Montant Payé:</span>
                <span className="font-mono">{formatDH(invoice.amountPaid || 0)}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-bold pt-1 border-t border-slate-200">
                <span>Reste à Payer:</span>
                <span className="font-mono">{formatDH(remaining)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Register Payment Sub-modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-800 text-sm">Enregistrer un Paiement</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterPayment} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Montant à encaisser (DH) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    max={remaining}
                    className="w-full border rounded px-3 py-2 text-sm font-bold font-mono focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Reste dû: {formatDH(remaining)}</span>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mode de Paiement *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-[#714B67]"
                  >
                    <option value="Espèces">Espèces (Caisse)</option>
                    <option value="Virement bancaire">Virement bancaire</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Carte bancaire">Carte bancaire (TPE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Référence du paiement</label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="Ex: VIR-BMCE-2026, CHQ-9912..."
                    className="w-full border rounded px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold shadow"
                  >
                    {loading ? 'Validation...' : 'Valider Paiement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
