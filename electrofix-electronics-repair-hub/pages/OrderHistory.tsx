
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  MapPin,
  MessageSquare,
  Phone,
  Mail,
  CreditCard,
  Image as ImageIcon,
  ReceiptText,
  Truck,
  History,
  Wrench
} from 'lucide-react';
import { useAppState } from '../services/hooks';
import { getAppState } from '../services/storage';
import { BookingStatus } from '../types';

const OrderHistory: React.FC = () => {
  const { bookings, products, services } = getAppState();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const sortedBookings = [...bookings].sort((a, b) => b.createdAt - a.createdAt);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusStyles = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case BookingStatus.PENDING:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case BookingStatus.SHIPPED:
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case BookingStatus.DELIVERED:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case BookingStatus.CANCELLED:
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case BookingStatus.COMPLETED:
        return 'bg-slate-800/10 text-slate-600 border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const StatusTimeline = ({ status }: { status: BookingStatus }) => {
    const stages = [
      { id: BookingStatus.PENDING, label: 'Placed', icon: <Clock size={12} /> },
      { id: BookingStatus.CONFIRMED, label: 'Confirmed', icon: <ShieldCheck size={12} /> },
      { id: BookingStatus.SHIPPED, label: 'Shipped', icon: <Truck size={12} /> },
      { id: BookingStatus.DELIVERED, label: 'Delivered', icon: <CheckCircle size={12} /> },
    ];

    const currentIdx = stages.findIndex(s => s.id === status);
    // Logic: If Completed, select last stage. If Cancelled, show 0 or handle separately (not handled in timeline usually).
    // For simplicity, if status is COMPLETED (legacy), map to Delivered.
    const activeIdx = (status === BookingStatus.COMPLETED) ? 3 : currentIdx === -1 ? 0 : currentIdx;

    const isCancelled = status === BookingStatus.CANCELLED;

    if (isCancelled) {
      return (
        <div className="w-full mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
          <XCircle size={18} />
          Order Cancelled
        </div>
      )
    }

    return (
      <div className="flex items-center justify-between w-full max-w-md mt-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
        {stages.map((stage, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${idx <= activeIdx
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300'
              }`}>
              {idx < activeIdx ? <CheckCircle size={12} /> : stage.icon}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${idx <= activeIdx ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  /* Review Logic */
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<{ productId: string, productName: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleOpenReview = (productId: string, productName: string) => {
    setReviewingItem({ productId, productName });
    setRating(5);
    setComment('');
    setShowReviewModal(true);
  };

  const submitReview = () => {
    if (reviewingItem && comment.trim()) {
      const { currentUser } = getAppState();
      const review: any = {
        id: 'r-' + Math.random().toString(36).substr(2, 9),
        productId: reviewingItem.productId,
        userId: currentUser?.id || 'guest',
        userName: currentUser?.name || 'Guest User',
        userAvatar: currentUser?.avatar,
        rating,
        comment,
        createdAt: Date.now()
      };

      // Dynamic import to avoid circular dependency issues if any, or just direct usage if safe
      // styling logic is safe.
      // Dynamic import to avoid circular dependency issues
      import('../services/storage').then(({ addReview }) => {
        addReview(review);
      });

      setShowReviewModal(false);
      setReviewingItem(null);
      alert('Review submitted successfully!');
    } else {
      alert('Please write a comment.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      {/* ... Header ... */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black tracking-widest uppercase">
            <History size={14} /> Tracking History
          </div>
          <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">My Orders.</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Manage your tech purchases and repair progress in real-time.</p>
        </div>
      </div>

      {sortedBookings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {sortedBookings.map((booking) => {
            const product = products.find((p) => p.id === booking.productId);
            const service = services.find((s) => s.id === booking.serviceId);
            const itemName = booking.productName || (product ? product.name : service ? service.title : 'Custom Request');
            const itemImage = booking.productImage || (product ? product.images[0] : 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?q=80&w=400&auto=format&fit=crop');
            const isExpanded = expandedOrderId === booking.id;

            return (
              <div
                key={booking.id}
                className={`group bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 transition-all duration-500 overflow-hidden ${isExpanded ? 'shadow-2xl ring-4 ring-emerald-500/5' : 'hover:border-emerald-500/30'
                  }`}
              >
                {/* Main Card Header */}
                <div
                  onClick={() => toggleExpand(booking.id)}
                  className="p-8 md:p-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-inner">
                      <img src={itemImage} alt={itemName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
                      {product ? <ShoppingBag size={14} className="text-emerald-500" /> : <Wrench size={14} className="text-emerald-500" />}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border ${getStatusStyles(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{booking.id}</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{itemName}</h3>
                    <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 font-bold text-sm">
                      <span className="flex items-center gap-2"><Clock size={16} className="text-slate-400" /> {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-2 text-slate-900 dark:text-white"><CreditCard size={16} className="text-emerald-500" /> ₹{booking.totalAmount}</span>
                    </div>
                  </div>

                  <div className="w-full lg:w-auto mt-6 lg:mt-0">
                    <StatusTimeline status={booking.status} />
                  </div>

                  <div className="flex gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                    <button className="flex-1 lg:flex-none p-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 transition-all">
                      {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details View */}
                {isExpanded && (
                  <div className="glass border-t border-slate-100 dark:border-slate-800 p-8 md:p-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Review Button for Delivered Items */}
                    {(booking.status === BookingStatus.DELIVERED || booking.status === BookingStatus.COMPLETED) && product && (
                      <div className="mb-12 p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-emerald-500 text-white p-3 rounded-2xl">
                            <MessageSquare size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Rate your product</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Share your experience with others</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReview(product.id, product.name);
                          }}
                          className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                        >
                          Write a Review
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                      {/* ... Existing Details ... */}
                      {/* Shipping & Notes */}
                      <div className="lg:col-span-4 space-y-8">
                        <div>
                          <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                            <MapPin size={14} className="text-emerald-500" /> Logistics Info
                          </h4>
                          <div className="p-6 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                              {booking.address}
                            </p>
                            <div className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                              <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                <Phone size={14} className="text-slate-400" /> {booking.mobile}
                              </div>
                              <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                <Mail size={14} className="text-slate-400" /> {booking.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {booking.notes && (
                          <div>
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                              <MessageSquare size={14} className="text-emerald-500" /> Service Memo
                            </h4>
                            <div className="p-6 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100 dark:border-emerald-500/10 italic text-sm text-emerald-800 dark:text-emerald-400 font-medium">
                              "{booking.notes}"
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Proof */}
                      <div className="lg:col-span-4 space-y-8">
                        <div>
                          <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                            <CreditCard size={14} className="text-emerald-500" /> Payment Receipt
                          </h4>
                          {booking.paymentScreenshot ? (
                            <div className="relative group cursor-zoom-in">
                              <div className="aspect-[4/3] rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 relative">
                                <img
                                  src={booking.paymentScreenshot.startsWith('http') ? booking.paymentScreenshot : `http://localhost:5000${booking.paymentScreenshot}`}
                                  alt="Payment Proof"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/20 transition-all"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-[4/3] rounded-3xl border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 bg-white dark:bg-slate-800/30 relative overflow-hidden group">
                              <ImageIcon size={48} className="mb-4 opacity-20 group-hover:scale-110 transition-transform" />
                              <label className="cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-slate-100 dark:border-slate-700">
                                Upload Proof
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                      const { uploadOrderPaymentScreenshot } = await import('../services/storage');
                                      await uploadOrderPaymentScreenshot(booking.id, e.target.files[0]);
                                      // Refresh or force re-render logic handled by storage/state?
                                      // We might need to force a refresh of the page or component state if not reactive
                                      window.location.reload();
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Financial Breakdown */}
                      <div className="lg:col-span-4 space-y-8">
                        <div>
                          <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                            <ReceiptText size={14} className="text-emerald-500" /> Billing Breakdown
                          </h4>
                          <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>

                            <div className="space-y-4 mb-8">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                                <span>Base Amount</span>
                                <span className="text-white">₹{booking.totalAmount}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                                <span>Service / Tax</span>
                                <span className="text-emerald-400 uppercase tracking-tighter">Included</span>
                              </div>
                              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                                <span>Logistics</span>
                                <span className="text-emerald-400 uppercase tracking-tighter">FREE</span>
                              </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Paid</p>
                                <p className="text-4xl font-black text-emerald-500 tracking-tighter">₹{booking.totalAmount}</p>
                              </div>
                              <Truck className="text-white/20" size={40} />
                            </div>

                            <div className="mt-8">
                              <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs hover:scale-[1.02] transition-transform">
                                Download PDF Invoice
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 bg-white dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ShoppingBag className="text-slate-300 dark:text-slate-700" size={48} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">No active orders.</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm mx-auto font-bold">
            Looks like your tech stack is already solid! Need an upgrade or a fix?
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/shop"
              className="bg-emerald-500 text-white px-10 py-5 rounded-3xl font-black text-lg hover:shadow-emerald transition-all"
            >
              Browse Shop
            </Link>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-2 dark:text-white">Write a Review</h3>
            <p className="text-slate-500 mb-6">How was your experience with {reviewingItem?.productName}?</p>

            <div className="space-y-4 mb-6">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill={star <= rating ? "#10b981" : "none"}
                      stroke={star <= rating ? "#10b981" : "#cbd5e1"}
                      strokeWidth="2"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              <textarea
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl resize-none outline-none focus:ring-2 focus:ring-emerald-500"
                rows={4}
                placeholder="Tell us what you liked or didn't like..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShieldCheck: React.FC<{ size?: number, className?: string }> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default OrderHistory;
