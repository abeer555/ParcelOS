export enum Role {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RESCHEDULED = 'RESCHEDULED'
}

export enum OrderType {
  B2B = 'B2B',
  B2C = 'B2C'
}

export enum PaymentType {
  PREPAID = 'PREPAID',
  COD = 'COD'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
}

export interface Zone {
  id: string;
  name: string;
  description: string;
}

export interface Area {
  id: string;
  name: string;
  pincode: string;
  zoneId: string;
  zone?: Zone;
  lat: number;
  lng: number;
}

export interface AgentProfile {
  id: string;
  userId: string;
  user?: User;
  zoneId: string;
  zone?: Zone;
  isAvailable: boolean;
  currentLat: number;
  currentLng: number;
}

export interface RateCard {
  id: string;
  fromZoneId: string;
  toZoneId: string;
  orderType: OrderType;
  baseRate: number;
  ratePerKg: number;
  codSurcharge: number;
}

export interface ChargeBreakdown {
  baseCharge: number;
  weightCharge: number;
  codSurcharge: number;
  total: number;
  billableWeight: number;
  volumetricWeight: number;
}

export interface TrackingEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  actorId?: string;
  actorName?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: User;
  agentId?: string;
  agent?: User;
  pickupAddress: string;
  pickupPincode: string;
  dropAddress: string;
  dropPincode: string;
  status: OrderStatus;
  type: OrderType;
  paymentType: PaymentType;
  dimensions: { l: number; b: number; h: number };
  actualWeight: number;
  charges: ChargeBreakdown;
  trackingEvents: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  pending: number;
  inTransit: number;
  delivered: number;
  failed: number;
}
