import { createContext, useContext, useState, useEffect } from 'react';
import { dichVuService } from '../services/dichVuService.js';
import { useAuth } from './AuthContext.jsx';

const MyServicesContext = createContext(null);

export const useMyServices = () => {
  const context = useContext(MyServicesContext);
  if (!context) {
    throw new Error('useMyServices must be used within MyServicesProvider');
  }
  return context;
};

export const MyServicesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [services, setServices] = useState([]);
  const [localAdded, setLocalAdded] = useState([]); // services added client-side (payment flow)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // storage key for local added services per-user
  const storageKey = user?.accountId || user?.maKH || user?.username ? `myservices_local_${user.accountId || user.maKH || user.username}` : 'myservices_local_guest';

  // Load local-added services from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const saved = raw ? JSON.parse(raw) : [];
      if (Array.isArray(saved)) setLocalAdded(saved);
    } catch (e) {
      setLocalAdded([]);
    }
  }, [storageKey]);

  // Whenever localAdded changes, merge into current services (avoid duplicates)
  useEffect(() => {
    if (!localAdded || localAdded.length === 0) return;
    setServices(prev => {
      const merged = [...prev];
      localAdded.forEach(local => {
        const exists = merged.some(s => s.maDV === (local.maDV || local.maDichVu || local.id));
        if (!exists) merged.push(local);
      });
      return merged;
    });
  }, [localAdded]);

  // Load services when user changes or becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadMyServices();
    } else {
      setServices([]);
    }
  }, [isAuthenticated, user]);

  const loadMyServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dichVuService.getDichVuCuaToi();
      // Merge server services with any local-added services, avoiding duplicates
      const serverList = response?.dichVuDaDangKy || [];
      const merged = [...serverList];
      localAdded.forEach(local => {
        const exists = merged.some(s => s.maDV === (local.maDV || local.maDichVu || local.id));
        if (!exists) merged.push(local);
      });
      setServices(merged);
    } catch (err) {
      console.error('Error loading my services:', err);
      // Don't set error for API failures, fall back to empty list
      // still show local added items even when API fails
      setServices(localAdded || []);
    } finally {
      setLoading(false);
    }
  };

  // Add a new service after successful payment
  const addService = (serviceData) => {
    const newService = {
      maDV: serviceData.maDV,
      tenDichVu: serviceData.tenDV || serviceData.tenDichVu,
      giaTien: serviceData.donGia || serviceData.gia,
      ngayBD: new Date().toISOString().split('T')[0], // Today
      ngayKT: serviceData.thoiHan ? 
        new Date(Date.now() + serviceData.thoiHan * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        null,
      trangThai: 'ACTIVE',
      ...serviceData
    };

    setServices(prev => [...prev, newService]);
    // persist locally-added service
    const updatedLocal = [...localAdded, newService];
    setLocalAdded(updatedLocal);
    try { localStorage.setItem(storageKey, JSON.stringify(updatedLocal)); } catch (e) {}
  };

  // Add multiple services (for cart checkout)
  const addServices = (servicesArray) => {
    const newServices = servicesArray.map(serviceData => ({
      maDV: serviceData.maDV,
      tenDichVu: serviceData.tenDV || serviceData.tenDichVu,
      giaTien: serviceData.donGia || serviceData.gia,
      ngayBD: new Date().toISOString().split('T')[0], // Today
      ngayKT: serviceData.thoiHan ? 
        new Date(Date.now() + serviceData.thoiHan * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        null,
      trangThai: 'ACTIVE',
      ...serviceData
    }));

    setServices(prev => [...prev, ...newServices]);
    // persist locally-added services
    const updatedLocal = [...localAdded, ...newServices];
    setLocalAdded(updatedLocal);
    try { localStorage.setItem(storageKey, JSON.stringify(updatedLocal)); } catch (e) {}
  };

  // Remove a service (for cancellation)
  const removeService = (maDV) => {
    setServices(prev => prev.filter(service => service.maDV !== maDV));
  };

  // Update service status
  const updateServiceStatus = (maDV, status) => {
    setServices(prev => 
      prev.map(service => 
        service.maDV === maDV 
          ? { ...service, trangThai: status }
          : service
      )
    );
  };

  // Get total spent on services
  const getTotalSpent = () => {
    return services.reduce((total, service) => 
      total + (Number(service.giaTien || service.gia || 0) || 0), 0
    );
  };

  // Get active services count
  const getActiveServicesCount = () => {
    return services.filter(service => 
      !service.trangThai || service.trangThai === 'ACTIVE'
    ).length;
  };

  // Check if user has a specific service
  const hasService = (maDV) => {
    return services.some(service => service.maDV === maDV);
  };

  const value = {
    services,
    loading,
    error,
    loadMyServices,
    addService,
    addServices,
    removeService,
    updateServiceStatus,
    getTotalSpent,
    getActiveServicesCount,
    hasService
  };

  return (
    <MyServicesContext.Provider value={value}>
      {children}
    </MyServicesContext.Provider>
  );
};