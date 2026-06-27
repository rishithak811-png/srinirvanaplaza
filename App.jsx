import React, { useState, useEffect } from 'react';
import RoleSelector from './components/RoleSelector';
import GuestForm from './components/GuestForm';
import OrderTimeline from './components/OrderTimeline';
import StaffDashboard from './components/StaffDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Phone, Mail, MapPin, ClipboardList, Clock, User, Briefcase, ShieldAlert } from 'lucide-react';

function SystemGateway({ onNavigate }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col justify-center items-center min-h-[60vh] space-y-12 animate-fade-in">
      <div className="text-center space-y-4 max-w-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-hotel-navy border-2 border-hotel-gold mb-2 shadow-lg">
          <span className="font-serif font-bold text-hotel-gold text-2xl">SNP</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-hotel-navy tracking-wide uppercase">
          Sri Nirvana Plaza
        </h1>
        <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-hotel-gold">
          Luxury Hotel Operations & Services Portal
        </p>
        <div className="w-24 h-0.5 bg-hotel-gold/40 mx-auto mt-4"></div>
        <p className="text-gray-500 text-xs md:text-sm max-w-md mx-auto leading-relaxed font-medium">
          Welcome to the centralized operations console. Please select the appropriate portal below to access hospitality services, dispatch tasks, or review executive analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {/* Card 1: Guest Portal */}
        <div 
          onClick={() => onNavigate('#/guest')}
          className="group cursor-pointer bg-white border border-gray-150 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-hotel-gold/50 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
            <User className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-lg text-hotel-navy group-hover:text-hotel-gold transition-colors">
            Guest Portal
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            Submit gourmet room service dining, request towels, housekeeping, or technicians, and track active requests in real-time.
          </p>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-600 pt-2 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Access Services →
          </span>
        </div>

        {/* Card 2: Staff Console */}
        <div 
          onClick={() => onNavigate('#/staff')}
          className="group cursor-pointer bg-white border border-gray-150 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-hotel-gold/50 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-lg text-hotel-navy group-hover:text-hotel-gold transition-colors">
            Staff Operations
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            Fulfill and assign room service tickets, dispatch housekeepers, respond to guest queries, and submit shift handover records.
          </p>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-700 pt-2 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Open Console →
          </span>
        </div>

        {/* Card 3: Manager Panel */}
        <div 
          onClick={() => onNavigate('#/manager')}
          className="group cursor-pointer bg-white border border-gray-150 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-hotel-gold/50 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-full bg-yellow-50/50 text-yellow-800 border border-yellow-600/20 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-lg text-hotel-navy group-hover:text-hotel-gold transition-colors">
            Manager Board
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            Monitor real-time hotel metrics, inspect visual room occupancy maps, read guest reviews, and export CSV spreadsheets.
          </p>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-yellow-800 pt-2 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            View Analytics →
          </span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');
  const [guestTab, setGuestTab] = useState('order'); // 'order' or 'track'
  const [trackedOrderId, setTrackedOrderId] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path) => {
    window.location.hash = path;
  };

  const handleOrderSubmitted = (orderId) => {
    setTrackedOrderId(orderId);
    setGuestTab('track'); // Auto switch to tracking tab on submit
  };

  const isHome = currentPath === '#/' || currentPath === '';

  return (
    <div className="flex flex-col min-h-screen bg-hotel-cream">
      {/* 1. Header (Rendered conditionally for sub-portals) */}
      {!isHome && (
        <RoleSelector 
          portalName={
            currentPath === '#/guest' ? 'guest' : 
            currentPath === '#/staff' ? 'staff' : 
            'manager'
          } 
        />
      )}

      {/* 2. Main Content Area */}
      <main className="flex-grow py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {isHome && <SystemGateway onNavigate={navigateTo} />}

        {currentPath === '#/guest' && (
          <div className="space-y-6 animate-fade-in">
            {/* Sub-tabs header for Guest Portal */}
            <div className="flex justify-center border-b border-hotel-gold/20 max-w-md mx-auto mb-6">
              <button
                onClick={() => setGuestTab('order')}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  guestTab === 'order'
                    ? 'border-hotel-gold text-hotel-navy font-bold'
                    : 'border-transparent text-gray-500 hover:text-hotel-navy'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Place Order</span>
              </button>
              <button
                onClick={() => setGuestTab('track')}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  guestTab === 'track'
                    ? 'border-hotel-gold text-hotel-navy font-bold'
                    : 'border-transparent text-gray-500 hover:text-hotel-navy'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Track Request</span>
              </button>
            </div>

            {/* Active view rendering */}
            <div className="max-w-4xl mx-auto">
              {guestTab === 'order' ? (
                <GuestForm onSubmitSuccess={handleOrderSubmitted} />
              ) : (
                <OrderTimeline defaultOrderId={trackedOrderId} />
              )}
            </div>
          </div>
        )}

        {currentPath === '#/staff' && (
          <div className="animate-fade-in">
            <StaffDashboard />
          </div>
        )}

        {(currentPath === '#/manager' || currentPath === '#/admin') && (
          <div className="animate-fade-in">
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* 3. Footer with branding details */}
      <footer className="bg-hotel-navy text-white border-t border-hotel-gold/30 mt-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            {/* Col 1: Hotel Brand Info */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-lg text-hotel-gold tracking-wide uppercase">
                SRI NIRVANA PLAZA
              </h4>
              <p className="text-gray-400 text-xs leading-relaxed max-w-xs font-medium">
                A premium business operating in elite room bookings, front desk guest service, and luxury room service dining experiences.
              </p>
            </div>

            {/* Col 2: Services Mock Info */}
            <div className="space-y-3">
              <h5 className="font-serif font-semibold text-hotel-gold uppercase text-xs tracking-wider">
                Services Available
              </h5>
              <ul className="text-gray-400 text-xs space-y-1.5 font-medium">
                <li>• Gourmet Room Service Dining</li>
                <li>• Elite Suite Housekeeping</li>
                <li>• Express Dry Cleaning & Laundry</li>
                <li>• 24/7 Technician Maintenance</li>
              </ul>
            </div>

            {/* Col 3: Contact Details */}
            <div className="space-y-3">
              <h5 className="font-serif font-semibold text-hotel-gold uppercase text-xs tracking-wider">
                Guest Desk & Support
              </h5>
              <ul className="text-gray-400 text-xs space-y-2">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-hotel-gold shrink-0" />
                  <span>Dial Ext: 100 or +91 98480 22338</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-hotel-gold shrink-0" />
                  <span>support@srinirvanaplaza.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-hotel-gold shrink-0" />
                  <span>Sri Nirvana Plaza, Main Road, India</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-2 font-medium">
            <p>© 2026 Sri Nirvana Plaza. All rights reserved.</p>
            <p className="uppercase tracking-widest text-[9px] text-hotel-gold">
              Room Service Order Management System v1.1
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
