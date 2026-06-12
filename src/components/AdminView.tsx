import React, { useState, useRef } from 'react';
import { DonationAccount } from '../types';
import { 
  Plus, Edit2, Trash2, Upload, RefreshCw, Save, X, Info, HelpCircle, FileImage, 
  CreditCard, Sparkles, Building, Coins, ShieldCheck
} from 'lucide-react';

interface AdminViewProps {
  accounts: DonationAccount[];
  logoUrl: string | null;
  onAddAccount: (account: Omit<DonationAccount, 'id'>) => void;
  onUpdateAccount: (account: DonationAccount) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateLogo: (logoBase64: string | null) => void;
  onResetAccounts: () => void;
  onCopyText: (text: string) => void;
}

export default function AdminView({
  accounts,
  logoUrl,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onUpdateLogo,
  onResetAccounts,
  onCopyText
}: AdminViewProps) {
  // New account form state
  const [newTitle, setNewTitle] = useState('');
  const [newBank, setNewBank] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newName, setNewName] = useState('RCCG HOUSE OF GLORY');
  
  // Quick-fill templates for titles
  const quickTitles = [
    'OFFERING ACCOUNT DETAILS', 
    'TITHE ACCOUNT DETAILS', 
    'PROJECT ACCOUNT DETAILS', 
    'DOLLAR ACCOUNT (USD) DETAILS',
    'BUILDING FUND ACCOUNT',
    'WELFARE DEPT ACCOUNT'
  ];

  // Map of which account id is in edit mode
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBank, setEditBank] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editName, setEditName] = useState('');

  // Drag & Drop File Upload state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form helpers
  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBank.trim() || !newNumber.trim() || !newName.trim()) {
      alert('Please fill out all fields for the new donation card.');
      return;
    }
    
    onAddAccount({
      title: newTitle.trim(),
      bankName: newBank.trim(),
      accountNumber: newNumber.trim(),
      accountName: newName.trim().toUpperCase()
    });

    // Clear form except account name as default helper
    setNewTitle('');
    setNewBank('');
    setNewNumber('');
  };

  const startEdit = (account: DonationAccount) => {
    setEditId(account.id);
    setEditTitle(account.title);
    setEditBank(account.bankName);
    setEditNumber(account.accountNumber);
    setEditName(account.accountName);
  };

  const handleUpdate = (id: string) => {
    if (!editTitle.trim() || !editBank.trim() || !editNumber.trim() || !editName.trim()) {
      alert('All fields must be filled out before saving edits.');
      return;
    }
    onUpdateAccount({
      id,
      title: editTitle.trim(),
      bankName: editBank.trim(),
      accountNumber: editNumber.trim(),
      accountName: editName.trim().toUpperCase()
    });
    setEditId(null);
  };

  // Process File to Base64
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select or drop an image file (PNG, JPG, SVG, etc.).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB restriction to prevent localstorage exceed
      alert('To optimize local storage performance, please upload a logo smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        onUpdateLogo(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  // Drag handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-slide-up" id="admin-view-root">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6" id="admin-header-row">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3">
            <span 
              className="w-2.5 h-8 rounded-full bg-gradient-to-b"
              style={{ backgroundImage: 'linear-gradient(#0B2D5C, #D4AF37)' }}
            />
            Admin Center
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure default and custom church accounts. All updates persist in your browser instance immediately.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('This will wipe all custom configurations & restore the 4 default RCCG House of Glory accounts exactly as requested. Do you want to proceed?')) {
              onResetAccounts();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors active:scale-95 duration-150 shadow-sm"
          id="btn-reset-defaults"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Accounts
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="admin-grid">
        
        {/* ========================================================== */}
        {/* LEFT COLUMN: LOGO UPLOADER & QUICK CONTROLS (4 cols)      */}
        {/* ========================================================== */}
        <div className="lg:col-span-4 space-y-6" id="admin-config-column">
          
          {/* Logo Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6" id="logo-uploader-card">
            <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-800 mb-4 flex items-center gap-2">
              <FileImage className="w-4 h-4 text-[#D4AF37]" />
              Church Logo Configuration
            </h3>

            {/* Current logo preview / container */}
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-2xl border border-zinc-100 mb-5 relative group">
              {logoUrl ? (
                <div className="relative flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl flex items-center justify-center bg-white relative">
                    <img 
                      src={logoUrl} 
                      alt="Uploaded Logo Landmark" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 mt-3 border border-emerald-100 rounded-full select-none">
                    ✔ Custom Logo Loaded
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div 
                    className="w-28 h-28 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg transition-transform duration-300"
                    style={{ backgroundColor: '#0B2D5C' }}
                  >
                    <span className="font-extrabold text-[#D4AF37] text-5xl">G</span>
                  </div>
                  <span className="text-[10px] bg-[#0B2D5C]/5 text-[#0B2D5C] font-semibold px-3 py-0.5 mt-3 rounded-full select-none">
                    Default Church Icon
                  </span>
                </div>
              )}
            </div>

            {/* Drag & Drop Upload field */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
                isDragging 
                  ? 'border-[#D4AF37] bg-amber-50/20 scale-[1.01]' 
                  : 'border-gray-200 hover:border-[#0B2D5C] bg-white hover:bg-gray-50'
              }`}
              id="dropzone"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden" 
                id="logo-file-input"
              />
              <Upload className={`w-8 h-8 mb-2 transition-transform duration-300 ${isDragging ? 'translate-y-[-4px] text-[#D4AF37]' : 'text-gray-400'}`} />
              
              <span className="text-xs font-bold text-gray-700 block mb-0.5">
                Drag and Drop Logo
              </span>
              <span className="text-[10px] text-gray-400">
                Or choose standard local file (Max 2MB)
              </span>
            </div>

            {/* Logo action triggers */}
            {logoUrl && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this custom logo and restore the default cross/globe symbol?')) {
                    onUpdateLogo(null);
                  }
                }}
                className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 border border-gray-200 hover:border-rose-100 text-gray-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                id="btn-remove-logo"
              >
                <X className="w-3.5 h-3.5" />
                Remove Logo
              </button>
            )}
          </div>

          {/* Portal URLs Sharing Panel */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6" id="portal-links-card">
            <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-900 mb-2.5 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Separate Portal URLs
            </h3>

            <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed font-medium">
              Copy and share these two distinct links. Users can view the portal on different URLs cleanly.
            </p>

            <div className="space-y-4">
              {/* Client Donation Link */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#0B2D5C]/5 border border-[#0B2D5C]/10 hover:border-[#D4AF37]/40 transition group">
                <span className="text-[10px] font-extrabold text-[#0B2D5C] uppercase tracking-wider flex items-center justify-between">
                  <span>Option 1: Donation View URL</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 rounded px-1.5 py-0.2 font-semibold">Active</span>
                </span>
                <span className="text-[11px] font-mono select-all text-zinc-600 truncate word-break break-all font-semibold">
                  {window.location.origin + window.location.pathname}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const clientUrl = window.location.origin + window.location.pathname;
                    onCopyText(clientUrl);
                  }}
                  className="mt-1.5 w-full py-1.5 px-3 bg-white hover:bg-[#0B2D5C] hover:text-white border border-gray-200 hover:border-[#0B2D5C] text-gray-750 text-[10.5px] font-semibold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:scale-95 shadow-sm cursor-pointer"
                >
                  Copy Donation URL
                </button>
              </div>

              {/* Admin Portal Link */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-amber-50/20 border border-amber-200/50 hover:border-[#0B2D5C]/40 transition group">
                <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-wider flex items-center justify-between">
                  <span>Option 2: Admin Portal URL</span>
                  <span className="text-[9px] bg-amber-100 text-[#D4AF37] border border-amber-200 rounded px-1.5 py-0.2 font-semibold font-sans">Owner view</span>
                </span>
                <span className="text-[11px] font-mono select-all text-zinc-600 truncate word-break break-all font-semibold font-medium">
                  {window.location.origin + window.location.pathname + '?view=admin#/admin'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const adminUrl = window.location.origin + window.location.pathname + '?view=admin#/admin';
                    onCopyText(adminUrl);
                  }}
                  className="mt-1.5 w-full py-1.5 px-3 bg-[#0B2D5C] text-white hover:bg-[#0B2D5C]/90 text-[10.5px] font-semibold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:scale-95 shadow-sm cursor-pointer"
                >
                  Copy Admin URL
                </button>
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-5" id="help-box">
            <h4 className="flex items-center gap-2 font-bold text-xs text-[#0B2D5C] uppercase tracking-wider mb-2">
              <Info className="w-4 h-4 text-[#D4AF37]" />
              How clipboard copying works
            </h4>
            <p className="text-[11.5px] text-sky-900/80 leading-relaxed font-medium">
              In the public-facing view, users can tap anywhere on any row of details (Bank, Account Name, Account Number) inside a card. It copies the text value immediately and triggers an elegant notification to confirm!
            </p>
          </div>

        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: ACTION PANELS & TABLE (8 cols)               */}
        {/* ========================================================== */}
        <div className="lg:col-span-8 space-y-8" id="accounts-workspace-column">
          
          {/* Create New Account form */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6" id="add-account-card">
            <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-800 mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              Add a New Donation Account Card
            </h3>

            <form onSubmit={handleAddNew} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account Title Field */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    Card Title / Account Category
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      placeholder="e.g. OFFERING ACCOUNT DETAILS or WELFARE FUND"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full text-xs font-semibold px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#D4AF37] focus:bg-white outline-none transition"
                      id="input-title"
                    />
                  </div>
                  
                  {/* Quick titles fill-in toolbar */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5" id="presets-container">
                    {quickTitles.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewTitle(t)}
                        className={`text-[9px] px-2 py-1 rounded-md border font-medium ${
                          newTitle === t 
                            ? 'bg-[#0B2D5C] text-white border-[#0B2D5C]' 
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-zinc-700'
                        }`}
                        id={`preset-${t.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {t.replace(' ACCOUNT DETAILS', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bank Name Field */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    Bank Name
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. UBA, Access, Zenith, GTBank"
                    value={newBank}
                    onChange={(e) => setNewBank(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#D4AF37] focus:bg-white outline-none transition"
                    id="input-bank"
                  />
                </div>

                {/* Account Number Field */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    Account Number
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 1028246694"
                    value={newNumber}
                    onChange={(e) => {
                      // Allow digits and simple letters for USD accounts
                      setNewNumber(e.target.value.replace(/[^\w\s-]/g, ''));
                    }}
                    className="w-full text-xs font-mono font-bold px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#D4AF37] focus:bg-white outline-none tracking-wider transition"
                    id="input-number"
                  />
                </div>

                {/* Account Name Field */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    Account Name
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. RCCG HOUSE OF GLORY"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#D4AF37] focus:bg-white outline-none tracking-wide transition uppercase"
                    id="input-account-name"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2" id="add-action-area">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 text-xs text-white uppercase font-bold tracking-wider rounded-xl hover:scale-[1.02] shadow-md transition-all active:scale-95 duration-200"
                  style={{ backgroundColor: '#0B2D5C' }}
                  id="btn-create-account"
                >
                  <Plus className="w-4 h-4" style={{ color: '#D4AF37' }} />
                  Create Donation Card
                </button>
              </div>
            </form>
          </div>

          {/* List of existing accounts with edit actions */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6" id="accounts-list-card">
            <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-800 mb-5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              Manage Configured Accounts ({accounts.length})
            </h3>

            {accounts.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No bank accounts exist currently. Add some above or click "Reset Accounts" at the top to load pre-configured defaults.
              </div>
            ) : (
              <div className="space-y-4" id="manage-accounts-list">
                {accounts.map((account) => {
                  const isEditingThis = editId === account.id;

                  return (
                    <div 
                      key={account.id}
                      className={`border rounded-2xl p-4 transition-all duration-200 ${
                        isEditingThis 
                          ? 'border-[#D4AF37] bg-amber-50/5 shadow-md' 
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                      id={`manage-item-${account.id}`}
                    >
                      {isEditingThis ? (
                        /* ================================================== */
                        /* EDITING STATE                                      */
                        /* ================================================== */
                        <div className="space-y-3" id={`edit-form-${account.id}`}>
                          <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-2">
                            <span className="text-[10px] font-extrabold text-[#0B2D5C] uppercase tracking-wider">
                              ✏️ Editing Card Details
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdate(account.id)}
                                className="p-1 px-3 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 uppercase tracking-wider transition"
                                title="Save changes"
                                id={`edit-save-${account.id}`}
                              >
                                <Save className="w-3 h-3" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditId(null)}
                                className="p-1 px-[7px] text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg flex items-center gap-1 uppercase tracking-wider transition"
                                title="Cancel"
                                id={`edit-cancel-${account.id}`}
                              >
                                <X className="w-3 h-3" />
                                Cancel
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* Edit Title */}
                            <div className="flex flex-col gap-1 md:col-span-2">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Title</label>
                              <input 
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full text-xs px-3 py-1.5 border border-gray-200 bg-white rounded-lg outline-none font-bold text-zinc-800"
                                id={`input-edit-title-${account.id}`}
                              />
                            </div>

                            {/* Edit Bank */}
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Bank</label>
                              <input 
                                type="text"
                                value={editBank}
                                onChange={(e) => setEditBank(e.target.value)}
                                className="w-full text-xs px-3 py-1.5 border border-gray-200 bg-white rounded-lg outline-none"
                                id={`input-edit-bank-${account.id}`}
                              />
                            </div>

                            {/* Edit Number */}
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Account Number</label>
                              <input 
                                type="text"
                                value={editNumber}
                                onChange={(e) => setEditNumber(e.target.value.replace(/[^\w\s-]/g, ''))}
                                className="w-full text-xs px-3 py-1.5 border border-gray-200 bg-white rounded-lg outline-none font-mono font-bold text-[#0B2D5C]"
                                id={`input-edit-number-${account.id}`}
                              />
                            </div>

                            {/* Edit Account Name */}
                            <div className="flex flex-col gap-1 md:col-span-2">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Account Name</label>
                              <input 
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full text-xs px-3 py-1.5 border border-gray-200 bg-white rounded-lg outline-none uppercase font-semibold text-zinc-700"
                                id={`input-edit-name-${account.id}`}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* ================================================== */
                        /* NORMAL READ-ONLY ITEM IN THE ADMIN LIST            */
                        /* ================================================== */
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" id={`item-row-${account.id}`}>
                          <div className="flex-1 min-w-0">
                            <span 
                              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                              style={{ backgroundColor: '#0B2D5C/5', color: '#0B2D5C', background: 'rgba(11, 45, 92, 0.06)' }}
                            >
                              {account.title}
                            </span>
                            
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold text-gray-600" id={`item-specs-${account.id}`}>
                              <span className="flex items-center gap-1">
                                <span className="text-gray-400 font-light">Bank:</span>
                                <strong className="text-zinc-800">{account.bankName}</strong>
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <span className="text-gray-400 font-light">Number:</span>
                                <strong className="text-[#0B2D5C]">{account.accountNumber}</strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-gray-400 font-light">Name:</span>
                                <strong className="text-zinc-600 truncate max-w-[124px] inline-block uppercase">{account.accountName}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center" id={`item-actions-${account.id}`}>
                            <button
                              onClick={() => startEdit(account)}
                              className="p-2 border border-blue-100 bg-sky-50 text-sky-800 rounded-xl hover:bg-sky-100 hover:text-sky-900 font-bold tracking-wider transition active:scale-90"
                              title="Edit account details"
                              id={`item-edit-btn-${account.id}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete the "${account.title}" account? This action cannot be undone.`)) {
                                  onDeleteAccount(account.id);
                                }
                              }}
                              className="p-2 border border-rose-100 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 hover:text-rose-700 font-bold tracking-wider transition active:scale-90"
                              title="Delete account"
                              id={`item-delete-btn-${account.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
