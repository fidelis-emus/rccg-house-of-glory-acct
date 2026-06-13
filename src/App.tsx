import { useState, useEffect } from 'react';
import { DonationAccount, ToastMessage, ChurchBranding } from './types';
import Header from './components/Header';
import DonationView from './components/DonationView';
import AdminView from './components/AdminView';
import ToastContainer from './components/ToastContainer';
import { Heart, Globe, Church } from 'lucide-react';

const DEFAULT_ACCOUNTS: DonationAccount[] = [
  {
    id: 'default-offering',
    title: 'OFFERING ACCOUNT',
    bankName: 'UBA',
    accountNumber: '1028246694',
    accountName: 'RCCG HOUSE OF GLORY',
    isDefault: true
  },
  {
    id: 'default-tithe',
    title: 'TITHE ACCOUNT',
    bankName: 'UBA',
    accountNumber: '1028247440',
    accountName: 'RCCG HOUSE OF GLORY',
    isDefault: true
  },
  {
    id: 'default-project',
    title: 'PROJECT ACCOUNT',
    bankName: 'UBA',
    accountNumber: '1028247206',
    accountName: 'RCCG HOUSE OF GLORY',
    isDefault: true
  },
  {
    id: 'default-dollar',
    title: 'DOLLAR ACCOUNT (USD)',
    bankName: 'UBA',
    accountNumber: '3004812341',
    accountName: 'RCCG HOUSE OF GLORY',
    isDefault: true
  }
];

const DEFAULT_BRANDING: ChurchBranding = {
  churchName: 'RCCG House Of Glory',
  churchSubtitle: 'International Worship Center',
  heroTitle: 'Fuel the Vision.',
  heroSubheader: 'Your generosity powers every life changed, every worship experience, and every community reached. Thank you for investing in the future.',
  footerScripture: 'Freely you have received; freely give.',
  footerScriptureRef: '— Matthew 10:8',
  footerThankYou: 'Thank you for partnering with God\'s work. Your resource is directly used in expanding the body of Christ, teaching truth, and caring for the vulnerable.',
  copyrightText: '© 2026 RCCG House of Glory. All Rights Reserved.'
};

export default function App() {
  // On App Mount: Read initial view based on URL Hash or search params
  const [currentView, setCurrentView] = useState<'donation' | 'admin'>(() => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    if (
      hash === '#/admin' || 
      hash === '#admin' || 
      searchParams.get('portal') === 'admin' || 
      searchParams.get('view') === 'admin' ||
      pathname === '/admin' ||
      pathname.endsWith('/admin') ||
      pathname.includes('/admin/')
    ) {
      return 'admin';
    }
    return 'donation';
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<DonationAccount[]>([]);
  const [branding, setBranding] = useState<ChurchBranding>(DEFAULT_BRANDING);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Trigger high quality secure church entrance loading on mounting
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize route changes when back/forward browser arrows or links are used
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname;
      if (
        hash === '#/admin' || 
        hash === '#admin' || 
        searchParams.get('portal') === 'admin' || 
        searchParams.get('view') === 'admin' ||
        pathname === '/admin' ||
        pathname.endsWith('/admin') ||
        pathname.includes('/admin/')
      ) {
        setCurrentView('admin');
      } else {
        setCurrentView('donation');
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Update URL state and hash when clicking switches elegantly
  const handleViewChange = (view: 'donation' | 'admin') => {
    setCurrentView(view);
    
    const baseOrigin = window.location.origin;
    if (view === 'admin') {
      window.location.hash = '/admin';
      const cleanUrl = `${baseOrigin}/admin?view=admin#/admin`;
      window.history.pushState({ path: cleanUrl }, '', cleanUrl);
    } else {
      window.location.hash = '/';
      const cleanUrl = `${baseOrigin}/?view=donation#/`;
      window.history.pushState({ path: cleanUrl }, '', cleanUrl);
    }
  };

  // On App Mount: Read configuration values from LocalStorage or fall back to requested defaults
  useEffect(() => {
    try {
      // 1. Load Logo
      const storedLogo = localStorage.getItem('rccg_church_logo');
      if (storedLogo) {
        setLogoUrl(storedLogo);
      }

      // 2. Load Donation Accounts
      const storedAccounts = localStorage.getItem('rccg_donation_accounts');
      if (storedAccounts) {
        const parsed = JSON.parse(storedAccounts) as DonationAccount[];
        const migrated = parsed.map((acc) => {
          let t = acc.title;
          const matchDetails = /\s+DETAILS$/i;
          if (matchDetails.test(t)) {
            t = t.replace(matchDetails, '');
          }
          return { ...acc, title: t };
        });
        setAccounts(migrated);
        localStorage.setItem('rccg_donation_accounts', JSON.stringify(migrated));
      } else {
        setAccounts(DEFAULT_ACCOUNTS);
        localStorage.setItem('rccg_donation_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
      }

      // 3. Load Church Branding Customizations
      const storedBranding = localStorage.getItem('rccg_church_branding');
      if (storedBranding) {
        setBranding({ ...DEFAULT_BRANDING, ...JSON.parse(storedBranding) });
      } else {
        setBranding(DEFAULT_BRANDING);
        localStorage.setItem('rccg_church_branding', JSON.stringify(DEFAULT_BRANDING));
      }
    } catch (e) {
      console.warn('LocalStorage error reading configs, loading default values: ', e);
      setAccounts(DEFAULT_ACCOUNTS);
      setBranding(DEFAULT_BRANDING);
    }
  }, []);

  // Set & store updated list
  const saveAccountsToStore = (newAccounts: DonationAccount[]) => {
    setAccounts(newAccounts);
    try {
      localStorage.setItem('rccg_donation_accounts', JSON.stringify(newAccounts));
    } catch (err) {
      console.error('Failed to write accounts details to local storage', err);
    }
  };

  const handleUpdateBranding = (newBranding: ChurchBranding) => {
    setBranding(newBranding);
    try {
      localStorage.setItem('rccg_church_branding', JSON.stringify(newBranding));
    } catch (err) {
      console.error('Failed to write branding details to local storage', err);
    }
  };

  // -------------------------------------------------------------
  // OPERATIONS
  // -------------------------------------------------------------
  const handleAddAccount = (accountData: Omit<DonationAccount, 'id'>) => {
    const newAccount: DonationAccount = {
      ...accountData,
      id: 'acc-' + Date.now()
    };
    const updated = [...accounts, newAccount];
    saveAccountsToStore(updated);
  };

  const handleUpdateAccount = (updatedAccount: DonationAccount) => {
    const updated = accounts.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc));
    saveAccountsToStore(updated);
  };

  const handleDeleteAccount = (id: string) => {
    const updated = accounts.filter((acc) => acc.id !== id);
    saveAccountsToStore(updated);
  };

  const handleUpdateLogo = (newLogoBase64: string | null) => {
    setLogoUrl(newLogoBase64);
    try {
      if (newLogoBase64) {
        localStorage.setItem('rccg_church_logo', newLogoBase64);
      } else {
        localStorage.removeItem('rccg_church_logo');
      }
    } catch (err) {
      console.error('Failed to write logo to local storage', err);
      alert('Your logo image is too large. Clean its size under 2MB for storage performance.');
    }
  };

  const handleResetAccounts = () => {
    setLogoUrl(null);
    setAccounts(DEFAULT_ACCOUNTS);
    setBranding(DEFAULT_BRANDING);
    try {
      localStorage.removeItem('rccg_church_logo');
      localStorage.setItem('rccg_donation_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
      localStorage.setItem('rccg_church_branding', JSON.stringify(DEFAULT_BRANDING));
    } catch (err) {
      console.error('Failed resetting to local storage', err);
    }
  };

  // Copy with fallback logic compatible with iframe/web sandboxes
  const handleCopyText = (text: string) => {
    if (!text) return;

    const triggerToast = () => {
      const toastId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6);
      const newToast: ToastMessage = {
        id: toastId,
        text: 'Copied successfully!',
        copiedValue: text,
        type: 'success'
      };
      
      setToasts((prev) => [...prev, newToast]);

      // Dismiss automatically after 3 seconds
      setTimeout(() => {
        handleDismissToast(toastId);
      }, 3500);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          triggerToast();
        })
        .catch((err) => {
          console.warn('Primary clipboard copy failed, attempting backup copy...', err);
          fallbackCopyText(text, triggerToast);
        });
    } else {
      fallbackCopyText(text, triggerToast);
    }
  };

  const fallbackCopyText = (text: string, onSuccess: () => void) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        onSuccess();
      } else {
        alert(`Copy failed. Please select and copy manually: ${text}`);
      }
    } catch (err) {
      console.error('Fallback copy operation failed', err);
      // Fallback fallback: display in simple browser input
      window.prompt('Copy current bank details:', text);
    }
    
    document.body.removeChild(textArea);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Render a beautiful, premium, custom church-branded entrance loader with absolutely no Gemini/AI icons
  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center text-white"
        style={{ backgroundColor: '#0B2D5C' }}
        id="app-initial-loader"
      >
        <div className="flex flex-col items-center max-w-sm px-6 text-center animate-pulse">
          {logoUrl ? (
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#D4AF37] bg-white flex items-center justify-center shadow-2xl mb-5">
              <img 
                src={logoUrl} 
                alt="Loading Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-white border-4 border-dashed shadow-2xl mb-5"
              style={{ 
                backgroundColor: '#0B2D5C',
                borderColor: '#D4AF37'
              }}
            >
              <Church className="w-12 h-12 text-[#D4AF37]" />
            </div>
          )}
          <h2 className="text-[#D4AF37] text-xl font-extrabold tracking-widest uppercase mb-1.5">{branding.churchName}</h2>
          <p className="text-zinc-300 text-xs font-semibold uppercase tracking-widest">{branding.churchSubtitle}</p>
          
          <div className="mt-8 flex items-center gap-2 justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-bounce"></span>
          </div>
          
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-5 select-none">
            Secure Church Portal Connecting
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#D4AF37]/30 selection:text-[#0B2D5C]">
      {/* Dynamic Header Component */}
      <Header 
        currentView={currentView}
        onViewChange={handleViewChange}
        logoUrl={logoUrl}
        branding={branding}
      />

      {/* Main Content Area */}
      <main className="flex-grow bg-gradient-to-b from-white via-zinc-50/20 to-zinc-50/50 pb-16">
        {currentView === 'donation' ? (
          <DonationView 
            accounts={accounts}
            branding={branding}
            logoUrl={logoUrl}
            onCopyText={handleCopyText}
          />
        ) : (
          <AdminView 
            accounts={accounts}
            logoUrl={logoUrl}
            branding={branding}
            onUpdateBranding={handleUpdateBranding}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onUpdateLogo={handleUpdateLogo}
            onResetAccounts={handleResetAccounts}
            onCopyText={handleCopyText}
          />
        )}
      </main>

      {/* Inspiring Sacred Footer Area */}
      <footer 
        className="text-white relative overflow-hidden shrink-0"
        style={{ backgroundColor: '#0B2D5C' }}
        id="app-footer"
      >
        {/* Subtle Decorative Gold Crown/Arch Element in background */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37]" />
        
        <div className="max-w-4xl mx-auto px-6 py-12 text-center relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-2 select-none">
            <Heart className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">Partnering with Heaven</span>
          </div>

          <h3 
            className="text-xl md:text-2xl font-extrabold tracking-widest uppercase mb-3 decoration-[#D4AF37] decoration-2 text-center"
          >
            {branding.churchName}
          </h3>

          <p className="font-serif italic text-sm md:text-base text-amber-100/90 max-w-lg mb-4 text-center leading-relaxed tracking-wide font-light">
            {branding.footerScripture} <br />
            <span className="text-xs opacity-70 font-sans tracking-widest uppercase mt-1 inline-block">{branding.footerScriptureRef}</span>
          </p>

          <p className="text-xs text-white/70 font-medium tracking-wide max-w-md border-t border-white/10 pt-4 mb-6 text-center">
            {branding.footerThankYou}
          </p>

          {/* Copyright Section */}
          <div className="text-[10px] text-zinc-400 font-medium flex flex-col sm:flex-row items-center gap-2 sm:gap-4 select-none">
            <span>{branding.copyrightText}</span>
            <div className="hidden sm:inline w-1 h-3 bg-zinc-600 rounded" />
            <span className="flex items-center gap-1 hover:text-[#D4AF37] transition cursor-pointer">
              <Globe className="w-3 h-3 text-[#D4AF37]" /> International Missions Network
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Animated Toast List */}
      <ToastContainer 
        toasts={toasts}
        onClose={handleDismissToast}
      />
    </div>
  );
}
