import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, FileText } from 'lucide-react';
import api, { formatDH } from '../api';

export default function NewInvoiceModal({ isOpen, onClose, onCreated, defaultType = 'client' }) {
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [type, setType] = useState(defaultType);
  const [contactId, setContactId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [salesperson, setSalesperson] = useState('Administrateur');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([
    { productId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 20 }
  ]);

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      fetchContacts(defaultType);
      fetchProducts();
      // Default due date: +30 days
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split('T')[0]);
    }
  }, [isOpen, defaultType]);

  const fetchContacts = async (contactType) => {
    try {
      const res = await api.get(`/contacts?type=${contactType}`);
      setContacts(res.data);
      if (res.data.length > 0) {
        setContactId(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductChange = (index, prodId) => {
    const selected = products.find(p => p._id === prodId);
    const newItems = [...items];
    if (selected) {
      newItems[index] = {
        ...newItems[index],
        productId: selected._id,
        reference: selected.reference,
        description: selected.name,
        unitPrice: type === 'client' ? selected.price : selected.costPrice,
        taxRate: selected.taxRate || 20
      };
    } else {
      newItems[index].productId = '';
    }
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { productId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 20 }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  const taxTotal = items.reduce((acc, item) => {
    const lineSub = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    return acc + (lineSub * Number(item.taxRate || 20) / 100);
  }, 0);
  const totalAmount = subtotal + taxTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactId) {
      alert('Veuillez sélectionner un partenaire');
      return;
    }
    if (items.some(i => !i.description || i.quantity <= 0)) {
      alert('Veuillez renseigner toutes les lignes de la facture correctement');
      return;
    }

    try {
      setLoading(true);
      await api.post('/invoices', {
        type,
        contactId,
        dueDate,
        salesperson,
        items,
        notes
      });
      onCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création de la facture');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#714B67] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg font-bold">
              Nouvelle Facture {type === 'client' ? 'Client' : 'Fournisseur'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {type === 'client' ? 'Client' : 'Fournisseur'} *
              </label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                required
              >
                {contacts.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.city ? `(${c.city})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Date d'échéance *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Vendeur / Responsable
              </label>
              <input
                type="text"
                value={salesperson}
                onChange={(e) => setSalesperson(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#714B67] focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-700">Lignes de la Facture</h3>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-semibold text-[#714B67] hover:text-[#5b3c53] flex items-center gap-1 bg-purple-50 px-2.5 py-1.5 rounded border border-purple-200 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Article</th>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5 w-20 text-center">Qté</th>
                    <th className="p-2.5 w-28 text-right">Prix Unitaire (DH)</th>
                    <th className="p-2.5 w-20 text-center">TVA %</th>
                    <th className="p-2.5 w-28 text-right">Total HT</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => {
                    const lineHT = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                    return (
                      <tr key={index} className="hover:bg-slate-50/80">
                        <td className="p-2 min-w-[160px]">
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductChange(index, e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs bg-white"
                          >
                            <option value="">-- Choisir un produit --</option>
                            {products.map(p => (
                              <option key={p._id} value={p._id}>{p.name} ({p.reference})</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 min-w-[200px]">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Description..."
                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-center"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-right font-mono"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={item.taxRate}
                            onChange={(e) => handleItemChange(index, 'taxRate', e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-center"
                          >
                            <option value="20">20%</option>
                            <option value="14">14%</option>
                            <option value="10">10%</option>
                            <option value="0">0%</option>
                          </select>
                        </td>
                        <td className="p-2 text-right font-mono font-semibold text-slate-800">
                          {formatDH(lineHT)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="text-slate-400 hover:text-rose-600 transition p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-200">
            <div className="w-full sm:w-1/2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Conditions de paiement & Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Paiement à 30 jours fin de mois, RIB BMCE 011..."
                rows="3"
                className="w-full border border-slate-300 rounded-md p-2 text-xs focus:ring-2 focus:ring-[#714B67] focus:outline-none"
              ></textarea>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total HT:</span>
                <span className="font-mono">{formatDH(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total TVA (20%):</span>
                <span className="font-mono">{formatDH(taxTotal)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-300">
                <span>Total TTC:</span>
                <span className="text-[#714B67] font-mono">{formatDH(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#714B67] hover:bg-[#5b3c53] text-white rounded-md text-sm font-semibold shadow flex items-center gap-2 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Création...' : 'Créer la Facture'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
