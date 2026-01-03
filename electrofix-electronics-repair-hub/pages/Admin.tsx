
import React from 'react';
// Added ShieldCheck to the lucide-react import list
import { LayoutDashboard, Package, Wrench, CreditCard, ListChecks, Plus, Trash2, Power, Edit3, Info, TrendingUp, Users, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { getAppState, saveAppState, updateBookingStatus } from '../services/storage';
import { BookingStatus } from '../types';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'products' | 'services' | 'bookings' | 'payment'>('dashboard');
  const [state, setState] = React.useState(getAppState());

  const handleToggleQr = () => {
    const newState = { ...state, isQrEnabled: !state.isQrEnabled };
    setState(newState);
    saveAppState(newState);
  };

  const handleUpdateQrUrl = (url: string) => {
    const newState = { ...state, qrCodeUrl: url };
    setState(newState);
    saveAppState(newState);
  };

  const handleStatusChange = (bookingId: string, status: BookingStatus) => {
    updateBookingStatus(bookingId, status);
    setState(getAppState());
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col gap-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="font-black text-xl tracking-tighter dark:text-white">Electro<span className="text-emerald-500">Fix</span> Admin</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'bookings', label: 'Bookings', icon: <ListChecks size={20} /> },
            { id: 'products', label: 'Inventory', icon: <Package size={20} /> },
            { id: 'services', label: 'Services', icon: <Wrench size={20} /> },
            { id: 'payment', label: 'Payments', icon: <CreditCard size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id
                  ? 'bg-emerald-500 text-white shadow-emerald'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800"></div>
          <div><p className="text-xs font-black dark:text-white">Admin Portal</p><p className="text-[10px] text-slate-400">v2.4.0 Stable</p></div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-16">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white capitalize tracking-tight">{activeTab}</h2>
            <p className="text-slate-400 font-bold text-sm">Managing ElectroFix business operations.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-black text-sm border border-emerald-100 dark:border-emerald-500/20">System Live</button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {[
                { label: 'Revenue', val: '₹24,850', sub: '+12% from last month', icon: <TrendingUp className="text-emerald-500" />, bg: 'bg-emerald-500/10' },
                { label: 'Active Enquiries', val: state.bookings.length.toString(), sub: '4 pending approval', icon: <ListChecks className="text-blue-500" />, bg: 'bg-blue-500/10' },
                { label: 'Products', val: state.products.length.toString(), sub: '8 categories active', icon: <Package className="text-purple-500" />, bg: 'bg-purple-500/10' },
                { label: 'Total Clients', val: '1,248', sub: '+48 this week', icon: <Users className="text-orange-500" />, bg: 'bg-orange-500/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform`}></div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>{stat.icon}</div>
                    <ArrowUpRight className="text-slate-300" size={20} />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mb-2">{stat.val}</p>
                  <p className="text-xs font-bold text-slate-400">{stat.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black mb-8">Revenue Analysis</h3>
                <div className="h-80 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center italic text-slate-300">
                  Interactive Growth Chart
                </div>
              </div>
              <div className="bg-emerald-500 p-10 rounded-[2.5rem] text-white space-y-6">
                <h3 className="text-xl font-black">Quick Action</h3>
                <p className="opacity-80 text-sm font-bold">Instantly generate a repair quote or product listing.</p>
                <div className="space-y-3">
                  <button className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-black shadow-lg">New Product</button>
                  <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black border border-emerald-400">System Report</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-black text-xl">Recent Activity</h3>
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-black">Export</button>
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black">Bulk Action</button>
              </div>
            </div>
            <div className="overflow-x-auto px-4">
              <table className="w-full text-left">
                <thead className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-6">ID Reference</th>
                    <th className="px-6 py-6">Customer Profile</th>
                    <th className="px-6 py-6">Service/Item</th>
                    <th className="px-6 py-6">Internal Status</th>
                    <th className="px-6 py-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {state.bookings.sort((a, b) => b.createdAt - a.createdAt).map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-6 font-mono text-xs text-slate-500 font-bold">{booking.id}</td>
                      <td className="px-6 py-6">
                        <div className="font-black text-slate-900 dark:text-white">{booking.customerName}</div>
                        <div className="text-xs text-slate-400 font-bold">{booking.mobile}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-bold truncate max-w-[150px]">
                          {booking.productId ? state.products.find(p => p.id === booking.productId)?.name :
                            state.services.find(s => s.id === booking.serviceId)?.title || 'Custom Request'}
                        </div>
                        <div className="text-xs font-black text-emerald-500 uppercase tracking-tighter">₹{booking.totalAmount}</div>
                      </td>
                      <td className="px-6 py-6">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                          className={`text-[10px] font-black px-4 py-2 rounded-xl outline-none appearance-none cursor-pointer border-none shadow-sm ${booking.status === BookingStatus.CONFIRMED ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                              booking.status === BookingStatus.PENDING ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                            }`}
                        >
                          {Object.values(BookingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-6">
                        <button className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all"><Edit3 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                  {state.bookings.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-32 text-slate-300 font-bold italic">No active bookings detected.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="max-w-3xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">QR Gateway</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Manual Verification Config</p>
                </div>
                <button
                  onClick={handleToggleQr}
                  className={`w-20 h-10 rounded-full relative transition-all shadow-inner ${state.isQrEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all shadow-md ${state.isQrEnabled ? 'left-11' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">UPI Payment String or Image URL</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={state.qrCodeUrl}
                      onChange={(e) => handleUpdateQrUrl(e.target.value)}
                      className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-black shadow-xl">Update</button>
                  </div>
                </div>

                <div className="p-12 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-6">
                  <div className="bg-white p-6 inline-block rounded-4xl shadow-2xl">
                    <img src={state.qrCodeUrl} alt="Preview" className="w-56 h-56 object-contain" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Gateway Preview</p>
                </div>

                <div className="flex items-start gap-4 p-6 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-3xl text-sm font-bold">
                  <Info size={24} className="shrink-0" />
                  <p>Changes here affect the checkout page immediately. Ensure the UPI string follows the standard upi://pay protocol for deep-linking apps.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {['products', 'services'].includes(activeTab) && (
          <div className="bg-white dark:bg-slate-900 py-32 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Plus className="text-slate-400" size={40} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">Inventory Management</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto">This module is locked in the preview version. <br />Full CRUD operations coming in v3.0.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
