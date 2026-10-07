import React from 'react';
import {
  Utensils,
  ShoppingCart,
  ClipboardList,
  Grid,
  FileText,
  Users,
  BarChart3,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const Sidebar = () => {
  const { user, logout, isOwner } = useAuth();
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'pos', label: 'POS / New Order', icon: ShoppingCart, roles: ['OWNER', 'WAITER'] },
    { id: 'orders', label: 'Active Orders', icon: ClipboardList, roles: ['OWNER', 'WAITER'] },
    { id: 'tables', label: 'Table Layout', icon: Grid, roles: ['OWNER', 'WAITER'] },
    { id: 'menu', label: 'Menu & Stock', icon: Utensils, roles: ['OWNER', 'WAITER'] },
    { id: 'billing', label: 'Billing & Receipts', icon: FileText, roles: ['OWNER', 'WAITER'] },
    { id: 'staff', label: 'Staff Management', icon: Users, roles: ['OWNER'] },
    { id: 'analytics', label: 'Owner Analytics', icon: BarChart3, roles: ['OWNER'] }
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Utensils size={24} />
        </div>
        <div>
          <div className="brand-title">DineMaster</div>
          <div className="brand-subtitle">POS & Billing</div>
        </div>
      </div>

      <ul className="nav-list">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id} className="nav-item">
              <button
                className={isActive ? 'active' : ''}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="nav-icon" />
                <span className="nav-text">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-user">
        <div className="user-card">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            <div style={{ overflow: 'hidden' }}>
              <div className="user-name">{user?.username}</div>
              <span className={`user-role-badge ${isOwner ? 'role-owner' : 'role-waiter'}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button className="icon-btn" onClick={logout} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
