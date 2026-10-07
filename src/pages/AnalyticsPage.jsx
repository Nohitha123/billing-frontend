import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Award, Users, ShieldAlert } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const AnalyticsPage = () => {
  const { addToast, refreshTrigger } = useApp();
  const { isOwner } = useAuth();

  const [salesSummary, setSalesSummary] = useState(null);
  const [topDishes, setTopDishes] = useState([]);
  const [waiterPerformance, setWaiterPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [refreshTrigger]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch 7.1, 7.2, 7.3 APIs
      const [sRes, tRes, wRes] = await Promise.all([
        api.analytics.salesSummary(),
        api.analytics.topDishes(),
        api.analytics.waiterPerformance()
      ]);
      setSalesSummary(sRes.data || null);
      setTopDishes(tRes.data || []);
      setWaiterPerformance(wRes.data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load owner analytics reports', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
        <ShieldAlert size={48} style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }} />
        <h3>Access Restricted (Owner Only)</h3>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Owner Analytics APIs (7.1, 7.2, 7.3) require OWNER privileges.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BarChart3 size={22} style={{ color: 'var(--primary)' }} /> Executive Sales & Business Analytics
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time revenue metrics, dish popularity rankings & waiter sales performance
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading analytics...</div>
      ) : (
        <>
          {/* Key Metric KPI Cards (7.1) */}
          <div className="grid-4">
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Gross Revenue (7.1)
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  ₹{salesSummary?.total_revenue}
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Today's Sales
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                  ₹{salesSummary?.today_revenue}
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Orders
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  {salesSummary?.total_orders} Orders
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Avg Order Value
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  ₹{salesSummary?.avg_order_value}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid-2">
            {/* Hourly Revenue Graph */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Hourly Sales Velocity (Today)
              </h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesSummary?.hourly_sales || []}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#131b2e', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                    <Area type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Dishes Bar Chart (7.2) */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Top Selling Dishes (API 7.2)
              </h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDishes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#131b2e', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="orders_count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Orders Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Waiter Performance Report Table (7.3) */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--primary)' }} /> Waiter Performance Summary (API 7.3)
            </h3>

            <table className="custom-table">
              <thead>
                <tr>
                  <th>Waiter Username</th>
                  <th>Total Orders Processed</th>
                  <th>Total Revenue Generated</th>
                  <th>Customer Rating</th>
                </tr>
              </thead>
              <tbody>
                {waiterPerformance.map((waiter) => (
                  <tr key={waiter.id}>
                    <td>
                      <strong style={{ color: '#fff' }}>{waiter.username}</strong>
                    </td>
                    <td>{waiter.total_orders} Orders</td>
                    <td>
                      <strong style={{ color: 'var(--accent-green)' }}>₹{waiter.total_revenue}</strong>
                    </td>
                    <td>
                      <span className="badge badge-reserved">⭐ {waiter.rating} / 5.0</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
