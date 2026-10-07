import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { NotificationToast } from './components/NotificationToast';
import { ApiConfigModal } from './components/ApiConfigModal';

// Pages
import { AuthPage } from './pages/AuthPage';
import { POSOrderPage } from './pages/POSOrderPage';
import { OrdersPage } from './pages/OrdersPage';
import { TablesPage } from './pages/TablesPage';
import { MenuPage } from './pages/MenuPage';
import { BillingPage } from './pages/BillingPage';
import { StaffPage } from './pages/StaffPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

const MainAppContent = () => {
  const { user, loading } = useAuth();
  const { activeTab } = useApp();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#f59e0b', fontSize: '1.2rem', fontWeight: 600 }}>
        Loading DineMaster System...
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'pos':
        return <POSOrderPage />;
      case 'orders':
        return <OrdersPage />;
      case 'tables':
        return <TablesPage />;
      case 'menu':
        return <MenuPage />;
      case 'billing':
        return <BillingPage />;
      case 'staff':
        return <StaffPage />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return <POSOrderPage />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="content-area">{renderActiveTab()}</main>
      </div>

      <NotificationToast />
      <ApiConfigModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
