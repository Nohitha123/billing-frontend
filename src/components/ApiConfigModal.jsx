import React, { useState } from 'react';
import { Modal } from './Modal';
import { useApp } from '../context/AppContext';
import { Server, ToggleLeft, ToggleRight, Check, Link2, Info } from 'lucide-react';

export const ApiConfigModal = () => {
  const { showConfigModal, setShowConfigModal, apiUrl, updateApiUrl, demoMode, toggleDemoMode } = useApp();
  const [urlInput, setUrlInput] = useState(apiUrl);

  const handleSave = (e) => {
    e.preventDefault();
    updateApiUrl(urlInput);
    setShowConfigModal(false);
  };

  return (
    <Modal
      isOpen={showConfigModal}
      onClose={() => setShowConfigModal(false)}
      title="API Backend & Mode Settings"
      maxWidth="560px"
    >
      <form onSubmit={handleSave}>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={16} /> Backend Server Base URL
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. http://localhost:8000"
              required
            />
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Save
            </button>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            All REST API calls will target this origin (e.g. <code>{urlInput}/api/auth/login/</code>).
          </span>
        </div>

        <div
          className="glass-card"
          style={{
            padding: '1.2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>Demo / Mock Simulation Mode</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Enable to run offline with sample local storage state. Disable to connect directly to Django REST endpoints.
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleDemoMode()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: demoMode ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            {demoMode ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
          </button>
        </div>

        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <Info size={16} /> Registered Endpoints Map
          </div>
          <ul style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <li>🔑 <strong>Auth:</strong> <code>POST /api/auth/login/</code>, <code>POST /api/auth/logout/</code>, <code>POST /api/auth/register/</code>, <code>GET /api/auth/me/</code></li>
            <li>👥 <strong>Staff:</strong> <code>GET /api/staff/</code>, <code>POST /api/staff/</code></li>
            <li>🍽️ <strong>Menu:</strong> <code>GET /api/menu/categories/</code>, <code>GET /api/menu/items/</code>, <code>POST</code>, <code>PATCH</code>, <code>DELETE</code></li>
            <li>🪑 <strong>Tables:</strong> <code>GET /api/tables/</code>, <code>POST /api/tables/</code>, <code>PATCH update-status</code></li>
            <li>📝 <strong>Orders:</strong> <code>POST /api/orders/</code>, <code>GET active</code>, <code>POST add-items</code>, <code>PATCH update-status</code></li>
            <li>🧾 <strong>Billing:</strong> <code>POST generate-bill</code>, <code>POST pay</code>, <code>GET pdf</code></li>
            <li>📊 <strong>Analytics:</strong> <code>sales-summary</code>, <code>top-dishes</code>, <code>waiter-performance</code></li>
          </ul>
        </div>
      </form>
    </Modal>
  );
};
