import React, { useState } from 'react';
import { User, Address, Order } from '../types';
import { getThemeClasses } from './ProductCard';
import { Mail, Lock, UserCheck, Key, LogOut, Package, MapPin, Eye, Edit3, Trash2, Check, RefreshCw } from 'lucide-react';

interface AccountDashboardViewProps {
  loggedInUser: User | null;
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  onRegister: (email: string, name: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  onLogout: () => void;
  onUpdateProfile: (updated: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  addresses: Address[];
  onAddAddress: (addr: Address) => void;
  onRemoveAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
  orders: Order[];
  themeColorId: string;
  setView: (v: string) => void;
}

export default function AccountDashboardView({
  loggedInUser,
  onLogin,
  onRegister,
  onLogout,
  onUpdateProfile,
  addresses,
  onAddAddress,
  onRemoveAddress,
  onSetDefaultAddress,
  orders,
  themeColorId,
  setView
}: AccountDashboardViewProps) {
  const colors = getThemeClasses(themeColorId);

  // Sub-views states: 'login' | 'register' | 'forgot' OR if loggedIn: 'profile' | 'addresses' | 'orders'
  const [authState, setAuthState] = useState<'login' | 'register' | 'forgot'>('login');
  const [dashboardTab, setDashboardTab] = useState<'profile' | 'addresses' | 'orders'>('orders');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Input fields - Auth
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Input fields - Profile edit
  const [editName, setEditName] = useState(loggedInUser?.fullName || '');
  const [editPhone, setEditPhone] = useState(loggedInUser?.phone || '');
  const [editGender, setEditGender] = useState(loggedInUser?.gender || 'not-specified');
  const [editBirthdate, setEditBirthdate] = useState(loggedInUser?.childBirthdate || '');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Input fields - Address book
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addLine1, setAddLine1] = useState('');
  const [addCity, setAddCity] = useState('');
  const [addState, setAddState] = useState('');
  const [addZip, setAddZip] = useState('');

  // Past orders detailed modal status
  const [activeOrderModal, setActiveOrderModal] = useState<Order | null>(null);

  // Sync edits when user logs in
  React.useEffect(() => {
    if (loggedInUser) {
      setEditName(loggedInUser.fullName);
      setEditPhone(loggedInUser.phone || '');
      setEditGender(loggedInUser.gender || 'not-specified');
      setEditBirthdate(loggedInUser.childBirthdate || '');
    }
  }, [loggedInUser]);

  // Handlers
  React.useEffect(() => {
    setActionError(null);
  }, [authState, dashboardTab]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const result = await onLogin(authEmail.trim(), authPassword.trim());
      if (result.success) {
        setAuthPassword('');
      } else {
        setActionError(result.message || 'Invalid login credentials. Please check your Shopify account details.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Connection to authentication provider failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authName || !authPassword) {
      alert('Fill all blanks, please.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const result = await onRegister(authEmail.trim(), authName.trim(), authPassword.trim());
      if (result.success) {
        alert(`Account registration completed! You can now log into ${authEmail}.`);
        setAuthState('login');
        setAuthEmail(authEmail);
        setAuthPassword('');
      } else {
        setActionError(result.message || 'Signup failed. Please verify that your email is unique and your password has at least 5 characters.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Connection to signup provider failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(`We have simulated and sent a secure workspace reset email to ${forgotEmail}. Please verify your inbox folders.`);
    setForgotEmail('');
    setTimeout(() => {
      setForgotSuccess('');
      setAuthState('login');
    }, 4500);
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      const result = await onUpdateProfile({
        fullName: editName,
        phone: editPhone,
        gender: editGender,
        childBirthdate: editBirthdate
      });
      if (result.success) {
        setEditSuccessMsg('Your personal parenting profile has been successfully saved!');
        setTimeout(() => setEditSuccessMsg(''), 2500);
      } else {
        setActionError(result.message || 'Could not save profile changes.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to update user profile details.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addPhone || !addLine1 || !addCity || !addState || !addZip) {
      alert('Fill all blanks!');
      return;
    }
    const newAddr: Address = {
      id: 'addr-panel-' + Date.now(),
      fullName: addName,
      phone: addPhone,
      addressLine1: addLine1,
      city: addCity,
      state: addState,
      zipCode: addZip,
      country: 'India',
      isDefault: addresses.length === 0
    };
    onAddAddress(newAddr);
    setAddressFormOpen(false);

    // Clear outputs
    setAddName('');
    setAddPhone('');
    setAddLine1('');
    setAddCity('');
    setAddState('');
    setAddZip('');
  };

  // If user is NOT logged in: Show dynamic forms
  if (!loggedInUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 font-sans text-xs text-left">
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          
          {/* LOGIN VIEW */}
          {authState === 'login' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-zinc-950 tracking-tight leading-none uppercase">Buyer Sign In</h3>
                <p className="text-zinc-500 text-xs">Access your personalized order history and address logs instantly.</p>
              </div>

              {actionError && (
                <div id="auth-error-login" className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl leading-relaxed text-[11px] font-semibold">
                  {actionError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-600">Email Address (use any email to test)</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200 outline-hidden"
                    />
                    <Mail className="absolute left-3 top-3 text-zinc-400" size={14} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="font-semibold text-zinc-600">Security Password</label>
                    <button
                      type="button"
                      onClick={() => setAuthState('forgot')}
                      className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200 outline-hidden"
                    />
                    <Lock className="absolute left-3 top-3 text-zinc-400" size={14} />
                  </div>
                </div>

                <button
                  id="account-login-submit"
                  type="submit"
                  disabled={actionLoading}
                  className={`w-full py-2.5 text-white font-bold rounded-lg cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5 ${colors.bg} ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : null}
                  <span>{actionLoading ? 'Connecting Shop...' : 'Confirm Sign In'}</span>
                </button>
              </form>

              <div className="text-center pt-2 text-zinc-500 text-[11px] font-medium border-t">
                New to Baby Van?{' '}
                <button
                  onClick={() => setAuthState('register')}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Create free Account
                </button>
              </div>
            </div>
          )}

          {/* REGISTER VIEW */}
          {authState === 'register' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-zinc-950 tracking-tight leading-none uppercase">Create Account</h3>
                <p className="text-zinc-500 text-xs">Unlock smart child milestone tracking and quick checkout features.</p>
              </div>

              {actionError && (
                <div id="auth-error-register" className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl leading-relaxed text-[11px] font-semibold">
                  {actionError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-600">Parent Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      placeholder="e.g. Sreya Patel"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200"
                    />
                    <UserCheck className="absolute left-3 top-3 text-zinc-400" size={14} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-600">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="care@parent.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200"
                    />
                    <Mail className="absolute left-3 top-3 text-zinc-400" size={14} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-600">Write Security Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="Choose strength code"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200"
                    />
                    <Lock className="absolute left-3 top-3 text-zinc-400" size={14} />
                  </div>
                </div>

                <button
                  id="account-register-submit"
                  type="submit"
                  disabled={actionLoading}
                  className={`w-full py-2.5 text-white font-bold rounded-lg cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5 ${colors.bg} ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : null}
                  <span>{actionLoading ? 'Creating Customer...' : 'Join Parenting Club'}</span>
                </button>
              </form>

              <div className="text-center pt-2 text-zinc-500 text-[11px] font-medium border-t">
                Have an account already?{' '}
                <button
                  onClick={() => setAuthState('login')}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {authState === 'forgot' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-zinc-950 tracking-tight leading-none uppercase">Reset Credentials</h3>
                <p className="text-zinc-500 text-xs">Enter your registered email below to receive credential code coordinates.</p>
              </div>

              {forgotSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-medium leading-relaxed">
                  {forgotSuccess}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-600">Your email coordinate</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="care@parent.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200"
                    />
                    <Key className="absolute left-3 top-3 text-zinc-400" size={14} />
                  </div>
                </div>

                <button
                  id="forgot-pass-submit"
                  type="submit"
                  className={`w-full py-2.5 text-white font-bold rounded-lg cursor-pointer transition ${colors.bg}`}
                >
                  Simulate Password Reset Link
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setAuthState('login')}
                  className="text-zinc-500 hover:text-zinc-900 font-bold underline cursor-pointer"
                >
                  ← Go back back
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // If user IS logged in: Show dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-xs text-left">
      
      {/* Top dashboard header info card */}
      <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-150 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 shadow-xs">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full ${colors.bg} text-white flex items-center justify-center font-black text-lg shadow-md`}>
            {loggedInUser.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-zinc-950 tracking-tight leading-none mb-1">
              Welcome, {loggedInUser.fullName}!
            </h2>
            <p className="text-zinc-500 font-medium">Logged email: <span className="font-bold">{loggedInUser.email}</span></p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-4 py-2 hover:bg-neutral-100 text-zinc-650 rounded-xl border border-zinc-300 font-bold cursor-pointer hover:text-zinc-950 shadow-xs transition"
        >
          <LogOut size={13} />
          Sign Out Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar Tabs */}
        <div className="space-y-1.5 font-bold uppercase tracking-wider text-neutral-400">
          <p className="text-[10px] font-black text-zinc-400 pb-2 pl-2">Dashboard controls</p>
          {[
            { id: 'orders', label: '📦 Orders History', count: orders.length },
            { id: 'addresses', label: '📍 Shipping Addresses', count: addresses.length },
            { id: 'profile', label: '👤 Parenting Profile' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setDashboardTab(tab.id as any)}
              className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer text-[10px] ${
                dashboardTab === tab.id
                  ? 'bg-zinc-950 border-zinc-950 text-white font-extrabold shadow-sm'
                  : 'bg-white border-neutral-100 text-zinc-700 hover:bg-neutral-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 text-[9px] rounded-full ${dashboardTab === tab.id ? 'bg-white text-zinc-900' : 'bg-neutral-100 text-neutral-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content panel */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: ORDER HISTORY */}
          {dashboardTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-zinc-950 tracking-wider">Simulated Past Orders ({orders.length})</h3>
              
              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-neutral-100 rounded-3xl p-6 shadow-xs max-w-sm mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                    <Package size={22} />
                  </div>
                  <h4 className="font-bold text-zinc-900">No active parenting orders yet</h4>
                  <p className="text-zinc-500">Go to Shop Collections to purchase clothes, diapers, gear or baby nursery accessories.</p>
                  <button onClick={() => setView('collection')} className={`py-2 px-6 text-white text-[10px] font-bold rounded-lg cursor-pointer ${colors.bg}`}>
                    Explore Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => {
                    return (
                      <div
                        key={o.id}
                        className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-xs hover:border-neutral-250 transition text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-zinc-900 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">{o.id}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              o.status === 'Processing' ? 'bg-blue-50 text-blue-700 border border-blue-250' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {o.status}
                            </span>
                          </div>
                          <p className="text-neutral-400 text-[10px]">Date Placed: <span className="font-bold text-zinc-900">{o.date}</span></p>
                          <p className="text-neutral-500 leading-normal truncate max-w-xs block">
                            Items: {o.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                          </p>
                        </div>

                        <div className="text-right flex items-baseline sm:flex-col justify-between w-full sm:w-auto gap-4">
                          <div className="leading-none text-left sm:text-right">
                            <p className="text-neutral-400 uppercase text-[9px] font-bold">Grand Total Paid:</p>
                            <p className="font-extrabold text-sm text-zinc-950 font-mono">₹{o.total}</p>
                          </div>
                          
                          <button
                            id={`view-order-details-${o.id}`}
                            onClick={() => setActiveOrderModal(o)}
                            className="bg-zinc-950 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer hover:bg-zinc-800 transition"
                          >
                            Track Package
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESS MANAGEMENT */}
          {dashboardTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-baseline border-b pb-2">
                <h3 className="text-sm font-black uppercase text-zinc-950 tracking-wider">Address Directory</h3>
                <button
                  onClick={() => setAddressFormOpen(!addressFormOpen)}
                  className="font-bold text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  {addressFormOpen ? 'Cancel Addition' : '+ Write New Address'}
                </button>
              </div>

              {/* Address insert option */}
              {addressFormOpen && (
                <form onSubmit={handleAddAddressSubmit} className="bg-neutral-50 rounded-2xl border border-neutral-250 p-5 space-y-4 text-xs">
                  <h4 className="font-bold text-zinc-900 pb-1 border-b">Add Shipping Coordinate</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">Full Name</label>
                      <input type="text" required value={addName} onChange={e => setAddName(e.target.value)} placeholder="e.g. Sreya Verma" className="w-full p-2 bg-white border rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">Mobile Phone</label>
                      <input type="tel" required value={addPhone} onChange={e => setAddPhone(e.target.value)} placeholder="9876543210" className="w-full p-2 bg-white border rounded" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600">Street / Block Area Line 1</label>
                    <input type="text" required value={addLine1} onChange={e => setAddLine1(e.target.value)} placeholder="House floor or apartment block" className="w-full p-2 bg-white border rounded" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">City / District</label>
                      <input type="text" required value={addCity} onChange={e => setAddCity(e.target.value)} placeholder="Mumbai" className="w-full p-2 bg-white border rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">State</label>
                      <input type="text" required value={addState} onChange={e => setAddState(e.target.value)} placeholder="Maharashtra" className="w-full p-2 bg-white border rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">PIN Postal Code</label>
                      <input type="text" required value={addZip} onChange={e => setAddZip(e.target.value)} placeholder="400001" className="w-full p-2 bg-white border rounded font-mono" />
                    </div>
                  </div>

                  <button
                    id="submit-address-btn"
                    type="submit"
                    className={`px-5 py-2 text-white font-bold rounded cursor-pointer ${colors.bg}`}
                  >
                    Add Address
                  </button>
                </form>
              )}

              {/* Directory table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-350 transition relative space-y-3 flex flex-col justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-rose-500 shrink-0" />
                        <h4 className="font-bold text-zinc-950 truncate">{addr.fullName}</h4>
                        {addr.isDefault && <span className="text-[8px] font-bold uppercase tracking-wider bg-zinc-900 text-white px-2 py-0.5 rounded-full">Default</span>}
                      </div>
                      <p className="text-zinc-600 leading-normal">{addr.addressLine1}, {addr.city}, {addr.state} - <span className="font-mono font-bold text-zinc-900">{addr.zipCode}</span></p>
                      <p className="text-[10px] text-zinc-400">Phone: {addr.phone}</p>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t text-[10px] font-bold uppercase tracking-wide">
                      {!addr.isDefault ? (
                        <button
                          onClick={() => onSetDefaultAddress(addr.id)}
                          className="text-indigo-600 hover:underline cursor-pointer"
                        >
                          Mark default
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5"><Check size={10} /> Active Default</span>
                      )}

                      <button
                        id={`delete-addr-${addr.id}`}
                        onClick={() => onRemoveAddress(addr.id)}
                        className="text-red-500 hover:text-red-600 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 size={11} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PARENTING PROFILE */}
          {dashboardTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-zinc-950 tracking-wider">Parent Profile Management</h3>
              
              {editSuccessMsg && (
                <p className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg font-medium leading-relaxed">
                  {editSuccessMsg}
                </p>
              )}

              <form onSubmit={handleUpdateProfileSubmit} className="bg-white border rounded-2xl p-5 md:p-6 shadow-xs max-w-lg space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-600">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 rounded border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-600">Helpline telephone number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="Mobile number"
                    className="w-full p-2.5 bg-neutral-50 rounded border font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600">Gender Identity</label>
                    <select
                      value={editGender}
                      onChange={e => setEditGender(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 rounded border bg-white"
                    >
                      <option value="not-specified">Decline to specify</option>
                      <option value="mother">🤰 Mother</option>
                      <option value="father">🧔 Father</option>
                      <option value="guardian">🤱 Guardian</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600">Child Expected / Birthdate</label>
                    <input
                      type="date"
                      value={editBirthdate}
                      onChange={e => setEditBirthdate(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 rounded border font-mono"
                    />
                  </div>
                </div>

                {actionError && (
                  <div className="p-3 bg-red-50 text-red-800 border border-red-100 rounded-lg font-medium leading-relaxed">
                    {actionError}
                  </div>
                )}

                <button
                  id="profile-update-btn"
                  type="submit"
                  disabled={actionLoading}
                  className={`py-2 px-6 text-white font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 ${colors.bg} ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : null}
                  <span>{actionLoading ? 'Saving...' : 'Save Parenting Profile'}</span>
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* MODAL: TRACK SHIPMENT OR ORDER ITEMIZATION DETAILS */}
      {activeOrderModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full text-xs text-left shadow-2xl border space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start border-b pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Shipment status details</span>
                <h4 className="font-black text-zinc-950 text-sm font-mono">{activeOrderModal.id}</h4>
              </div>
              <button
                onClick={() => setActiveOrderModal(null)}
                className="text-zinc-400 hover:text-zinc-650 font-bold text-sm cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 text-xs space-y-2">
              <p className="flex justify-between"><span>Active Status:</span> <strong className="font-bold text-blue-600 font-mono">{activeOrderModal.status}</strong></p>
              <p className="flex justify-between"><span>Tracking ID:</span> <span className="font-mono font-bold text-zinc-900 select-all">{activeOrderModal.trackingNumber || 'TRK-245906734'}</span></p>
              <p className="flex justify-between"><span>Estimated Courier Date:</span> <strong className="font-bold text-zinc-950 font-mono">{activeOrderModal.estimatedDelivery || '3 Days'}</strong></p>
              <p className="flex justify-between"><span>Payment method applied:</span> <span className="font-medium text-zinc-700">{activeOrderModal.paymentMethod}</span></p>
            </div>

            {/* Product items listed */}
            <div className="space-y-2">
              <p className="font-bold text-zinc-900 border-b pb-1">Items shipped ({activeOrderModal.items.length})</p>
              <div className="space-y-2 division-y division-light max-h-40 overflow-y-auto">
                {activeOrderModal.items.map((it, idx) => (
                  <div key={idx} className="flex gap-2 items-center justify-between pt-2 first:pt-0">
                    <div className="flex items-center gap-2">
                      <img src={it.productImage} className="w-8 h-8 object-cover rounded bg-neutral-100" />
                      <div>
                        <p className="font-bold text-zinc-900 leading-tight truncate max-w-[190px]">{it.productName}</p>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase font-sans">Qty: {it.quantity} · Size: {it.selectedSize || 'standard'}</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax summaries */}
            <div className="pt-2 border-t space-y-1 text-zinc-600 text-[11px]">
              <p className="flex justify-between"><span>Items Subtotal</span> <span className="font-bold">₹{activeOrderModal.subtotal}</span></p>
              {activeOrderModal.discount > 0 && <p className="flex justify-between text-emerald-700"><span>Promotional Discount</span> <span className="font-semibold">-₹{activeOrderModal.discount}</span></p>}
              <p className="flex justify-between"><span>Simulated 12% GST Tax</span> <span className="font-mono">₹{activeOrderModal.tax}</span></p>
              <p className="flex justify-between"><span>Carrier Delivery Shipping</span> <span>{activeOrderModal.shipping === 0 ? 'FREE' : `₹${activeOrderModal.shipping}`}</span></p>
              <div className="justify-between flex text-sm text-zinc-950 font-black border-t pt-2"><span>Total Paid</span> <span className="font-mono">₹{activeOrderModal.total}</span></div>
            </div>

            <p className="text-[10px] text-zinc-400 text-center leading-normal pt-2">Pack is dispatched under temperature-controlled safety criteria using sustainable bio-pouches.</p>
          </div>
        </div>
      )}

    </div>
  );
}
