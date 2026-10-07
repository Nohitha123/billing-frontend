import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Utensils, Plus, Edit, ToggleLeft, ToggleRight, Trash2, Search, DollarSign } from 'lucide-react';

export const MenuPage = () => {
  const { addToast, refreshTrigger } = useApp();
  const { isOwner } = useAuth();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditPriceModal, setShowEditPriceModal] = useState(false);
  const [targetItem, setTargetItem] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMenuData();
  }, [refreshTrigger]);

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const [cRes, iRes] = await Promise.all([
        api.menu.listCategories(),
        api.menu.listItems()
      ]);
      setCategories(cRes.data || []);
      setItems(iRes.data || []);
      if (cRes.data?.length > 0 && !category) {
        setCategory(cRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch menu items', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 3.3 Add Menu Item: POST /api/menu/items/
      await api.menu.addItem({
        category: Number(category),
        name,
        description,
        price,
        is_available: isAvailable
      });
      addToast(`Added "${name}" to menu!`, 'success');
      setShowAddModal(false);
      setName('');
      setDescription('');
      setPrice('');
      fetchMenuData();
    } catch (err) {
      console.error(err);
      addToast('Failed to add menu item', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    if (!targetItem) return;
    setSubmitting(true);
    try {
      // 3.4 Update Menu Item: PATCH /api/menu/items/:id/
      await api.menu.updateItem(targetItem.id, { price });
      addToast(`Updated price for "${targetItem.name}" to ₹${price}`, 'success');
      setShowEditPriceModal(false);
      setTargetItem(null);
      fetchMenuData();
    } catch (err) {
      console.error(err);
      addToast('Failed to update price', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStock = async (item) => {
    try {
      // 3.5 Toggle Dish Stock: PATCH /api/menu/items/:id/toggle-stock/
      await api.menu.toggleStock(item.id);
      addToast(`Toggled stock for "${item.name}"`, 'info');
      fetchMenuData();
    } catch (err) {
      console.error(err);
      addToast('Failed to toggle stock status', 'danger');
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    try {
      // 3.6 Delete Menu Item: DELETE /api/menu/items/:id/
      await api.menu.deleteItem(item.id);
      addToast(`Deleted "${item.name}"`, 'success');
      fetchMenuData();
    } catch (err) {
      console.error(err);
      addToast('Failed to delete item', 'danger');
    }
  };

  const openPriceModal = (item) => {
    setTargetItem(item);
    setPrice(item.price);
    setShowEditPriceModal(true);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Utensils size={22} style={{ color: 'var(--primary)' }} /> Menu Catalog & Stock Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage category items, update prices, toggle availability stock
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '220px' }}
              placeholder="Filter menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {isOwner && (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add Menu Item (Owner Only)
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading menu catalog...</div>
      ) : (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Dish Name</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Stock Status</th>
                {isOwner && <th style={{ textAlign: 'right' }}>Owner Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{item.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                      {item.category_name || `Category #${item.category}`}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>₹{Number(item.price).toFixed(2)}</strong>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${item.is_available ? 'btn-success' : 'btn-danger'}`}
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                      onClick={() => isOwner && handleToggleStock(item)}
                      disabled={!isOwner}
                      title={isOwner ? 'Click to toggle stock (API 3.5)' : 'Only owner can toggle stock'}
                    >
                      {item.is_available ? 'In Stock (Available)' : 'Out of Stock'}
                    </button>
                  </td>
                  {isOwner && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openPriceModal(item)}
                          title="Update Price (API 3.4)"
                        >
                          <Edit size={14} /> Price
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteItem(item)}
                          title="Delete Item (API 3.6)"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Item Modal (3.3 Owner Only) */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Menu Item (API 3.3)">
        <form onSubmit={handleAddItem}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Dish Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken Biryani"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short delicious description of dish..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="340.00"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Adding Dish...' : 'Add Dish to Menu'}
          </button>
        </form>
      </Modal>

      {/* Update Price Modal (3.4 Owner Only) */}
      <Modal isOpen={showEditPriceModal} onClose={() => setShowEditPriceModal(false)} title={`Update Price for "${targetItem?.name}" (API 3.4)`}>
        <form onSubmit={handleUpdatePrice}>
          <div className="form-group">
            <label className="form-label">New Price (₹)</label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="360.00"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Price'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
