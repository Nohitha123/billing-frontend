import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { ReceiptModal } from '../components/ReceiptModal';
import { FileText, DollarSign, CreditCard, QrCode, CheckCircle, Download, Calculator, PlusCircle } from 'lucide-react';

export const BillingPage = () => {
  const { addToast, refreshTrigger } = useApp();

  const [activeOrders, setActiveOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [targetBill, setTargetBill] = useState(null);

  // Form states
  const [taxPercentage, setTaxPercentage] = useState('5.0');
  const [discountAmount, setDiscountAmount] = useState('0.00');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, [refreshTrigger]);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const oRes = await api.orders.listActive();
      setActiveOrders(oRes.data || []);
      // Load generated bills from storage / API simulation
      const bData = localStorage.getItem('mock_bills');
      setBills(bData ? JSON.parse(bData) : []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load billing data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      // 6.1 Generate Bill: POST /api/orders/:id/generate-bill/
      const res = await api.billing.generateBill(selectedOrder.id, {
        tax_percentage: parseFloat(taxPercentage),
        discount_amount: parseFloat(discountAmount)
      });
      addToast(`Bill #${res.data?.bill_number || ''} generated for Order #${selectedOrder.order_number}!`, 'success');
      setShowGenerateModal(false);
      fetchBillingData();
      // Auto open pay modal
      setTargetBill(res.data);
      setShowPayModal(true);
    } catch (err) {
      console.error(err);
      addToast('Failed to generate bill', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayBill = async (e) => {
    e.preventDefault();
    if (!targetBill) return;
    setSubmitting(true);
    try {
      // 6.2 Pay & Close Bill: POST /api/bills/:id/pay/
      await api.billing.payBill(targetBill.id, { payment_mode: paymentMode });
      addToast(`Payment of ₹${targetBill.final_amount} recorded via ${paymentMode}! Table closed.`, 'success');
      setShowPayModal(false);
      fetchBillingData();
    } catch (err) {
      console.error(err);
      addToast('Failed to process payment', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const openGenerateModal = (order) => {
    setSelectedOrder(order);
    setShowGenerateModal(true);
  };

  const openReceiptModal = (bill) => {
    setTargetBill(bill);
    setShowReceiptModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Card */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={22} style={{ color: 'var(--primary)' }} /> Billing & PDF Receipt Terminal
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Generate tax invoices (API 6.1), collect payment (API 6.2) & download binary PDF receipts (API 6.3)
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Orders Ready For Billing */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={18} style={{ color: 'var(--primary)' }} /> Orders Pending Billing
          </h3>

          {activeOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No active orders pending billing.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').map((order) => (
                <div
                  key={order.id}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    padding: '0.9rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                      {order.order_number} (Table #{order.table_number})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {order.items?.length || 0} items | Waiter: {order.waiter_username}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                      ₹{Number(order.total_amount).toFixed(2)}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => openGenerateModal(order)}
                    >
                      Generate Bill (6.1)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Issued Bills History */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: 'var(--accent-green)' }} /> Issued Invoices & Receipts
          </h3>

          {bills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No bills issued yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    padding: '0.9rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                      {bill.bill_number} (Table #{bill.table_number})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Final: <strong style={{ color: 'var(--primary)' }}>₹{Number(bill.final_amount).toFixed(2)}</strong> |{' '}
                      <span style={{ color: bill.is_paid ? 'var(--accent-green)' : 'var(--primary)' }}>
                        {bill.is_paid ? `PAID (${bill.payment_mode})` : 'UNPAID'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!bill.is_paid ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          setTargetBill(bill);
                          setShowPayModal(true);
                        }}
                      >
                        Pay Bill (6.2)
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openReceiptModal(bill)}
                      >
                        <Download size={14} /> PDF Receipt (6.3)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6.1 Generate Bill Modal */}
      <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title={`Generate Bill for Order #${selectedOrder?.order_number}`}>
        <form onSubmit={handleGenerateBill}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              <span>Order Subtotal:</span>
              <strong>₹{Number(selectedOrder?.total_amount || 0).toFixed(2)}</strong>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">GST Tax Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              className="form-input"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(e.target.value)}
              placeholder="5.0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Discount Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              placeholder="20.00"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Generating Bill...' : 'Generate Bill & Proceed to Payment'}
          </button>
        </form>
      </Modal>

      {/* 6.2 Pay & Close Bill Modal */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title={`Process Payment for Bill #${targetBill?.bill_number}`}>
        <form onSubmit={handlePayBill}>
          <div style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.25rem', borderRadius: '14px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>TOTAL PAYABLE AMOUNT</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-green)', margin: '0.25rem 0' }}>
              ₹{Number(targetBill?.final_amount || 0).toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Subtotal: ₹{targetBill?.subtotal} | Tax ({targetBill?.tax_percentage}%): +₹{targetBill?.tax_amount} | Discount: -₹{targetBill?.discount_amount}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select Payment Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
              {['UPI', 'CASH', 'CARD'].map((mode) => (
                <button
                  type="button"
                  key={mode}
                  className={`btn ${paymentMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPaymentMode(mode)}
                  style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem 0.5rem', gap: '0.35rem' }}
                >
                  {mode === 'UPI' && <QrCode size={18} />}
                  {mode === 'CASH' && <DollarSign size={18} />}
                  {mode === 'CARD' && <CreditCard size={18} />}
                  <span>{mode}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem' }} disabled={submitting}>
            {submitting ? 'Processing...' : `Confirm Payment via ${paymentMode} & Close Table`}
          </button>
        </form>
      </Modal>

      {/* 6.3 PDF Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        bill={targetBill}
      />
    </div>
  );
};
