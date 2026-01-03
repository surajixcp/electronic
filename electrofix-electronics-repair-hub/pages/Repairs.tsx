
import React from 'react';
import { Link } from 'react-router-dom';
import { Tablet, Smartphone, Laptop, Search, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAppState } from '../services/hooks';

const Repairs: React.FC = () => {
  const { services } = useAppState();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const categories = Array.from(new Set(services.map(s => s.category)));

  const filteredServices = selectedCategory
    ? services.filter(s => s.category === selectedCategory)
    : services;

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1920&auto=format&fit=crop" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight">Give Your Tech <br />a Second Life</h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
            Certified technicians. Genuine parts. 90-day warranty. <br />Fast turnaround to get you back online.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search repair e.g. iPhone Screen..."
              className="w-full pl-12 pr-4 py-5 rounded-[2rem] border-none ring-1 ring-slate-800 bg-slate-800/80 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold backdrop-blur-md"
            />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-b border-slate-50 flex flex-wrap justify-center gap-8 md:gap-20">
        {[
          { label: 'Certified Experts', icon: <CheckCircle2 className="text-emerald-500" /> },
          { label: 'Fast Turnaround', icon: <CheckCircle2 className="text-emerald-500" /> },
          { label: '90-Day Warranty', icon: <CheckCircle2 className="text-emerald-500" /> }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            {item.icon}
            <span className="font-bold text-slate-700">{item.label}</span>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-8">1. Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`flex flex-col items-center justify-center p-8 rounded-4xl border-2 transition-all ${selectedCategory === cat
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
                  : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                  }`}
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                  {cat.includes('Mobile') ? <Smartphone size={32} className="text-slate-700" /> : cat.includes('Laptop') ? <Laptop size={32} className="text-slate-700" /> : <Tablet size={32} className="text-slate-700" />}
                </div>
                <span className="font-black text-slate-900">{cat}</span>
              </button>
            ))}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex flex-col items-center justify-center p-8 rounded-4xl border-2 transition-all ${!selectedCategory
                ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
                : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                }`}
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <Search size={32} className="text-slate-700" />
              </div>
              <span className="font-black text-slate-900">All Services</span>
            </button>
          </div>
        </div>

        {/* Service List */}
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-8">2. Common Fixes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div key={service.id} className={`p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm transition-all group relative overflow-hidden ${service.isAvailable === false ? 'opacity-75' : 'hover:shadow-soft'}`}>
                {service.isAvailable === false && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-bl-xl z-10">
                    Unavailable
                  </div>
                )}
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{service.category}</div>
                  <div className="text-3xl font-black text-slate-900">₹{service.basePrice}<span className="text-slate-400 text-xs font-normal">+</span></div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-emerald-500 transition-colors">{service.title}</h3>
                {service.isAvailable === false ? (
                  <button disabled className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-400 py-4 rounded-2xl font-black cursor-not-allowed">
                    Service Unavailable
                  </button>
                ) : (
                  <Link
                    to={`/booking?serviceId=${service.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-200"
                  >
                    Book Repair Now <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Simple Process.</h2>
            <p className="text-slate-500 font-bold">Tech repair doesn't have to be complicated.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: '1. Book Online', desc: 'Select your repair and schedule a pick up or drop off.' },
              { title: '2. Mail or Drop-off', desc: 'Bring your device to our store or ship it with our free labels.' },
              { title: '3. Good as New', desc: 'We fix it, test it, and return it to you. Quality guaranteed.' }
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center font-black text-3xl mx-auto mb-6 shadow-xl shadow-emerald-100 group-hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 px-8 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Repairs;
