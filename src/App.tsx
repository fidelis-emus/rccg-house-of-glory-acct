import { useState, useEffect } from 'react';
import { DonationAccount, ToastMessage } from './types';
import Header from './components/Header';
import DonationView from './components/DonationView';
import AdminView from './components/AdminView';
import ToastContainer from './components/ToastContainer';
import { Heart, Globe } from 'lucide-react';

const DEFAULT_ACCOUNTS: DonationAccount[] = [
  {
    id: 'default-offering',
    title: 'OFFERING ACCOUNT DETAILS',
    bankName: 'UBA',
    accountNumber: '1028246694',
    accountName: 'RCCG HOUSE OF GLORY',
    isDefault: true
  },
  {
    id: 'default-tithe',
    title: 'TITHE ACCOUNT DETAILS',
    bankName: 'UBA',
    accountNumber: '1028247440',
    accountName: 'RCCG HOUSE OF GLORY',
    isDefault: true
  },
  {
    id: 'default-project',
    title: 'PROJECT ACCOUNT DETAILS',
    bankName: 'UBA',
    accountNumber: '1028247206',
    accountName: 'RCCG HOUSE OF GLORY',
    isDefault: true
  },
  {
    id: 'default-dollar',
    title: 'DOLLAR ACCOUNT (USD) DETAILS',
    bankName: 'UBA',
    accountNumber: '3004812341',
    accountName: 'RCCG HOUSE OF GLORY',
    isDefault: true
  }
];

export default function App() {
  // On App Mount: Read initial view based on URL Hash or search params
  const [currentView, setCurrentView] = useState<'donation' | 'admin'>(() => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    if (
      hash === '#/admin' || 
      hash === '#admin' || 
      searchParams.get('portal') === 'admin' || 
      searchParams.get('view') === 'admin'
    ) {
      return 'admin';
    }
    return 'donation';
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<DonationAccount[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize route changes when back/forward browser arrows or links are used
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      if (
        hash === '#/admin' || 
        hash === '#admin' || 
        searchParams.get('portal') === 'admin' || 
        searchParams.get('view') === 'admin'
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
    
    const baseUrl = window.location.origin + window.location.pathname;
    if (view === 'admin') {
      window.location.hash = '/admin';
      const cleanUrl = `${baseUrl}?view=admin#/admin`;
      window.history.pushState({ path: cleanUrl }, '', cleanUrl);
    } else {
      window.location.hash = '/';
      const cleanUrl = `${baseUrl}?view=donation#/`;
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
        setAccounts(JSON.parse(storedAccounts));
      } else {
        setAccounts(DEFAULT_ACCOUNTS);
        localStorage.setItem('rccg_donation_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
      }
    } catch (e) {
      console.warn('LocalStorage error reading configs, loading default accounts: ', e);
      setAccounts(DEFAULT_ACCOUNTS);
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
    try {
      localStorage.removeItem('rccg_church_logo');
      localStorage.setItem('rccg_donation_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
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

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#D4AF37]/30 selection:text-[#0B2D5C]">
      {/* Dynamic Header Component */}
      <Header 
        currentView={currentView}
        onViewChange={handleViewChange}
        logoUrl={logoUrl}
      />

      {/* Main Content Area */}
      <main className="flex-grow bg-gradient-to-b from-white via-zinc-50/20 to-zinc-50/50 pb-16">
        {currentView === 'donation' ? (
          <DonationView 
            accounts={accounts}
            onCopyText={handleCopyText}
          />
        ) : (
          <AdminView 
            accounts={accounts}
            logoUrl={logoUrl}
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
            className="text-xl md:text-2xl font-extrabold tracking-widest uppercase mb-3 decoration-[#D4AF37] decoration-2"
          >
            RCCG House Of Glory
          </h3>

          <p className="font-serif italic text-sm md:text-base text-amber-100/90 max-w-lg mb-4 leading-relaxed tracking-wide font-light">
            "Freely you have received; freely give." <br />
            <span className="text-xs opacity-70 font-sans tracking-widest uppercase mt-1 inline-block">— Matthew 10:8</span>
          </p>

          <p className="text-xs text-white/70 font-medium tracking-wide max-w-md border-t border-white/10 pt-4 mb-6">
            Thank you for partnering with God's work. Your resource is directly used in expanding the body of Christ, teaching truth, and caring for the vulnerable.
          </p>

          {/* Copyright Section */}
          <div className="text-[10px] text-zinc-400 font-medium flex flex-col sm:flex-row items-center gap-2 sm:gap-4 select-none">
            <span>&copy; 2026 RCCG House of Glory. All Rights Reserved.</span>
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
