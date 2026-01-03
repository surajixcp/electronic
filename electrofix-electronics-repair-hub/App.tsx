
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Repairs from './pages/Repairs';
import Booking from './pages/Booking';
import OrderHistory from './pages/OrderHistory';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import { getAppState, fetchInitialData } from './services/storage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  return null;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 dark:bg-slate-900">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  // Theme management logic
  const applyTheme = () => {
    const { theme } = getAppState();
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    applyTheme();
    // Listen for custom theme change events from the Navbar
    window.addEventListener('themechange', applyTheme);
    return () => window.removeEventListener('themechange', applyTheme);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/repairs" element={<Repairs />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
