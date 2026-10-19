import React, { useState } from 'react';
import { X, Package, Check } from 'lucide-react';
import api from '../api';

export default function NewProductModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('Restauration & Fast-Food');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [unit, setUnit] = useState('Unités');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const categories = [
    'Restauration & Fast-Food',
    'Boissons & Cafés',
    'Épicerie & Ingrédients',
    'Boulangerie & Pâtisserie',
    'Fournitures & Emballage'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/products', {
        name,
        reference: reference || `REF-${Date.now().toString().slice(-6)}`,
        barcode: barcode || reference,
        category,
        price: Number(price),
        costPrice: Number(costPrice || 0),
        stock: Number(stock || 0),
        minStockAlert: Number(minStockAlert || 5),
        unit,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60'
      });
      onCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l’ajout du produit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        <div className="bg-[#714B67] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold">Nouveau Produit / Article</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nom du Produit *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tacos Poulet Fromage, Thé à la menthe..."
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#714B67] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Référence (SKU) *</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: TAC-PCH-01"
                className="w-full border rounded-md px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-[#714B67]"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Code Barre (EAN)</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Ex: 61110001099"
                className="w-full border rounded-md px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Catégorie *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-[#714B67]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Unité de mesure</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-[#714B67]"
              >
                <option value="Unités">Unités</option>
                <option value="Portions">Portions</option>
                <option value="Plats">Plats</option>
                <option value="Kg">Kg</option>
                <option value="Litre">Litre</option>
                <option value="Canettes">Canettes</option>
                <option value="Bouteilles">Bouteilles</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Prix de Vente (DH) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="35.00"
                className="w-full border rounded-md px-3 py-2 text-sm font-bold font-mono text-emerald-700 focus:ring-2 focus:ring-[#714B67]"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Coût d'Achat (DH)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="18.00"
                className="w-full border rounded-md px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Quantité en Stock initiale</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Seuil Alerte Stock Bas</label>
              <input
                type="number"
                min="0"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">URL Image du Produit</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full border rounded-md px-3 py-2 text-xs focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-slate-600 hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#714B67] hover:bg-[#5b3c53] text-white rounded-md font-semibold shadow flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Enregistrement...' : 'Enregistrer le Produit'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
