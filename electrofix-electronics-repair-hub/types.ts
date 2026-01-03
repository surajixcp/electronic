
export enum ProductCategory {
  MOBILE = 'Mobile',
  LAPTOP = 'Laptop',
  TV = 'TV',
  ACCESSORIES = 'Accessories',
  OTHER = 'Other'
}

export enum ProductCondition {
  NEW = 'New',
  USED = 'Used',
  REFURBISHED = 'Refurbished'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  mobile: string;
  address: string;
  avatar?: string;
  isAdmin?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: number;
  userAvatar?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  condition: ProductCondition;
  images: string[];
  specs: Record<string, string>;
  warranty: string;
  featured: boolean;
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export interface RepairService {
  id: string;
  title: string;
  category: string;
  basePrice: number;
  description: string;
}

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed'
}


export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Booking {
  id: string;
  userId?: string; // Optional for guest checkouts, required for logged in users
  customerName: string;
  mobile: string;
  email?: string;
  address: string;
  productId?: string; // Kept for backward compatibility / single buy
  serviceId?: string;
  items?: { productId: string; quantity: number; price: number }[]; // For cart checkout
  notes?: string;
  paymentScreenshot?: string;
  status: BookingStatus;
  createdAt: number;
  totalAmount: number;
}

export interface AppState {
  users: User[];
  currentUser: User | null;
  products: Product[];
  services: RepairService[];
  bookings: Booking[];
  cart: CartItem[];
  qrCodeUrl: string;
  isQrEnabled: boolean;
  theme: 'light' | 'dark';
  token?: string;
}
