
export const ProductCategory = {
    MOBILE: 'Mobile',
    LAPTOP: 'Laptop',
    TV: 'TV',
    ACCESSORIES: 'Accessories',
    OTHER: 'Other'
} as const;

export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];

export const ProductCondition = {
    NEW: 'New',
    USED: 'Used',
    REFURBISHED: 'Refurbished'
} as const;

export type ProductCondition = (typeof ProductCondition)[keyof typeof ProductCondition];

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
    brand: string;
    featured: boolean;
    originalPrice: number;
    discount: number;
    stock?: number;
    isAvailable?: boolean;
}

export interface RepairService {
    id: string;
    title: string;
    category: string;
    basePrice: number;
    description: string;
    brand: string;
    image: string;
}

export const BookingStatus = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed'
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export interface Booking {
    id: string;
    userId?: string; // Optional for guest checkouts, required for logged in users
    customerName: string;
    mobile: string;
    email?: string;
    address: string;
    productId?: string;
    serviceId?: string;
    items?: { productId: string; product?: string; name?: string; quantity: number; price: number }[];
    notes?: string;
    paymentScreenshot?: string;
    isPaymentVerified?: boolean;
    invoiceUrl?: string;
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
    qrCodeUrl: string;
    upiId: string;
    isQrEnabled: boolean;
    theme: 'light' | 'dark';
    token?: string;
}
