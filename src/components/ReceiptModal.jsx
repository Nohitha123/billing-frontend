import React, { useState } from 'react';
import { Modal } from './Modal';
import { Download, Printer, CheckCircle, CreditCard, DollarSign, QrCode } from 'lucide-react';
import { api } from '../api/apiClient';
import { useApp } from '../context/AppContext';

export const ReceiptModal = ({ isOpen, onClose, bill }) => {
  const { addToast } = useApp();
  const [downloading, setDownloading] = useState(false);

  if (!bill) return null;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await api.billing.downloadPdf(bill.id);
      // Create blob download link
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${bill.bill_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      addToast(`PDF Receipt downloaded for ${bill.bill_number}`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to download PDF receipt', 'danger');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Receipt #${bill.bill_number}`} maxWidth="480px">
      <div className="receipt-paper">
        <div className="receipt-header">
          <h2>GOURMET BISTRO</h2>
          <p style={{ fontSize: '0.8rem', color: '#555' }}>123 Fine Dining Avenue, Suite 400</p>
          <p style={{ fontSize: '0.8rem', color: '#555' }}>GSTIN: 22AAAAA0000A1Z5 | Tel: +91 98765 43210</p>
        </div>

        <div style={{ fontSize: '0.8rem', margin: '0.75rem 0' }}>
          <div className="receipt-item-row">
            <span>Bill No: <strong>{bill.bill_number}</strong></span>
            <span>Table: <strong>#{bill.table_number}</strong></span>
          </div>
          <div className="receipt-item-row">
            <span>Date: {new Date(bill.created_at || Date.now()).toLocaleString()}</span>
          </div>
          <div className="receipt-item-row">
            <span>Server: {bill.waiter_username}</span>
            <span>Status: <strong style={{ color: bill.is_paid ? 'green' : 'orange' }}>{bill.is_paid ? `PAID (${bill.payment_mode})` : 'UNPAID'}</strong></span>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <div style={{ marginBottom: '0.75rem' }}>
          <div className="receipt-item-row" style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
            <span style={{ flex: 2 }}>ITEM</span>
            <span style={{ flex: 1, textAlign: 'center' }}>QTY</span>
            <span style={{ flex: 1, textAlign: 'right' }}>AMOUNT</span>
          </div>
          <div className="receipt-divider"></div>

          {bill.items && bill.items.map((item, idx) => (
            <div key={idx} className="receipt-item-row">
              <span style={{ flex: 2 }}>{item.name}</span>
              <span style={{ flex: 1, textAlign: 'center' }}>x{item.quantity}</span>
              <span style={{ flex: 1, textAlign: 'right' }}>₹{Number(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="receipt-divider"></div>

        <div style={{ fontSize: '0.85rem' }}>
          <div className="receipt-item-row">
            <span>Subtotal</span>
            <span>₹{Number(bill.subtotal).toFixed(2)}</span>
          </div>
          <div className="receipt-item-row">
            <span>GST ({bill.tax_percentage}%)</span>
            <span>+ ₹{Number(bill.tax_amount).toFixed(2)}</span>
          </div>
          {Number(bill.discount_amount) > 0 && (
            <div className="receipt-item-row" style={{ color: '#059669' }}>
              <span>Discount</span>
              <span>- ₹{Number(bill.discount_amount).toFixed(2)}</span>
            </div>
          )}

          <div className="receipt-total-row">
            <span>TOTAL AMOUNT</span>
            <span>₹{Number(bill.final_amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="receipt-header" style={{ borderBottom: 'none', borderTop: '2px dashed #333', marginTop: '1.25rem', paddingTop: '1rem' }}>
          <p style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>THANK YOU FOR DINING WITH US!</p>
          <p style={{ fontSize: '0.75rem', color: '#666' }}>Please Visit Again</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={handleDownloadPdf}
          disabled={downloading}
        >
          <Download size={16} />
          {downloading ? 'Downloading...' : 'Download PDF Receipt'}
        </button>
        <button className="btn btn-secondary" onClick={handlePrint} title="Browser Print">
          <Printer size={16} />
        </button>
      </div>
    </Modal>
  );
};
