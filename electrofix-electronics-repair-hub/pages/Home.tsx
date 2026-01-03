import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, RefreshCw, Zap, Star, Shield, Smartphone, Laptop, Clock } from 'lucide-react';
import { useAppState } from '../services/hooks';
import { RepairService, Product, ProductCondition } from '../types';

const Home: React.FC = () => {
  const { products, services } = useAppState();
  const featuredProducts = products.length > 0 ? products.slice(0, 4) : [];

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-black border border-emerald-500/20">
              <Sparkles size={16} className="animate-pulse" /> TRUSTED TECH HUB
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] text-slate-900 dark:text-white">
              Revive Your <br />
              <span className="text-emerald-500">Digital Life.</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              The premium destination for the latest gadgets, certified used electronics, and expert-level repairs.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/shop" className="bg-slate-900 dark:bg-emerald-500 text-white px-6 md:px-10 py-3 md:py-5 rounded-3xl font-black text-sm md:text-lg transition-all flex items-center gap-2 md:gap-3 hover:scale-105 shadow-xl shadow-slate-900/20">
                Explore Shop <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
              </Link>
              <Link to="/repairs" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 md:px-10 py-3 md:py-5 rounded-3xl font-black text-sm md:text-lg transition-all border border-slate-200 dark:border-slate-700 hover:bg-slate-50">
                Repair Service
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-6 opacity-60">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200"><img src={`https://i.pravatar.cc/100?img=${i + 10}`} className="rounded-full" /></div>)}
              </div>
              <p className="text-sm font-bold">5k+ Happy Clients</p>
            </div>
          </div>

          <div className="relative block animate-in fade-in slide-in-from-right-8 duration-700 delay-150 mt-12 lg:mt-0">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[120px] rounded-full animate-float"></div>
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-4xl shadow-2xl rotate-3">
                  <img src="/electrical 2.jpg" className="rounded-3xl object-cover h-[300px] w-full" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl -rotate-6 flex flex-col gap-2">
                  <div className="flex gap-1 text-emerald-500"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                  <p className="font-bold text-sm">"Fastest repair in the city!"</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl rotate-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white"><Shield size={24} /></div>
                  <div><p className="font-black">Certified</p><p className="text-xs opacity-50">Genuine Parts Only</p></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2 rounded-4xl shadow-2xl -rotate-2">
                  <img src="/electrical 3.jpg" className="rounded-3xl object-cover h-[350px] w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Categories */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
          <Link to="/shop?filter=New" className="md:col-span-8 bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-5xl p-6 md:p-10 border border-slate-100 dark:border-slate-800 hover:shadow-soft transition-all group overflow-hidden relative">
            <Zap className="text-emerald-500 absolute -right-10 -bottom-10 w-48 h-48 opacity-5 group-hover:rotate-12 transition-transform" />
            <h3 className="text-4xl font-black mb-4">Latest Arrivals</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">Brand new devices with local and international warranties.</p>
            <div className="inline-flex items-center gap-2 font-black text-emerald-500">Shop Now <ArrowRight size={20} /></div>
          </Link>
          <Link to="/repairs" className="md:col-span-4 bg-emerald-500 text-white rounded-5xl p-10 hover:shadow-emerald transition-all group relative overflow-hidden">
            <Clock className="absolute -right-4 top-4 w-24 h-24 opacity-20" />
            <h3 className="text-3xl font-black mb-2">Same-Day Repair</h3>
            <p className="opacity-80 text-sm mb-6">Broken screens, battery swaps, and more.</p>
            <div className="bg-white text-emerald-600 px-6 py-3 rounded-2xl font-black inline-block text-sm">Book slot</div>
          </Link>
          <Link to="/shop?filter=Used" className="md:col-span-5 bg-slate-900 text-white rounded-5xl p-10 hover:shadow-soft transition-all group relative overflow-hidden">
            <RefreshCw className="absolute -left-4 -bottom-4 w-32 h-32 opacity-10" />
            <h3 className="text-3xl font-black mb-2">Pre-Owned</h3>
            <p className="opacity-60 text-sm mb-4">Certified inspection, better price.</p>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><ArrowRight /></div>
          </Link>
          <div className="md:col-span-7 bg-slate-100 dark:bg-slate-800/50 rounded-5xl p-10 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-black">Trade-In Your Device</h3>
              <p className="text-sm opacity-60">Exchange your old tech for credits.</p>
              <button className="text-emerald-500 font-black text-sm pt-2">Check Value →</button>
            </div>
            <div className="flex gap-4">
              <Smartphone className="opacity-20" size={48} />
              <Laptop className="opacity-20" size={48} />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Our Best Sellers</h2>
            <p className="text-slate-500 font-bold">Hand-picked premium tech for you.</p>
          </div>
          <Link to="/shop" className="px-4 md:px-8 py-2 md:py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 text-xs md:text-base">
            Explore All <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group bg-white dark:bg-slate-800/50 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-soft transition-all">
              <div className="relative aspect-square md:aspect-[4/5] overflow-hidden bg-slate-50 dark:bg-slate-900">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <Link to={`/product/${product.id}`} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-center shadow-xl">Quick View</Link>
                </div>
                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${product.condition === 'New' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
                  }`}>
                  {product.condition}
                </div>
              </div>
              <div className="p-3 md:p-8 space-y-2 md:space-y-4">
                <div className="space-y-1">
                  <p className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">{product.category}</p>
                  <h4 className="text-sm md:text-xl font-black text-slate-900 dark:text-white truncate">{product.name}</h4>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">₹{product.price}</span>
                  <div className="flex gap-0.5 md:gap-1">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="currentColor" className="text-amber-400 md:w-3 md:h-3" />)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Repairs CTA */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 flex flex-col md:flex-row items-center gap-16 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] -mr-64 -mt-64 animate-pulse-slow"></div>
          <div className="flex-1 space-y-8 relative z-10 text-center md:text-left">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
              Expert Repairs <br />
              <span className="text-emerald-500">In Hours.</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed max-w-lg">
              Don't let a broken screen slow you down. Our certified technicians use professional-grade tools and parts.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
              <Link to="/repairs" className="bg-emerald-500 text-white px-12 py-5 rounded-3xl font-black text-lg shadow-emerald hover:scale-105 transition-all">
                Get Instant Quote
              </Link>
              <button className="bg-white/5 border border-white/10 text-white px-12 py-5 rounded-3xl font-black text-lg hover:bg-white/10 transition-all">
                Track Progress
              </button>
            </div>
          </div>
          <div className="flex-1 relative z-10 w-full">
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl rotate-3 scale-105 border-8 border-white/5">
              <img src="/industries-consumer-electronics.jpeg" className="w-full h-full object-cover" alt="Repair Service" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
