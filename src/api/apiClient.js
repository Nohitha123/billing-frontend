import axios from 'axios';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_STAFF,
  INITIAL_ORDERS,
  INITIAL_BILLS,
  INITIAL_ANALYTICS
} from './mockData';

// API Configuration
const API_BASE_KEY = 'restaurant_api_base';
const DEMO_MODE_KEY = 'restaurant_demo_mode';

export const getApiBaseUrl = () => localStorage.getItem(API_BASE_KEY) || 'http://localhost:8000';
export const setApiBaseUrl = (url) => localStorage.setItem(API_BASE_KEY, url);

export const isDemoMode = () => {
  const val = localStorage.getItem(DEMO_MODE_KEY);
  return val === null ? true : val === 'true'; // Default to Demo mode enabled for smooth immediate testing
};
export const setDemoMode = (enabled) => localStorage.setItem(DEMO_MODE_KEY, String(enabled));

// Create Axios Instance
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper for Mock Local Storage State
const getStorage = (key, defaultVal) => {
  const data = localStorage.getItem(`mock_${key}`);
  if (!data) {
    localStorage.setItem(`mock_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(data);
};

const setStorage = (key, val) => {
  localStorage.setItem(`mock_${key}`, JSON.stringify(val));
};

// Mock Response Helper
const mockDelay = (data, ms = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data, status: 200, statusText: 'OK' });
    }, ms);
  });
};

// Combined API Client Service
export const api = {
  // 🔑 1. Authentication APIs
  auth: {
    login: async (credentials) => {
      if (isDemoMode()) {
        const staff = getStorage('staff', INITIAL_STAFF);
        const user = staff.find((u) => u.username.toLowerCase() === credentials.username.toLowerCase());

        // Default owner fallback
        if (credentials.username === 'owner' || credentials.username === 'waiter') {
          const role = credentials.username === 'owner' ? 'OWNER' : 'WAITER';
          const mockUser = {
            id: credentials.username === 'owner' ? 1 : 2,
            username: credentials.username,
            email: `${credentials.username}@restaurant.com`,
            role: role
          };
          const mockRes = {
            refresh: `mock_refresh_token_${Date.now()}`,
            access: `mock_access_token_${Date.now()}`,
            user: mockUser
          };
          localStorage.setItem('access_token', mockRes.access);
          localStorage.setItem('refresh_token', mockRes.refresh);
          localStorage.setItem('user_profile', JSON.stringify(mockUser));
          return mockDelay(mockRes);
        }

        if (user) {
          const mockUser = { id: user.id, username: user.username, email: user.email, role: user.role };
          const mockRes = {
            refresh: `mock_refresh_token_${Date.now()}`,
            access: `mock_access_token_${Date.now()}`,
            user: mockUser
          };
          localStorage.setItem('access_token', mockRes.access);
          localStorage.setItem('refresh_token', mockRes.refresh);
          localStorage.setItem('user_profile', JSON.stringify(mockUser));
          return mockDelay(mockRes);
        }

        throw { response: { data: { detail: 'Invalid credentials. Try owner or waiter' } } };
      }
      const res = await axiosInstance.post('/api/auth/login/', credentials);
      if (res.data.access) {
        localStorage.setItem('access_token', res.data.access);
        if (res.data.refresh) {
          localStorage.setItem('refresh_token', res.data.refresh);
        }
        localStorage.setItem('user_profile', JSON.stringify(res.data.user));
      }
      return res;
    },

    register: async (userData) => {
      if (isDemoMode()) {
        const staff = getStorage('staff', INITIAL_STAFF);
        const newUser = { id: staff.length + 1, ...userData, created_at: new Date().toISOString() };
        staff.push(newUser);
        setStorage('staff', staff);
        return mockDelay({ message: 'User registered successfully', user: newUser });
      }
      return await axiosInstance.post('/api/auth/register/', userData);
    },

    logout: async () => {
      if (isDemoMode()) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_profile');
        return mockDelay({ detail: 'Successfully logged out.' });
      }
      const refreshToken = localStorage.getItem('refresh_token');
      try {
        const res = await axiosInstance.post('/api/auth/logout/', { refresh: refreshToken });
        return res;
      } finally {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_profile');
      }
    },

    me: async () => {
      if (isDemoMode()) {
        const savedUser = localStorage.getItem('user_profile');
        if (savedUser) {
          return mockDelay(JSON.parse(savedUser));
        }
        return mockDelay({ id: 1, username: 'owner', email: 'owner@restaurant.com', role: 'OWNER' });
      }
      return await axiosInstance.get('/api/auth/me/');
    }
  },

  // 👥 2. Staff Management APIs (Owner Only)
  staff: {
    list: async () => {
      if (isDemoMode()) {
        return mockDelay(getStorage('staff', INITIAL_STAFF));
      }
      return await axiosInstance.get('/api/staff/');
    },

    createWaiter: async (waiterData) => {
      if (isDemoMode()) {
        const staff = getStorage('staff', INITIAL_STAFF);
        const newWaiter = {
          id: staff.length + 1,
          ...waiterData,
          role: 'WAITER',
          created_at: new Date().toISOString().split('T')[0]
        };
        staff.push(newWaiter);
        setStorage('staff', staff);
        return mockDelay(newWaiter);
      }
      return await axiosInstance.post('/api/staff/', waiterData);
    }
  },

  // 🍽️ 3. Menu & Category APIs
  menu: {
    listCategories: async () => {
      if (isDemoMode()) {
        return mockDelay(getStorage('categories', INITIAL_CATEGORIES));
      }
      return await axiosInstance.get('/api/menu/categories/');
    },

    listItems: async (params = {}) => {
      if (isDemoMode()) {
        let items = getStorage('menu_items', INITIAL_MENU_ITEMS);
        if (params.available !== undefined) {
          items = items.filter((i) => i.is_available === (params.available === 'true' || params.available === true));
        }
        return mockDelay(items);
      }
      return await axiosInstance.get('/api/menu/items/', { params });
    },

    addItem: async (itemData) => {
      if (isDemoMode()) {
        const items = getStorage('menu_items', INITIAL_MENU_ITEMS);
        const categories = getStorage('categories', INITIAL_CATEGORIES);
        const catObj = categories.find((c) => c.id === Number(itemData.category));
        const newItem = {
          id: items.length + 1,
          ...itemData,
          category_name: catObj ? catObj.name : 'General',
          is_available: itemData.is_available !== undefined ? itemData.is_available : true,
          image: itemData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'
        };
        items.push(newItem);
        setStorage('menu_items', items);
        return mockDelay(newItem);
      }
      return await axiosInstance.post('/api/menu/items/', itemData);
    },

    updateItem: async (id, patchData) => {
      if (isDemoMode()) {
        const items = getStorage('menu_items', INITIAL_MENU_ITEMS);
        const idx = items.findIndex((i) => i.id === Number(id));
        if (idx !== -1) {
          items[idx] = { ...items[idx], ...patchData };
          setStorage('menu_items', items);
          return mockDelay(items[idx]);
        }
      }
      return await axiosInstance.patch(`/api/menu/items/${id}/`, patchData);
    },

    toggleStock: async (id) => {
      if (isDemoMode()) {
        const items = getStorage('menu_items', INITIAL_MENU_ITEMS);
        const idx = items.findIndex((i) => i.id === Number(id));
        if (idx !== -1) {
          items[idx].is_available = !items[idx].is_available;
          setStorage('menu_items', items);
          return mockDelay(items[idx]);
        }
      }
      return await axiosInstance.patch(`/api/menu/items/${id}/toggle-stock/`);
    },

    deleteItem: async (id) => {
      if (isDemoMode()) {
        let items = getStorage('menu_items', INITIAL_MENU_ITEMS);
        items = items.filter((i) => i.id !== Number(id));
        setStorage('menu_items', items);
        return mockDelay({ message: 'Item deleted successfully' });
      }
      return await axiosInstance.delete(`/api/menu/items/${id}/`);
    }
  },

  // 🪑 4. Table Management APIs
  tables: {
    list: async () => {
      if (isDemoMode()) {
        return mockDelay(getStorage('tables', INITIAL_TABLES));
      }
      return await axiosInstance.get('/api/tables/');
    },

    addTable: async (tableData) => {
      if (isDemoMode()) {
        const tables = getStorage('tables', INITIAL_TABLES);
        const newTable = {
          id: tables.length + 1,
          table_number: Number(tableData.table_number),
          capacity: Number(tableData.capacity),
          status: 'AVAILABLE'
        };
        tables.push(newTable);
        setStorage('tables', tables);
        return mockDelay(newTable);
      }
      return await axiosInstance.post('/api/tables/', tableData);
    },

    updateStatus: async (id, statusData) => {
      if (isDemoMode()) {
        const tables = getStorage('tables', INITIAL_TABLES);
        const idx = tables.findIndex((t) => t.id === Number(id));
        if (idx !== -1) {
          tables[idx].status = statusData.status;
          setStorage('tables', tables);
          return mockDelay(tables[idx]);
        }
      }
      return await axiosInstance.patch(`/api/tables/${id}/update-status/`, statusData);
    }
  },

  // 📝 5. Order Management APIs
  orders: {
    create: async (orderPayload) => {
      if (isDemoMode()) {
        const orders = getStorage('orders', INITIAL_ORDERS);
        const menuItems = getStorage('menu_items', INITIAL_MENU_ITEMS);
        const tables = getStorage('tables', INITIAL_TABLES);
        const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{"username":"waiter"}');

        const table = tables.find((t) => t.id === Number(orderPayload.table_id));

        let total = 0;
        const formattedItems = orderPayload.items.map((item) => {
          const menuItem = menuItems.find((m) => m.id === Number(item.menu_item_id)) || { name: 'Item', price: '100.00' };
          const itemTotal = Number(menuItem.price) * item.quantity;
          total += itemTotal;
          return {
            menu_item_id: item.menu_item_id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: item.quantity,
            subtotal: itemTotal.toFixed(2)
          };
        });

        const newOrder = {
          id: orders.length + 1,
          order_number: `ORD-${1000 + orders.length + 1}`,
          table_id: Number(orderPayload.table_id),
          table_number: table ? table.table_number : orderPayload.table_id,
          waiter_username: userProfile.username,
          status: 'PENDING',
          notes: orderPayload.notes || '',
          created_at: new Date().toISOString(),
          items: formattedItems,
          total_amount: total.toFixed(2)
        };

        orders.push(newOrder);
        setStorage('orders', orders);

        // Update table status to OCCUPIED automatically
        if (table) {
          table.status = 'OCCUPIED';
          setStorage('tables', tables);
        }

        return mockDelay(newOrder);
      }
      return await axiosInstance.post('/api/orders/', orderPayload);
    },

    listActive: async (params = {}) => {
      if (isDemoMode()) {
        let orders = getStorage('orders', INITIAL_ORDERS);
        if (params.status) {
          orders = orders.filter((o) => o.status === params.status);
        }
        return mockDelay(orders);
      }
      return await axiosInstance.get('/api/orders/', { params });
    },

    addItems: async (orderId, itemsPayload) => {
      if (isDemoMode()) {
        const orders = getStorage('orders', INITIAL_ORDERS);
        const menuItems = getStorage('menu_items', INITIAL_MENU_ITEMS);
        const idx = orders.findIndex((o) => o.id === Number(orderId));

        if (idx !== -1) {
          const order = orders[idx];
          itemsPayload.items.forEach((newItem) => {
            const menuItem = menuItems.find((m) => m.id === Number(newItem.menu_item_id)) || { name: 'Item', price: '100.00' };
            const existingItemIdx = order.items.findIndex((i) => i.menu_item_id === Number(newItem.menu_item_id));
            if (existingItemIdx !== -1) {
              order.items[existingItemIdx].quantity += newItem.quantity;
              order.items[existingItemIdx].subtotal = (
                Number(order.items[existingItemIdx].price) * order.items[existingItemIdx].quantity
              ).toFixed(2);
            } else {
              order.items.push({
                menu_item_id: newItem.menu_item_id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: newItem.quantity,
                subtotal: (Number(menuItem.price) * newItem.quantity).toFixed(2)
              });
            }
          });

          // Recalculate total amount
          const newTotal = order.items.reduce((acc, curr) => acc + Number(curr.subtotal), 0);
          order.total_amount = newTotal.toFixed(2);
          orders[idx] = order;
          setStorage('orders', orders);
          return mockDelay(order);
        }
      }
      return await axiosInstance.post(`/api/orders/${orderId}/add-items/`, itemsPayload);
    },

    updateStatus: async (orderId, statusPayload) => {
      if (isDemoMode()) {
        const orders = getStorage('orders', INITIAL_ORDERS);
        const idx = orders.findIndex((o) => o.id === Number(orderId));
        if (idx !== -1) {
          orders[idx].status = statusPayload.status;
          setStorage('orders', orders);
          return mockDelay(orders[idx]);
        }
      }
      return await axiosInstance.patch(`/api/orders/${orderId}/update-status/`, statusPayload);
    }
  },

  // 🧾 6. Billing & PDF Receipt APIs
  billing: {
    generateBill: async (orderId, billingPayload) => {
      if (isDemoMode()) {
        const orders = getStorage('orders', INITIAL_ORDERS);
        const bills = getStorage('bills', INITIAL_BILLS);
        const order = orders.find((o) => o.id === Number(orderId));

        const taxPct = Number(billingPayload.tax_percentage || 5.0);
        const discount = Number(billingPayload.discount_amount || 0.0);
        const subtotal = order ? Number(order.total_amount) : 500.0;
        const taxAmt = (subtotal * taxPct) / 100;
        const finalAmt = Math.max(0, subtotal + taxAmt - discount);

        const newBill = {
          id: bills.length + 1,
          order_id: Number(orderId),
          bill_number: `INV-2026-${100 + bills.length + 1}`,
          table_number: order ? order.table_number : 1,
          waiter_username: order ? order.waiter_username : 'waiter',
          subtotal: subtotal.toFixed(2),
          tax_percentage: taxPct.toFixed(1),
          tax_amount: taxAmt.toFixed(2),
          discount_amount: discount.toFixed(2),
          final_amount: finalAmt.toFixed(2),
          is_paid: false,
          payment_mode: null,
          created_at: new Date().toISOString(),
          items: order ? order.items : []
        };

        bills.push(newBill);
        setStorage('bills', bills);
        return mockDelay(newBill);
      }
      return await axiosInstance.post(`/api/orders/${orderId}/generate-bill/`, billingPayload);
    },

    payBill: async (billId, paymentPayload) => {
      if (isDemoMode()) {
        const bills = getStorage('bills', INITIAL_BILLS);
        const orders = getStorage('orders', INITIAL_ORDERS);
        const tables = getStorage('tables', INITIAL_TABLES);

        const idx = bills.findIndex((b) => b.id === Number(billId));
        if (idx !== -1) {
          bills[idx].is_paid = true;
          bills[idx].payment_mode = paymentPayload.payment_mode;
          setStorage('bills', bills);

          // Complete the order
          const orderIdx = orders.findIndex((o) => o.id === bills[idx].order_id);
          if (orderIdx !== -1) {
            orders[orderIdx].status = 'COMPLETED';
            setStorage('orders', orders);

            // Free table
            const tableIdx = tables.findIndex((t) => t.table_number === orders[orderIdx].table_number);
            if (tableIdx !== -1) {
              tables[tableIdx].status = 'AVAILABLE';
              setStorage('tables', tables);
            }
          }
          return mockDelay(bills[idx]);
        }
      }
      return await axiosInstance.post(`/api/bills/${billId}/pay/`, paymentPayload);
    },

    downloadPdf: async (billId) => {
      if (isDemoMode()) {
        // Return dummy text payload blob for PDF simulation
        const pdfBlob = new Blob([`MOCK_PDF_PAYLOAD_BILL_${billId}`], { type: 'application/pdf' });
        return mockDelay({ data: pdfBlob, headers: { 'content-type': 'application/pdf' } });
      }
      return await axiosInstance.get(`/api/bills/${billId}/pdf/`, { responseType: 'blob' });
    }
  },

  // 📊 7. Owner Analytics APIs (Owner Only)
  analytics: {
    salesSummary: async () => {
      if (isDemoMode()) {
        const bills = getStorage('bills', INITIAL_BILLS);
        const orders = getStorage('orders', INITIAL_ORDERS);

        const paidBills = bills.filter((b) => b.is_paid);
        const totalRev = paidBills.reduce((sum, b) => sum + Number(b.final_amount), 0);

        const summary = {
          ...INITIAL_ANALYTICS.sales_summary,
          total_revenue: (48250 + totalRev).toFixed(2),
          total_orders: INITIAL_ANALYTICS.sales_summary.total_orders + orders.length
        };
        return mockDelay(summary);
      }
      return await axiosInstance.get('/api/analytics/sales-summary/');
    },

    topDishes: async () => {
      if (isDemoMode()) {
        return mockDelay(INITIAL_ANALYTICS.top_dishes);
      }
      return await axiosInstance.get('/api/analytics/top-dishes/');
    },

    waiterPerformance: async () => {
      if (isDemoMode()) {
        return mockDelay(INITIAL_ANALYTICS.waiter_performance);
      }
      return await axiosInstance.get('/api/analytics/waiter-performance/');
    }
  }
};
