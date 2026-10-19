import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Boxes, 
  Package, 
  Truck, 
  ArrowRightLeft, 
  History, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Grid, 
  List,
  Check,
  Eye,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import api, { formatDH, formatDate } from '../api';
import NewProductModal from '../components/NewProductModal';
import NewOperationModal from '../components/NewOperationModal';

export default function Inventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [operations, setOperations] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & views
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [operationType, setOperationType] = useState('all');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [opModalType, setOpModalType] = useState('reception');

  useEffect(() => {
    fetchData();
  }, [currentTab, search, selectedCategory, operationType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (currentTab === 'overview') {
        const res = await api.get('/inventory/dashboard');
        setDashboardData(res.data);
      } else if (currentTab === 'products') {
        let url = `/products?search=${encodeURIComponent(search)}`;
        if (selectedCategory !== 'Tous') url += `&category=${encodeURIComponent(selectedCategory)}`;
        const res = await api.get(url);
        setProducts(res.data);
      } else if (currentTab === 'receptions') {
        const res = await api.get(`/inventory/operations?type=reception&search=${encodeURIComponent(search)}`);
        setOperations(res.data);
      } else if (currentTab === 'livraisons') {
        const res = await api.get(`/inventory/operations?type=livraison&search=${encodeURIComponent(search)}`);
        setOperations(res.data);
      } else if (currentTab === 'movements') {
        const res = await api.get(`/inventory/movements?search=${encodeURIComponent(search)}`);
        setMovements(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOperation = async (opId) => {
    if (!window.confirm('Confirmer la validation de cette opération ? Le stock sera mis à jour automatiquement.')) return;
    try {
      await api.put(`/inventory/operations/${opId}/validate`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium">Inventaire /</div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#714B67]" />
            Gestion des Stocks & Opérations
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {currentTab === 'products' ? (
            <button
              onClick={() => setIsProductModalOpen(true)}
              className="bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nouveau Produit
            </button>
          ) : currentTab === 'receptions' ? (
            <button
              onClick={() => {
                setOpModalType('reception');
                setIsOpModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Réception
            </button>
          ) : currentTab === 'livraisons' ? (
            <button
              onClick={() => {
                setOpModalType('livraison');
                setIsOpModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nouveau Bon de Livraison
            </button>
          ) : null}
        </div>
      </div>

      {/* Tabs navigation matching Odoo top sub-menu */}
      <div className="flex overflow-x-auto bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm gap-1 scrollbar-none text-xs font-semibold">
        <button
          onClick={() => setSearchParams({ tab: 'overview' })}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
            currentTab === 'overview'
              ? 'bg-[#714B67] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Vue d'ensemble
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'products' })}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
            currentTab === 'products'
              ? 'bg-[#714B67] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          Articles & Produits
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'receptions' })}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
            currentTab === 'receptions'
              ? 'bg-[#714B67] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          Réceptions Fournisseurs
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'livraisons' })}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
            currentTab === 'livraisons'
              ? 'bg-[#714B67] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Bons de Livraison
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'movements' })}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
            currentTab === 'movements'
              ? 'bg-[#714B67] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          Mouvements de Stock (Audit)
        </button>
      </div>

      {/* TAB 1: OVERVIEW KANBAN (Like in video at 00:18) */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Receptions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    Réceptions (Fournisseurs)
                  </h3>
                  <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    WH/IN
                  </span>
                </div>
                <div className="py-6">
                  <div className="text-4xl font-black text-slate-900 font-mono">
                    {dashboardData?.receptions?.toProcess || 0}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">À traiter / En attente</span>
                  <div className="mt-3 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{dashboardData?.receptions?.done || 0} réception(s) effectuées</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSearchParams({ tab: 'receptions' })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg shadow transition"
              >
                Gérer les Réceptions
              </button>
            </div>

            {/* Card 2: Deliveries */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Bons de Livraison (Clients)
                  </h3>
                  <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                    WH/OUT
                  </span>
                </div>
                <div className="py-6">
                  <div className="text-4xl font-black text-slate-900 font-mono">
                    {dashboardData?.livraisons?.toProcess || 0}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">À expédier / En attente</span>
                  <div className="mt-3 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{dashboardData?.livraisons?.done || 0} livraison(s) expédiées</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSearchParams({ tab: 'livraisons' })}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg shadow transition"
              >
                Gérer les Livraisons
              </button>
            </div>

            {/* Card 3: Internal Transfers */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    Transferts Internes
                  </h3>
                  <span className="text-[11px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                    WH/INT
                  </span>
                </div>
                <div className="py-6">
                  <div className="text-4xl font-black text-slate-900 font-mono">
                    {dashboardData?.transferts?.toProcess || 0}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Transfert(s) inter-dépôts</span>
                  <div className="mt-3 text-xs text-purple-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{dashboardData?.transferts?.done || 1} transfert(s) validé(s)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSearchParams({ tab: 'movements' })}
                className="w-full bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs font-bold py-2.5 rounded-lg shadow transition"
              >
                Consulter les Mouvements
              </button>
            </div>

          </div>

          {/* Quick links to Products & POS */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#714B67] text-white flex items-center justify-center shadow">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Gestion des Articles en Stock</h4>
                <p className="text-xs text-slate-500">
                  Consulter les fiches produits, prix de vente marocains, seuils d'alerte et valorisation du stock.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSearchParams({ tab: 'products' })}
              className="bg-[#714B67] text-white text-xs font-bold px-4 py-2 rounded-lg shadow hover:bg-[#5b3c53] transition"
            >
              Voir le Catalogue
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS CATALOG (Matching video at 00:21 - 00:23) */}
      {currentTab === 'products' && (
        <div className="space-y-4">
          
          {/* Controls: search, category pills, view toggle */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher produit, référence, code barre..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-[#714B67] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg border ${viewMode === 'grid' ? 'bg-[#714B67] text-white border-[#714B67]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                title="Vue Grille / Cartes"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg border ${viewMode === 'table' ? 'bg-[#714B67] text-white border-[#714B67]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                title="Vue Tableau"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid View (Matching video cards) */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const isLowStock = product.stock <= product.minStockAlert;
                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="h-36 bg-slate-100 relative overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Package className="w-10 h-10" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded">
                          {product.reference}
                        </span>
                        {isLowStock && (
                          <span className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            Stock Bas!
                          </span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="p-4 space-y-1.5">
                        <span className="text-[10px] text-purple-700 font-semibold uppercase tracking-wider block">
                          {product.category}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm line-clamp-1">
                          {product.name}
                        </h4>
                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-base font-black text-slate-900 font-mono">
                            {formatDH(product.price)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Coût: {formatDH(product.costPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock footer */}
                    <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Disponible:</span>
                      <span className={`font-mono font-bold ${
                        isLowStock ? 'text-rose-600' : 'text-emerald-700'
                      }`}>
                        {product.stock.toFixed(2)} {product.unit}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                    <tr>
                      <th className="py-3 px-4">Référence</th>
                      <th className="py-3 px-4">Nom de l'Article</th>
                      <th className="py-3 px-4">Catégorie</th>
                      <th className="py-3 px-4 text-right">Prix de Vente</th>
                      <th className="py-3 px-4 text-right">Coût</th>
                      <th className="py-3 px-4 text-center">En Stock</th>
                      <th className="py-3 px-4 text-center">Alerte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-[#714B67]">{p.reference}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                        <td className="py-3 px-4 text-slate-500">{p.category}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">{formatDH(p.price)}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-500">{formatDH(p.costPrice)}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span className={p.stock <= p.minStockAlert ? 'text-rose-600' : 'text-emerald-700'}>
                            {p.stock} {p.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {p.stock <= p.minStockAlert ? (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded">
                              Sous le seuil ({p.minStockAlert})
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Normal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 3 & 4: OPERATIONS (Receptions & Livraisons matching video at 00:20) */}
      {(currentTab === 'receptions' || currentTab === 'livraisons') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                <tr>
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Partenaire</th>
                  <th className="py-3 px-4">Emplacement Source</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Doc Source</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operations.map((op) => (
                  <tr key={op._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#714B67]">{op.reference}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{op.partnerName || '-'}</td>
                    <td className="py-3 px-4 text-slate-500">{op.sourceLocation}</td>
                    <td className="py-3 px-4 text-slate-500">{op.destinationLocation}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{op.sourceDocument || '-'}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(op.date)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        op.status === 'fait'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {op.status === 'fait' ? 'Fait / Validé' : 'Prêt / À traiter'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {op.status !== 'fait' ? (
                        <button
                          onClick={() => handleValidateOperation(op._id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 rounded shadow flex items-center gap-1 mx-auto transition"
                        >
                          <Check className="w-3 h-3" /> Valider
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Synchronisé</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: MOVEMENTS AUDIT LOG */}
      {currentTab === 'movements' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                <tr>
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Type Opération</th>
                  <th className="py-3 px-4">Document Réf.</th>
                  <th className="py-3 px-4 text-center">Variation</th>
                  <th className="py-3 px-4 text-center">Avant</th>
                  <th className="py-3 px-4 text-center">Nouveau Stock</th>
                  <th className="py-3 px-4">Emplacement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {movements.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600 font-sans">
                      {new Date(m.date).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 font-bold font-sans text-slate-800">
                      {m.productName}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] uppercase">
                        {m.operationType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#714B67] font-bold">
                      {m.referenceDoc}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-0.5 font-bold ${
                        m.quantityChanged > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {m.quantityChanged > 0 ? `+${m.quantityChanged}` : m.quantityChanged}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {m.previousStock}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {m.newStock}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500">
                      {m.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onCreated={fetchData}
      />

      <NewOperationModal
        isOpen={isOpModalOpen}
        onClose={() => setIsOpModalOpen(false)}
        onCreated={fetchData}
        defaultType={opModalType}
      />

    </div>
  );
}
