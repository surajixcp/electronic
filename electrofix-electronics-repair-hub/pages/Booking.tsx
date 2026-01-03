
import React, { useEffect } from 'react';
// Re-importing useSearchParams and useNavigate from react-router-dom to resolve missing exported member error
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Upload, CheckCircle, Info, ShoppingCart, X } from 'lucide-react';
import { useAppState } from '../services/hooks';
import { addBooking, clearCart } from '../services/storage';
import { BookingStatus } from '../types';

const Booking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products, services, qrCodeUrl, isQrEnabled, currentUser, cart } = useAppState();

  const mode = searchParams.get('mode');
  const productId = searchParams.get('productId');
  const serviceId = searchParams.get('serviceId');

  const selectedProduct = products.find(p => p.id === productId);
  const selectedService = services.find(s => s.id === serviceId);

  // Cart Logic
  const cartItems = mode === 'cart' ? (cart || []).map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    product: products.find(p => p.id === item.productId)
  })).filter(item => item.product) : [];

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const [step, setStep] = React.useState<1 | 2>(1);
  const [formData, setFormData] = React.useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    notes: '',
    screenshot: null as File | null,
    screenshotPreview: ''
  });

  // Effect to pre-fill user data
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name,
        mobile: currentUser.mobile,
        email: currentUser.email,
        address: currentUser.address
      }));
    }
  }, [currentUser]);

  const totalAmount = mode === 'cart' ? cartTotal : (selectedProduct?.price || selectedService?.basePrice || 0);

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      if (confirm('Logging in helps us track your order better. Would you like to sign in first?')) {
        navigate('/auth', { state: { from: { pathname: '/booking' + window.location.search } } });
        return;
      }
    }

    if (!formData.name || !formData.mobile || !formData.address) {
      alert('Please fill all mandatory fields');
      return;
    }
    setStep(2);
  };

  const handleConfirmBooking = async () => {
    const bookingId = 'B' + Math.random().toString(36).substr(2, 9).toUpperCase();

    await addBooking({
      id: bookingId,
      customerName: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      address: formData.address,
      productId: mode !== 'cart' ? (productId || undefined) : undefined,
      serviceId: mode !== 'cart' ? (serviceId || undefined) : undefined,
      items: mode === 'cart' ? cartItems.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.product!.price
      })) : undefined,
      notes: formData.notes,
      paymentScreenshot: formData.screenshotPreview || undefined,
      status: BookingStatus.PENDING,
      createdAt: Date.now(),
      totalAmount
    });

    if (mode === 'cart') {
      clearCart();
    }

    alert('Booking Submitted Successfully! Admin will contact you shortly.');
    navigate('/orders');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 md:mb-4">Confirm Your {selectedService ? 'Service' : 'Order'}</h1>
            <p className="text-slate-500 text-sm md:text-base">Fill in your details below to proceed with your request.</p>
          </div>
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors md:hidden">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Form/Status */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
              <div className="h-[2px] w-12 bg-slate-100"></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleSubmitDetails} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Mobile Number *</label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Delivery / Pickup Address *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Flat No, Building, Street, City, Pincode"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Additional Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Any specific requests or instructions..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-xl hover:shadow-emerald-100"
                >
                  Proceed to Payment <ChevronRight size={20} />
                </button>
              </form>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Details Verified</h3>
                    <p className="text-sm text-emerald-700">Please complete the payment to finalize.</p>
                  </div>
                </div>

                {isQrEnabled ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Scan & Pay</h3>
                      <p className="text-slate-500 text-sm mb-6">QR scan karke payment karein aur booking confirm karein</p>
                      <div className="inline-block p-4 bg-white border-2 border-slate-100 rounded-3xl shadow-lg">
                        <img src={qrCodeUrl} alt="Payment QR" className="w-64 h-64 object-contain" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Upload size={18} /> Upload Payment Proof
                      </div>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer">
                        <input type="file" className="hidden" id="screenshot-upload" onChange={(e) => setFormData({ ...formData, screenshot: e.target.files?.[0] || null })} />
                        <label htmlFor="screenshot-upload" className="cursor-pointer">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 mx-auto">
                            <Upload className="text-slate-400" size={20} />
                          </div>
                          <p className="font-bold text-slate-900 mb-1">{formData.screenshot ? formData.screenshot.name : 'Click to upload screenshot'}</p>
                          <p className="text-xs text-slate-400">PNG, JPG (MAX. 5MB)</p>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-amber-50 border border-amber-100 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Info className="text-amber-500" size={24} />
                    </div>
                    <p className="text-amber-700 font-medium text-sm">QR payment is currently disabled. Please contact support or continue to submit an enquiry.</p>
                  </div>
                )}



                <div className="mt-6 p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Upload size={18} /> Upload Payment Screenshot
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">Please upload a screenshot of your payment confirmation for verification.</p>

                  {formData.screenshotPreview ? (
                    <div className="relative">
                      <img src={formData.screenshotPreview} alt="Payment Screenshot" className="w-full h-48 object-cover rounded-xl" />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, screenshotPreview: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({ ...prev, screenshotPreview: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    Go Back
                  </button>
                  <button onClick={handleConfirmBooking} className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                    Confirm Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl sticky top-24">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShoppingCart size={20} className="text-emerald-400" /> Summary
            </h3>

            <div className="space-y-4 mb-8">
              {selectedProduct && (
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800">
                    <img src={selectedProduct.images[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{selectedProduct.name}</div>
                    <div className="text-xs text-slate-400">{selectedProduct.condition}</div>
                  </div>
                  <div className="ml-auto font-bold">₹{selectedProduct.price}</div>
                </div>
              )}
              {selectedService && (
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
                    <CheckCircle className="text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{selectedService.title}</div>
                    <div className="text-xs text-slate-400 mb-1">{selectedService.category}</div>
                    <div className="text-[10px] text-slate-500 leading-tight max-w-[150px]">{selectedService.description}</div>
                  </div>
                  <div className="ml-auto font-bold">₹{selectedService.basePrice}</div>
                </div>
              )}
              {!selectedProduct && !selectedService && mode !== 'cart' && (
                <div className="text-slate-400 text-sm italic">No items selected</div>
              )}

              {mode === 'cart' && cartItems.map(({ product, quantity }) => (
                <div key={product!.id} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                    <img src={product!.images[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{product!.name}</div>
                    <div className="text-xs text-slate-400">Qty: {quantity}</div>
                  </div>
                  <div className="font-bold">₹{product!.price * quantity}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-6 space-y-4">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping/Service Fee</span>
                <span className="text-emerald-400 font-bold text-xs uppercase">Calculated at completion</span>
              </div>
              <div className="flex justify-between text-xl font-black pt-2">
                <span>Est. Total</span>
                <span className="text-emerald-400">₹{totalAmount}</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                <ShieldCheck size={14} /> Safe Payment Guarantee
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Your data is secure and will only be used for this service. We manually verify all payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Booking;
