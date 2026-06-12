import { Gift, Sliders, Church } from 'lucide-react';
import { ChurchBranding } from '../types';

interface HeaderProps {
  currentView: 'donation' | 'admin';
  onViewChange: (view: 'donation' | 'admin') => void;
  logoUrl: string | null;
  branding: ChurchBranding;
}

export default function Header({ currentView, onViewChange, logoUrl, branding }: HeaderProps) {
  return (
    <header 
      className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm"
      id="app-header"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3" id="brand-header">
          {logoUrl ? (
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4AF37] flex items-center justify-center bg-gray-50 uppercase shadow-inner">
              <img 
                src={logoUrl} 
                alt={branding.churchName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white border-2 border-dashed shadow-md transition-all duration-300"
              style={{ 
                backgroundColor: '#0B2D5C',
                borderColor: '#D4AF37'
              }}
            >
              <Church className="w-6 h-6 animate-pulse" style={{ color: '#D4AF37' }} />
            </div>
          )}
          
          <div className="text-center sm:text-left">
            <h1 
              className="text-lg md:text-xl font-bold tracking-wider uppercase transition-colors"
              style={{ color: '#0B2D5C' }}
            >
              {branding.churchName}
            </h1>
            <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-gray-400">
              {branding.churchSubtitle}
            </p>
          </div>
        </div>

        {/* View Switcher Controls - Only shown when in admin view or with specialized return link, preventing public users from accessing settings */}
        <nav className="flex items-center" id="nav-controls">
          {currentView === 'admin' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewChange('donation')}
                className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-650 hover:bg-zinc-50 hover:text-zinc-800 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm active:scale-95"
                id="switch-donation-btn"
              >
                <Gift className="w-3.5 h-3.5 text-[#D4AF37]" />
                View Donation Site
              </button>
              
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border select-none transition-all duration-300"
                style={{ 
                  backgroundColor: 'rgba(212, 175, 55, 0.1)', 
                  borderColor: 'rgba(212, 175, 55, 0.4)',
                  color: '#0B2D5C'
                }}
                id="admin-status-badge"
              >
                <Sliders className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
                Admin Mode
              </div>
            </div>
          ) : (
            <div 
              className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest text-[#0B2D5C]/80 bg-[#0B2D5C]/5 border border-[#0B2D5C]/10 flex items-center gap-1.5 select-none"
              id="giving-badge"
            >
              <Gift className="w-3.5 h-3.5 text-[#D4AF37]" />
              Secure Portal
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
