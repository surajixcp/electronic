
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Smartphone, MapPin, LogOut, Save, ShieldCheck, ClipboardList } from 'lucide-react';
import { getAppState, logoutUser, updateUserProfile } from '../services/storage';

const Profile: React.FC = () => {
  const { currentUser, bookings } = getAppState();
  const navigate = useNavigate();

  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  const [formData, setFormData] = useState({
    name: currentUser.name,
    mobile: currentUser.mobile,
    address: currentUser.address,
    email: currentUser.email
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateUserProfile(formData);
      setIsSaving(false);
      alert('Profile updated successfully!');
    }, 500);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const userBookings = bookings.filter(b => b.userId === currentUser.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 text-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-5xl font-black shadow-xl shadow-emerald-500/20 overflow-hidden ${!currentUser.avatar && 'bg-emerald-500'}`}>
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:5000${currentUser.avatar}`}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('bg-emerald-500');
                    e.currentTarget.parentElement!.innerHTML = currentUser.name.charAt(0);
                  }}
                />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">{currentUser.name}</h2>
            <p className="text-slate-400 text-sm mb-8">{currentUser.email}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Orders</p>
                <p className="text-xl font-black text-slate-900">{userBookings.length}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                <p className="text-xl font-black text-emerald-500">PRO</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-100 text-red-600 font-bold hover:bg-red-50 transition-all"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <ShieldCheck className="text-emerald-500" /> Account Settings
            </h3>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-semibold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Mobile</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email (Read Only)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    disabled
                    type="email"
                    value={formData.email}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-100 border border-transparent text-slate-400 text-sm font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Default Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-semibold h-32 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-xl disabled:opacity-50"
                >
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-2xl font-black mb-2">Order Activity</h4>
                <p className="text-slate-400 text-sm">You have {userBookings.length} total orders and repair requests.</p>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all"
              >
                <ClipboardList size={20} /> View Order History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
