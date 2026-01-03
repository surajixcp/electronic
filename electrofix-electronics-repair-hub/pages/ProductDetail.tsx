import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCcw, CheckCircle2, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import { useAppState } from '../services/hooks';
import { addToCart } from '../services/storage';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useAppState();
  const product = products.find(p => p.id === id);

  // State for Gallery & Zoom
  // Initialize with empty string, will update in useEffect when product is found
  const [activeImage, setActiveImage] = useState<string>('');
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-emerald-500 font-semibold underline">Back to Shop</Link>
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.5)'
    });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomStyle({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link to="/" className="hover:text-emerald-500">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="hover:text-emerald-500">Shop</Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-slate-900 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <div className="space-y-6">
          <div
            className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 relative cursor-crosshair group z-10"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={activeImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-200 ease-out"
              style={isZoomed ? zoomStyle : {}}
            />
            {!isZoomed && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black/50 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md">Hover to Zoom</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl overflow-hidden cursor-pointer transition-all ${activeImage === img ? 'ring-2 ring-emerald-500 ring-offset-2' : 'hover:ring-2 hover:ring-emerald-500/50 hover:ring-offset-1 opacity-70 hover:opacity-100'
                  }`}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} className="w-full h-full object-cover" alt={`View ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${product.condition === 'New' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
                }`}>
                {product.condition}
              </span>
              <span className="text-slate-400 text-sm font-medium">SKU: {product.id.toUpperCase()}-2024</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 text-emerald-600 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={i < Math.round(product.rating || 0) ? "fill-current" : "text-slate-300 fill-slate-300"}
                    size={16}
                  />
                ))}
              </div>
              <span className="text-sm font-bold">{product.rating || 'N/A'} ({product.reviewCount || 0} reviews)</span>
            </div>
            <p className="text-slate-500 text-lg leading-relaxed">{product.description}</p>
          </div>

          <div className="mb-10 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-black text-slate-900">₹{product.price}</span>
              {product.condition !== 'New' && <span className="text-xl text-slate-400 line-through font-medium">₹1,299.00</span>}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  addToCart(product.id);
                  // window.dispatchEvent(new Event('open-cart')); // Removed if CartDrawer auto-opens
                }}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg"
              >
                Add to Cart
              </button>
              {product.isAvailable !== false ? (
                <Link
                  to={`/booking?productId=${product.id}`}
                  className="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                >
                  Book Order / Enquire <ChevronRight size={20} />
                </Link>
              ) : (
                <button
                  disabled
                  className="flex-[2] bg-slate-200 text-slate-400 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  Out of Stock <ShieldCheck size={20} />
                </button>
              )}
            </div>
            {product.isAvailable === false && (
              <p className="text-center text-red-500 text-sm font-bold mt-4">This product is currently out of stock. You can add it to your cart, but booking is temporarily unavailable.</p>
            )}
            {product.isAvailable !== false && (
              <p className="text-center text-slate-400 text-xs mt-4">Safe & Secure QR Payments. Satisfaction Guaranteed.</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Verified', icon: <CheckCircle2 className="text-emerald-500" /> },
              { label: 'Fast Ship', icon: <Truck className="text-emerald-500" /> },
              { label: 'Eco Friendly', icon: <RefreshCcw className="text-emerald-500" /> }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-50 shadow-sm">
                {item.icon}
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-10">
            <h3 className="font-bold text-xl text-slate-900">Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.specs && Object.entries(product.specs).length > 0 ? (
                Object.entries(product.specs).map(([key, val], i) => (
                  <div key={i} className="p-4 bg-white border border-slate-100 rounded-xl">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{key}</div>
                    <div className="text-slate-900 font-semibold">{val}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-slate-400 italic">No specifications available.</div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-6 mb-10">
            <h3 className="font-bold text-xl text-slate-900">Customer Reviews</h3>
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {review.userAvatar ? (
                          <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full object-cover border border-indigo-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                            {review.userName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{review.userName}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} at {new Date(review.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex text-emerald-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={i < review.rating ? "fill-current" : "text-slate-200 fill-slate-200"}
                            size={14}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 font-bold">
                No reviews yet. Be the first to share your experience!
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
            <h4 className="flex items-center gap-2 font-bold text-indigo-900 mb-2">
              <ShieldCheck size={20} /> Warranty Information
            </h4>
            <p className="text-sm text-indigo-700 font-medium">
              {product.warranty}. Includes standard coverage against manufacturing defects. {product.condition !== 'New' ? '30-day money back guarantee applies.' : 'Manufacturer standard terms apply.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
