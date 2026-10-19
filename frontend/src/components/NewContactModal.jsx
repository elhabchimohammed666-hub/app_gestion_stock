import React, { useState } from 'react';
import { X, Users, Check } from 'lucide-react';
import api from '../api';

export default function NewContactModal({ isOpen, onClose, onCreated, defaultType = 'client' }) {
  const [name, setName] = useState('');
  const [type, setType] = useState(defaultType);
  const [isCompany, setIsCompany] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [ice, setIce] = useState('');
  const [ifCode, setIfCode] = useState('');
  const [rc, setRc] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/contacts', {
        name,
        type,
        isCompany,
        email,
        phone,
        address,
        city,
        ice,
        if: ifCode,
        rc,
        notes
      });
      onCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la création du contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        <div className="bg-[#714B67] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold">Nouveau Contact ({type === 'client' ? 'Client' : 'Fournisseur'})</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="flex gap-4 p-2 bg-slate-50 rounded border">
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
              <input
                type="radio"
                name="contactType"
                checked={type === 'client'}
                onChange={() => setType('client')}
                className="text-[#714B67]"
              />
              Client
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
              <input
                type="radio"
                name="contactType"
                checked={type === 'fournisseur'}
                onChange={() => setType('fournisseur')}
                className="text-[#714B67]"
              />
              Fournisseur
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
              <input
                type="radio"
                name="contactType"
                checked={type === 'both'}
                onChange={() => setType('both')}
                className="text-[#714B67]"
              />
              Les deux
            </label>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nom ou Raison Sociale *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: SOCIÉTÉ ATLAS MAROC SARL ou M. ALAMI"
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#714B67] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Téléphone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212 522 00 00 00"
                className="w-full border rounded-md px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@entreprise.ma"
                className="w-full border rounded-md px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Ville</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Casablanca, Rabat, Tanger..."
                className="w-full border rounded-md px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Adresse</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Bd Mohammed V, N° 12..."
                className="w-full border rounded-md px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Moroccan legal identifiers */}
          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 space-y-2">
            <span className="font-bold text-slate-700 text-[11px] block">Identifiants Fiscaux Marocains</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-500 text-[10px] mb-0.5">ICE (15 chiffres)</label>
                <input
                  type="text"
                  value={ice}
                  onChange={(e) => setIce(e.target.value)}
                  placeholder="001523..."
                  className="w-full border rounded px-2 py-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] mb-0.5">Identifiant Fiscal (IF)</label>
                <input
                  type="text"
                  value={ifCode}
                  onChange={(e) => setIfCode(e.target.value)}
                  placeholder="401928..."
                  className="w-full border rounded px-2 py-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] mb-0.5">Registre Commerce (RC)</label>
                <input
                  type="text"
                  value={rc}
                  onChange={(e) => setRc(e.target.value)}
                  placeholder="83920 CASA"
                  className="w-full border rounded px-2 py-1 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
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
              {loading ? 'Création...' : 'Créer le Contact'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
