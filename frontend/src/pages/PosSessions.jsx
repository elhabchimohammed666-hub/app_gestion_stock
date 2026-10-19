import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Plus, Clock, User, CheckCircle2, ArrowRight } from 'lucide-react';
import api, { formatDH, formatDate } from '../api';

export default function PosSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSessionName, setNewSessionName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pos/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSession = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pos/sessions', {
        name: newSessionName || 'Caisse Principale',
        openingCash: 500,
        cashier: 'Mohamed Caisse'
      });
      setIsModalOpen(false);
      setNewSessionName('');
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur ouverture de session');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar matching Odoo */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium">Point de Vente /</div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-[#714B67]" />
            Sessions de Caisse (POS)
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Session de Caisse
        </button>
      </div>

      {/* Grid of Sessions (matching video at 00:20 - 00:22) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => {
          const isOpen = session.status === 'en_cours';
          return (
            <div
              key={session._id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {session.sessionNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    isOpen ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isOpen ? 'Session en cours' : 'Fermée'}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 mt-2">
                  {session.name}
                </h3>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Caissier: <strong>{session.cashier}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ouverture: {formatDate(session.openingDate)}</span>
                  </div>
                </div>

                {/* Sales stat */}
                <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Total Encaissé</span>
                    <span className="text-base font-black font-mono text-[#714B67]">
                      {formatDH(session.totalSales)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Tickets</span>
                    <span className="text-base font-bold font-mono text-slate-700">
                      {session.ordersCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="p-4 bg-slate-50/50">
                <Link
                  to={`/pos/caisse?session=${session._id}`}
                  className="w-full bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs font-bold py-2.5 rounded-lg shadow flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <span>{isOpen ? 'Continuer la Vente' : 'Consulter la Caisse'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          );
        })}
      </div>

      {/* New Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Ouvrir une Nouvelle Caisse</h3>
            <form onSubmit={handleOpenSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nom de la Caisse *</label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Ex: Caisse Snack 2, Comptoir Express..."
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#5b3c53] text-white rounded font-bold shadow"
                >
                  Ouvrir la Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
