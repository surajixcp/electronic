import type { AppState, Product, RepairService, Booking, User } from '../types';

import api from './api';

const STORAGE_KEY = 'electrofix_app_state';
const listeners = new Set<() => void>();

export const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const notifyListeners = () => listeners.forEach(l => l());

const defaultState: AppState = {
    users: [],
    currentUser: null,
    products: [],
    services: [],
    bookings: [],
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=shop@upi&pn=ElectroFix&cu=INR',
    upiId: 'shop@upi',
    isQrEnabled: true,
    theme: 'light',
    token: undefined
};

// Initialize memory state from local storage
let memoryState: AppState = { ...defaultState };

try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme) memoryState.theme = parsed.theme;
        if (parsed.token) memoryState.token = parsed.token;
        if (parsed.currentUser) memoryState.currentUser = parsed.currentUser;
    }
} catch (e) {
    console.error("Failed to load state from LS", e);
}

// Sync token from direct storage if not in state
const storedToken = localStorage.getItem('token');
if (!memoryState.token && storedToken) {
    memoryState.token = storedToken;
}

export const getAppState = (): AppState => {
    return memoryState;
};

export const saveAppState = (state: AppState) => {
    memoryState = state; // Update in-memory

    // Persist token, theme AND currentUser
    const toSave = {
        theme: state.theme,
        token: state.token,
        currentUser: state.currentUser
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));

    notifyListeners();
};

export const fetchInitialData = async () => {
    try {
        const token = getAppState().token || localStorage.getItem('token');
        const [productsRes, bookingsRes, servicesRes, settingsRes] = await Promise.all([
            api.get('/product'),
            token ? api.get('/order').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
            api.get('/service').catch(() => ({ data: [] })),
            api.get('/settings').catch(() => ({ data: {} }))
        ]);

        const state = getAppState();
        if (productsRes.data && Array.isArray(productsRes.data)) {
            state.products = productsRes.data.map((p: any) => ({
                ...p,
                id: p._id || p.id,
                specs: p.specs || {}
            }));
        }
        if (bookingsRes.data && Array.isArray(bookingsRes.data)) {
            state.bookings = bookingsRes.data.map((b: any) => ({
                ...b,
                id: b._id || b.id
            }));
        }
        if (servicesRes.data && Array.isArray(servicesRes.data)) {
            state.services = servicesRes.data.map((s: any) => ({
                ...s,
                id: s._id || s.id
            }));
        }

        // Process Settings
        if (settingsRes.data && settingsRes.data.upi_config) {
            state.upiId = settingsRes.data.upi_config.upiId || state.upiId;
            state.qrCodeUrl = settingsRes.data.upi_config.qrCodeUrl || state.qrCodeUrl;
            if (settingsRes.data.upi_config.isQrEnabled !== undefined) {
                state.isQrEnabled = settingsRes.data.upi_config.isQrEnabled;
            }
        }

        saveAppState(state);
    } catch (e) {
        console.error("Fetch data failed", e);
    }
};

export const toggleTheme = () => {
    const state = getAppState();
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    saveAppState(state);
    return state.theme;
};

export const registerUser = async (user: Omit<User, 'id'>): Promise<User> => {
    // Fallback/Simulated
    const state = getAppState();
    const newUser = { ...user, id: 'u-' + Math.random().toString(36).substr(2, 9) };
    state.users.push(newUser);
    saveAppState(state);
    return newUser;
};

export const loginUser = async (email: string, password?: string): Promise<User | null> => {
    try {
        const res = await api.post('/admin/login', { email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);

        const mappedUser: User = {
            id: user.id || user._id,
            name: user.name || user.fullname,
            email: user.email,
            mobile: user.mobile || user.phone,
            address: user.address || '',
            isAdmin: user.role === 'Admin',
            avatar: user.avatar
        };

        const state = getAppState();
        state.currentUser = mappedUser;
        state.token = token; // Create source of truth in state
        saveAppState(state);
        return mappedUser;
    } catch (error: any) {
        console.error("Login failed", error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error("Login failed. Check network or server.");
    }
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    const state = getAppState();
    state.currentUser = null;
    state.token = undefined;
    saveAppState(state);
};

export const updateUserProfile = (userData: Partial<User>) => {
    const state = getAppState();
    if (state.currentUser) {
        // Optimistic update
        const updatedUser = { ...state.currentUser, ...userData };
        state.currentUser = updatedUser;
        saveAppState(state);
    }
};

// Service API
export const fetchServicesFromApi = async (): Promise<RepairService[]> => {
    try {
        const response = await api.get('/service');
        return response.data.map((s: any) => ({
            ...s,
            id: s._id || s.id
        }));
    } catch (error) {
        console.error("Failed to fetch services:", error);
        return [];
    }
};

export const fetchProductsFromApi = async (): Promise<Product[]> => {
    try {
        const response = await api.get('/product');
        return response.data.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            specs: p.specs || {}
        }));
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
};

export const createServiceApi = async (serviceData: any): Promise<RepairService | null> => {
    try {
        const response = await api.post('/service', serviceData);
        return response.data;
    } catch (error) {
        console.error("Failed to create service:", error);
        return null;
    }
};

export const updateServiceApi = async (id: string, serviceData: any): Promise<RepairService | null> => {
    try {
        const response = await api.put(`/service/${id}`, serviceData);
        return response.data;
    } catch (error) {
        console.error("Failed to update service:", error);
        return null;
    }
};

export const deleteServiceApi = async (id: string): Promise<boolean> => {
    try {
        await api.delete(`/service/${id}`);
        return true;
    } catch (error) {
        console.error("Failed to delete service:", error);
        return false;
    }
}

export const uploadUserAvatar = async (file: File): Promise<string | null> => {
    try {
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await api.post('/auth/profile-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.success && res.data.avatar) {
            updateUserProfile({ avatar: res.data.avatar });
            return res.data.avatar;
        }
        return null;
    } catch (error) {
        console.error("Avatar upload failed", error);
        throw error;
    }
};

export const updateProducts = async (products: Product[]) => {
    const state = getAppState();
    state.products = products;
    saveAppState(state);
};

export const addProduct = async (productData: any): Promise<Product | null> => {
    try {
        const res = await api.post('/product', productData);
        // We rely on caller to update state or we do it here?
        // Let's do it here to match pattern, but also return it
        const state = getAppState();
        state.products.push(res.data);
        saveAppState(state);
        return res.data;
    } catch (e) {
        console.error("Add product failed", e);
        return null;
    }
};

export const updateProduct = async (id: string, data: any): Promise<Product | null> => {
    try {
        const res = await api.put(`/product/${id}`, data);
        const state = getAppState();
        const index = state.products.findIndex(p => p.id === id);
        if (index !== -1) {
            state.products[index] = res.data;
            saveAppState(state);
        }
        return res.data;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
    try {
        await api.delete(`/product/${id}`);
        const state = getAppState();
        state.products = state.products.filter(p => p.id !== id);
        saveAppState(state);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const addBooking = (booking: Omit<Booking, 'userId'>) => {
    const state = getAppState();
    const newBooking = { ...booking, userId: state.currentUser?.id } as Booking;
    state.bookings.push(newBooking);
    saveAppState(state);
};

export const updateBookingStatus = async (id: string, status: Booking['status']) => {
    const state = getAppState();
    const index = state.bookings.findIndex(b => b.id === id);

    // Optimistic update
    if (index !== -1) {
        const originalStatus = state.bookings[index].status;
        state.bookings[index].status = status;
        saveAppState(state);

        try {
            await api.put(`/order/${id}/status`, { status });
        } catch (error) {
            console.error("Failed to update status on server", error);
            // Revert on failure
            state.bookings[index].status = originalStatus;
            saveAppState(state);
            alert("Failed to update status. Please try again.");
        }
    }
};

export const deleteBooking = async (id: string) => {
    try {
        await api.delete(`/order/${id}`);
        const state = getAppState();
        state.bookings = state.bookings.filter(b => b.id !== id);
        saveAppState(state);
        return true;
    } catch (error) {
        console.error("Failed to delete booking", error);
        return false;
    }
};

export const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const res = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data.url;
    } catch (e) {
        console.error("Upload failed", e);
        return null;
    }
};

export const verifyOrderPayment = async (id: string) => {
    try {
        await api.put(`/order/${id}/verify-payment`);
        // Update local state?
        // Ideally we should reload bookings or update the specific one
        return true;
    } catch (e) {
        console.error("Verify payment failed", e);
        return false;
    }
};

export const uploadOrderInvoice = async (id: string, file: File) => {
    const url = await uploadFile(file);
    if (url) {
        try {
            await api.put(`/order/${id}/invoice`, { invoiceUrl: url });
            return url;
        } catch (e) {
            console.error("Invoice update failed", e);
            return null;
        }
    }
    return null;
};

export const fetchUsersFromApi = async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
        const response = await api.get('/auth/users');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch users', error);
        return [];
    }
};
