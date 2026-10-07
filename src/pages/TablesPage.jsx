import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Grid, Plus, Users, CheckCircle2, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

export const TablesPage = () => {
  const { addToast, refreshTrigger } = useApp();
  const { isOwner } = useAuth();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetTable, setTargetTable] = useState(null);

  // Form states
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [newStatus, setNewStatus] = useState('AVAILABLE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTables();
  }, [refreshTrigger]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await api.tables.list();
      setTables(res.data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch tables', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 4.2 Add Table: POST /api/tables/
      await api.tables.addTable({ table_number: tableNumber, capacity });
      addToast(`Table #${tableNumber} created successfully!`, 'success');
      setShowAddModal(false);
      setTableNumber('');
      setCapacity('4');
      fetchTables();
    } catch (err) {
      console.error(err);
      addToast('Failed to add new table', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!targetTable) return;
    setSubmitting(true);
    try {
      // 4.3 Update Table Status: PATCH /api/tables/:id/update-status/
      await api.tables.updateStatus(targetTable.id, { status: newStatus });
      addToast(`Table #${targetTable.table_number} status changed to ${newStatus}`, 'success');
      setShowStatusModal(false);
      setTargetTable(null);
      fetchTables();
    } catch (err) {
      console.error(err);
      addToast('Failed to update table status', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const openStatusModal = (table) => {
    setTargetTable(table);
    setNewStatus(table.status);
    setShowStatusModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Grid size={22} style={{ color: 'var(--primary)' }} /> Dining Floor Layout
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time table occupancy, seating capacity & reservation status
          </p>
        </div>

        {isOwner && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Table (Owner Only)
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading tables...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {tables.map((table) => {
            let statusBadge = <span className="badge badge-available">AVAILABLE</span>;
            let borderGlow = 'rgba(16, 185, 129, 0.2)';

            if (table.status === 'OCCUPIED') {
              statusBadge = <span className="badge badge-occupied">OCCUPIED</span>;
              borderGlow = 'rgba(244, 63, 94, 0.2)';
            } else if (table.status === 'RESERVED') {
              statusBadge = <span className="badge badge-reserved">RESERVED</span>;
              borderGlow = 'rgba(245, 158, 11, 0.2)';
            }

            return (
              <div
                key={table.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${table.status === 'OCCUPIED' ? '#f43f5e' : table.status === 'RESERVED' ? '#f59e0b' : '#10b981'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                      Table #{table.table_number}
                    </div>
                    {statusBadge}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    <Users size={16} /> Capacity: <strong>{table.capacity} Persons</strong>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={() => openStatusModal(table)}
                >
                  Change Status (API 4.3)
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Table Modal (4.2 Owner Only) */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Table (API 4.2)">
        <form onSubmit={handleAddTable}>
          <div className="form-group">
            <label className="form-label">Table Number</label>
            <input
              type="number"
              className="form-input"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 7"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Seating Capacity</label>
            <input
              type="number"
              className="form-input"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 4"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Table'}
          </button>
        </form>
      </Modal>

      {/* Update Table Status Modal (4.3) */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title={`Update Status for Table #${targetTable?.table_number}`}>
        <form onSubmit={handleUpdateStatus}>
          <div className="form-group">
            <label className="form-label">Select Status</label>
            <select
              className="form-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="RESERVED">RESERVED</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Updating...' : 'Save Table Status'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
