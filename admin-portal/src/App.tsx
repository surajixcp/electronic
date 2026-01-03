
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Wrench,
  CreditCard,
  ListChecks,
  Plus,
  Trash2,
  Edit3,
  Info,
  Users,
  User,
  ArrowUpRight,
  ShieldCheck,
  Search,
  ChevronRight,
  Activity,
  DollarSign,
  Clock,
  LogOut,
  Upload,
  Sun,
  Moon,
  Menu,
  X,
  ReceiptText
} from 'lucide-react';
import { subscribe, getAppState, saveAppState, updateBookingStatus, logoutUser, updateUserProfile, fetchInitialData, uploadUserAvatar, createServiceApi, deleteServiceApi, updateServiceApi, fetchServicesFromApi, addProduct, updateProduct, deleteProduct, fetchProductsFromApi, deleteBooking, verifyOrderPayment, uploadOrderInvoice, fetchUsersFromApi } from './services/storage';
import { BASE_URL } from './services/api';
import { BookingStatus, type Product, type RepairService, ProductCondition, ProductCategory } from './types';
import Login from './Login';

const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'bookings' | 'services' | 'payment' | 'profile'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [state, setState] = useState(getAppState());
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [serviceImage, setServiceImage] = useState<string | null>(null);
  const [productImageMode, setProductImageMode] = useState<'upload' | 'url'>('upload');
  const [serviceImageMode, setServiceImageMode] = useState<'upload' | 'url'>('upload');

  const [totalCustomers, setTotalCustomers] = useState(0);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'week' | 'month'>('week');

  const chartData = React.useMemo(() => {
    const days = analyticsTimeframe === 'week' ? 7 : 30;
    const data: { date: number; value: number }[] = [];
    const now = new Date();

    // Create buckets for last N days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      data.push({ date: d.getTime(), value: 0 });
    }

    // Fill buckets
    state.bookings.forEach((b: any) => {
      // Assume b.createdAt is timestamp
      const bDate = new Date(b.createdAt);
      bDate.setHours(0, 0, 0, 0);
      const dayTime = bDate.getTime();
      const bucket = data.find(d => d.date === dayTime);
      if (bucket) {
        bucket.value += b.totalAmount || 0;
      }
    });

    return data;
  }, [state.bookings, analyticsTimeframe]);

  const chartPath = React.useMemo(() => {
    if (chartData.length < 2) return "M 0,300 L 1000,300";

    const width = 1000;
    const height = 300;
    const maxVal = Math.max(...chartData.map(d => d.value), 1000); // Min max is 1000 so graph isn't flat 0 if empty

    const relevantHeight = height - 20; // 20px padding top

    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * width;
      const y = height - ((d.value / maxVal) * relevantHeight);
      return [x, y];
    });

    // Simple line for now (Bezier is complex to code inline accurately without lib)
    // Actually, let's try a simple Catmull-Rom or similar if possible, or just Line
    // Let's do straight lines for robustness, or simple Quadratic Bezier between points

    let path = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      // Simple smoothing: use midpoint control
      // path += ` L ${points[i+1][0]},${points[i+1][1]}`; 

      // Removed unused Bezier logic variables for lint fix
      path += ` Q ${points[i + 1][0]},${points[i + 1][1]} ${points[i + 1][0]},${points[i + 1][1]}`; // Linear fallback effectively
      // Actually for simplicity in this context, straight lines or standard L is safest visual
    }
    // Re-do with direct L for strict accuracy
    path = `M ${points[0][0]},${points[0][1]}`;
    points.slice(1).forEach(p => path += ` L ${p[0]},${p[1]}`);

    return path;
  }, [chartData]);

  // Fetch initial data
  React.useEffect(() => {
    fetchInitialData();
    fetchUsersFromApi().then(users => setTotalCustomers(users.length));

    // Subscribe to storage changes
    const unsubscribe = subscribe(() => {
      setState({ ...getAppState() });
    });
    return () => { unsubscribe(); };
  }, []);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Product Specs State
  const [newProductCondition, setNewProductCondition] = useState<ProductCondition>(ProductCondition.NEW);
  const [newProductDesc, setNewProductDesc] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [newProductSpecs, setNewProductSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Processor', value: '' },
    { key: 'RAM', value: '' }
  ]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory | ''>('');
  const [newProductIsAvailable, setNewProductIsAvailable] = useState(true);

  // Service State
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceBrand, setServiceBrand] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const [viewingPayment, setViewingPayment] = useState<any | null>(null);

  // UPI State
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [tempUpiId, setTempUpiId] = useState(state.upiId || 'shop@upi');

  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: state.currentUser?.name || '',
    email: state.currentUser?.email || '',
    mobile: state.currentUser?.mobile || '',
    address: state.currentUser?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) {
      alert('Name and Email are required');
      return;
    }

    updateUserProfile({
      name: profileForm.name,
      email: profileForm.email,
      mobile: profileForm.mobile,
      address: profileForm.address
    });

    // Refresh state
    setState(getAppState());
    alert('Profile updated successfully!');
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm.currentPassword !== state.currentUser?.password) {
      alert('Current password is incorrect');
      return;
    }
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (profileForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    updateUserProfile({ password: profileForm.newPassword });
    setState(getAppState());
    setProfileForm({ ...profileForm, currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Password updated successfully!');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadUserAvatar(file);
        setState(getAppState());
        alert('Profile picture updated successfully!');
      } catch (error) {
        console.error(error);
        alert('Failed to upload profile picture.');
      }
    }
  };

  const handleSaveUpi = () => {
    // Generate UPI Payment Link
    // Format: upi://pay?pa=ADDRESS&pn=NAME&cu=CURRENCY
    const upiLink = `upi://pay?pa=${tempUpiId}&pn=ElectroFix&cu=INR`;

    // Generate QR Code URL using public API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    const newState = {
      ...state,
      upiId: tempUpiId,
      qrCodeUrl: qrUrl
    };

    setState(newState);
    saveAppState(newState);
    setIsEditingUpi(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Customer', 'Mobile', 'Amount', 'Status'];
    const rows = state.bookings.map((b: any) => [
      b.id,
      new Date(b.createdAt).toLocaleDateString(),
      b.shippingAddress?.fullName || 'Unknown',
      b.shippingAddress?.phone || 'No Contact',
      b.totalAmount,
      b.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookings_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintManifest = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order Manifest</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1 { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>Order Manifest - ${new Date().toLocaleDateString()}</h1>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Details</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${state.bookings.map((b: any) => `
                  <tr>
                    <td>#${b.id ? b.id.toString().slice(-6).toUpperCase() : 'UNKNOWN'}</td>
                    <td>${b.shippingAddress?.fullName || 'Unknown'}<br><small>${b.shippingAddress?.phone}</small></td>
                    <td>${b.items?.map((i: any) => i.name || i.product?.name).join(', ') || 'Service Request'}</td>
                    <td>₹${b.totalAmount}</td>
                    <td>${b.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleAddSpec = () => {
    setNewProductSpecs([...newProductSpecs, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setNewProductSpecs(newProductSpecs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedSpecs = [...newProductSpecs];
    updatedSpecs[index][field] = value;
    setNewProductSpecs(updatedSpecs);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'service') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'product') {
          if (productImages.length < 5) {
            setProductImages([...productImages, reader.result as string]);
          } else {
            alert('Cannot add more than 5 images.');
          }
        } else {
          setServiceImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = () => {
    setState(getAppState());
  };

  const handleLogout = () => {
    logoutUser();
    setState(getAppState());
  };



  // Stats calculation
  const totalRevenue = state.bookings.reduce((sum: number, b: any) =>
    (b.status === BookingStatus.COMPLETED || b.status === BookingStatus.DELIVERED) ? sum + (b.totalAmount || 0) : sum
    , 0);
  const pendingOrders = state.bookings.filter((b: any) => b.status === BookingStatus.PENDING).length;

  const handleStatusChange = (bookingId: string, status: BookingStatus) => {
    updateBookingStatus(bookingId, status);
    setState(getAppState());
  };

  const [editingService, setEditingService] = useState<RepairService | null>(null);



  const handleDeleteService = async (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      const success = await deleteServiceApi(serviceId);
      if (success) {
        const updatedServices = state.services.filter((s: RepairService) => s.id !== serviceId);
        const newState = { ...state, services: updatedServices };
        saveAppState(newState);
        setState(newState);
      } else {
        alert('Failed to delete service');
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProductName(product.name || '');
    setNewProductBrand(product.brand || '');
    setNewProductCategory(product.category);
    setNewProductDesc(product.description || '');
    setNewProductCondition(product.condition);
    setOriginalPrice(product.originalPrice || product.price);
    setDiscount(product.discount || 0);
    setProductImages(product.images && product.images.length > 0 ? product.images : []);
    setNewProductIsAvailable(product.isAvailable !== undefined ? product.isAvailable : true);
    setNewProductSpecs(
      product.specs
        ? Object.entries(product.specs).map(([key, value]) => ({ key, value: String(value) }))
        : []
    );
    setShowAddProduct(true);
  };

  const handleEditService = (service: RepairService) => {
    setEditingService(service);
    setServiceTitle(service.title);
    setServiceBrand(service.brand);
    setServicePrice(service.basePrice.toString());
    setServiceCategory(service.category);
    setServiceDescription(service.description);
    setServiceImage(service.image);
    setServiceAvailable(service.isAvailable !== undefined ? service.isAvailable : true);
    setShowAddService(true);
  };

  const handleAddService = () => {
    setEditingService(null);
    setServiceTitle('');
    setServiceBrand('');
    setServicePrice('');
    setServiceCategory('');
    setServiceDescription('');
    setServiceImage('');
    setShowAddService(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle || !servicePrice) {
      alert('Title and Price are required');
      return;
    }

    const serviceData = {
      title: serviceTitle,
      brand: serviceBrand,
      basePrice: parseFloat(servicePrice),
      category: serviceCategory,
      description: serviceDescription,
      image: serviceImage,
      isAvailable: serviceAvailable
    };

    let result;
    if (editingService) {
      result = await updateServiceApi(editingService.id, serviceData);
    } else {
      result = await createServiceApi(serviceData);
    }

    if (result) {
      // Refresh list
      const updatedServices = await fetchServicesFromApi();
      const newState = { ...state, services: updatedServices };
      saveAppState(newState);
      setState(newState);

      setShowAddService(false);
      // Reset form
      setServiceTitle('');
      setServiceBrand('');
      setServicePrice('');
      setServiceCategory('');
      setServiceDescription('');
      setServiceImage('');
      setEditingService(null);
    } else {
      alert('Failed to save service');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || productImages.length === 0) {
      alert('Please fill all required fields (Name, Images).');
      return;
    }

    const finalPrice = Math.round(originalPrice - (originalPrice * discount / 100));

    // Convert specs array back to object
    const specsObject = newProductSpecs.reduce((acc, curr) => {
      if (curr.key) acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const productData: Product = {
      id: editingProduct ? editingProduct.id : 'P' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: newProductName,
      brand: newProductBrand,
      category: newProductCategory || ProductCategory.OTHER,
      description: newProductDesc,
      price: finalPrice,
      originalPrice: originalPrice,
      discount: discount,
      images: productImages,
      // image: productImages[0], // Removed to fix TS error
      specs: specsObject,
      condition: newProductCondition,
      stock: 50,
      isAvailable: newProductIsAvailable,
      warranty: '1 Year',
      featured: false
    };


    let success;
    if (editingProduct) {
      success = await updateProduct(editingProduct.id, productData);
    } else {
      // Remove random ID generation, backend handles it
      const { id, ...newProductData } = productData;
      success = await addProduct(newProductData);
    }

    if (success) {
      const updatedProducts = await fetchProductsFromApi();
      const newState = { ...state, products: updatedProducts };
      saveAppState(newState);
      setState(newState);
      setShowAddProduct(false);

      // Reset form
      setEditingProduct(null);
      setNewProductName('');
      setNewProductBrand('');
      setNewProductDesc('');
      setOriginalPrice(0);
      setDiscount(0);
      setProductImages([]);
      setNewProductSpecs([{ key: '', value: '' }]);
    } else {
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const success = await deleteProduct(productId);
      if (success) {
        const updatedProducts = await fetchProductsFromApi();
        const newState = { ...state, products: updatedProducts };
        saveAppState(newState);
        setState(newState);
      } else {
        alert('Failed to delete product');
      }
    }
  };

  const handleToggleQr = () => {
    const newState = { ...state, isQrEnabled: !state.isQrEnabled };
    setState(newState);
    saveAppState(newState);
  };

  if (!state.currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f1a] flex flex-col lg:flex-row font-sans">
      {/* Sidebar - Responsive */}
      {/* Sidebar - Responsive */}
      <aside className={`fixed inset-0 z-50 bg-white dark:bg-[#111827] lg:static lg:w-80 border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col gap-10 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="text-white w-7 h-7" />
            </div>
            <div>
              <span className="block font-black text-xl tracking-tighter dark:text-white leading-none">Electro<span className="text-emerald-500">Fix</span></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner Portal</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'bookings', label: 'Order Queue', icon: ListChecks },
            { id: 'inventory', label: 'Stock Manager', icon: Package },
            { id: 'services', label: 'Repair Catalog', icon: Wrench },
            { id: 'payment', label: 'Financials', icon: CreditCard },
            { id: 'profile', label: 'Profile Settings', icon: Users },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
              className={`flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all group whitespace-nowrap text-base ${activeTab === item.id
                ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-500 dark:text-slate-300 group-hover:text-emerald-500'} transition-colors`}>
                <item.icon size={20} />
              </span>
              {item.label}
              {item.id === 'bookings' && pendingOrders > 0 && (
                <span className={`ml-auto w-5 h-5 flex items-center justify-center text-[10px] rounded-full font-black ${activeTab === item.id ? 'bg-white text-emerald-500' : 'bg-emerald-500 text-white'}`}>
                  {pendingOrders}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="hidden lg:block pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <img src={state.currentUser?.avatar ? (state.currentUser.avatar.startsWith('http') ? state.currentUser.avatar : `http://localhost:5000${state.currentUser.avatar}`) : "https://i.pravatar.cc/100?u=admin"} alt="Admin" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#111827] rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black dark:text-white leading-none truncate">{state.currentUser?.name || "Admin User"}</p>
              <p className="text-[10px] text-slate-400 font-bold truncate">{state.currentUser?.email}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase">System Load</span>
              <span className="text-[10px] font-black text-emerald-500">Normal</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="w-[12%] h-full bg-emerald-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 p-4 lg:p-16 overflow-y-auto h-screen scrollbar-hide">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6 mb-8 lg:mb-16">
          <div className="space-y-1 lg:space-y-2 flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white capitalize tracking-tighter">
                {activeTab === 'inventory' ? 'Stock Manager' : activeTab === 'bookings' ? 'Order Queue' : activeTab === 'profile' ? 'Profile Settings' : activeTab}
              </h2>
              <div className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                <span>Merchant Console</span>
                <ChevronRight size={14} />
                <span className="text-emerald-500">Global Environment</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 lg:pl-12 pr-4 lg:pr-6 py-2 lg:py-3.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl text-[10px] lg:text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none w-32 lg:w-72 transition-all"
              />
            </div>
            <button className="p-2 lg:p-3.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl lg:rounded-2xl text-slate-400 hover:text-emerald-500 transition-all">
              <Activity size={16} className="lg:hidden" />
              <Activity size={20} className="hidden lg:block" />
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-8">
              {[
                { label: 'Settled Revenue', val: `₹${totalRevenue.toLocaleString()}`, sub: 'Lifetime sales', icon: <DollarSign className="text-emerald-500" />, bg: 'bg-emerald-500/10' },
                { label: 'Pending Queue', val: pendingOrders.toString(), sub: 'Awaiting confirmation', icon: <Clock className="text-amber-500" />, bg: 'bg-amber-500/10' },
                { label: 'Inventory Count', val: state.products.length.toString(), sub: 'Unique SKUs', icon: <Package className="text-blue-500" />, bg: 'bg-blue-500/10' },
                { label: 'Customer Base', val: totalCustomers.toString(), sub: 'Verified users', icon: <Users className="text-purple-500" />, bg: 'bg-purple-500/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-[#111827] p-4 lg:p-8 rounded-2xl lg:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
                  <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>{stat.icon}</div>
                    <ArrowUpRight className="text-slate-300" size={20} />
                  </div>
                  <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{stat.val}</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1">
              <div className="bg-white dark:bg-[#111827] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black dark:text-white">Growth Analytics</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAnalyticsTimeframe('week')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${analyticsTimeframe === 'week' ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => setAnalyticsTimeframe('month')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${analyticsTimeframe === 'month' ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                    >
                      30 Days
                    </button>
                  </div>
                </div>
                <div className="h-96 w-full relative">
                  {/* Custom SVG Line Chart */}
                  <div className="absolute inset-0 flex flex-col justify-between text-xs font-bold text-slate-300 pl-8 pb-8 z-10 pointer-events-none">
                    {[100, 75, 50, 25, 0].map(pct => (
                      <div key={pct} className="border-b border-dashed border-slate-100 dark:border-slate-800 w-full h-full flex items-end">
                        {/* Dynamic Y-Axis Labels could go here if we calculated max revenue */}
                      </div>
                    ))}
                  </div>
                  <svg className="absolute inset-0 w-full h-full pl-8 pb-8 overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <path d={`${chartPath} L 1000,300 L 0,300 Z`} fill="url(#chartGradient)" />
                    <path d={chartPath} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {/* X-Axis Labels */}
                  <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] font-bold text-slate-400 pt-2">
                    {chartData.filter((_, i) => i % (analyticsTimeframe === 'week' ? 1 : 4) === 0).map((d, i) => (
                      <span key={i}>{new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-[#111827] rounded-3xl lg:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 lg:p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-transparent">
              <div>
                <h3 className="font-black text-xl lg:text-2xl dark:text-white">Active Queue</h3>
                <p className="text-slate-400 text-xs lg:text-sm font-bold">Manage customer requests and repair jobs.</p>
              </div>
              <div className="flex gap-2 lg:gap-4 w-full md:w-auto">
                <button onClick={handleExportCSV} className="flex-1 md:flex-none px-4 py-2 lg:px-6 lg:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Export CSV</button>
                <button onClick={handlePrintManifest} className="flex-1 md:flex-none px-4 py-2 lg:px-6 lg:py-3 bg-emerald-500 text-white rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Print Manifest</button>
              </div>
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-10 py-6">ID & Date</th>
                    <th className="px-10 py-6">Customer</th>
                    <th className="px-10 py-6">Service/Model</th>
                    <th className="px-10 py-6">Internal Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {state.bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="font-mono text-xs text-emerald-500 font-bold mb-1">#{booking.id ? booking.id.toString().slice(-6).toUpperCase() : 'UNKNOWN'}</div>
                        <div className="text-xs text-slate-400 font-bold">{new Date(booking.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="font-black text-slate-900 dark:text-white">{booking.shippingAddress?.fullName || booking.user?.name || 'Unknown User'}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{booking.shippingAddress?.phone || booking.user?.mobile || booking.mobile || 'No Contact'}</div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="text-sm font-bold truncate max-w-[200px] dark:text-slate-200">
                          {booking.items && booking.items.length > 0 ? (
                            <div>
                              <span className="text-emerald-500 font-bold">{booking.items.length} Items</span>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {booking.items.map((item: any, idx: number) => {
                                  const p = state.products.find((prod: any) => prod.id === (item.product || item.productId));
                                  return (
                                    <div key={idx} className="flex items-center gap-2 mt-1">
                                      {p && p.images && p.images.length > 0 && (
                                        <img src={p.images[0]} alt="" className="w-5 h-5 rounded-md object-cover border border-slate-200 dark:border-slate-700" />
                                      )}
                                      <div className="truncate">{p?.name || item.name || 'Unknown Item'} <span className="text-slate-500">(x{item.quantity})</span></div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : booking.productId ? state.products.find((p: any) => p.id === booking.productId)?.name :
                            state.services.find((s: any) => s.id === booking.serviceId)?.title || 'Custom Request'}
                        </div>
                        <div className="text-xs font-black text-emerald-500 uppercase tracking-tighter mt-1">₹{booking.totalAmount}</div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="relative inline-block w-40">
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                            className={`w-full text-[10px] font-black px-4 py-3 rounded-xl appearance-none cursor-pointer border-none shadow-sm transition-all ${booking.status === BookingStatus.CONFIRMED ? 'bg-emerald-500 text-white' :
                              booking.status === BookingStatus.SHIPPED ? 'bg-purple-500 text-white' :
                                booking.status === BookingStatus.DELIVERED ? 'bg-blue-500 text-white' :
                                  booking.status === BookingStatus.PENDING ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                    booking.status === BookingStatus.COMPLETED ? 'bg-slate-800 text-white' :
                                      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                              }`}
                          >
                            {Object.values(BookingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-2">
                          {booking.paymentScreenshot && (
                            <div className="flex gap-2">
                              <button onClick={() => setViewingPayment(booking)} className={`p-3 rounded-2xl transition-all ${booking.isPaymentVerified ? 'text-emerald-500 bg-emerald-50' : 'text-amber-500 bg-amber-50 animate-pulse'}`} title="View Payment Proof">
                                <CreditCard size={18} />
                              </button>
                              {!booking.isPaymentVerified && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Verify this payment?')) {
                                      await verifyOrderPayment(booking.id);
                                      window.location.reload(); // Simple reload to refresh state
                                    }
                                  }}
                                  className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl"
                                  title="Mark Payment Verified"
                                >
                                  <ShieldCheck size={18} />
                                </button>
                              )}
                            </div>
                          )}

                          <label className={`p-3 rounded-2xl transition-all cursor-pointer ${booking.invoiceUrl ? 'text-blue-500 bg-blue-50' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`} title={booking.invoiceUrl ? "Replace Invoice" : "Upload Invoice"}>
                            <ReceiptText size={18} />
                            <input
                              type="file"
                              className="hidden"
                              accept="application/pdf,image/*"
                              onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                  await uploadOrderInvoice(booking.id, e.target.files[0]);
                                  alert('Invoice uploaded!');
                                  window.location.reload();
                                }
                              }}
                            />
                          </label>

                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this order?')) {
                                await deleteBooking(booking.id);
                              }
                            }}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
                            title="Delete Order"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {state.bookings.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-40 text-slate-300 font-bold italic">No active requests in queue.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Mobile Card View for Bookings */}
            <div className="md:hidden space-y-4 p-4">
              {state.bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((booking: any) => (
                <div key={booking.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-mono text-xs text-emerald-500 font-bold">#{booking.id}</div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{booking.shippingAddress?.fullName || booking.user?.name || 'Unknown User'}</div>
                    </div>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                      className={`text-[10px] font-black px-2 py-1 rounded-lg border-none shadow-sm ${booking.status === BookingStatus.CONFIRMED ? 'bg-emerald-500 text-white' :
                        booking.status === BookingStatus.SHIPPED ? 'bg-purple-500 text-white' :
                          booking.status === BookingStatus.DELIVERED ? 'bg-blue-500 text-white' :
                            booking.status === BookingStatus.PENDING ? 'bg-amber-100 text-amber-600' :
                              'bg-slate-200 text-slate-600'
                        }`}
                    >
                      {Object.values(BookingStatus).map(s => <option key={s} value={s}>{s.substring(0, 3)}</option>)}
                    </select>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {booking.items && booking.items.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {booking.items.map((item: any, idx: number) => {
                          const p = state.products.find((prod: any) => prod.id === (item.product || item.productId));
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              {p && p.images && p.images.length > 0 && (
                                <img src={p.images[0]} alt="" className="w-4 h-4 rounded object-cover" />
                              )}
                              <span>{p?.name || item.name} (x{item.quantity})</span>
                            </div>
                          )
                        })}
                        <span className="mt-1 font-bold text-emerald-500">Total: ₹{booking.totalAmount}</span>
                      </div>
                    ) : (
                      <span>{state.services.find((s: any) => s.id === booking.serviceId)?.title || 'Service'} • ₹{booking.totalAmount}</span>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                    {booking.paymentScreenshot && (
                      <button onClick={() => setViewingPayment(booking)} className="p-2 text-emerald-500 bg-emerald-50 rounded-lg">
                        <CreditCard size={14} />
                      </button>
                    )}
                    <button className="p-2 text-slate-400 bg-white dark:bg-slate-800 rounded-lg border"><Edit3 size={14} /></button>
                    <button className="p-2 text-red-500 bg-white dark:bg-slate-800 rounded-lg border"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
        }

        {
          activeTab === 'inventory' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-black dark:text-white">Product Catalog</h3>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProductName('');
                    setNewProductBrand('');
                    setNewProductDesc('');
                    setOriginalPrice(0);
                    setDiscount(0);
                    setProductImages([]);
                    setNewProductSpecs([{ key: '', value: '' }]);
                    setShowAddProduct(true);
                  }}
                  className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
                >
                  <Plus size={20} /> Add Item
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
                {state.products.map((product: Product) => (
                  <div key={product.id} className="bg-white dark:bg-[#111827] rounded-xl lg:rounded-[2.5rem] p-2 lg:p-6 border border-slate-200 dark:border-slate-800 shadow-sm group">
                    <div className="relative aspect-square rounded-lg lg:rounded-[2rem] bg-slate-50 dark:bg-slate-900 overflow-hidden mb-2 lg:mb-6">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{product.brand}</span>
                      </div>
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-3 bg-white/90 backdrop-blur dark:bg-slate-800/90 text-red-500 rounded-xl shadow-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{product.category}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${product.condition === ProductCondition.NEW ? 'bg-emerald-500/10 text-emerald-600' : 'bg-indigo-500/10 text-indigo-600'
                          }`}>
                          {product.condition}
                        </span>
                      </div>
                      <h4 className="text-xs lg:text-lg font-black dark:text-white truncate">{product.name}</h4>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
                        <span className="text-sm lg:text-xl font-black dark:text-white">₹{product.price}</span>
                        <button onClick={() => handleEditProduct(product)} className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 transition-colors">Edit</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {
          activeTab === 'payment' && (
            <div className="max-w-4xl space-y-6 lg:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white dark:bg-[#111827] p-6 lg:p-12 rounded-3xl lg:rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 lg:space-y-12">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 lg:space-y-2">
                    <h3 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Gateway Config</h3>
                    <p className="text-[8px] lg:text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Payment Processing Unit</p>
                  </div>
                  <button
                    onClick={handleToggleQr}
                    className={`w-20 h-10 rounded-full relative transition-all shadow-inner ${state.isQrEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all shadow-md ${state.isQrEnabled ? 'left-11' : 'left-1'}`}></div>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked UPI ID</label>
                      <div className="flex flex-col gap-4">
                        <div className="relative">
                          <input
                            type="text"
                            value={isEditingUpi ? tempUpiId : state.upiId || 'shop@upi'}
                            onChange={(e) => setTempUpiId(e.target.value)}
                            disabled={!isEditingUpi}
                            className={`w-full px-4 py-3 lg:px-8 lg:py-5 rounded-xl lg:rounded-2xl bg-slate-50 dark:bg-slate-900 border font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-white text-xs lg:text-base ${isEditingUpi
                              ? 'border-emerald-500 bg-white dark:bg-slate-800'
                              : 'border-slate-100 dark:border-slate-800 text-slate-500 cursor-not-allowed opacity-75'
                              }`}
                          />
                          {!isEditingUpi && (
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500">
                              <ShieldCheck size={20} />
                            </div>
                          )}
                        </div>

                        {isEditingUpi ? (
                          <div className="flex gap-2 lg:gap-3">
                            <button
                              onClick={() => {
                                setIsEditingUpi(false);
                                setTempUpiId(state.upiId || 'shop@upi');
                              }}
                              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 px-4 py-3 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl font-black text-xs lg:text-base hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveUpi}
                              className="flex-1 bg-emerald-500 text-white px-4 py-3 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] lg:text-base font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                            >
                              Save & Generate
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setIsEditingUpi(true);
                              setTempUpiId(state.upiId || 'shop@upi');
                            }}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 lg:px-10 lg:py-5 rounded-xl lg:rounded-2xl font-black text-xs lg:text-base shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                          >
                            <Edit3 size={16} className="lg:hidden" />
                            <Edit3 size={18} className="hidden lg:block" /> Edit UPI ID
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-5 p-8 bg-blue-50 dark:bg-blue-500/5 text-blue-700 dark:text-blue-400 rounded-3xl text-xs font-bold leading-relaxed border border-blue-100 dark:border-blue-500/10">
                      <Info size={28} className="shrink-0" />
                      <p>Updating the UPI ID will automatically regenerate the payment QR code below. The system uses a standard secure UPI intent link format compatible with all major payment apps.</p>
                    </div>
                  </div>

                  <div className="space-y-4 lg:space-y-6">
                    <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Checkout Preview</p>
                    <div className="p-6 lg:p-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl lg:rounded-[3rem] border-2 lg:border-4 border-dashed border-slate-200 dark:border-slate-800 text-center flex items-center justify-center">
                      <div className="bg-white p-4 lg:p-8 inline-block rounded-2xl lg:rounded-[2.5rem] shadow-2xl hover:rotate-3 transition-transform duration-500">
                        <img src={state.qrCodeUrl} alt="Preview" className="w-32 h-32 lg:w-64 lg:h-64 object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {
          activeTab === 'services' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-black dark:text-white">Repair Services</h3>
                <button
                  onClick={handleAddService}
                  className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
                >
                  <Plus size={20} /> Add Service
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8">
                {state.services.map((service: RepairService) => (
                  <div key={service.id} className="bg-white dark:bg-[#111827] rounded-xl lg:rounded-[2.5rem] p-2 lg:p-6 border border-slate-200 dark:border-slate-800 shadow-sm group">
                    <div className="relative aspect-square lg:aspect-video rounded-lg lg:rounded-[2rem] bg-slate-50 dark:bg-slate-900 overflow-hidden mb-2 lg:mb-6">
                      <img src={service.image || "https://images.unsplash.com/photo-1581092921461-eab62e97a78e?q=80&w=800&auto=format&fit=crop"} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{service.brand}</span>
                      </div>
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {/* Conceptual Delete Button */}
                        <button onClick={() => handleDeleteService(service.id)} className="p-3 bg-white/90 backdrop-blur dark:bg-slate-800/90 text-red-500 rounded-xl shadow-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">{service.category}</span>
                      </div>
                      <h4 className="text-sm lg:text-lg font-black dark:text-white truncate">{service.title}</h4>
                      <p className="text-xs text-slate-400 font-bold line-clamp-2">{service.description}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
                        <span className="text-sm lg:text-xl font-black dark:text-white">₹{service.basePrice}</span>
                        <button onClick={() => handleEditService(service)} className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 transition-colors">Edit</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {activeTab === 'profile' && (
          <div className="max-w-7xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Avatar Section */}
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-[#111827] dark:to-[#0b0f1a] p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

              <div className="relative group shrink-0">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-white dark:bg-slate-800 ring-4 ring-white dark:ring-slate-900 shadow-2xl relative z-10">
                  <img src={state.currentUser?.avatar ? (state.currentUser.avatar.startsWith('http') ? state.currentUser.avatar : `http://localhost:5000${state.currentUser.avatar}`) : "https://i.pravatar.cc/100?u=admin"} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <label className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-full z-20 backdrop-blur-sm">
                  <Upload className="text-white drop-shadow-lg" size={32} />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-4 border-white dark:border-[#111827] z-20">
                  <Edit3 size={16} />
                </div>
              </div>

              <div className="text-center md:text-left space-y-3 z-10">
                <div>
                  <h3 className="text-3xl font-black dark:text-white tracking-tight">{state.currentUser?.name || "Admin User"}</h3>
                  <p className="text-slate-400 font-bold text-lg">{state.currentUser?.email || "adminelectrofix@gmail.com"}</p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                  <span className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Super Admin</span>
                  <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">Verified</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Details Form */}
              <div className="bg-white dark:bg-[#111827] p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <User size={20} />
                  </div>
                  <h3 className="text-xl font-black dark:text-white">Personal Details</h3>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-6 py-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 hover:border-emerald-500/30 text-slate-900 dark:text-white font-bold outline-none transition-all duration-200"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-6 py-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 hover:border-emerald-500/30 text-slate-900 dark:text-white font-bold outline-none transition-all duration-200"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.mobile}
                        onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                        className="w-full px-6 py-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 hover:border-emerald-500/30 text-slate-900 dark:text-white font-bold outline-none transition-all duration-200"
                        placeholder="+91..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Address</label>
                      <input
                        type="text"
                        value={profileForm.address}
                        onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="w-full px-6 py-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 hover:border-emerald-500/30 text-slate-900 dark:text-white font-bold outline-none transition-all duration-200"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all">
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Form */}
              <div className="bg-white dark:bg-[#111827] p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-xl font-black dark:text-white">Security & Password</h3>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-6 flex-1 flex flex-col">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                    <input
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={e => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                      className="w-full px-6 py-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 hover:border-emerald-500/30 text-slate-900 dark:text-white font-bold outline-none transition-all duration-200"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                    <input
                      type="password"
                      value={profileForm.newPassword}
                      onChange={e => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      className="w-full px-6 py-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 hover:border-emerald-500/30 text-slate-900 dark:text-white font-bold outline-none transition-all duration-200"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={e => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      className="w-full px-6 py-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 hover:border-emerald-500/30 text-slate-900 dark:text-white font-bold outline-none transition-all duration-200"
                      placeholder="Re-enter new password"
                    />
                  </div>
                  <div className="pt-4 mt-auto">
                    <button type="submit" className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                      Update Password
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-bold mt-4">Last updated 3 days ago</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main >

      {/* Add Product Modal (Simple conceptual version) */}
      {
        showAddProduct && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#111827] w-[95%] max-w-lg rounded-3xl md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl border border-white/20 dark:border-slate-800 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide relative">
              <button
                onClick={() => setShowAddProduct(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 transition-colors z-10"
              >
                <X size={16} />
              </button>
              <h3 className="text-2xl lg:text-3xl font-black mb-6 lg:mb-8 dark:text-white">{editingProduct ? 'Edit Inventory Item' : 'New Inventory Item'}</h3>
              <form className="space-y-6" onSubmit={handleSaveProduct}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. iPad Pro M4"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Name</label>
                  <input
                    type="text"
                    value={newProductBrand}
                    onChange={(e) => setNewProductBrand(e.target.value)}
                    placeholder="e.g. Apple"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Images (Max 5)</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setProductImageMode('upload')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${productImageMode === 'upload' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductImageMode('url')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${productImageMode === 'url' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {/* Image Grid */}
                  {productImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-3">
                      {productImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setProductImages(productImages.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {productImages.length < 5 && (
                    <>
                      {productImageMode === 'upload' ? (
                        <div className="relative group cursor-pointer h-24">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'product')}
                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                          />
                          <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                              <Plus size={16} />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                              Add Image {productImages.length + 1}/5
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value;
                                if (val) {
                                  setProductImages([...productImages, val]);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white text-xs"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = ((e.target as HTMLElement).previousElementSibling as HTMLInputElement);
                              if (input && input.value) {
                                setProductImages([...productImages, input.value]);
                                input.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-wider"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
                  <textarea
                    value={newProductDesc}
                    onChange={(e) => setNewProductDesc(e.target.value)}
                    placeholder="Brief overview of the product..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white h-24 resize-none"
                  ></textarea>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specifications</label>
                    <button type="button" onClick={handleAddSpec} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-600 transition-colors flex items-center gap-1">
                      <Plus size={14} /> Add Spec
                    </button>
                  </div>
                  <div className="space-y-3">
                    {newProductSpecs.map((spec, index) => (
                      <div key={`${index}-${spec.key || 'new'}`} className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Feature"
                          value={spec.key || ''}
                          onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                          className="w-1/3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-bold outline-none dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 16GB)"
                          value={spec.value || ''}
                          onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                          className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-bold outline-none dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(index)}
                          className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>



                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Original Price (₹)</label>
                    <input
                      type="number"
                      value={originalPrice || ''}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      placeholder="1000"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount (%)</label>
                    <input
                      type="number"
                      value={discount || ''}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      placeholder="10"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Final Price (₹)</label>
                    <div className="w-full px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 font-black text-emerald-500 flex items-center">
                      {Math.round(originalPrice - (originalPrice * discount / 100))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value as ProductCategory)}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white"
                    >
                      {Object.values(ProductCategory).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Condition</label>
                  <div className="flex gap-3">
                    {[ProductCondition.NEW, ProductCondition.USED, ProductCondition.REFURBISHED].map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setNewProductCondition(cond)}
                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${newProductCondition === cond
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-emerald-500/50'
                          }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Availability Status</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setNewProductIsAvailable(true)}
                      className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${newProductIsAvailable
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-emerald-500/50'
                        }`}
                    >
                      In Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProductIsAvailable(false)}
                      className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${!newProductIsAvailable
                        ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-red-500/50'
                        }`}
                    >
                      Out of Stock
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setShowAddProduct(false)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black">Cancel</button>
                  <button type="submit" className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20">{editingProduct ? 'Update Product' : 'Commit Stock'}</button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Add Service Modal */}
      {
        showAddService && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#111827] w-[95%] max-w-lg rounded-3xl md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl border border-white/20 dark:border-slate-800 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide relative">
              <button
                onClick={() => setShowAddService(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 transition-colors z-10"
              >
                <X size={16} />
              </button>
              <h3 className="text-2xl lg:text-3xl font-black mb-6 lg:mb-8 dark:text-white">New Service Catalog Item</h3>
              <form className="space-y-6" onSubmit={handleSaveService}>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Availability Status</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setServiceAvailable(true)}
                      className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${serviceAvailable
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-emerald-500/50'
                        }`}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceAvailable(false)}
                      className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${!serviceAvailable
                        ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-red-500/50'
                        }`}
                    >
                      Unavailable
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Title</label>
                  <input
                    type="text"
                    placeholder="e.g. HDMI Port Repair"
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Samsung"
                    value={serviceBrand}
                    onChange={(e) => setServiceBrand(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Image</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setServiceImageMode('upload')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${serviceImageMode === 'upload' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setServiceImageMode('url')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${serviceImageMode === 'url' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {serviceImageMode === 'upload' ? (
                    <div className="relative group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'service')}
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                      />
                      <div className={`w-full h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 transition-all ${serviceImage ? 'bg-slate-50 dark:bg-slate-900 border-emerald-500' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                        {serviceImage ? (
                          <div className="relative w-full h-full p-2">
                            <img src={serviceImage} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                              <p className="text-white text-xs font-bold">Click to change</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                              <Upload size={20} />
                            </div>
                            <p className="text-xs text-slate-400 font-bold text-center">
                              <span className="text-emerald-500">Click to upload</span> or drag and drop<br />
                              <span className="text-[10px] opacity-70">SVG, PNG, JPG or GIF (max. 5MB)</span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="https://..."
                      onChange={(e) => setServiceImage(e.target.value)}
                      value={serviceImage || ''}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white"
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Price (₹)</label>
                    <input
                      type="number"
                      placeholder="49"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Console Repair"
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    placeholder="Brief details about the service operation..."
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold outline-none dark:text-white h-24 resize-none"
                  ></textarea>
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setShowAddService(false)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black">Cancel</button>
                  <button type="submit" className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20">{editingService ? 'Update Service' : 'Add Service'}</button>

                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Payment Verification Modal */}
      {
        viewingPayment && (
          <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#111827] w-[95%] max-w-lg rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-800 animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-black mb-6 dark:text-white">Verify Payment</h3>

              <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-4 mb-6">
                <img
                  src={viewingPayment.paymentScreenshot.startsWith('http') ? viewingPayment.paymentScreenshot : `${BASE_URL}${viewingPayment.paymentScreenshot}`}
                  alt="Payment Proof"
                  className="w-full h-auto rounded-xl object-contain max-h-[60vh]"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setViewingPayment(null)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    await verifyOrderPayment(viewingPayment.id);
                    setViewingPayment(null);
                    window.location.reload();
                  }}
                  className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20"
                >
                  Confirm Payment & Verify
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default AdminPortal;
