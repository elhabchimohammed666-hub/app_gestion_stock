import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  User, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  Building2,
  FileText
} from 'lucide-react';
import api, { formatDH } from '../api';
import NewContactModal from '../components/NewContactModal';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all'); // 'all', 'client', 'fournisseur'
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [activeType, search]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      let url = `/contacts?type=${activeType}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium">Répertoire /</div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#714B67]" />
            Clients & Fournisseurs
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nouveau Contact
        </button>
      </div>

      {/* Control bar: type filter & search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex rounded-lg bg-slate-100 p-1 w-fit border border-slate-200">
          <button
            onClick={() => setActiveType('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeType === 'all'
                ? 'bg-white text-[#714B67] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous les contacts
          </button>
          <button
            onClick={() => setActiveType('client')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeType === 'client'
                ? 'bg-white text-[#714B67] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clients uniquement
          </button>
          <button
            onClick={() => setActiveType('fournisseur')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              activeType === 'fournisseur'
                ? 'bg-white text-[#714B67] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fournisseurs uniquement
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher contact, ICE, ville, téléphone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-[#714B67] focus:outline-none"
          />
        </div>
      </div>

      {/* Contacts Cards Grid (matching video at 00:01 - 00:15) */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#714B67]"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <Users className="w-12 h-12 stroke-1 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun contact trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact._id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#714B67] font-black text-sm flex items-center justify-center border border-purple-100 shadow-sm">
                      {contact.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1">
                        {contact.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        contact.type === 'client'
                          ? 'bg-blue-50 text-blue-700'
                          : contact.type === 'fournisseur'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-purple-50 text-[#714B67]'
                      }`}>
                        {contact.type === 'client' ? 'Client' : (contact.type === 'fournisseur' ? 'Fournisseur' : 'Client & Fournisseur')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  {contact.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{contact.city}{contact.address ? ` - ${contact.address}` : ''}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{contact.phone}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.ice && (
                    <div className="flex items-center gap-2 pt-1">
                      <Building2 className="w-3.5 h-3.5 text-[#714B67]" />
                      <span className="text-[11px] font-mono text-slate-700">ICE: <strong>{contact.ice}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Outstanding balance */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Solde dû:</span>
                <span className={`font-mono font-bold ${
                  contact.totalDue > 0 ? 'text-amber-600' : 'text-slate-600'
                }`}>
                  {formatDH(contact.totalDue || 0)}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* New Contact Modal */}
      <NewContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={fetchContacts}
        defaultType={activeType === 'fournisseur' ? 'fournisseur' : 'client'}
      />

    </div>
  );
}
