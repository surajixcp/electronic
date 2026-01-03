
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ShoppingCart, Info, Star, ChevronDown, CheckCircle2 } from 'lucide-react';
import { ProductCondition, ProductCategory } from '../types';
import { useAppState } from '../services/hooks';

const Shop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const { products } = useAppState();

  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedCategories, setSelectedCategories] = React.useState<ProductCategory[]>([]);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 200000]);
  const [sortOption, setSortOption] = React.useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  const [activeTab, setActiveTab] = React.useState<'All' | 'New' | 'Used'>(
    filterParam === 'New' ? 'New' : filterParam === 'Used' ? 'Used' : 'All'
  );
  const [searchQuery, setSearchQuery] = React.useState('');

  const toggleCategory = (category: ProductCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredProducts = products
    .filter(p => {
      const matchesTab = activeTab === 'All' || (activeTab === 'New' && p.condition === ProductCondition.NEW) || (activeTab === 'Used' && p.condition !== ProductCondition.NEW);
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesTab && matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortOption === 'price_asc') return a.price - b.price;
      if (sortOption === 'price_desc') return b.price - a.price;
      return 0; // Default to natural order (assuming newest first in array or add createdAt if available)
    });

  // Prevent body scroll when filter is open
  React.useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isFilterOpen]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Filter Drawer */}
      {isFilterOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" onClick={() => setIsFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-slate-900 z-50 shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <ChevronDown className="rotate-90" size={24} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Sort By */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Sort By</h3>
                <div className="space-y-2">
                  {[
                    { id: 'newest', label: 'Newest Arrivals' },
                    { id: 'price_asc', label: 'Price: Low to High' },
                    { id: 'price_desc', label: 'Price: High to Low' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortOption(option.id as any)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${sortOption === option.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-200'
                        }`}
                    >
                      {option.label}
                      {sortOption === option.id && <CheckCircle2 size={18} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(ProductCategory).map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`p-3 rounded-xl border text-sm font-bold transition-all ${selectedCategories.includes(category)
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-500 dark:border-emerald-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Price Range</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Min Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Max Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-8 flex gap-4">
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceRange([0, 200000]);
                    setSortOption('newest');
                  }}
                  className="flex-1 py-4 rounded-2xl font-black border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-16">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">Shop Tech.</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Curated collection of high-performance electronics.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Search gadgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-4 md:pr-6 py-2.5 md:py-4 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-4 rounded-[2rem] border border-slate-200 dark:border-slate-700 font-black text-xs md:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 whitespace-nowrap"
          >
            <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" /> Filters
            {(selectedCategories.length > 0 || priceRange[0] > 0 || sortOption !== 'newest') && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
        {['All', 'New', 'Used'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-5 md:px-8 py-2 md:py-3.5 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap border ${activeTab === tab
              ? 'bg-slate-900 dark:bg-emerald-500 text-white border-transparent shadow-xl'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-500'
              }`}
          >
            {tab} Collection
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group flex flex-col h-full bg-white dark:bg-slate-800/50 rounded-2xl md:rounded-[3rem] border border-slate-100 dark:border-slate-800 hover:shadow-soft transition-all p-2 md:p-4">
            <Link to={`/product/${product.id}`} className="relative aspect-square rounded-xl md:rounded-[2rem] bg-slate-50 dark:bg-slate-900 overflow-hidden block">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl ${product.condition === ProductCondition.NEW ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
                }`}>
                {product.condition}
              </div>
              {product.isAvailable === false && (
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl bg-red-500 text-white">
                  Out of Stock
                </div>
              )}
            </Link>

            <div className="p-2 md:p-6 flex flex-col flex-1 space-y-2 md:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{product.category}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="currentColor" className="text-amber-400" />)}
                </div>
              </div>

              <div className="space-y-2">
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-sm md:text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-1">{product.name}</h3>
                </Link>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm line-clamp-2 leading-relaxed font-medium">{product.description}</p>
              </div>

              <div className="pt-6 mt-auto flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">₹{product.price}</span>
                  <span className="text-[8px] md:text-[10px] font-bold text-slate-400 line-through tracking-tighter">₹1,299.00</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/booking?productId=${product.id}`}
                    className="p-2 md:p-4 bg-emerald-500 text-white rounded-lg md:rounded-[1.5rem] hover:shadow-emerald transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <ShoppingCart size={16} className="md:w-[22px] md:h-[22px]" />
                  </Link>
                  <Link
                    to={`/product/${product.id}`}
                    className="p-2 md:p-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg md:rounded-[1.5rem] hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    <Info size={16} className="md:w-[22px] md:h-[22px]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-32 bg-white dark:bg-slate-800/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
          <div className="mx-auto w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Search className="text-slate-300" size={48} />
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">No matches found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
