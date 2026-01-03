
import React from 'react';
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <h3 className="text-white text-xl font-bold">ElectroFix</h3>
          <p className="text-sm leading-relaxed">
            Your one-stop destination for new and pre-owned premium electronics. We also offer expert repair services with genuine parts.
          </p>
          <div className="flex gap-4">
            <Facebook className="cursor-pointer hover:text-emerald-400" size={20} />
            <Twitter className="cursor-pointer hover:text-emerald-400" size={20} />
            <Instagram className="cursor-pointer hover:text-emerald-400" size={20} />
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#/shop" className="hover:text-emerald-400">Shop New Arrivals</a></li>
            <li><a href="#/shop" className="hover:text-emerald-400">Used Gear Deals</a></li>
            <li><a href="#/repairs" className="hover:text-emerald-400">Repair Services</a></li>
            <li><a href="#/orders" className="hover:text-emerald-400 font-bold text-emerald-400">Track My Orders</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#/orders" className="hover:text-emerald-400">Order History</a></li>
            <li><a href="#/admin" className="hover:text-emerald-400">Merchant Portal</a></li>
            <li><a href="#" className="hover:text-emerald-400">Warranty Claims</a></li>
            <li><a href="#" className="hover:text-emerald-400">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-emerald-500" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-emerald-500" /> support@electrofix.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-emerald-500" /> Sector 15, Tech City, IN
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs opacity-50">
        &copy; 2024 ElectroFix Services. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
