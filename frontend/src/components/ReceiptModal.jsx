import React from 'react';
import { CheckCircle2, Printer, X, PlusCircle } from 'lucide-react';
import { formatDH, formatDate } from '../api';

export default function ReceiptModal({ isOpen, onClose, order, onNewOrder }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top success header */}
        <div className="bg-emerald-600 text-white p-4 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full hover:bg-emerald-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">Paiement Réussi !</h3>
          <p className="text-xs text-emerald-100 mt-0.5">La commande a été enregistrée et le stock actualisé.</p>
        </div>

        {/* Receipt paper view (identical to the video at 00:27) */}
        <div className="p-6 bg-slate-50">
          <div 
            id="printable-receipt" 
            className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm font-mono text-xs text-slate-800 space-y-3"
          >
            {/* Store header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-sm font-black uppercase tracking-wider">ODOO SERVICE MAROC</h2>
              <p className="text-[11px] text-slate-500">Magasin & Restauration Casablanca</p>
              <p className="text-[10px] text-slate-400">ICE: 002341908000088 | IF: 51203948</p>
              <p className="text-[10px] text-slate-400">Tél: +212 522 98 44 10</p>
            </div>

            {/* Ticket meta info */}
            <div className="flex justify-between text-[11px] border-b border-dashed border-slate-200 pb-2">
              <div>
                <span className="font-bold">Ticket: </span>{order.orderNumber}
              </div>
              <div className="text-right">
                <span className="font-bold">Date: </span>{new Date(order.date || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} {formatDate(order.date || Date.now())}
              </div>
            </div>

            <div className="text-[11px] text-slate-600">
              <span>Client: <strong>{order.clientName || 'Client Comptoir'}</strong></span>
              <br />
              <span>Caissier: <strong>{order.cashier || 'Mohamed Caisse'}</strong></span>
            </div>

            {/* Itemized list */}
            <div className="pt-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-300 text-[10px] uppercase text-slate-400">
                    <th className="py-1">Article</th>
                    <th className="py-1 text-center">Qté</th>
                    <th className="py-1 text-right">P.U</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {order.items && order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-medium pr-1">{item.productName}</td>
                      <td className="py-1.5 text-center">{item.quantity}</td>
                      <td className="py-1.5 text-right whitespace-nowrap">{Number(item.unitPrice).toFixed(2)}</td>
                      <td className="py-1.5 text-right font-semibold whitespace-nowrap">{Number(item.subtotal).toFixed(2)} DH</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation summary */}
            <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Sous-total:</span>
                <span>{formatDH(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>TVA (Inclus):</span>
                <span>{formatDH(order.taxAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span className="text-emerald-700">{formatDH(order.total)}</span>
              </div>
            </div>

            {/* Payment details matching video */}
            <div className="pt-2 border-t border-dashed border-slate-200 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>Mode de règlement:</span>
                <span className="font-bold">{order.paymentMethod || 'Espèces'}</span>
              </div>
              <div className="flex justify-between">
                <span>Montant reçu:</span>
                <span>{formatDH(order.amountReceived)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900">
                <span>Monnaie rendue:</span>
                <span className="text-amber-600">{formatDH(order.changeGiven)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 text-center text-[10px] text-slate-400 border-t border-dashed border-slate-200">
              <p className="font-semibold text-slate-600">MERCI DE VOTRE VISITE !</p>
              <p>Logiciel Odoo Service Maroc - Système certifié</p>
            </div>

          </div>
        </div>

        {/* Modal actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#714B67] hover:bg-[#5b3c53] text-white py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Imprimer le Ticket
          </button>
          <button
            onClick={() => {
              if (onNewOrder) onNewOrder();
              onClose();
            }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Nouvelle Commande
          </button>
        </div>

      </div>
    </div>
  );
}
