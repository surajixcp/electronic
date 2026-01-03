
import { AppState, Product, RepairService, Booking, User, Review, CartItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SERVICES } from '../constants';
import api from './api';

const STORAGE_KEY = 'electrofix_app_state';
const listeners = new Set<() => void>();

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(l => l());
};

const defaultState: AppState = {
  users: [],
  currentUser: null,
  products: [],
  services: [],
  bookings: [],
  cart: [],
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=shop@upi&pn=ElectroFix&cu=INR',
  isQrEnabled: true,
  theme: 'light'
};

// Initialize memory state from persistent storage
let memoryState: AppState = { ...defaultState };

try {
  // 1. Restore Token (for API)
  const token = localStorage.getItem('token');
  if (token) {
    memoryState.token = token;
  }

  // 2. Restore Theme & User (from State Storage)
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.theme) memoryState.theme = parsed.theme;
    if (parsed.currentUser) memoryState.currentUser = parsed.currentUser;
    if (parsed.bookings) memoryState.bookings = parsed.bookings;
  }
} catch {
  // ignore
}

export const getAppState = (): AppState => {
  return memoryState;
};

export const saveAppState = (state: AppState) => {
  memoryState = state;
  // Persist allowed fields
  const toSave = {
    theme: state.theme,
    currentUser: state.currentUser,
    bookings: state.bookings
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  notifyListeners();
};



// API Helpers
const fetchCartApi = async (): Promise<CartItem[]> => {
  try {
    const res = await api.get('/cart');
    // Backend returns { items: [{ productId, quantity, ... }] }
    // Map to { productId, quantity }
    if (res.data && Array.isArray(res.data.items)) {
      return res.data.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity
      }));
    }
    return [];
  } catch (e) {
    console.error("Fetch cart failed", e);
    return [];
  }
};

export const fetchInitialData = async () => {
  try {
    // Parallel request execution
    const productReq = api.get('/product').catch(e => { console.error("Product fetch failed", e); return { data: [] }; });
    const serviceReq = api.get('/service').catch(e => { console.error("Service fetch failed", e); return { data: [] }; });

    // Check for token
    const token = getAppState().token || localStorage.getItem('token');
    const bookingsReq = token
      ? api.get('/order/my-orders').catch(e => { console.error("Orders fetch failed", e); return { data: [] }; })
      : Promise.resolve({ data: [] }); // Return empty structure if not logged in

    const [productsRes, servicesRes, bookingsRes] = await Promise.all([
      productReq,
      serviceReq,
      bookingsReq
    ]);

    const state = getAppState();

    // Process Products
    if (productsRes.data && Array.isArray(productsRes.data)) {
      state.products = productsRes.data.map((p: any) => ({
        ...p,
        id: p._id || p.id,
        reviews: p.reviews || [],
        specs: p.specs || {}
      }));
    } else {
      state.products = [];
    }

    // Process Services
    if (servicesRes.data && Array.isArray(servicesRes.data) && servicesRes.data.length > 0) {
      state.services = servicesRes.data.map((s: any) => ({
        ...s,
        id: s._id || s.id
      }));
    } else {
      state.services = [];
    }

    // Process Bookings
    if (bookingsRes.data && Array.isArray(bookingsRes.data)) {
      // If we have orders, map them
      state.bookings = bookingsRes.data.map((b: any) => ({
        ...b,
        id: b._id || b.id,
        customerName: b.shippingAddress?.fullName || 'Unknown',
        mobile: b.shippingAddress?.phone || '',
        address: b.shippingAddress ? `${b.shippingAddress.addressLine}, ${b.shippingAddress.city}, ${b.shippingAddress.state} - ${b.shippingAddress.pincode}` : '',
        productId: b.items?.[0]?.product?._id || b.items?.[0]?.product,
        serviceId: b.items?.[0]?.service?._id || b.items?.[0]?.service,
        // Map populated details directly
        productName: b.items?.[0]?.product?.name,
        productImage: b.items?.[0]?.product?.images?.[0],
        status: b.status,
        createdAt: new Date(b.createdAt).getTime(),
        email: state.currentUser?.email,
        paymentScreenshot: b.paymentScreenshot,
        invoiceUrl: b.invoiceUrl,
        isPaymentVerified: b.isPaymentVerified
      }));
    } else if (token) {
      // If logged in but empty/error, ensure generic empty array or error state
      // But we used catch above so it returns data:[] on error
      // state.bookings = []; // Preserve existing? No, initial fetch should overwrite
    }

    // Fetch Global Settings (UPI / QR)
    try {
      const settingsRes = await api.get('/settings');
      if (settingsRes.data && settingsRes.data.upi_config) {
        state.qrCodeUrl = settingsRes.data.upi_config.qrCodeUrl || state.qrCodeUrl;
        // Check for isQrEnabled explicitly
        if (settingsRes.data.upi_config.isQrEnabled !== undefined) {
          state.isQrEnabled = settingsRes.data.upi_config.isQrEnabled;
        }
      }
    } catch (e) {
      console.error("Settings fetch failed", e);
    }

    // Fetch Cart if logged in
    if (state.token) {
      state.cart = await fetchCartApi();
    }

    // Attempt to hydrate user profile if token exists but no user (optional, implies /me endpoint which we might not have, so skipping for now relying on login response)

    saveAppState(state);
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
  }
};

export const toggleTheme = () => {
  const state = getAppState();
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  saveAppState(state);
  return state.theme;
};

export const registerUser = async (user: Omit<User, 'id'>): Promise<User | null> => {
  try {
    const res = await api.post('/auth/register', {
      fullname: user.name,
      email: user.email,
      password: user.password,
      phone: user.mobile,
      role: 'User'
    });
    // Register success, but we usually require login after. 
    // Or we can auto-login if backend returns token. 
    // Backend Register (Step 707) returns { success: true, user } but NO token.
    // So return user and let component redirect to login.
    return {
      id: res.data.user._id,
      name: res.data.user.fullname,
      email: res.data.user.email,
      mobile: res.data.user.phone,
      address: '', // Default
      isAdmin: false
    };
  } catch (e) {
    console.error("Register failed", e);
    return null;
  }
};

export const loginUser = async (email: string, password?: string): Promise<User | null> => {
  try {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, user } = res.data;
      const mappedUser: User = {
        id: user.id || user._id,
        name: user.name || user.fullname,
        email: user.email,
        mobile: user.mobile,
        address: user.address || '',
        avatar: user.avatar,
        isAdmin: user.role === 'Admin'
      };

      memoryState.token = token;
      memoryState.currentUser = mappedUser;

      // Persist token for api.ts interceptor
      localStorage.setItem('token', token);

      // Fetch cart immediately
      memoryState.cart = await fetchCartApi();

      // Fetch orders immediately
      try {
        const ordersRes = await api.get('/order/my-orders');
        if (ordersRes.data && Array.isArray(ordersRes.data)) {
          memoryState.bookings = ordersRes.data.map((b: any) => ({
            ...b,
            id: b._id || b.id,
            customerName: b.shippingAddress?.fullName || 'Unknown',
            mobile: b.shippingAddress?.phone || '',
            address: b.shippingAddress ? `${b.shippingAddress.addressLine}, ${b.shippingAddress.city}, ${b.shippingAddress.state} - ${b.shippingAddress.pincode}` : '',
            productId: b.items?.[0]?.product?._id || b.items?.[0]?.product,
            serviceId: b.items?.[0]?.service?._id || b.items?.[0]?.service,
            status: b.status,
            createdAt: new Date(b.createdAt).getTime(),
            email: mappedUser.email
          }));
        }
      } catch (e) {
        console.error("Failed to fetch orders on login", e);
      }

      saveAppState(memoryState);
      return mappedUser;
    }
    return null;
  } catch (e) {
    console.error("Login failed", e);
    return null;
  }
};

export const logoutUser = () => {
  // Clear token and cart
  memoryState.token = undefined;
  memoryState.currentUser = null;
  memoryState.cart = [];

  localStorage.removeItem('token');

  saveAppState(memoryState);
};

export const updateUserProfile = async (userData: Partial<User>) => {
  const state = getAppState();

  if (state.token) {
    try {
      const res = await api.put('/auth/profile', userData);
      if (res.data.success) {
        // Merge response user (which might have avatar/updated fields)
        const newItem = { ...state.currentUser, ...res.data.user };
        state.currentUser = newItem;

        // Update in users array too if present
        const userIndex = state.users.findIndex(u => u.id === state.currentUser?.id);
        if (userIndex !== -1) {
          state.users[userIndex] = newItem;
        }
        saveAppState(state);
        return state.currentUser;
      }
    } catch (e) {
      console.error("Update profile failed", e);
      throw e;
    }
  }

  // Fallback (e.g. offline or no auth implementation yet)
  if (state.currentUser) {
    const updatedUser = { ...state.currentUser, ...userData };
    state.currentUser = updatedUser;

    const userIndex = state.users.findIndex(u => u.id === state.currentUser?.id);
    if (userIndex !== -1) {
      state.users[userIndex] = updatedUser;
    }
    saveAppState(state);
  }
};

export const updateProducts = (products: Product[]) => {
  const state = getAppState();
  state.products = products;
  saveAppState(state);
};

export const addBooking = async (booking: Omit<Booking, 'userId'>) => {
  const state = getAppState();

  if (state.token) {
    try {
      // Map Booking to Order Payload
      const payload = {
        shippingAddress: {
          fullName: booking.customerName,
          phone: booking.mobile,
          addressLine: booking.address,
          city: 'Mumbai', // Default
          state: 'MH', // Default 
          pincode: '400001', // Default valid
          country: 'India'
        },
        paymentMethod: 'COD',
        serviceId: booking.serviceId,
        productId: booking.productId,
        items: booking.items,
        paymentScreenshot: booking.paymentScreenshot
      };

      await api.post('/order', payload);
      // Auto-refresh orders if needed is handled by page reload or socket
    } catch (e) {
      console.error("Booking API Failed", e);
      alert("Failed to sync booking with server. Please try again.");
      return;
    }
  }

  // Optimistic / Local update (keep this for responsiveness or fallback)
  const newBooking = {
    ...booking,
    userId: state.currentUser?.id
  } as Booking;
  state.bookings.push(newBooking);
  saveAppState(state);
};

export const updateBookingStatus = (id: string, status: Booking['status']) => {
  const state = getAppState();
  const index = state.bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    state.bookings[index].status = status;
    saveAppState(state);
  }
};
export const addReview = async (review: Review) => {
  const state = getAppState();
  const productIndex = state.products.findIndex(p => p.id === review.productId);

  if (productIndex !== -1) {
    const product = state.products[productIndex];
    if (!product.reviews) product.reviews = [];

    product.reviews.push(review);
    product.reviewCount = product.reviews.length;
    product.rating = Number((product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviewCount).toFixed(1));

    state.products[productIndex] = product;
    saveAppState(state);

    if (state.token) {
      try {
        await api.post(`/product/${review.productId}/reviews`, {
          rating: review.rating,
          comment: review.comment,
          userName: review.userName,
          userAvatar: review.userAvatar
        });
      } catch (e) {
        console.error("Failed to add review", e);
      }
    }
  }
};

export const addToCart = async (productId: string) => {
  const state = getAppState();
  if (!state.cart) state.cart = [];

  // Optimistic update
  const existingItemIndex = state.cart.findIndex(item => item.productId === productId);
  if (existingItemIndex > -1) {
    state.cart[existingItemIndex].quantity += 1;
  } else {
    state.cart.push({ productId, quantity: 1 });
  }
  saveAppState(state);
  window.dispatchEvent(new Event('cart-updated'));

  // Sync with API
  if (state.token) {
    try {
      await api.post('/cart', { productId, quantity: 1 });
      // Optionally refetch to ensure sync
    } catch (e) {
      console.error("Add to cart failed", e);
    }
  }
};

export const removeFromCart = async (productId: string) => {
  const state = getAppState();
  if (!state.cart) return;
  state.cart = state.cart.filter(item => item.productId !== productId);
  saveAppState(state);
  window.dispatchEvent(new Event('cart-updated'));

  if (state.token) {
    try {
      await api.delete(`/cart/item/${productId}`);
    } catch (e) { console.error(e); }
  }
};

export const updateCartQuantity = async (productId: string, delta: number) => {
  const state = getAppState();
  if (!state.cart) return;

  const itemIndex = state.cart.findIndex(item => item.productId === productId);

  if (itemIndex > -1) {
    const newQuantity = state.cart[itemIndex].quantity + delta;
    if (newQuantity > 0) {
      state.cart[itemIndex].quantity = newQuantity;
    } else {
      state.cart.splice(itemIndex, 1);
    }
  }

  saveAppState(state);
  window.dispatchEvent(new Event('cart-updated'));

  if (state.token) {
    try {
      // Backend expects absolute quantity? Cart controller (Step 681) 'updateQuantity' takes 'quantity'.
      // Is it absolute or delta?
      // Line 61: item.quantity = quantity;
      // So it expects ABSOLUTE quantity.
      // Wait, addToCart logic in controller (Line 29) uses += quantity.
      // updateQuantity controller (Line 61) uses = quantity.
      // So I need to send the NEW absolute quantity.
      const item = state.cart.find(i => i.productId === productId);
      if (item) {
        await api.put('/cart', { productId, quantity: item.quantity });
      } else {
        // If item removed (quantity 0), use removeFromCart endpoint?
        // Or updateQuantity logic (Line 56) handles <= 0 by filtering out.
        // so sending 0 is fine.
        await api.put('/cart', { productId, quantity: 0 });
      }
    } catch (e) { console.error(e); }
  }
};

export const clearCart = async () => {
  const state = getAppState();
  state.cart = [];
  saveAppState(state);
  window.dispatchEvent(new Event('cart-updated'));

  if (state.token) {
    try {
      await api.delete('/cart/clear');
    } catch (e) { console.error(e); }
  }
};

export const uploadFile = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('image', file); // Backend expects 'image' key
  try {
    const res = await api.post('/upload', formData, {
      // Axios sets Content-Type to multipart/form-data automatically with correct boundary when data is FormData
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    // Backend returns { image: '/uploads/...' }
    return res.data.image;
  } catch (e) {
    console.error("Upload failed", e);
    return null;
  }
};

export const uploadOrderPaymentScreenshot = async (orderId: string, file: File) => {
  const url = await uploadFile(file);
  if (url) {
    try {
      await api.put(`/order/${orderId}/payment-screenshot`, { screenshotUrl: url });
      // Update local state
      const state = getAppState();
      const booking = state.bookings.find(b => b.id === orderId);
      if (booking) {
        booking.paymentScreenshot = url;
        saveAppState(state);
      }
      return url;
    } catch (e) {
      console.error("Failed to update payment screenshot", e);
      return null;
    }
  }
  return null;
};
