import React from 'react';
import { ArrowLeft, Home, User, Briefcase, ShieldAlert } from 'lucide-react';

export default function RoleSelector({ portalName }) {
  const handleGoHome = () => {
    window.location.hash = '#/';
  };

  const getPortalDetails = () => {
    switch (portalName) {
      case 'guest':
        return {
          label: 'Guest Services Portal',
          desc: 'Request amenities & room dining',
          icon: User,
          color: 'bg-amber-500 text-white shadow-amber-500/20'
        };
      case 'staff':
        return {
          label: 'Staff Fulfillment Console',
          desc: 'Manage service requests & housekeeping',
          icon: Briefcase,
          color: 'bg-slate-700 text-white shadow-slate-900/20'
        };
      case 'admin':
      case 'manager':
        return {
          label: 'Manager Executive Board',
          desc: 'Hotel occupancy & analytical metrics',
          icon: ShieldAlert,
          color: 'bg-hotel-gold text-hotel-navy shadow-yellow-800/20'
        };
      default:
        return {
          label: 'Hotel Operations',
          desc: 'Sri Nirvana Plaza Management',
          icon: Home,
          color: 'bg-hotel-navy text-hotel-gold'
        };
    }
  };

  const details = getPortalDetails();
  const Icon = details.icon;

  return (
    <div className="bg-white border-b border-hotel-gold/20 py-3 px-4 md:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Brand & Portal Type */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-full bg-hotel-navy flex items-center justify-center border border-hotel-gold shrink-0">
            <span className="font-serif font-bold text-hotel-gold text-lg">SNP</span>
          </div>
          <div className="grow">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-serif font-bold text-hotel-navy text-sm md:text-base tracking-wide uppercase">
                Sri Nirvana Plaza
              </h2>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest ${details.color}`}>
                {details.label}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
              {details.desc}
            </p>
          </div>
        </div>

        {/* Home Linkage */}
        <button
          onClick={handleGoHome}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-hotel-gold/30 hover:border-hotel-gold text-hotel-navy hover:text-hotel-gold rounded-xl text-xs font-bold uppercase tracking-wider bg-hotel-cream/35 hover:bg-hotel-cream transition-all duration-300 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>System Gateway</span>
        </button>
      </div>
    </div>
  );
}
