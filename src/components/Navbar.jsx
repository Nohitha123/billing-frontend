import React from 'react';
import { Settings, RefreshCw, Sparkles, Server, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { demoMode, toggleDemoMode, triggerRefresh, setShowConfigModal, activeTab } = useApp();
  const { user } = useAuth();

  const tabTitles = {
    pos: { title: 'POS / New Order', subtitle: 'Select table, pick menu items, and place order' },
    orders: { title: 'Order Kitchen Display System', subtitle: 'Track and manage order statuses in real-time' },
    tables: { title: 'Table Management', subtitle: 'Monitor seating availability and table reservations' },
    menu: { title: 'Menu & Category Inventory', subtitle: 'Manage menu items, prices, and stock availability' },
    billing: { title: 'Billing & Receipt Generation', subtitle: 'Generate tax invoices, payment processing & PDF receipts' },
    staff: { title: 'Staff & Waiter Management', subtitle: 'Owner Control: Create waiter accounts and manage access' },
    analytics: { title: 'Owner Sales & Analytics', subtitle: 'Executive overview of revenue, top dishes & staff performance' }
  };

  const currentInfo = tabTitles[activeTab] || { title: 'Dashboard', subtitle: 'Restaurant Billing Portal' };

  return (
    <header className="top-navbar">
      <div className="page-title-group">
        <h1>{currentInfo.title}</h1>
        <p>{currentInfo.subtitle}</p>
      </div>

      <div className="nav-actions">
        <button
          className={`mode-toggle-btn ${demoMode ? 'mode-demo' : 'mode-live'}`}
          onClick={() => toggleDemoMode()}
          title="Click to toggle between Demo Local State & Live Django Backend API"
        >
          {demoMode ? <Zap size={15} /> : <Server size={15} />}
          <span>{demoMode ? 'Demo Mock Mode' : 'Live Backend Mode'}</span>
        </button>

        <button className="icon-btn" onClick={triggerRefresh} title="Refresh Data">
          <RefreshCw size={18} />
        </button>

        <button className="icon-btn" onClick={() => setShowConfigModal(true)} title="API Settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
