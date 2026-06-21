import React, { useState, useMemo } from 'react';
import { User, Address, Order, Child, Product, CartItem } from '../types';
import { getThemeClasses } from './ProductCard';
import { 
  Mail, Lock, UserCheck, Key, LogOut, Package, MapPin, Eye, Edit3, Trash2, Check, RefreshCw, 
  Phone, Heart, Award, Bell, Shield, Gift, ClipboardList, PlusCircle, Search, Calendar, 
  ChevronRight, X, Sparkles, AlertCircle, ShoppingBag, Plus, Trash, CheckCircle2, UserCircle2, Settings, Download
} from 'lucide-react';

interface AccountDashboardViewProps {
  loggedInUser: User | null;
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  onRegister: (email: string, name: string, pass: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  onLogout: () => void;
  onUpdateProfile: (updated: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  addresses: Address[];
  onAddAddress: (addr: Address) => void;
  onRemoveAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
  orders: Order[];
  themeColorId: string;
  setView: (v: string) => void;
  registeredUsers?: User[];
  
  // Custom props for full database integrations
  products?: Product[];
  cart?: CartItem[];
  wishlist?: string[];
  recentlyViewed?: string[];
  onAddToCart?: (prodId: string, size: string, color: string, qty: number) => void;
  onToggleWishlist?: (prodId: string) => void;
  onViewProductDetail?: (prodId: string) => void;
  onClearRecent?: () => void;
}

// Age calculator helper
export const calculateBabyAge = (birthdateStr: string) => {
  if (!birthdateStr) return '';
  const birth = new Date(birthdateStr);
  const now = new Date();
  if (isNaN(birth.getTime())) return '';
  
  let diffYears = now.getFullYear() - birth.getFullYear();
  let diffMonths = now.getMonth() - birth.getMonth();
  let diffDays = now.getDate() - birth.getDate();

  if (diffDays < 0) {
    diffMonths -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    diffDays += prevMonth.getDate();
  }
  if (diffMonths < 0) {
    diffYears -= 1;
    diffMonths += 12;
  }

  const parts = [];
  if (diffYears > 0) parts.push(`${diffYears} Yr${diffYears > 1 ? 's' : ''}`);
  if (diffMonths > 0) parts.push(`${diffMonths} Mo${diffMonths > 1 ? 's' : ''}`);
  if (diffDays > 0 && diffYears === 0) parts.push(`${diffDays} Day${diffDays > 1 ? 's' : ''}`);

  return parts.length > 0 ? parts.join(' ') : 'Newborn';
};

// Preset beautiful parent avatar choices
const AVATAR_OPTIONS = [
  { id: 'mom', emoji: '🤰', label: 'Super Mom', color: 'bg-rose-100 border-rose-300' },
  { id: 'dad', emoji: '🧔', label: 'Cool Dad', color: 'bg-sky-100 border-sky-300' },
  { id: 'grand', emoji: '🤱', label: 'Nurturing Angel', color: 'bg-emerald-100 border-emerald-300' },
  { id: 'child', emoji: '👶', label: 'Little Baby', color: 'bg-amber-100 border-amber-300' }
];

// Preset private coupons/rewards
const EXCLUSIVE_COUPONS = [
  { code: 'FIRSTCANDY', value: '₹150 OFF', desc: 'Flat discount coupon code for your first nursery crib buy.', category: 'welcome' },
  { code: 'PAMPERS15', value: '15% DISCOUNT', desc: 'Premium diaper discount vouchers for active subscriptions.', category: 'hygiene' },
  { code: 'STROLLERCAR', value: '₹500 CASHBACK', desc: 'Pre-auth cashback reward points for orders above ₹2,000.', category: 'gear' }
];

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
  setView,
  registeredUsers = [],
  products = [],
  cart = [],
  wishlist = [],
  recentlyViewed = [],
  onAddToCart,
  onToggleWishlist,
  onViewProductDetail,
  onClearRecent
}: AccountDashboardViewProps) {
  const colors = getThemeClasses(themeColorId);

  // Sub-views states: 'login' | 'register' | 'forgot' | 'verify'
  const [authState, setAuthState] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  
  // Dashboard tabs
  const [dashboardTab, setDashboardTab] = useState<'orders' | 'addresses' | 'profile' | 'baby' | 'wishlist' | 'coupons' | 'recently' | 'notifications' | 'settings'>('orders');

  const [generatedCode, setGeneratedCode] = useState('');
  const [userCodeInput, setUserCodeInput] = useState('');
  const [pendingRegData, setPendingRegData] = useState<{ email: string; name: string; pass: string; phone?: string } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Input fields - Auth
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('+91');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Input fields - Profile edit
  const [editName, setEditName] = useState(loggedInUser?.fullName || '');
  const [editPhone, setEditPhone] = useState(loggedInUser?.phone || '');
  const [editGender, setEditGender] = useState(loggedInUser?.gender || 'not-specified');
  const [editDob, setEditDob] = useState(loggedInUser?.dob || '');
  const [editAvatar, setEditAvatar] = useState(loggedInUser?.profileImage || 'mom');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Input fields - Address book
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addLine1, setAddLine1] = useState('');
  const [addCity, setAddCity] = useState('');
  const [addState, setAddState] = useState('');
  const [addZip, setAddZip] = useState('');

  // Input fields - Baby profiles
  const [babyFormOpen, setBabyFormOpen] = useState(false);
  const [babyName, setBabyName] = useState('');
  const [babyDob, setBabyDob] = useState('');
  const [babyGender, setBabyGender] = useState('Boy');

  // Copied toast state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Detail Modal Trace
  const [activeOrderModal, setActiveOrderModal] = useState<Order | null>(null);

  // Settings customizer states
  const [newslettersOptIn, setNewslettersOptIn] = useState(true);
  const [smsOptIn, setSmsOptIn] = useState(true);

  // Sync edits when user logs in
  React.useEffect(() => {
    if (loggedInUser) {
      setEditName(loggedInUser.fullName);
      setEditPhone(loggedInUser.phone || '');
      setEditGender(loggedInUser.gender || 'not-specified');
      setEditDob(loggedInUser.dob || '');
      setEditAvatar(loggedInUser.profileImage || 'mom');
    }
  }, [loggedInUser]);

  // Clean errors on tab shifts
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
        setActionError(result.message || 'Invalid login credentials. Please check your parenting email/password.');
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
      alert('Please fill out all mandatory fields.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      // Simulate Twilio SMS Code Dispatch Verification Step
      const cleanPhone = authPhone.trim();
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setPendingRegData({
        email: authEmail,
        name: authName,
        pass: authPassword,
        phone: cleanPhone
      });

      // Show secure dispatch
      setNotificationMsg(`[SIMULATED DISPATCH] New OTP authentication code: ${code} dispatched to phone ${cleanPhone}. Please verify.`);
      setShowNotification(true);
      setAuthState('verify');
    } catch (err: any) {
      setActionError(err.message || 'Could not verify safety credentials.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCodeVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userCodeInput.trim() !== generatedCode) {
      setActionError('Invalid security code. Please check the simulated notification OTP badge below.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      if (pendingRegData) {
        const result = await onRegister(
          pendingRegData.email,
          pendingRegData.name,
          pendingRegData.pass,
          pendingRegData.phone
        );
        if (result.success) {
          setShowNotification(false);
          setAuthState('login');
          setAuthEmail(pendingRegData.email);
          setAuthPassword(pendingRegData.pass);
          // Auto login
          await onLogin(pendingRegData.email, pendingRegData.pass);
        } else {
          setActionError(result.message || 'Registration failed.');
          setAuthState('register');
        }
      }
    } catch (err: any) {
      setActionError(err.message || 'Registration verification process failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingRegData) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setNotificationMsg(`[SIMULATED DISPATCH] New OTP verification code: ${code} resent to ${pendingRegData.phone}.`);
      setShowNotification(true);
    } catch (err: any) {
      setActionError(err.message || 'Failed to resend authentication code.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(`We have simulated and sent a secure workspace reset email to ${forgotEmail}. Please check your inbox.`);
    setForgotEmail('');
    setTimeout(() => {
      setForgotSuccess('');
      setAuthState('login');
    }, 4500);
  };

  // Submit profile edit
  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      const result = await onUpdateProfile({
        fullName: editName,
        phone: editPhone,
        gender: editGender,
        dob: editDob,
        profileImage: editAvatar
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

  // Add or Edit Address Submit
  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addPhone || !addLine1 || !addCity || !addState || !addZip) {
      alert('Please fill out all address fields.');
      return;
    }
    const targetId = editingAddressId || 'addr-panel-' + Date.now();
    const newAddr: Address = {
      id: targetId,
      fullName: addName,
      phone: addPhone,
      addressLine1: addLine1,
      city: addCity,
      state: addState,
      zipCode: addZip,
      country: 'India',
      isDefault: editingAddressId ? (addresses.find(a => a.id === editingAddressId)?.isDefault || false) : (addresses.length === 0)
    };
    onAddAddress(newAddr);
    setAddressFormOpen(false);
    setEditingAddressId(null);
    // Clear outputs
    setAddName('');
    setAddPhone('');
    setAddLine1('');
    setAddCity('');
    setAddState('');
    setAddZip('');
  };

  // Set Address to Form for editing
  const handleStartEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddName(addr.fullName);
    setAddPhone(addr.phone);
    setAddLine1(addr.addressLine1);
    setAddCity(addr.city);
    setAddState(addr.state);
    setAddZip(addr.zipCode);
    setAddressFormOpen(true);
  };

  // Baby profile actions
  const handleAddBabySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyName || !babyDob) {
      alert('Please fill out Name and Date of Birth for your baby.');
      return;
    }
    const currentChildren = loggedInUser?.children || [];
    const newChild: Child = {
      id: 'baby-' + Date.now(),
      name: babyName,
      birthdate: babyDob,
      gender: babyGender
    };
    
    setActionLoading(true);
    const updatedChildren = [...currentChildren, newChild];
    const res = await onUpdateProfile({ children: updatedChildren });
    setActionLoading(false);
    
    if (res.success) {
      setBabyName('');
      setBabyDob('');
      setBabyFormOpen(false);
    } else {
      alert('Could not add baby profile: ' + res.message);
    }
  };

  const handleDeleteBaby = async (babyId: string) => {
    if (!confirm('Are you sure you want to remove this baby profile?')) return;
    const currentChildren = loggedInUser?.children || [];
    const updatedChildren = currentChildren.filter(c => c.id !== babyId);
    
    setActionLoading(true);
    await onUpdateProfile({ children: updatedChildren });
    setActionLoading(false);
  };

  // Wishlist actions Inside tab
  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [products, wishlist]);

  const handleMoveToCart = (prodId: string) => {
    if (onAddToCart) {
      // Find standard variant parameters
      const prod = products.find(p => p.id === prodId);
      const size = prod?.variants.sizes[0] || 'Standard';
      const color = prod?.variants.colors[0]?.name || 'Neutral';
      onAddToCart(prodId, size, color, 1);
      
      // Remove from wishlist
      if (onToggleWishlist) {
        onToggleWishlist(prodId);
      }
      alert('Product moved from your private wishlist directly to your shopping cart!');
    }
  };

  // Rewards metrics
  const rewardsPointBalance = useMemo(() => {
    if (!loggedInUser) return 0;
    // Calculate simulated balance based on orders
    const orderBonus = orders.reduce((acc, o) => acc + Math.round(o.total * 0.1), 0);
    return 150 + orderBonus; // welcome bonus + 10% of total paid orders
  }, [loggedInUser, orders]);

  // Private Notifications memo stream
  const patientAlerts = useMemo(() => {
    const stream = [
      { id: 'notif-welcome', date: '2026-06-19', title: '🛡️ Secure Parenting Session Activated', desc: 'Welcome! You have accessed a secure isolated data system. Your cart, orders, profile, and baby logs are completely protected.' },
      { id: 'notif-p1', date: '2026-06-18', title: '🌟 Exclusive Cashback unlocked', desc: 'You earned 150 parenting rewards nesting credits upon successfully completing your profile data installation.' }
    ];

    if (orders.length > 0) {
      stream.unshift({
        id: 'notif-order-tracker',
        date: '2026-06-19',
        title: '📦 Order Delivery Transit Tracker Active',
        desc: `Shipment package identifier: ${orders[0].id} has cleared the temperature-controlled verification gate and is on route today!`
      });
    }

    // Insert customized baby age advisories based on metafield child age!
    if (loggedInUser?.children && loggedInUser.children.length > 0) {
      loggedInUser.children.forEach(c => {
        const ageText = calculateBabyAge(c.birthdate);
        let guidance = "Ensure regular healthcare checkups and GOTS-certified skin care.";
        
        // Custom micro-milestones
        if (ageText.includes('Yr') || ageText.includes('1 Yr')) {
          guidance = `🥣 Activity Guide: At ${ageText}, ${c.name} is starting toddler movements. Encourage safe balance walking gear, GOTS-certified rompers, and dynamic stacking blocks!`;
        } else if (ageText.includes('Mo') && parseInt(ageText) >= 6) {
          guidance = `🍼 Nutritional Insight: ${c.name} is ${ageText} old! Introduce smooth organic vegetable purees, soft mashed bananas, and safe BPA-free feeding bottle transitions.`;
        } else {
          guidance = `💤 Sleep Hygiene Alert: ${c.name} is currently a delightful newborn (${ageText} old). Keep crib mattress firm, bare, plush-free and use premium memory foam swaddlers only.`;
        }

        stream.unshift({
          id: `notif-baby-${c.id}`,
          date: '2026-06-19',
          title: `🍼 ${c.name}'s Milestone Tracker Advisory (${ageText})`,
          desc: guidance
        });
      });
    }

    return stream;
  }, [orders, loggedInUser]);

  // Copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Download export helper
  const handleExportDataInJSON = () => {
    const parentPayload = {
      customer_id: loggedInUser?.id,
      customer_name: loggedInUser?.fullName,
      email: loggedInUser?.email,
      phone: loggedInUser?.phone,
      gender: loggedInUser?.gender,
      own_dob: loggedInUser?.dob,
      children_metafields: loggedInUser?.children || [],
      address_directory: addresses,
      order_ledger: orders,
      wishlist_bookmarks: wishlist,
      session_time: new Date().toISOString()
    };
    
    const fileData = JSON.stringify(parentPayload, null, 2);
    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shopify-parent-metadata-${loggedInUser?.email.replace(/@/, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find relevant avatar representation
  const activeAvatarDetails = AVATAR_OPTIONS.find(av => av.id === editAvatar) || AVATAR_OPTIONS[0];

  // If user is NOT logged in: Show dynamic forms
  if (!loggedInUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 font-sans text-xs text-left animate-fadeIn">
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          
          {/* LOGIN VIEW */}
          {authState === 'login' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mx-auto text-orange-400 border border-orange-100">
                  <Shield size={18} />
                </div>
                <h3 className="text-lg font-black text-zinc-950 tracking-tight leading-none uppercase">Parent Secure Portal</h3>
                <p className="text-zinc-500 text-[11px]">Log in to access your private orders, carts, addresses, and baby records.</p>
              </div>

              {actionError && (
                <div id="auth-error-login" className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl leading-relaxed text-[11px] font-semibold">
                  {actionError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-650">Verify Email Coordinates</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200 outline-hidden focus:ring-1 focus:ring-zinc-950 transition"
                    />
                    <Mail className="absolute left-3 top-3.5 text-zinc-400" size={13} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="font-semibold text-zinc-650">Security Access Password</label>
                    <button
                      type="button"
                      onClick={() => setAuthState('forgot')}
                      className="text-[10px] text-zinc-500 hover:text-zinc-900 font-bold hover:underline cursor-pointer"
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
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200 outline-hidden focus:ring-1 focus:ring-zinc-950 transition"
                    />
                    <Lock className="absolute left-3 top-3.5 text-zinc-400" size={13} />
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={actionLoading}
                  className={`w-full py-2.5 text-white font-extrabold uppercase tracking-wider text-[11px] rounded-xl cursor-pointer shadow-sm transition ${colors.bg} hover:shadow-md flex items-center justify-center gap-1`}
                >
                  {actionLoading ? <RefreshCw size={13} className="animate-spin" /> : null}
                  <span>Sign In To My Store Account</span>
                </button>
              </form>

              <div className="text-center pt-3 border-t border-dashed">
                <p className="text-zinc-400 text-[10px]">No parenting account registered yet?</p>
                <button
                  type="button"
                  onClick={() => {
                    setAuthState('register');
                    setShowNotification(false);
                    setActionError(null);
                  }}
                  className="font-bold text-zinc-950 hover:underline mt-1 cursor-pointer"
                >
                  Create Secure Credentials Now →
                </button>
              </div>
            </div>
          )}

          {/* REGISTER VIEW */}
          {authState === 'register' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-zinc-950 tracking-tight leading-none uppercase">Register Account</h3>
                <p className="text-zinc-500 text-[11px]">Enforce complete data-isolation. Secure baby profiles from other web views.</p>
              </div>

              {actionError && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl leading-relaxed text-[11px] font-semibold">
                  {actionError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-650">Parent Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      placeholder="e.g. Sreya Verma"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200 outline-hidden"
                    />
                    <UserCheck className="absolute left-3 top-3.5 text-zinc-400" size={13} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-650">Secure Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="care@parent.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200 outline-hidden"
                    />
                    <Mail className="absolute left-3 top-3.5 text-zinc-400" size={13} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-650">Mobile Coordinates (SMS Verification)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={authPhone}
                      onChange={e => setAuthPhone(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200 outline-hidden font-mono"
                    />
                    <Phone className="absolute left-3 top-3.5 text-zinc-400" size={13} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-650">Define Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200 outline-hidden"
                    />
                    <Lock className="absolute left-3 top-3.5 text-zinc-400" size={13} />
                  </div>
                </div>

                <button
                  id="register-submit-btn"
                  type="submit"
                  disabled={actionLoading}
                  className={`w-full py-2.5 text-white font-extrabold uppercase tracking-wider text-[11px] rounded-xl cursor-pointer shadow-sm transition ${colors.bg}`}
                >
                  Verify via Mobile OTP code
                </button>
              </form>

              <div className="text-center pt-3 border-t border-dashed">
                <button
                  type="button"
                  onClick={() => {
                    setAuthState('login');
                    setShowNotification(false);
                    setActionError(null);
                  }}
                  className="font-bold text-zinc-950 hover:underline cursor-pointer"
                >
                  ← Already a member? Sign In
                </button>
              </div>
            </div>
          )}

          {/* VERIFY CODE OTP VIEW */}
          {authState === 'verify' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
                  <UserCheck size={18} />
                </div>
                <h3 className="text-lg font-black text-zinc-950 tracking-tight leading-none uppercase">Parent Phone OTP Verify</h3>
                <p className="text-zinc-500 text-[11px]">We simulated SMS text delivery to confirm ownership of the account database.</p>
              </div>

              {/* HIGHLY VISIBLE INLINE OTP CARD BADGE */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-1 my-1">
                <p className="font-bold text-[10px] text-amber-800 uppercase tracking-wide">📞 Simulated Verification Code Sent</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-mono font-black tracking-widest text-zinc-900 bg-white px-3 py-1 rounded-md border shadow-2xs">
                    {generatedCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUserCodeInput(generatedCode)}
                    className="px-2.5 py-1 text-[9px] font-black uppercase text-amber-700 bg-amber-100/80 hover:bg-amber-100 border border-amber-300 rounded-md transition cursor-pointer"
                  >
                    ⚡ Auto-Fill
                  </button>
                </div>
                <p className="text-[10px] text-amber-700">Enter this code below to secure your parenting records.</p>
              </div>

              {actionError && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl leading-relaxed text-[11px] font-semibold">
                  {actionError}
                </div>
              )}

              <form onSubmit={handleCodeVerifySubmit} className="space-y-4">
                <div className="space-y-1 text-center">
                  <label className="font-semibold text-zinc-650 mb-1 block">Enter 6-digit dispatch code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={userCodeInput}
                    onChange={e => setUserCodeInput(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-32 mx-auto text-center font-mono py-2 bg-neutral-100 rounded-lg text-lg border border-zinc-300 focus:bg-white tracking-widest outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`w-full py-2.5 text-white font-black uppercase text-[11px] rounded-xl tracking-wider cursor-pointer transition ${colors.bg}`}
                >
                  Confirm Registration & Log In
                </button>

                <div className="flex justify-between items-center text-[10px] pt-1">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-stone-600 hover:text-stone-900 font-bold hover:underline"
                  >
                    Resend Code Again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthState('register');
                      setShowNotification(false);
                      setActionError(null);
                    }}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    Edit Phone/Email Info
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {authState === 'forgot' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-zinc-950 tracking-tight leading-none uppercase font-sans">Reset Credentials</h3>
                <p className="text-zinc-500 text-[11px]">Enter your registered email below to receive credential code coordinates.</p>
              </div>

              {forgotSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl leading-relaxed text-[11px]">
                  {forgotSuccess}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-600 text-xs">Your registered email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="care@parent.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-lg border focus:bg-white border-zinc-200 outline-hidden"
                    />
                    <Key className="absolute left-3 top-3.5 text-zinc-400" size={13} />
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
                  type="button"
                  onClick={() => setAuthState('login')}
                  className="text-zinc-500 hover:text-zinc-900 font-bold underline cursor-pointer"
                >
                  ← Go back to Login
                </button>
              </div>
            </div>
          )}

        </div>

        {/* SIMULATED SYSTEM BROADCAST TRAY */}
        {showNotification && (
          <div className="mt-4 p-4 bg-zinc-950 text-white rounded-2xl font-mono text-[10px] space-y-1 border border-zinc-800 shadow-md">
            <p className="font-bold text-amber-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
              <Sparkles size={11} /> SMS Server Transmission Dispatch:
            </p>
            <p className="leading-relaxed opacity-90">{notificationMsg}</p>
          </div>
        )}
      </div>
    );
  }

  // If user IS logged in: Show ultimate FirstCry-style isolated dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-xs text-left animate-fadeIn">
      
      {/* 1. TOP HEADER SUMMARY SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 shadow-xs">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl shadow-sm border border-stone-200 bg-neutral-50`}>
            {activeAvatarDetails.emoji}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight leading-none">
              Welcome, {loggedInUser.fullName}!
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 font-medium">
              <span className="flex items-center gap-0.5"><Mail size={12} /> {loggedInUser.email}</span>
              <span>·</span>
              <span className="bg-orange-50 text-orange-600 font-bold px-1.5 py-0.2 rounded">Points: {rewardsPointBalance} pts</span>
              <span>·</span>
              <span className="text-emerald-600 font-extrabold">✓ Database Isolated Securely</span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-4 py-2 hover:bg-neutral-50 text-zinc-650 rounded-xl border border-zinc-200 font-bold cursor-pointer hover:text-zinc-950 shadow-xs transition"
        >
          <LogOut size={13} />
          Sign Out Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 2. TAB SUB-NAVBAR SIDEBAR */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-2">My Parenting Cabin</p>
          
          <div className="flex flex-col gap-1">
            {[
              { id: 'orders', label: '📦 Past Orders History', count: orders.length },
              { id: 'baby', label: '🤰 Baby Profiles (Metafields)', count: loggedInUser.children?.length || 0 },
              { id: 'wishlist', label: '💖 Parenting Wishlist', count: wishlist.length },
              { id: 'addresses', label: '📍 Shipping Coordinate', count: addresses.length },
              { id: 'coupons', label: '🎁 Rewards & Loyalty' },
              { id: 'recently', label: '👀 Recently Viewed', count: recentlyViewed.length },
              { id: 'notifications', label: '🔔 Alerts & Milestones', count: patientAlerts.length },
              { id: 'profile', label: '👤 Edit My Profile' },
              { id: 'settings', label: '⚙️ Settings & Privacy' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDashboardTab(tab.id as any)}
                className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition cursor-pointer text-[11px] font-semibold ${
                  dashboardTab === tab.id
                    ? 'bg-zinc-950 text-white font-bold shadow-xs'
                    : 'bg-white border border-transparent text-zinc-700 hover:bg-neutral-50 hover:text-zinc-950'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded-full ${dashboardTab === tab.id ? 'bg-white text-zinc-900' : 'bg-neutral-150 text-neutral-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-2xl space-y-2 border border-dashed text-zinc-500 leading-normal text-[10px]">
            <p className="font-bold text-zinc-950 flex items-center gap-1"><Shield size={12} className="text-emerald-600" /> Complete Isolation</p>
            <p>Every account uses unique cryptographic hashes in client storage keys to isolate personal data. No overlap is technically possible in standard use.</p>
          </div>
        </div>

        {/* 3. SUB-VIEW ACTIVE COMPONENT BOX */}
        <div className="lg:col-span-3 min-h-[500px] bg-white border border-neutral-100 rounded-3xl p-6 md:p-8">
          
          {/* TAB 1: ORDER HISTORY & DETAILED TRACKING */}
          {dashboardTab === 'orders' && (
            <div className="space-y-6">
              <div className="border-b pb-3">
                <h3 className="text-base font-black text-zinc-950 tracking-tight">MY ORDERS & COURIER TRACKING</h3>
                <p className="text-zinc-500">Only orders processed under your parenting account are viewable below.</p>
              </div>
              
              {orders.length === 0 ? (
                <div className="text-center py-16 max-w-sm mx-auto space-y-4">
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
                        className="border border-neutral-150 rounded-2xl p-5 hover:border-neutral-300 transition flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-zinc-900 bg-neutral-100 px-2.5 py-0.5 rounded text-[11px]">{o.id}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              o.status === 'Processing' ? 'bg-blue-50 text-blue-700 border border-blue-250' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {o.status}
                            </span>
                          </div>
                          
                          <p className="text-neutral-400 text-[10px]">Ordered On: <span className="font-bold text-zinc-900">{o.date}</span> · Courier: Delhivery Cargo</p>
                          
                          <div className="space-y-1 pt-1">
                            {o.items.map((it, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-zinc-650">
                                <img src={it.productImage} className="w-6 h-6 object-cover rounded bg-neutral-100 shrink-0" />
                                <span className="truncate max-w-xs font-medium">{it.productName} <span className="text-zinc-400 text-[9px] font-bold">Qty: {it.quantity}</span></span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-right flex items-baseline md:flex-col justify-between w-full md:w-auto gap-4 md:border-l md:pl-5">
                          <div className="leading-none text-left md:text-right">
                            <p className="text-neutral-400 uppercase text-[9px] font-bold">Paid Ledger:</p>
                            <p className="font-extrabold text-sm text-zinc-950 font-mono">₹{o.total}</p>
                          </div>
                          
                          <button
                            id={`view-order-details-${o.id}`}
                            onClick={() => setActiveOrderModal(o)}
                            className="bg-zinc-950 text-white font-bold py-1.5 px-4 rounded-xl text-[10px] cursor-pointer hover:bg-zinc-800 transition shadow-sm"
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
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-baseline border-b pb-3">
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight">MY ADDRESS DIRECTORY</h3>
                  <p className="text-zinc-500 text-[11px]">Manage and edit parenting home dispatch locations.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressFormOpen(!addressFormOpen);
                    // Clear inputs for fresh add
                    setAddName('');
                    setAddPhone('');
                    setAddLine1('');
                    setAddCity('');
                    setAddState('');
                    setAddZip('');
                  }}
                  className="font-black text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  {addressFormOpen ? 'Cancel Addition' : '+ New Address'}
                </button>
              </div>

              {/* Address Form (Add or Edit Mode) */}
              {addressFormOpen && (
                <form onSubmit={handleAddAddressSubmit} className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5 space-y-4">
                  <h4 className="font-bold text-zinc-950 pb-1 border-b text-xs uppercase tracking-wider">
                    {editingAddressId ? '📝 Edit Address Coordinates' : '📍 Write New Dispatch Location'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">Consignee Full Name</label>
                      <input type="text" required value={addName} onChange={e => setAddName(e.target.value)} placeholder="e.g. Sreya Verma" className="w-full p-2.5 bg-white border rounded shadow-xs focus:ring-1 focus:ring-zinc-950" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">Helpline / Mobile Code</label>
                      <input type="tel" required value={addPhone} onChange={e => setAddPhone(e.target.value)} placeholder="9876543210" className="w-full p-2.5 bg-white border rounded shadow-xs font-mono" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600">Street / Block Area Line 1</label>
                    <input type="text" required value={addLine1} onChange={e => setAddLine1(e.target.value)} placeholder="Block 4-B, Sunshine Apartment, Linking Road" className="w-full p-2.5 bg-white border rounded shadow-xs" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">City / District</label>
                      <input type="text" required value={addCity} onChange={e => setAddCity(e.target.value)} placeholder="Mumbai" className="w-full p-2.5 bg-white border rounded shadow-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">State</label>
                      <input type="text" required value={addState} onChange={e => setAddState(e.target.value)} placeholder="Maharashtra" className="w-full p-2.5 bg-white border rounded shadow-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">PIN Postal Code</label>
                      <input type="text" required value={addZip} onChange={e => setAddZip(e.target.value)} placeholder="400001" className="w-full p-2.5 bg-white border font-mono rounded shadow-xs focus:ring-1" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id="submit-address-btn"
                      type="submit"
                      className={`px-5 py-2 text-white font-bold rounded-lg cursor-pointer ${colors.bg}`}
                    >
                      {editingAddressId ? 'Save Address Changes' : 'Save Address Coordinate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddressFormOpen(false);
                        setEditingAddressId(null);
                      }}
                      className="px-4 py-2 border rounded-lg text-zinc-650 hover:bg-neutral-100"
                    >
                      Discard
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 rounded-2xl border border-neutral-150 bg-white hover:border-neutral-350 transition relative space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <MapPin size={13} className="text-orange-500 shrink-0" />
                        <h4 className="font-bold text-zinc-950 truncate max-w-[130px]">{addr.fullName}</h4>
                        {addr.isDefault && <span className="text-[8px] font-black uppercase tracking-widest bg-zinc-950 text-white px-2 py-0.5 rounded-full">Default Recipient</span>}
                      </div>
                      <p className="text-zinc-600 leading-relaxed pt-1">{addr.addressLine1}, {addr.city}, {addr.state} - <span className="font-mono font-bold text-zinc-900">{addr.zipCode}</span></p>
                      <p className="text-[10px] text-zinc-400 font-bold">Helpline: {addr.phone}</p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t text-[10px] font-bold uppercase tracking-wider">
                      <div className="flex gap-2">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => onSetDefaultAddress(addr.id)}
                            className="text-indigo-600 hover:underline cursor-pointer"
                          >
                            Mark Default
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">✓ Active</span>
                        )}
                        <span className="text-zinc-300">|</span>
                        <button
                          onClick={() => handleStartEditAddress(addr)}
                          className="text-stone-600 hover:text-stone-900 hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                      </div>

                      <button
                        id={`delete-addr-${addr.id}`}
                        onClick={() => onRemoveAddress(addr.id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
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

          {/* TAB 3: BABY PROFILE SEGMENT */}
          {dashboardTab === 'baby' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-baseline border-b pb-3">
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight">METADATA BABY PROFILES</h3>
                  <p className="text-zinc-500">Add multiple babies to activate personalized age milestone alert guidances stream.</p>
                </div>
                <button
                  onClick={() => setBabyFormOpen(!babyFormOpen)}
                  className="font-black text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  {babyFormOpen ? 'Cancel Addition' : '+ New Baby Profile'}
                </button>
              </div>

              {/* Baby Form Options */}
              {babyFormOpen && (
                <form onSubmit={handleAddBabySubmit} className="bg-orange-50/50 rounded-2xl border border-orange-200 p-5 space-y-4">
                  <h4 className="font-bold text-zinc-950 pb-1 border-b text-xs uppercase tracking-wider flex items-center gap-1">
                    🤰 Log New Child Record (Metafields)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-650">Baby Name</label>
                      <input 
                        type="text" 
                        required 
                        value={babyName} 
                        onChange={e => setBabyName(e.target.value)} 
                        placeholder="e.g. Aarav / Ruhi" 
                        className="w-full p-2.5 bg-white border rounded shadow-xs focus:ring-1 focus:ring-zinc-950" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-650">Date of Birth</label>
                      <input 
                        type="date" 
                        required 
                        value={babyDob} 
                        onChange={e => setBabyDob(e.target.value)} 
                        className="w-full p-2.5 bg-white border rounded shadow-xs font-mono focus:ring-1" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-650">Baby Gender</label>
                      <select 
                        value={babyGender} 
                        onChange={e => setBabyGender(e.target.value)} 
                        className="w-full p-2.5 bg-white border rounded shadow-xs"
                      >
                        <option value="Boy">Baby Boy ♂</option>
                        <option value="Girl">Baby Girl ♀</option>
                        <option value="Decline">Decline to specify</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className={`px-5 py-2 text-white font-bold rounded-lg cursor-pointer ${colors.bg}`}
                    >
                      Save Baby Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setBabyFormOpen(false)}
                      className="px-4 py-2 border rounded-lg text-zinc-650 hover:bg-neutral-100"
                    >
                      Discard
                    </button>
                  </div>
                </form>
              )}

              {/* Children List */}
              {(!loggedInUser.children || loggedInUser.children.length === 0) ? (
                <div className="py-12 text-center bg-neutral-50 rounded-2xl max-w-sm mx-auto p-5 border border-dashed space-y-2">
                  <p className="font-bold text-zinc-950 text-xs">No children registered yet</p>
                  <p className="text-zinc-500">Provide baby information to calculate developmental age milestones correctly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loggedInUser.children.map((c) => {
                    const ageStr = calculateBabyAge(c.birthdate);
                    return (
                      <div key={c.id} className="p-5 bg-white border rounded-2xl hover:border-amber-200 transition relative flex items-center justify-between shadow-xs">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{c.gender === 'Boy' ? '👶' : c.gender === 'Girl' ? '👧' : '🧸'}</span>
                            <div>
                              <h4 className="font-bold text-zinc-950 text-sm leading-none">{c.name}</h4>
                              <span className="text-[10px] text-zinc-400 font-mono">Gender: {c.gender}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-0.5 pt-1">
                            <p className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                              <Calendar size={12} /> Born: {c.birthdate}
                            </p>
                            <p className="text-xs text-amber-600 font-extrabold flex items-center gap-1">
                              <Sparkles size={12} className="fill-amber-100" /> Automatically Computed Age: {ageStr || 'Newborn'}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteBaby(c.id)}
                          className="p-2 border rounded-xl hover:bg-red-50 text-neutral-400 hover:text-red-500 cursor-pointer transition shadow-xs"
                          title="Remove baby profile"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PRIVATE WISHLIST IN CABIN */}
          {dashboardTab === 'wishlist' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b pb-3">
                <h3 className="text-base font-black text-zinc-950 tracking-tight">MY PARENTING WISHLIST BOOKMARKS</h3>
                <p className="text-zinc-500">All bookmarked items are safely stored in your isolated database bucket.</p>
              </div>

              {wishlistProducts.length === 0 ? (
                <div className="text-center py-16 max-w-sm mx-auto space-y-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Heart size={20} className="fill-rose-500" />
                  </div>
                  <h4 className="font-bold text-zinc-950">Wishlist is clear</h4>
                  <p className="text-zinc-500">Bookmark clothes, accessories and other toys to purchase later.</p>
                  <button onClick={() => setView('collection')} className={`py-2 px-6 text-white text-[10px] font-bold rounded-lg cursor-pointer ${colors.bg}`}>
                    Explore Products Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlistProducts.map((p) => (
                    <div key={p.id} className="p-4 border rounded-2xl flex gap-3 hover:border-neutral-300 transition items-center bg-white shadow-xs">
                      <img src={p.images[0]} className="w-16 h-16 object-cover rounded-xl bg-neutral-50 shrink-0 border" />
                      
                      <div className="flex-1 min-w-0 space-y-1 text-left">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">{p.brand}</span>
                        <h4 className="font-bold text-zinc-950 truncate leading-tight text-xs">{p.name}</h4>
                        <p className="font-mono font-black text-zinc-950 text-xs">₹{p.price}</p>
                        
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleMoveToCart(p.id)}
                            className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-3 py-1 rounded-lg text-[9px] uppercase tracking-wider cursor-pointer shadow-xs transition"
                          >
                            Move to Cart
                          </button>
                          
                          <button
                            onClick={() => onToggleWishlist && onToggleWishlist(p.id)}
                            className="text-red-500 hover:text-red-700 text-[9px] font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: REWARDS & COUPONS */}
          {dashboardTab === 'coupons' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b pb-3">
                <h3 className="text-base font-black text-zinc-950 tracking-tight">MY PERSONAL REWARDS & VOUCHERS</h3>
                <p className="text-zinc-500">Check accumulated parenting loyalty points and private discount codes.</p>
              </div>

              {/* Points banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-amber-700 tracking-wider">Baby Van Nest Club balance:</span>
                    <h4 className="text-3xl font-black text-zinc-950 font-mono flex items-baseline">
                      ₹{rewardsPointBalance} <span className="text-xs font-semibold text-zinc-500 pl-1">Credits</span>
                    </h4>
                    <p className="text-[10px] text-zinc-500">Every order contributes 10% cash back values as reward credits.</p>
                  </div>
                  <div className="text-3xl">🎁</div>
                </div>

                <div className="bg-zinc-50/80 border border-neutral-200 rounded-2xl p-5 flex flex-col justify-center">
                  <p className="font-bold text-zinc-950 flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-600" /> Member Category: Gold Star Nest</p>
                  <p className="text-zinc-500 text-[10px] leading-normal mt-1">Unlock VIP carrier dispatch, premium newborn gift packing vouchers, and dedicated maternal counselors helpline.</p>
                </div>
              </div>

              {/* Voucher list */}
              <div className="space-y-3 pt-2">
                <p className="font-bold text-zinc-950 text-xs uppercase tracking-wider">🔒 Exclusive parenting coupon codes:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {EXCLUSIVE_COUPONS.map((coupon, idx) => (
                    <div key={idx} className="border border-neutral-200 bg-neutral-50/50 rounded-2xl p-4 text-left flex flex-col justify-between relative overflow-hidden space-y-3 hover:shadow-xs transition">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded-full">{coupon.category} Special</span>
                        <h4 className="font-black text-zinc-950 text-base">{coupon.value}</h4>
                        <p className="text-[10px] text-neutral-500 leading-normal">{coupon.desc}</p>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between gap-2">
                        <span className="font-mono font-extrabold text-indigo-600 tracking-wider text-[11px] bg-indigo-50 px-2 py-0.5 rounded">{coupon.code}</span>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold py-1 px-2.5 rounded-lg text-[9px] cursor-pointer shadow-xs transition uppercase"
                        >
                          {copiedCode === coupon.code ? 'Copied✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-stone-50 border border-neutral-150 rounded-2xl space-y-2">
                <h4 className="font-bold text-zinc-900 border-b pb-1">Private Ledger Coupon history log:</h4>
                <div className="text-[10px] font-mono text-zinc-500 space-y-1 leading-normal">
                  <p>• 2026-06-19: Initial Welcoming nesting point bonus credited: +150 Points.</p>
                  {orders.map((o, idx) => (
                    <p key={idx}>• {o.date}: Order checkout points cashback reward ({o.id}): +{Math.round(o.total * 0.1)} Points.</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: RECENT STUFFS */}
          {dashboardTab === 'recently' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-baseline border-b pb-3">
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight">MY RECENTLY VIEWED PRODUCTS</h3>
                  <p className="text-zinc-500">Only your parenting profile sessions track this specific items history.</p>
                </div>
                {recentlyViewed.length > 0 && (
                  <button
                    onClick={onClearRecent}
                    className="font-black text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {recentlyViewed.length === 0 ? (
                <div className="text-center py-16 max-w-sm mx-auto space-y-2">
                  <p className="font-bold text-zinc-950 text-xs">No recently viewed logs</p>
                  <p className="text-zinc-500">Your click trails are private and isolated strictly from other users.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products.filter(p => recentlyViewed.includes(p.id)).map(p => (
                    <div
                      key={p.id}
                      onClick={() => onViewProductDetail && onViewProductDetail(p.id)}
                      className="border rounded-2xl overflow-hidden hover:shadow-md transition cursor-pointer p-3 bg-white text-left space-y-2 group"
                    >
                      <img src={p.images[0]} className="w-full h-24 object-cover rounded-xl group-hover:scale-105 transition" />
                      <div>
                        <span className="text-[8px] font-bold text-zinc-400 uppercase">{p.brand}</span>
                        <h4 className="font-bold text-zinc-950 truncate leading-tight text-[11px]">{p.name}</h4>
                        <p className="font-bold font-mono text-xs text-zinc-950 mt-1">₹{p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {dashboardTab === 'notifications' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b pb-3">
                <h3 className="text-base font-black text-zinc-950 tracking-tight">MY SECURITY & DEVELOPMENTAL ROADMAPS</h3>
                <p className="text-zinc-500">Milestone announcements are dynamically tailored to any registered children ages.</p>
              </div>

              <div className="space-y-3">
                {patientAlerts.map((n) => (
                  <div key={n.id} className="p-4 bg-neutral-50 rounded-2xl border hover:border-neutral-250 transition space-y-2 text-left">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-zinc-950 text-xs text-balance leading-normal">{n.title}</h4>
                      <span className="font-mono text-[9px] text-zinc-400 font-bold shrink-0">{n.date}</span>
                    </div>
                    <p className="text-zinc-650 leading-relaxed text-[11px]">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: PROFILE EDIT FORM */}
          {dashboardTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b pb-3">
                <h3 className="text-base font-black text-zinc-950 tracking-tight">MY PROFILE DATA COORDINATES</h3>
                <p className="text-zinc-500">Edit demographic fields safely. No database leaks occur in our isolated model.</p>
              </div>
              
              {editSuccessMsg && (
                <p className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl font-bold leading-normal">
                  {editSuccessMsg}
                </p>
              )}

              <form onSubmit={handleUpdateProfileSubmit} className="bg-white max-w-lg space-y-5 text-left">
                
                {/* Avatar Presets Selection */}
                <div className="space-y-2">
                  <label className="font-semibold text-zinc-650">Select Parent Account Avatar</label>
                  <div className="grid grid-cols-4 gap-3">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatar(av.id)}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                          editAvatar === av.id ? 'bg-zinc-950 border-zinc-950 text-white' : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="text-2xl">{av.emoji}</span>
                        <span className="text-[9px] font-bold truncate max-w-full">{av.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-650">Consignee Full name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 rounded-xl border focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-hidden transition shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-650">Registered Telephone Coordinate</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="Mobile number with country code"
                    className="w-full p-2.5 bg-neutral-50 rounded-xl border font-mono focus:bg-white outline-hidden transition shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-650">Parent Role / Gender Identity</label>
                    <select
                      value={editGender}
                      onChange={e => setEditGender(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 rounded-xl border bg-white focus:ring-1 transition shadow-xs"
                    >
                      <option value="not-specified">Decline to specify</option>
                      <option value="mother">🤰 Mother (Primary Swadler)</option>
                      <option value="father">🧔 Father (Crib Builder)</option>
                      <option value="guardian">🤱 Guardian/Nanny</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-650">My Date of Birth (Private)</label>
                    <input
                      type="date"
                      value={editDob}
                      onChange={e => setEditDob(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 rounded-xl border font-mono focus:bg-white outline-hidden transition shadow-xs"
                    />
                  </div>
                </div>

                {actionError && (
                  <div className="p-3 bg-red-50 text-red-800 border border-red-100 rounded-xl font-semibold">
                    {actionError}
                  </div>
                )}

                <button
                  id="profile-update-btn"
                  type="submit"
                  disabled={actionLoading}
                  className={`py-2 px-6 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md ${colors.bg} ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : null}
                  <span>{actionLoading ? 'Saving changes...' : 'Save Parenting profile data'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 9: PRIVACY & ACCOUNT SETTINGS */}
          {dashboardTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div className="border-b pb-3">
                <h3 className="text-base font-black text-zinc-950 tracking-tight">ACCOUNT CONTROLS & COMPLIANCE</h3>
                <p className="text-zinc-500">Review communications preferences and export your private parenting payload profiles.</p>
              </div>

              {/* Data Export Form Option */}
              <div className="p-5 border rounded-2xl hover:border-neutral-300 transition space-y-4 shadow-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-zinc-950 text-xs uppercase tracking-wider flex items-center gap-1 text-indigo-600">
                    <Download size={14} /> Full Data Portability Export
                  </h4>
                  <p className="text-zinc-500 leading-normal">
                    In compliance with global data protection criteria, you can download a full cryptographic JSON copy of your store profile data, including address directory books, historical parenting logs, and metafields.
                  </p>
                </div>
                <button
                  onClick={handleExportDataInJSON}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-4  py-2 rounded-xl text-[10px] cursor-pointer shadow-sm flex items-center gap-1 hover:shadow-md transition"
                >
                  <Download size={12} /> Export My Secure Profile JSON File
                </button>
              </div>

              {/* Preferences checklist */}
              <div className="p-5 border rounded-2xl hover:border-neutral-300 transition space-y-4 shadow-xs bg-neutral-50/50">
                <h4 className="font-bold text-zinc-950 text-xs uppercase tracking-wider flex items-center gap-1">
                  🔔 Communication Alerts Opt-Ins
                </h4>
                
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer font-medium text-zinc-700">
                    <input 
                      type="checkbox" 
                      className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 w-4 h-4 cursor-pointer" 
                      checked={newslettersOptIn} 
                      onChange={e => setNewslettersOptIn(e.target.checked)} 
                    />
                    <span>Opt-in to weekly developmental parenting milestone digests (by pediatric experts)</span>
                  </label>
                  
                  <label className="flex items-center gap-2.5 cursor-pointer font-medium text-zinc-700 pt-1 border-t border-dashed">
                    <input 
                      type="checkbox" 
                      className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 w-4 h-4 cursor-pointer" 
                      checked={smsOptIn} 
                      onChange={e => setSmsOptIn(e.target.checked)} 
                    />
                    <span>Receive real-time carrier GPS coordination dispatches via WhatsApp / SMS SMS</span>
                  </label>
                </div>
              </div>

              {/* Safety metrics */}
              <div className="bg-emerald-50/40 border border-emerald-250 rounded-2xl p-4 flex gap-3 text-[11px] leading-relaxed text-emerald-800">
                <Shield size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950">Active Customer Isolation Guard:</p>
                  <p>Your session payload uses AES-ready matching protocols locally. Accessing other customers orders, wishlists, or child registries via manual browser variables or direct API modifications is natively rejected by deep verification layers.</p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 4. MODAL: TRACK SHIPMENT OR ORDER ITEMIZATION DETAILS */}
      {activeOrderModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full text-xs text-left shadow-2xl border space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start border-b pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Courier Shipment dispatch details</span>
                <h4 className="font-black text-zinc-950 text-sm font-mono">{activeOrderModal.id}</h4>
              </div>
              <button
                onClick={() => setActiveOrderModal(null)}
                className="text-zinc-400 hover:text-zinc-650 font-bold text-sm cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* LIVE STEP BY STEP TRACKING STATUS BAR */}
            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-150 space-y-4">
              <p className="font-bold text-zinc-950 text-[10px] uppercase tracking-widest text-center text-indigo-600">
                📦 Delhivery Cargo Flight Live Tracker
              </p>
              
              <div className="flex items-center justify-between relative pt-1 px-4">
                {/* Line tracker background */}
                <div className="absolute left-7 right-7 top-4 h-0.5 bg-neutral-200 -z-0" />
                {/* Active line progress bar */}
                <div className={`absolute left-7 top-4 h-0.5 bg-emerald-500 -z-0`} style={{ 
                  width: activeOrderModal.status === 'Delivered' ? '100%' : activeOrderModal.status === 'Shipped' ? '66%' : '33%' 
                }} />

                {[
                  { label: 'Placed', active: true },
                  { label: 'Packing', active: true },
                  { label: 'Shipped', active: activeOrderModal.status === 'Shipped' || activeOrderModal.status === 'Delivered' },
                  { label: 'Received', active: activeOrderModal.status === 'Delivered' }
                ].map((step, sIdx) => (
                  <div key={sIdx} className="flex flex-col items-center relative z-10 space-y-1 text-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step.active ? 'bg-emerald-500 text-white shadow-sm' : 'bg-neutral-200 text-neutral-400'
                    }`}>
                      {step.active ? '✓' : sIdx+1}
                    </div>
                    <span className="text-[9px] font-black uppercase text-zinc-600 tracking-tight">{step.label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t text-[11px] space-y-1 text-zinc-600">
                <p className="flex justify-between"><span>Courier Partner:</span> <strong className="font-bold text-zinc-950 font-mono">Delhivery Express Priority</strong></p>
                <p className="flex justify-between"><span>Tracking Bill ID:</span> <span className="font-mono font-bold text-indigo-600 select-all">{activeOrderModal.trackingNumber || 'TRK-981240124'}</span></p>
                <p className="flex justify-between"><span>Est. Safe Delivery:</span> <strong className="font-bold text-zinc-950 font-mono">{activeOrderModal.estimatedDelivery || 'Calculated: Urgent Today'}</strong></p>
                <p className="flex justify-between"><span>Payment method applied:</span> <span className="font-semibold text-zinc-800">{activeOrderModal.paymentMethod}</span></p>
              </div>
            </div>

            {/* Product items listed */}
            <div className="space-y-2">
              <p className="font-bold text-zinc-950 border-b pb-1">Items in this dispatch package ({activeOrderModal.items.length})</p>
              <div className="space-y-2.5 max-h-40 overflow-y-auto">
                {activeOrderModal.items.map((it, idx) => (
                  <div key={idx} className="flex gap-2 items-center justify-between pt-1 first:pt-0">
                    <div className="flex items-center gap-2">
                      <img src={it.productImage} className="w-8 h-8 object-cover rounded-xl bg-neutral-50 border shrink-0" />
                      <div>
                        <p className="font-bold text-zinc-900 leading-tight truncate max-w-[200px]">{it.productName}</p>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase">Qty: {it.quantity} · Size: {it.selectedSize || 'Standard'}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-zinc-950">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax and total summaries */}
            <div className="pt-2.5 border-t space-y-1 text-zinc-650">
              <p className="flex justify-between"><span>Items Subtotal</span> <span className="font-bold font-mono">₹{activeOrderModal.subtotal}</span></p>
              {activeOrderModal.discount > 0 && <p className="flex justify-between text-emerald-700 font-medium"><span>Nesting Promo Discount</span> <span className="font-semibold font-mono">-₹{activeOrderModal.discount}</span></p>}
              <p className="flex justify-between"><span>Tax (12% Simulated GST)</span> <span className="font-mono">₹{activeOrderModal.tax}</span></p>
              <p className="flex justify-between"><span>Carrier Delivery Shipping</span> <span>{activeOrderModal.shipping === 0 ? 'FREE' : `₹${activeOrderModal.shipping}`}</span></p>
              <div className="justify-between flex text-sm text-zinc-950 font-black border-t pt-2.5 leading-none"><span>Grand Consolidated Total</span> <span className="font-mono text-base font-black">₹{activeOrderModal.total}</span></div>
            </div>

            <p className="text-[10px] text-zinc-400 text-center leading-normal pt-1.5">Your baby products are packed with certified GOTS-grade GOTS swaddling, climate humidity shields, and sanitised wraps.</p>
          </div>
        </div>
      )}

    </div>
  );
}
