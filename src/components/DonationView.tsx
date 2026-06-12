import { DonationAccount } from '../types';
import { Copy, CreditCard, Coins, DollarSign, Building, Sparkles, Check, QrCode } from 'lucide-react';
import React, { useState } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';

interface DonationViewProps {
  accounts: DonationAccount[];
  onCopyText: (text: string) => void;
}

export default function DonationView({ accounts, onCopyText }: DonationViewProps) {
  // Store temporarily copied state per field to show inline success animations
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Dynamic QR Code visibility and lazy loading URL states
  const [expandedQrId, setExpandedQrId] = useState<string | null>(null);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

  const toggleQrCode = async (id: string, textToEncode: string) => {
    if (expandedQrId === id) {
      setExpandedQrId(null);
    } else {
      setExpandedQrId(id);
      if (!qrUrls[id]) {
        try {
          const url = await QRCode.toDataURL(textToEncode, {
            margin: 2,
            width: 300,
            color: {
              dark: '#0B2D5C',
              light: '#FFFFFF'
            }
          });
          setQrUrls(prev => ({ ...prev, [id]: url }));
        } catch (err) {
          console.error("Error generating QR code", err);
        }
      }
    }
  };

  const handleCopy = (value: string, uniqueKey: string) => {
    onCopyText(value);
    setCopiedKey(uniqueKey);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };

  // Helper matching titles to meaningful visual icons
  const getCardIcon = (title: string) => {
    const uppercaseTitle = title.toUpperCase();
    if (uppercaseTitle.includes('OFFERING')) {
      return <Coins className="w-5 h-5 text-[#D4AF37]" />;
    } else if (uppercaseTitle.includes('TITHE')) {
      return <Sparkles className="w-5 h-5 text-[#D4AF37]" />;
    } else if (uppercaseTitle.includes('PROJECT')) {
      return <Building className="w-5 h-5 text-[#D4AF37]" />;
    } else if (uppercaseTitle.includes('DOLLAR') || uppercaseTitle.includes('USD') || uppercaseTitle.includes('$')) {
      return <DollarSign className="w-5 h-5 text-[#D4AF37]" />;
    }
    return <CreditCard className="w-5 h-5 text-[#D4AF37]" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-slide-up" id="donation-view-root">
      {/* Inspired Hero Title / Sub-Header */}
      <div className="text-center mb-10 max-w-2xl mx-auto" id="donation-hero">
        <h2 
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 select-none"
          style={{ color: '#0B2D5C' }}
        >
          Fuel the Vision.
        </h2>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed font-light mb-6 px-2">
          "Your generosity powers every life changed, every worship experience, and every community reached. Thank you for investing in the future."
        </p>
        
        {/* Helper copy indicator */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider select-none bg-amber-50/50"
          style={{ color: '#0B2D5C', borderColor: 'rgba(212, 175, 55, 0.4)' }}
          id="tap-indicator"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
          </span>
          Tap any detail below to copy it instantly
        </div>
      </div>

      {accounts.length === 0 ? (
        <div 
          className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-md max-w-md mx-auto"
          id="no-accounts-state"
        >
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-1">No Donation Accounts Available</h3>
          <p className="text-sm text-gray-400">
            Please switch to the Admin Center above to configure your bank accounts and options.
          </p>
        </div>
      ) : (
        /* Grid container for beautiful responsive cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="donation-cards-grid">
          {accounts.map((account, index) => {
            const cardIcon = getCardIcon(account.title);
            
            return (
              <div 
                key={account.id}
                className="bg-white rounded-3xl border border-gray-100/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group transform hover:-translate-y-1"
                id={`donation-card-${account.id}`}
              >
                {/* Card Title Header */}
                <div 
                  className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-zinc-50/50 group-hover:bg-amber-50/30 transition-colors"
                  id={`card-header-${account.id}`}
                >
                  <h3 
                    className="font-bold text-xs uppercase tracking-widest flex items-center gap-2 text-zinc-800"
                    id={`card-title-${account.id}`}
                  >
                    {cardIcon}
                    <span className="line-clamp-1">{account.title}</span>
                  </h3>
                  <span className="text-[10px] bg-sky-50 text-[#0B2D5C] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider select-none border border-sky-100">
                    Active
                  </span>
                </div>

                {/* Account details rows */}
                <div className="p-6 space-y-3" id={`card-body-${account.id}`}>
                  {/* Bank Name Row */}
                  <div 
                    onClick={() => handleCopy(account.bankName, `${account.id}-bank`)}
                    className="relative flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-[#0B2D5C]/5 hover:border-[#D4AF37]/50 transition-all duration-200 cursor-pointer group/row"
                    title="Click to copy Bank Name"
                    id={`row-${account.id}-bank`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">
                        🔘 Bank Name
                      </span>
                      <span className="text-sm font-semibold text-zinc-850">
                        {account.bankName}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(account.bankName, `${account.id}-bank`);
                      }}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-[#0B2D5C] hover:text-white text-gray-500 hover:scale-105 transition active:scale-95 flex items-center gap-1 text-[11px] font-medium"
                      title="Copy Bank"
                      id={`btn-copy-${account.id}-bank`}
                    >
                      {copiedKey === `${account.id}-bank` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="text-[#D4AF37]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Account Number Row */}
                  <div 
                    onClick={() => handleCopy(account.accountNumber, `${account.id}-number`)}
                    className="relative flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-amber-50/10 hover:bg-[#0B2D5C]/5 hover:border-[#D4AF37]/50 transition-all duration-200 cursor-pointer group/row"
                    title="Click to copy Account Number"
                    id={`row-${account.id}-number`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">
                        🔘 Account Number
                      </span>
                      <span className="text-base md:text-lg font-mono font-bold text-[#0B2D5C] tracking-wide">
                        {account.accountNumber}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(account.accountNumber, `${account.id}-number`);
                      }}
                      className="p-2.5 rounded-lg bg-[#0B2D5C]/5 hover:bg-[#0B2D5C] hover:text-white text-[#0B2D5C] hover:scale-105 transition active:scale-95 flex items-center gap-1.5 text-xs font-bold shadow-sm"
                      title="Copy Account Number"
                      id={`btn-copy-${account.id}-number`}
                    >
                      {copiedKey === `${account.id}-number` ? (
                        <>
                          <Check className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-[#D4AF37]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Account Name Row */}
                  <div 
                    onClick={() => handleCopy(account.accountName, `${account.id}-name`)}
                    className="relative flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-[#0B2D5C]/5 hover:border-[#D4AF37]/50 transition-all duration-200 cursor-pointer group/row"
                    title="Click to copy Account Name"
                    id={`row-${account.id}-name`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">
                        🔘 Account Name
                      </span>
                      <span className="text-sm font-semibold text-zinc-800 tracking-wide uppercase">
                        {account.accountName}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(account.accountName, `${account.id}-name`);
                      }}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-[#0B2D5C] hover:text-white text-gray-500 hover:scale-105 transition active:scale-95 flex items-center gap-1 text-[11px] font-medium"
                      title="Copy Account Name"
                      id={`btn-copy-${account.id}-name`}
                    >
                      {copiedKey === `${account.id}-name` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="text-[#D4AF37]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Dynamic QR Code Toggle Button */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col gap-2" id={`qr-wrapper-${account.id}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleQrCode(
                          account.id,
                          `RCCG HOUSE OF GLORY\n-----------------------\nCategory: ${account.title}\nBank: ${account.bankName}\nAccount: ${account.accountNumber}\nName: ${account.accountName}`
                        );
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0B2D5C]/5 hover:bg-[#0B2D5C] group-hover:bg-[#0B2D5C]/10 hover:text-white border border-[#0B2D5C]/10 text-[#0B2D5C] rounded-xl text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all duration-200"
                      id={`btn-qr-${account.id}`}
                    >
                      <QrCode className="w-4 h-4 text-[#D4AF37]" />
                      <span>
                        {expandedQrId === account.id ? 'Hide QR Code' : 'Show QR Code for Scanning'}
                      </span>
                    </button>

                    <AnimatePresence>
                      {expandedQrId === account.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden flex flex-col items-center py-2"
                          id={`qr-panel-${account.id}`}
                        >
                          <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-inner flex flex-col items-center max-w-[240px] mx-auto w-full">
                            {qrUrls[account.id] ? (
                              <img
                                src={qrUrls[account.id]}
                                alt={`QR Code for ${account.title}`}
                                className="w-40 h-40 object-contain selection:bg-transparent"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-40 h-40 flex items-center justify-center text-gray-400 font-medium text-xs">
                                Generating dynamic QR...
                              </div>
                            )}
                            <span className="text-[9.5px] text-gray-400 font-semibold text-center leading-normal mt-2.5 select-none uppercase tracking-wider">
                              Scan with phone camera <br /> to copy instant info
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Card Subtle Bottom Bar */}
                <div 
                  className="h-1 w-full bg-gradient-to-r"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #0B2D5C, #D4AF37)'
                  }}
                  id={`card-decor-${account.id}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
