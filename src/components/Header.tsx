import { Gift, Sliders, Church } from 'lucide-react';

interface HeaderProps {
  currentView: 'donation' | 'admin';
  onViewChange: (view: 'donation' | 'admin') => void;
  logoUrl: string | null;
}

export default function Header({ currentView, onViewChange, logoUrl }: HeaderProps) {
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
                alt="RCCG House of Glory" 
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
              RCCG House Of Glory
            </h1>
            <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-gray-400">
              International Worship Center
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <nav className="flex items-center" id="nav-controls">
          <div className="bg-gray-100 p-1.5 rounded-full flex items-center gap-1 shadow-inner border border-gray-200/50">
            <button
              onClick={() => onViewChange('donation')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${
                currentView === 'donation'
                  ? 'bg-white text-[#0B2D5C] shadow-md scale-100'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
              }`}
              style={currentView === 'donation' ? { color: '#0B2D5C' } : {}}
              id="switch-donation-btn"
            >
              <Gift className="w-4 h-4" style={{ color: currentView === 'donation' ? '#D4AF37' : undefined }} />
              Donation Portal
            </button>
            
            <button
              onClick={() => onViewChange('admin')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${
                currentView === 'admin'
                  ? 'bg-white text-[#0B2D5C] shadow-md scale-100'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
              }`}
              style={currentView === 'admin' ? { color: '#0B2D5C' } : {}}
              id="switch-admin-btn"
            >
              <Sliders className="w-4 h-4" style={{ color: currentView === 'admin' ? '#D4AF37' : undefined }} />
              Admin Center
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
