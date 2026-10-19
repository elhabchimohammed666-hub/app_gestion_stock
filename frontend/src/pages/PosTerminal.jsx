import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Store, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  CreditCard, 
  Banknote, 
  X, 
  Check, 
  Layers, 
  ArrowLeft,
  ShoppingBag,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import api, { formatDH } from '../api';
import ReceiptModal from '../components/ReceiptModal';

export default function PosTerminal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState({ _id: null, name: 'Client Comptoir' });
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Espèces');
  const [amountReceived, setAmountReceived] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchContacts();
  }, [selectedCategory, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/pos/products?search=${encodeURIComponent(search)}`;
      if (selectedCategory !== 'Tous') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      const res = await api.get(url);
      setProducts(res.data);

      // Extract unique categories
      const distinctCats = ['Tous', ...new Set(res.data.map(p => p.category))];
      if (categories.length <= 1) {
        setCategories(distinctCats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts?type=client');
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Add product to cart
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product._id);
      if (existing) {
        return prevCart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            productId: product._id,
            productName: product.name,
            quantity: 1,
            unitPrice: product.price,
            discount: 0,
            subtotal: product.price,
            stock: product.stock
          }
        ];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, subtotal: newQty * item.unitPrice }
              : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm('Voulez-vous vider la commande actuelle ?')) {
      setCart([]);
    }
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartTotal = cartSubtotal; // In Moroccan POS, retail prices are TTC

  // Payment handling
  const openPaymentModal = () => {
    if (cart.length === 0) return;
    setAmountReceived(cartTotal.toFixed(2));
    setPaymentMethod('Espèces');
    setIsPaymentModalOpen(true);
  };

  const handleNumpadInput = (val) => {
    if (val === 'C') {
      setAmountReceived('');
    } else if (val === 'backspace') {
      setAmountReceived((prev) => prev.slice(0, -1));
    } else if (val === '.') {
      if (!amountReceived.includes('.')) {
        setAmountReceived((prev) => (prev ? prev + '.' : '0.'));
      }
    } else {
      setAmountReceived((prev) => (prev === '0' ? String(val) : prev + String(val)));
    }
  };

  const handleAddQuickCash = (extra) => {
    const current = Number(amountReceived) || 0;
    setAmountReceived((current + extra).toFixed(2));
  };

  const receivedNum = Number(amountReceived) || 0;
  const changeGiven = Math.max(0, receivedNum - cartTotal);

  const handleValidateOrder = async () => {
    if (receivedNum < cartTotal - 0.01) {
      alert('Le montant reçu est inférieur au total à payer !');
      return;
    }

    try {
      setProcessingPayment(true);
      const res = await api.post('/pos/orders', {
        sessionId: sessionId || null,
        clientId: selectedClient._id || null,
        items: cart,
        amountReceived: receivedNum,
        paymentMethod,
        cashier: 'Mohamed Caisse'
      });

      setCompletedOrder(res.data.order);
      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
      setCart([]);
      fetchProducts(); // Refresh stock counts in background
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la validation du paiement');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-[calc(100vh-3.5rem)] flex flex-col bg-slate-100">
      
      {/* POS Top Bar */}
      <header className="bg-[#714B67] text-white px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/pos')}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Sessions
          </button>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-wide">
              TERMINAL DE CAISSE POS
            </span>
            <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
              EN LIGNE
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full text-purple-200">
            <User className="w-3.5 h-3.5" />
            <span>Caissier: <strong>Mohamed Caisse</strong></span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xs bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-md transition"
          >
            Quitter Caisse
          </button>
        </div>
      </header>

      {/* Main Terminal Split View (matching video at 00:23 - 00:26) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT / CENTER: Products Grid & Categories */}
        <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 space-y-3">
          
          {/* Categories Horizontal Tabs */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5 flex-nowrap">
              {['Tous', 'Restauration & Fast-Food', 'Boissons & Cafés', 'Épicerie & Ingrédients', 'Boulangerie & Pâtisserie'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition shadow-sm ${
                    selectedCategory === cat
                      ? 'bg-[#714B67] text-white shadow'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick search input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher produit..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-[#714B67] focus:outline-none"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#714B67]"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <ShoppingBag className="w-12 h-12 stroke-1 mb-2" />
                <p className="text-sm">Aucun produit disponible</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {products.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  return (
                    <button
                      key={product._id}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      disabled={isOutOfStock}
                      className={`group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition text-left flex flex-col justify-between active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="relative h-28 bg-slate-100 overflow-hidden w-full">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-sm text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded">
                          {product.stock} dispo
                        </span>
                      </div>

                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight">
                          {product.name}
                        </span>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-black text-[#714B67] font-mono">
                            {formatDH(product.price)}
                          </span>
                          <span className="w-6 h-6 rounded-full bg-purple-50 group-hover:bg-[#714B67] group-hover:text-white text-[#714B67] flex items-center justify-center text-xs font-bold transition">
                            +
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT: Cart & Ticket Summary (matching video at 00:23 - 00:25) */}
        <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col justify-between shadow-xl">
          
          {/* Cart Header */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-[#714B67] text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-[#714B67]" />
              <span className="truncate max-w-[150px]">{selectedClient.name}</span>
            </button>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 p-1"
                title="Vider le panier"
              >
                <Trash2 className="w-3.5 h-3.5" /> Vider
              </button>
            )}
          </div>

          {/* Order items list */}
          <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <ShoppingBag className="w-12 h-12 stroke-1 mb-2 opacity-60" />
                <p className="text-sm font-semibold">Le panier est vide</p>
                <p className="text-xs text-slate-400 mt-1">Sélectionnez des articles pour commencer</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="py-2.5 flex items-center justify-between text-xs gap-2">
                  <div className="flex-1 pr-1">
                    <p className="font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                    <p className="text-slate-400 font-mono text-[10px]">
                      {Number(item.unitPrice).toFixed(2)} DH / u
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-6 h-6 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold shadow-sm transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold font-mono text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="w-6 h-6 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold shadow-sm transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="w-18 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatDH(item.subtotal)}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Bottom Summary & Checkout Button */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Articles ({cart.reduce((sum, i) => sum + i.quantity, 0)}):</span>
                <span className="font-mono">{formatDH(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Net:</span>
                <span className="text-[#714B67] font-mono text-lg">{formatDH(cartTotal)}</span>
              </div>
            </div>

            {/* Big Payment Button (matching video at 00:23) */}
            <button
              onClick={openPaymentModal}
              disabled={cart.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-base py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Banknote className="w-5 h-5" />
              <span>PAIEMENT ({formatDH(cartTotal)})</span>
            </button>
          </div>

        </div>

      </div>

      {/* MODAL 1: PAYMENT SCREEN (Directly matching video at 00:24 - 00:26) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            
            {/* Payment header */}
            <div className="bg-[#714B67] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-amber-300" />
                <h3 className="font-extrabold text-base">Règlement de la Commande</h3>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Payment Methods selector (matching video: Espèces, Banque, Compte client) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Mode de Paiement
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Espèces', 'Carte bancaire', 'Virement / Chèque', 'Compte client'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                        paymentMethod === m
                          ? 'bg-[#714B67] text-white border-[#714B67] shadow'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total & Change Display */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center font-mono">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">À Payer</span>
                  <span className="text-lg font-black text-slate-900">{formatDH(cartTotal)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Montant Reçu</span>
                  <span className="text-lg font-black text-emerald-700">{formatDH(receivedNum)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Monnaie à Rendre</span>
                  <span className={`text-lg font-black ${changeGiven > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {formatDH(changeGiven)}
                  </span>
                </div>
              </div>

              {/* Quick Cash Buttons (+10, +20, +50, +100, +200 DH) */}
              {paymentMethod === 'Espèces' && (
                <div>
                  <span className="text-xs text-slate-500 font-semibold block mb-1.5">Billets Rapides (DH):</span>
                  <div className="flex flex-wrap gap-2">
                    {[10, 20, 50, 100, 200].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleAddQuickCash(amt)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        +{amt} DH
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmountReceived(cartTotal.toFixed(2))}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-lg transition ml-auto"
                    >
                      Montant Exact
                    </button>
                  </div>
                </div>
              )}

              {/* Numpad Input (matching video keypad) */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '.', 'C'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNumpadInput(key)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-lg py-3 rounded-xl border border-slate-200 shadow-sm transition active:scale-95"
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleValidateOrder}
                  disabled={processingPayment || receivedNum < cartTotal - 0.01}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <Check className="w-5 h-5" />
                  {processingPayment ? 'Enregistrement...' : 'Valider & Imprimer'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: CLIENT SELECTOR */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Sélectionner un Client</h3>
              <button onClick={() => setIsClientModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedClient({ _id: null, name: 'Client Comptoir' });
                  setIsClientModalOpen(false);
                }}
                className={`w-full p-2.5 rounded-lg border text-left text-xs font-semibold transition ${
                  !selectedClient._id ? 'border-[#714B67] bg-purple-50 text-[#714B67]' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                👤 Client Comptoir (Anonyme)
              </button>

              {contacts.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => {
                    setSelectedClient(c);
                    setIsClientModalOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs font-semibold transition ${
                    selectedClient._id === c._id ? 'border-[#714B67] bg-purple-50 text-[#714B67]' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-slate-800">{c.name}</p>
                  <p className="text-[10px] text-slate-400 font-normal">{c.phone || c.email || c.city}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsClientModalOpen(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: RECEIPT MODAL (Matching video 00:27 - 00:29) */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={completedOrder}
        onNewOrder={() => {
          setCart([]);
          setSelectedClient({ _id: null, name: 'Client Comptoir' });
        }}
      />

    </div>
  );
}
