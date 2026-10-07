import React, { createContext, useContext, useState } from 'react';
import { isDemoMode, setDemoMode, getApiBaseUrl, setApiBaseUrl } from '../api/apiClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [demoMode, setDemoModeState] = useState(isDemoMode());
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());
  const [toasts, setToasts] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pos'); // 'pos', 'orders', 'tables', 'menu', 'billing', 'staff', 'analytics'

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleDemoMode = (val) => {
    const newVal = val !== undefined ? val : !demoMode;
    setDemoMode(newVal);
    setDemoModeState(newVal);
    addToast(newVal ? 'Switched to Demo / Mock Mode' : 'Switched to Live Backend API Mode', newVal ? 'info' : 'warning');
    triggerRefresh();
  };

  const updateApiUrl = (url) => {
    setApiBaseUrl(url);
    setApiUrlState(url);
    addToast(`API Base URL set to: ${url}`, 'success');
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AppContext.Provider
      value={{
        demoMode,
        toggleDemoMode,
        apiUrl,
        updateApiUrl,
        toasts,
        addToast,
        removeToast,
        refreshTrigger,
        triggerRefresh,
        showConfigModal,
        setShowConfigModal,
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
