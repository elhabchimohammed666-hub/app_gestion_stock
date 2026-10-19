import React, { useState, useEffect } from 'react';
import { X, Truck, Check, Plus, Trash2 } from 'lucide-react';
import api from '../api';

export default function NewOperationModal({ isOpen, onClose, onCreated, defaultType = 'reception' }) {
  const [type, setType] = useState(defaultType);
  const [partners, setPartners] = useState([]);
  const [partnerId, setPartnerId] = useState('');
  const [products, setProducts] = useState([]);
  const [sourceLocation, setSourceLocation] = useState('Fournisseurs');
  const [destinationLocation, setDestinationLocation] = useState('WH/Stock');
  const [sourceDocument, setSourceDocument] = useState('');
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([
    { productId: '', productName: '', demandedQuantity: 10 }
  ]);

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      if (defaultType === 'reception') {
        setSourceLocation('Fournisseurs');
        setDestinationLocation('WH/Stock Central');
      } else if (defaultType === 'livraison') {
        setSourceLocation('WH/Stock Central');
        setDestinationLocation('Clients');
      } else {
        setSourceLocation('WH/Stock Central');
        setDestinationLocation('Shop 1 / Caisse');
      }
      fetchPartners(defaultType === 'reception' ? 'fournisseur' : 'client');
      fetchProducts();
    }
  }, [isOpen, defaultType]);

  const fetchPartners = async (pType) => {
    try {
      const res = await api.get(`/contacts?type=${pType}`);
      setPartners(res.data);
      if (res.data.length > 0) setPartnerId(res.data[0]._id);
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
        productName: selected.name
      };
    } else {
      newItems[index].productId = '';
      newItems[index].productName = '';
    }
    setItems(newItems);
  };

  const handleQuantityChange = (index, qty) => {
    const newItems = [...items];
    newItems[index].demandedQuantity = Number(qty);
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { productId: '', productName: '', demandedQuantity: 10 }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some(i => !i.productId || i.demandedQuantity <= 0)) {
      alert('Veuillez sélectionner les articles et des quantités valides');
      return;
    }

    try {
      setLoading(true);
      await api.post('/inventory/operations', {
        type,
        partnerId: partnerId || null,
        sourceLocation,
        destinationLocation,
        sourceDocument,
        items
      });
      onCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur création opération');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        
        <div className="bg-[#714B67] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold">
              Nouvelle Opération: {type === 'reception' ? 'Réception Marchandise (Stock In)' : (type === 'livraison' ? 'Bon de Livraison (Stock Out)' : 'Transfert Interne')}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {type === 'reception' ? 'Fournisseur' : (type === 'livraison' ? 'Client Destinataire' : 'Partenaire')}
              </label>
              <select
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className="w-full border rounded px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-[#714B67]"
              >
                <option value="">-- Aucun / Interne --</option>
                {partners.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Document Source</label>
              <input
                type="text"
                value={sourceDocument}
                onChange={(e) => setSourceDocument(e.target.value)}
                placeholder="Ex: BC/2026/089, FACT/2026/001"
                className="w-full border rounded px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Emplacement Source</label>
              <input
                type="text"
                value={sourceLocation}
                onChange={(e) => setSourceLocation(e.target.value)}
                className="w-full border rounded px-3 py-2 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Emplacement Destination</label>
              <input
                type="text"
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                className="w-full border rounded px-3 py-2 text-xs"
                required
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-slate-700">Articles à traiter</span>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-semibold text-[#714B67] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter un article
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto border p-2 rounded-lg bg-slate-50">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border">
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    className="flex-1 border rounded px-2 py-1 text-xs"
                    required
                  >
                    <option value="">-- Choisir le produit --</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} (Stock actuel: {p.stock})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.demandedQuantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    placeholder="Quantité"
                    className="w-24 border rounded px-2 py-1 text-xs text-center font-mono font-bold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#714B67] hover:bg-[#5b3c53] text-white rounded-md font-semibold shadow flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Création...' : 'Créer l’Opération'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
