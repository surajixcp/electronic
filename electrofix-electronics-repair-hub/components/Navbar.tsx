
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Wrench, ShieldCheck, User, Menu, X, ClipboardList, Settings, ChevronDown, LogIn, Sun, Moon } from 'lucide-react';
import { getAppState, toggleTheme } from '../services/storage';

import CartDrawer from './CartDrawer';
// ... existing imports

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [theme, setTheme] = useState(getAppState().theme);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { currentUser } = getAppState();

  const handleToggleTheme = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
    window.dispatchEvent(new Event('themechange'));
  };

  const updateCartCount = () => {
    const { cart } = getAppState();
    const count = (cart || []).reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(count);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);

    // Listen for open-cart event
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener('open-cart', handleOpenCart);

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('open-cart', handleOpenCart);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="glass sticky top-0 z-[100] border-b border-white/20 dark:border-slate-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-2 md:gap-3 group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-white w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                Electro<span className="text-emerald-500">Fix</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/shop" className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 font-bold flex items-center gap-2 transition-all">
                <ShoppingBag size={20} /> Shop
              </Link>
              <Link to="/repairs" className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 font-bold flex items-center gap-2 transition-all">
                <Wrench size={20} /> Repairs
              </Link>

              <div className="flex items-center gap-4 pl-6 border-l border-slate-200 dark:border-slate-800">
                {/* Cart Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
                >
                  <ShoppingBag size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-in zoom-in">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Theme Toggle Button */}
                <button
                  onClick={handleToggleTheme}
                  className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all"
                >
                  {theme === 'light' ? <Moon size={20} className="animate-in spin-in-180 duration-500" /> : <Sun size={20} className="animate-in spin-in-180 duration-500" />}
                </button>

                {currentUser ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all"
                    >
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {currentUser.name.charAt(0)}
                      </div>
                      <span className="font-bold text-sm hidden lg:block">{currentUser.name.split(' ')[0]}</span>
                      <ChevronDown size={16} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl py-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                          <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{currentUser.email}</p>
                        </div>
                        <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 font-bold transition-all"><User size={18} /> Profile Settings</Link>
                        <Link to="/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 font-bold transition-all"><ClipboardList size={18} /> My Orders</Link>
                        {currentUser.isAdmin && (
                          <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 font-black transition-all border-t border-slate-50 dark:border-slate-800 mt-2"><Settings size={18} /> Admin Dashboard</Link>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/auth" className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-105 transition-all text-sm">
                    Sign In
                  </Link>
                )}

                <Link to="/booking" className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black hover:shadow-emerald transition-all text-sm shadow-lg shadow-emerald-500/20">
                  Book Repair
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-3">
              <button onClick={() => setIsCartOpen(true)} className="relative p-1.5 md:p-2 text-slate-500">
                <ShoppingBag size={22} className="md:w-6 md:h-6" />
                {cartCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">{cartCount}</span>}
              </button>
              <button onClick={handleToggleTheme} className="p-2 md:p-3 rounded-2xl bg-slate-100 dark:bg-slate-800"><Sun size={18} className="md:w-5 md:h-5" /></button>
              <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 focus:outline-none">{isOpen ? <X size={24} className="md:w-7 md:h-7" /> : <Menu size={24} className="md:w-7 md:h-7" />}</button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-8 space-y-4 shadow-2xl">
            <Link to="/shop" onClick={() => setIsOpen(false)} className="block text-2xl font-black text-slate-900 dark:text-white">Shop</Link>
            <Link to="/repairs" onClick={() => setIsOpen(false)} className="block text-2xl font-black text-slate-900 dark:text-white">Repairs</Link>
            <hr className="border-slate-100 dark:border-slate-800" />
            {currentUser ? (
              <div className="space-y-4">
                <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-slate-600 dark:text-slate-400">Profile</Link>
                <Link to="/orders" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-slate-600 dark:text-slate-400">Orders</Link>
              </div>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-emerald-500">Sign In</Link>
            )}
            <Link to="/booking" onClick={() => setIsOpen(false)} className="block py-4 bg-emerald-500 text-white text-center rounded-2xl font-black text-xl">Book Now</Link>
          </div>
        )}
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
