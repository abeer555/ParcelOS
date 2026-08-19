import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const apiService = {
  auth: {
    register: (data: any) => api.post("/auth/register", data),
    login: (data: any) => api.post("/auth/login", data),
    getMe: () => api.get("/auth/me"),
  },
  orders: {
    calculateCharge: (data: any) => api.post("/orders/calculate", data),
    createOrder: (data: any) => api.post("/orders", data),
    getOrders: (params?: any) => api.get("/orders", { params }),
    getOrder: (id: string) => api.get(`/orders/${id}`),
    assignAgent: (id: string, agentId: string) =>
      api.patch(`/orders/${id}/assign`, { agentId }),
    autoAssign: (id: string) => api.post(`/orders/${id}/auto-assign`),
    updateStatus: (id: string, status: string, notes?: string) =>
      api.patch(`/orders/${id}/status`, { status, notes }),
    reschedule: (id: string) => api.post(`/orders/${id}/reschedule`),
    overrideStatus: (id: string, status: string) =>
      api.patch(`/orders/${id}/override`, { status }),
  },
  zones: {
    getZones: () => api.get("/zones"),
    createZone: (data: any) => api.post("/zones", data),
    updateZone: (id: string, data: any) => api.put(`/zones/${id}`, data),
    deleteZone: (id: string) => api.delete(`/zones/${id}`),
  },
  areas: {
    getAreas: () => api.get("/areas"),
    createArea: (data: any) => api.post("/areas", data),
    updateArea: (id: string, data: any) => api.put(`/areas/${id}`, data),
    deleteArea: (id: string) => api.delete(`/areas/${id}`),
  },
  rateCards: {
    getRateCards: () => api.get("/rate-cards"),
    createRateCard: (data: any) => api.post("/rate-cards", data),
    updateRateCard: (id: string, data: any) =>
      api.put(`/rate-cards/${id}`, data),
    deleteRateCard: (id: string) => api.delete(`/rate-cards/${id}`),
  },
  agents: {
    getAgents: () => api.get("/agents"),
    createAgent: (data: any) => api.post("/agents", data),
    updateLocation: (lat: number, lng: number) =>
      api.patch("/agents/location", { lat, lng }),
    toggleAvailability: () => api.patch("/agents/availability"),
    getAgentOrders: () => api.get("/orders"),
  },
  tracking: {
    getTracking: (orderNumber: string) => api.get(`/tracking/${orderNumber}`),
  },
  admin: {
    getDashboard: () => api.get("/admin/dashboard"),
    seedData: () => api.post("/admin/seed"),
  },
};
