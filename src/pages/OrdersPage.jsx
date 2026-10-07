import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import {
  ClipboardList,
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  User,
  Utensils
} from 'lucide-react';

export const OrdersPage = () => {
  const { addToast, refreshTrigger, setActiveTab } = useApp();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [refreshTrigger, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.orders.listActive(params);
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch active orders', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // 5.4 Update Order Status: PATCH /api/orders/:id/update-status/
      await api.orders.updateStatus(orderId, { status: newStatus });
      addToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
      fetchOrders();
    } catch (err) {
      console.error(err);
      addToast('Failed to update order status', 'danger');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-pending">PENDING</span>;
      case 'PREPARING':
        return <span className="badge badge-preparing">PREPARING</span>;
      case 'SERVED':
        return <span className="badge badge-served">SERVED</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="badge badge-cancelled">CANCELLED</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Filter Controls */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ClipboardList size={22} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Active Kitchen Orders</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['', 'PENDING', 'PREPARING', 'SERVED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === '' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Grid Layout */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading active orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <ChefHat size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No Orders Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {statusFilter ? `No orders with status "${statusFilter}"` : 'No active orders currently in system.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                      {order.order_number || `ORD-${order.id}`}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                      <User size={13} /> Waiter: <strong>{order.waiter_username || 'Staff'}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                      Table #{order.table_number}
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.85rem', borderRadius: '12px', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    ORDER DISHES:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span>
                          <strong style={{ color: 'var(--primary)' }}>{item.quantity}x</strong> {item.name}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          ₹{Number(item.subtotal || item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.78rem', color: '#f59e0b' }}>
                      📝 <em>Notes: {order.notes}</em>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total Amount</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                    ₹{Number(order.total_amount).toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {order.status === 'PENDING' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                    >
                      <ChefHat size={14} /> Preparing
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#a78bfa', borderColor: '#8b5cf6' }}
                      onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                    >
                      <Utensils size={14} /> Mark Served
                    </button>
                  )}

                  {(order.status === 'SERVED' || order.status === 'PREPARING') && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => setActiveTab('billing')}
                    >
                      <FileText size={14} /> Generate Bill
                    </button>
                  )}

                  {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
