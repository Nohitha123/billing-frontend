import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Users, UserPlus, Phone, Mail, Shield, ShieldCheck, Lock, User } from 'lucide-react';

export const StaffPage = () => {
  const { addToast, refreshTrigger } = useApp();
  const { isOwner } = useAuth();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, [refreshTrigger]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // 2.1 List All Staff: GET /api/staff/
      const res = await api.staff.list();
      setStaffList(res.data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch staff list', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWaiter = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 2.2 Create Waiter Account: POST /api/staff/
      await api.staff.createWaiter({
        username,
        email,
        password,
        phone
      });
      addToast(`Waiter account created for "${username}"!`, 'success');
      setShowAddModal(false);
      setUsername('');
      setEmail('');
      setPhone('');
      fetchStaff();
    } catch (err) {
      console.error(err);
      addToast('Failed to create waiter account', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
        <Shield size={48} style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }} />
        <h3>Access Restricted (Owner Only)</h3>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Staff Management APIs are restricted to OWNER token holders.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={22} style={{ color: 'var(--primary)' }} /> Restaurant Staff Roster (Owner Controls)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            List all active staff members and provision new waiter login credentials
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} /> Create Waiter Account (API 2.2)
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading staff roster...</div>
      ) : (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}>
                        {staff.username[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{staff.username}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`user-role-badge ${staff.role === 'OWNER' ? 'role-owner' : 'role-waiter'}`}>
                      {staff.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{staff.email}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{staff.phone || 'N/A'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{staff.created_at || '2026-01-01'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Waiter Modal (API 2.2) */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Waiter Account (API 2.2)">
        <form onSubmit={handleCreateWaiter}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. waiter_priya"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya@restaurant.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password123!"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Creating Waiter Account...' : 'Create Waiter Account'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
