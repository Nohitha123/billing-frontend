import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  Grid,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  PlusCircle
} from 'lucide-react';

export const POSOrderPage = () => {
  const { addToast, refreshTrigger, setActiveTab } = useApp();
  const { user } = useAuth();

  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);

  const [selectedTableId, setSelectedTableId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Cart: Array of { menuItem, quantity }
  const [cart, setCart] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      const [tRes, cRes, mRes, oRes] = await Promise.all([
        api.tables.list(),
        api.menu.listCategories(),
        api.menu.listItems({ available: true }),
        api.orders.listActive({ status: 'PENDING' })
      ]);
      setTables(tRes.data || []);
      setCategories(cRes.data || []);
      setMenuItems(mRes.data || []);
      setActiveOrders(oRes.data || []);

      if (tRes.data && tRes.data.length > 0 && !selectedTableId) {
        setSelectedTableId(tRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
      addToast('Error fetching POS data', 'danger');
    }
  };

  const selectedTable = tables.find((t) => t.id === Number(selectedTableId));
  const existingOrderForTable = activeOrders.find((o) => o.table_id === Number(selectedTableId) && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId, delta) => {
    setCart((prev) => {
      return prev.map((i) => {
        if (i.menuItem.id === itemId) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  const cartTotal = cart.reduce((sum, i) => sum + Number(i.menuItem.price) * i.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!selectedTableId) {
      addToast('Please select a table first', 'warning');
      return;
    }
    if (cart.length === 0) {
      addToast('Cart is empty. Add menu items to order', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (existingOrderForTable) {
        // 5.3 Add Items to Active Order: POST /api/orders/:id/add-items/
        const payload = {
          items: cart.map((i) => ({ menu_item_id: i.menuItem.id, quantity: i.quantity }))
        };
        await api.orders.addItems(existingOrderForTable.id, payload);
        addToast(`Added ${cart.length} item(s) to active Order #${existingOrderForTable.order_number}`, 'success');
      } else {
        // 5.1 Create Order: POST /api/orders/
        const payload = {
          table_id: Number(selectedTableId),
          items: cart.map((i) => ({ menu_item_id: i.menuItem.id, quantity: i.quantity })),
          notes: orderNotes
        };
        const res = await api.orders.create(payload);
        addToast(`Order #${res.data?.order_number || 'created'} placed for Table ${selectedTable?.table_number}!`, 'success');
      }

      setCart([]);
      setOrderNotes('');
      fetchData();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.detail || 'Failed to place order', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
      {/* Left Section: Table Selector + Menu Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Table Selector Bar */}
        <div className="glass-card">
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Grid size={16} /> SELECT TABLE FOR ORDER
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
            {tables.map((t) => {
              const isSelected = t.id === Number(selectedTableId);
              const hasOrder = activeOrders.some((o) => o.table_id === t.id && o.status !== 'COMPLETED');
              
              let statusClass = 'badge-available';
              if (t.status === 'OCCUPIED' || hasOrder) statusClass = 'badge-occupied';
              else if (t.status === 'RESERVED') statusClass = 'badge-reserved';

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? 'var(--shadow-glow)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>T-{t.table_number}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0' }}>Cap: {t.capacity}</div>
                  <span className={`badge ${statusClass}`} style={{ fontSize: '0.62rem', padding: '1px 4px' }}>
                    {hasOrder ? 'OCCUPIED' : t.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filters & Search */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search dishes or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Items
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`btn btn-sm ${selectedCategory === c.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: '0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ position: 'relative', height: '120px', background: '#1e293b' }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    padding: '2px 8px',
                    borderRadius: '8px'
                  }}
                >
                  ₹{Number(item.price).toFixed(2)}
                </span>
              </div>

              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                    {item.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '0.85rem' }}
                  onClick={() => addToCart(item)}
                >
                  <Plus size={15} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section: Order Cart & Summary */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', sticky: 'top', top: '90px' }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Order Cart {selectedTable ? `(Table #${selectedTable.table_number})` : ''}
            </h3>
            {existingOrderForTable && (
              <span className="badge badge-preparing" style={{ fontSize: '0.7rem' }}>
                Active Order #{existingOrderForTable.order_number}
              </span>
            )}
          </div>
          {existingOrderForTable && (
            <p style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
              ⚡ New items will be added to existing active order! (API 5.3)
            </p>
          )}
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
              <UtensilsCrossed size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No items in cart yet.</p>
              <p style={{ fontSize: '0.78rem' }}>Click "Add to Cart" on any menu dish.</p>
            </div>
          ) : (
            cart.map((cartItem) => (
              <div
                key={cartItem.menuItem.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{cartItem.menuItem.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>
                    ₹{Number(cartItem.menuItem.price).toFixed(2)} x {cartItem.quantity} = ₹{(Number(cartItem.menuItem.price) * cartItem.quantity).toFixed(2)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    className="icon-btn"
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => updateCartQuantity(cartItem.menuItem.id, -1)}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                    {cartItem.quantity}
                  </span>
                  <button
                    className="icon-btn"
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => updateCartQuantity(cartItem.menuItem.id, 1)}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Notes & Actions Footer */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
          {!existingOrderForTable && (
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                placeholder="Special notes (e.g., Extra spicy, less salt)..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, margin: '0.75rem 0' }}>
            <span>Total Payable:</span>
            <span style={{ color: 'var(--primary)' }}>₹{cartTotal.toFixed(2)}</span>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
            onClick={handlePlaceOrder}
            disabled={submitting || cart.length === 0}
          >
            {submitting ? (
              'Submitting Order...'
            ) : existingOrderForTable ? (
              <>
                <PlusCircle size={18} /> Add Items to Active Order (API 5.3)
              </>
            ) : (
              <>
                <Send size={18} /> Place Kitchen Order (API 5.1)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
