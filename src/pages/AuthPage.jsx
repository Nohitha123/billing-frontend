import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Utensils, Lock, User, Mail, Shield, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { api } from '../api/apiClient';

export const AuthPage = () => {
  const { login } = useAuth();
  const { addToast } = useApp();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('owner123');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('WAITER');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      // 1.2 User Registration: POST /api/auth/register/
      try {
        await api.auth.register({ username, email, password, role });
        addToast(`Account for ${username} registered successfully! Please login.`, 'success');
        setIsRegister(false);
      } catch (err) {
        addToast(err.response?.data?.detail || 'Registration failed', 'danger');
      } finally {
        setLoading(false);
      }
    } else {
      // 1.1 User Login: POST /api/auth/login/
      const res = await login(username, password);
      setLoading(false);
      if (res.success) {
        addToast(`Welcome back, ${res.user.username} (${res.user.role})!`, 'success');
      } else {
        addToast(res.error, 'danger');
      }
    }
  };

  const handleQuickLogin = (roleType) => {
    if (roleType === 'OWNER') {
      setUsername('owner');
      setPassword('owner123');
      login('owner', 'owner123');
      addToast('Logged in as Owner', 'success');
    } else {
      setUsername('waiter_rahul');
      setPassword('Password123!');
      login('waiter_rahul', 'Password123!');
      addToast('Logged in as Waiter (Rahul)', 'success');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        padding: '1.5rem',
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.12) 0%, transparent 60%)'
      }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
              color: '#fff'
            }}
          >
            <Utensils size={30} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>DineMaster POS</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            {isRegister ? 'Create staff or waiter account' : 'Sign in to access POS & Billing System'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. owner or waiter_rahul"
                required
              />
              <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@restaurant.com"
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Role</label>
              <div style={{ position: 'relative' }}>
                <select
                  className="form-select"
                  style={{ paddingLeft: '2.5rem' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="WAITER">WAITER</option>
                  <option value="OWNER">OWNER</option>
                </select>
                <Shield size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : isRegister ? (
              <>
                <UserPlus size={18} /> Register Account
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register Here'}
          </button>
        </div>

        {/* Quick Demo Presets */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem' }}>
            ⚡ 1-CLICK DEMO LOGIN PRESETS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('OWNER')}
            >
              👑 Owner Demo
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('WAITER')}
            >
              🍷 Waiter Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
