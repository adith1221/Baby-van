import React, { useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { Search, ShoppingBag, Heart, User, Menu, X, Tag, BookOpen, Compass, ChevronRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getThemeClasses } from './ProductCard';

interface NavbarProps {
  currentView: string;
  setView: (v: string) => void;
  cart: CartItem[];
  wishlist: string[];
  products: Product[];
  setActiveProductId: (id: string | null) => void;
  setActiveCategory: (cat: string | null) => void;
  setSearchQueryState: (q: string) => void;
  loggedInUser: any;
  setLoggedInUser: (u: any) => void;
  themeConfig: any;
  setCartOpen: (open: boolean) => void;
  setActiveBrandId: (id: string | null) => void;
}

export default function Navbar({
  currentView,
  setView,
  cart,
  wishlist,
  products,
  setActiveProductId,
  setActiveCategory,
  setSearchQueryState,
  loggedInUser,
  setLoggedInUser,
  themeConfig,
  setCartOpen,
  setActiveBrandId
}: NavbarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [predictiveOpen, setPredictiveOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Disable main body scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const colors = getThemeClasses(themeConfig.primaryColor);

  // Resolve specialized drawer header theme configurations depending on theme color
  const drawerTheme = (() => {
    switch (themeConfig.primaryColor) {
      case 'emerald':
        return {
          cardBg: 'bg-emerald-950 text-emerald-50',
          avatarBg: 'bg-emerald-600 text-white border-emerald-400/25',
          badgeText: 'text-emerald-300',
          btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-white',
          borderCol: 'border-emerald-900/60',
          closeHover: 'hover:bg-emerald-900/60 text-emerald-300 hover:text-white'
        };
      case 'sky':
        return {
          cardBg: 'bg-sky-950 text-sky-50',
          avatarBg: 'bg-sky-600 text-white border-sky-400/25',
          badgeText: 'text-sky-300',
          btnBg: 'bg-sky-500 hover:bg-sky-400 text-white',
          borderCol: 'border-sky-900/60',
          closeHover: 'hover:bg-sky-900/60 text-sky-300 hover:text-white'
        };
      case 'indigo':
        return {
          cardBg: 'bg-indigo-950 text-indigo-50',
          avatarBg: 'bg-indigo-600 text-white border-indigo-400/25',
          badgeText: 'text-indigo-300',
          btnBg: 'bg-indigo-500 hover:bg-indigo-400 text-white',
          borderCol: 'border-indigo-900/60',
          closeHover: 'hover:bg-indigo-900/60 text-indigo-300 hover:text-white'
        };
      case 'rose':
        return {
          cardBg: 'bg-rose-950 text-rose-50',
          avatarBg: 'bg-rose-600 text-white border-rose-400/25',
          badgeText: 'text-rose-300',
          btnBg: 'bg-rose-500 hover:bg-rose-400 text-white',
          borderCol: 'border-rose-900/60',
          closeHover: 'hover:bg-rose-900/60 text-rose-300 hover:text-white'
        };
      case 'honeybee':
      default:
        return {
          cardBg: 'bg-yellow-950 text-amber-50',
          avatarBg: 'bg-yellow-500 text-neutral-950 border-yellow-300/25 font-bold',
          badgeText: 'text-amber-300',
          btnBg: 'bg-yellow-500 hover:bg-amber-500 text-neutral-950 font-bold',
          borderCol: 'border-yellow-905/30',
          closeHover: 'hover:bg-yellow-900/60 text-yellow-300 hover:text-white'
        };
    }
  })();

  // Total cart quantities
  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  // Predictive search filter
  const predictiveResults = searchTerm.trim().length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      setSearchQueryState(searchTerm.trim());
      setView('search');
      setPredictiveOpen(false);
    }
  };

  const handlePredictiveClick = (productId: string) => {
    setActiveProductId(productId);
    setView('product');
    setPredictiveOpen(false);
    setSearchTerm('');
  };

  const handleCategoryNav = (catId: string) => {
    if (catId === '') {
      setActiveCategory(null);
      setView('shopify-collections');
    } else {
      setActiveCategory(catId);
      setView('collection');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 font-sans">
      {/* Blurred background layer that doesn't form a containing block for fixed descendants */}
      <div className="absolute inset-0 bg-[#FDFCFB]/95 backdrop-blur-md border-b border-[#F1ECE4]" style={{ zIndex: -1 }} />
      
      {/* Main Top Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="mobile-menu-burger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-zinc-650 md:hidden transition cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div
            onClick={() => {
              setView('home');
              setActiveProductId(null);
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-serif italic font-semibold text-white text-sm transform group-hover:rotate-6 transition ${colors.bg}`}>
              BV
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-serif font-black tracking-widest text-[#1A1A1A] flex items-center gap-1">
                BABY VAN 
              </h1>
              <p className="text-[10px] text-neutral-400 font-sans font-semibold tracking-tight">Nursery & Kids Boutique</p>
            </div>
          </div>
        </div>

        {/* Live Predictive Search Controls */}
        <div className="flex-1 max-w-lg relative hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search diapers, swaddles, strollers, wooden blocks..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPredictiveOpen(true);
              }}
              onFocus={() => setPredictiveOpen(true)}
              className="w-full pl-4 pr-10 py-2 border border-neutral-200 focus:border-zinc-800 rounded-full text-xs text-neutral-800 bg-neutral-50 focus:bg-white transition outline-none"
            />
            <button
              id="desktop-search-submit"
              type="submit"
              className="absolute right-3.5 top-2.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              <Search size={16} />
            </button>
          </form>

          {/* Predictive Results Drawer */}
          {predictiveOpen && searchTerm.trim().length > 1 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-150 overflow-hidden z-50 text-xs animate-fade-in max-h-96 overflow-y-auto">
              <div className="p-3 bg-neutral-50/80 border-b border-light text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex justify-between items-center">
                <span>Predictive Search Suggestions</span>
                <button onClick={() => setPredictiveOpen(false)} className="hover:text-zinc-700 text-[10px] normal-case font-medium text-neutral-400 cursor-pointer">
                  Close
                </button>
              </div>

              {predictiveResults.length === 0 ? (
                <div className="p-4 text-center text-zinc-500">
                  No matching baby products found. Change criteria.
                </div>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {predictiveResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handlePredictiveClick(p.id)}
                      className="p-3 hover:bg-neutral-50 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="w-8 h-8 object-cover rounded bg-neutral-50 shrink-0" />
                        <div>
                          <p className="font-bold text-zinc-800 text-[11px] line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-zinc-400">{p.brand} · <span className="capitalize">{p.category}</span></p>
                        </div>
                      </div>
                      <span className="font-bold text-zinc-900 shrink-0">₹{p.price}</span>
                    </div>
                  ))}

                  <div
                    onClick={() => {
                      setSearchQueryState(searchTerm);
                      setView('search');
                      setPredictiveOpen(false);
                    }}
                    className="p-2 text-center text-[10px] font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer transition uppercase tracking-wider bg-neutral-50"
                  >
                    View All Matching Results →
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Support Call & Customer CTA Trays */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          
          {/* Quick Help Link */}
          <button
            id="nav-faq-link"
            onClick={() => setView('faq')}
            className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-zinc-800 cursor-pointer"
          >
            <HelpCircle size={14} />
            <span>Support Help</span>
          </button>

          {/* Account Portal Button */}
          <button
            id="nav-account-btn"
            onClick={() => {
              setView('account');
            }}
            className="p-2 rounded-full hover:bg-neutral-50 text-neutral-600 hover:text-zinc-900 transition relative cursor-pointer"
          >
            <User size={18} />
            {loggedInUser && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            )}
          </button>

          {/* Wishlist Link */}
          <button
            id="nav-wish-btn"
            onClick={() => setView('wishlist')}
            className="p-2 rounded-full hover:bg-neutral-50 text-neutral-600 hover:text-zinc-900 transition relative cursor-pointer"
          >
            <Heart size={18} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Dynamic Cart Button Trigger */}
          <button
            id="nav-cart-btn"
            onClick={() => setCartOpen(true)}
            className="p-2 rounded-full hover:bg-neutral-50 text-neutral-600 hover:text-zinc-900 transition relative cursor-pointer"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${colors.bg}`}>
                {cartCount}
              </span>
            )}
          </button>

        </div>

      </div>

      {/* Desktop Dynamic Secondary Navigation links row */}
      <nav className="bg-[#FDFCFB]/50 border-t border-[#F1ECE4] hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs font-semibold text-neutral-600">
          <div className="flex items-center gap-6">
            <button id="nav-home-opt" onClick={() => setView('home')} className="hover:text-zinc-950 transition uppercase tracking-wide cursor-pointer">
              Home
            </button>
            
            <button id="nav-all-col" onClick={() => handleCategoryNav('')} className="hover:text-zinc-950 transition uppercase tracking-wide cursor-pointer flex items-center gap-0.5">
              Shop Collections
            </button>

            {/* Quick dropdown links */}
            <button id="nav-caparel" onClick={() => handleCategoryNav('apparel')} className="hover:text-zinc-950 transition cursor-pointer">Clothing</button>
            <button id="nav-cdiaper" onClick={() => handleCategoryNav('diapering')} className="hover:text-zinc-950 transition cursor-pointer">Hygiene/Diapers</button>
            <button id="nav-ctoys" onClick={() => handleCategoryNav('toys')} className="hover:text-zinc-950 transition cursor-pointer">Toys & Gaming</button>
            <button id="nav-cgear" onClick={() => handleCategoryNav('gear')} className="hover:text-zinc-950 transition cursor-pointer">Baby Gear</button>
            <button id="nav-cnurse" onClick={() => handleCategoryNav('nursery')} className="hover:text-zinc-950 transition cursor-pointer">Nursery Bedding</button>

            <span className="w-px h-3.5 bg-neutral-250 inline-block shrink-0"></span>

            <button id="nav-brands-all" onClick={() => setView('offers')} className="text-red-500 hover:text-red-600 transition flex items-center gap-1 cursor-pointer">
              <Tag size={13} className="animate-bounce" />
              <span>Offers Corner</span>
            </button>

            <button id="nav-blogs-all" onClick={() => setView('blog')} className="hover:text-zinc-950 transition cursor-pointer">
              Parenting Blog
            </button>

            <button id="nav-about-all" onClick={() => setView('about')} className="hover:text-zinc-950 transition cursor-pointer">
              About Us
            </button>

            <button id="nav-contact-all" onClick={() => setView('contact')} className="hover:text-zinc-950 transition cursor-pointer">
              Contact
            </button>
          </div>

          <div className="hidden lg:block text-[11px] text-zinc-500">
            Helpline: <span className="font-bold text-zinc-800">{themeConfig.contactPhone}</span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu Overlays */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden flex justify-start">
            {/* Backdrop overlay with fade effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 cursor-pointer"
            />

            {/* Slide-out Sidebar Drawer container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.22 }}
              className="absolute left-0 top-0 bottom-0 w-[290px] sm:w-[325px] bg-[#FFFDFB] h-full shadow-2xl flex flex-col overflow-hidden z-[101] border-r border-[#F1ECE4]"
            >
              {/* Profile Card Header (Matching FirstCry / Flipkart visual identity) */}
              <div className={`${drawerTheme.cardBg} p-5 flex flex-col justify-end relative shrink-0 transition-colors duration-200`}>
                <div className="absolute right-[-15px] top-[-15px] opacity-10 text-white pointer-events-none">
                  <div className="w-24 h-24 rounded-full border border-current pointer-events-none" />
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${drawerTheme.avatarBg} flex items-center justify-center font-serif italic font-extrabold text-sm border-2 border-white/20 transition-all duration-200`}>
                      {loggedInUser ? loggedInUser.fullName[0].toUpperCase() : 'BV'}
                    </div>
                    <div>
                      <h3 className="font-serif italic font-bold text-sm tracking-wide text-white">
                        {loggedInUser ? `Hi, ${loggedInUser.fullName.split(' ')[0]}` : 'Welcome, Parent!'}
                      </h3>
                      <p className={`text-[10px] ${drawerTheme.badgeText} font-sans font-semibold tracking-wider flex items-center gap-1 mt-0.5`}>
                        <span>👶</span>
                        <span>{loggedInUser ? 'Premium Nest Member' : 'Guest Parent'}</span>
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setMobileMenuOpen(false)} 
                    className={`relative z-20 p-2 ${drawerTheme.closeHover} rounded-full transition cursor-pointer`}
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Subheader action button link */}
                <div className={`mt-4 border-t ${drawerTheme.borderCol} pt-3 flex justify-between items-center text-[10px]`}>
                  {loggedInUser ? (
                    <>
                      <button 
                        onClick={() => { setView('account'); setMobileMenuOpen(false); }}
                        className="text-white/80 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <User size={11} />
                        My Baby Nest Tracker
                      </button>
                      <button 
                        onClick={() => {
                          setLoggedInUser(null);
                          localStorage.removeItem('fc_user');
                          setView('home');
                          setMobileMenuOpen(false);
                        }}
                        className="text-red-300 hover:text-red-200 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-white/70">Join Baby Van Rewards Program</span>
                      <button 
                        onClick={() => { setView('account'); setMobileMenuOpen(false); }}
                        className={`${drawerTheme.btnBg} px-2.5 py-1 rounded font-bold transition shadow-xs cursor-pointer text-[9px] uppercase tracking-wider`}
                      >
                        Sign In / Join
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Scrollable Categories List */}
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                
                {/* Embedded Search Form */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <span className="absolute left-3.5 top-2.5 text-neutral-400">
                    <Search size={13} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search baby products, safe diapers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-neutral-900 focus:bg-white rounded-xl text-[11px] transition placeholder:text-neutral-400 font-medium font-sans"
                  />
                  {searchTerm && (
                    <button 
                      type="button" 
                      onClick={() => setSearchTerm('')} 
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </form>

                {/* Primary store categories */}
                <div>
                  <h4 className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider mb-2 px-1">Shop Baby Collections</h4>
                  <div className="space-y-0.5">
                    {[
                      { id: '', label: 'All Collections', emoji: '👦' },
                      { id: 'apparel', label: 'Apparel & Clothes', emoji: '👕' },
                      { id: 'diapering', label: 'Diapering & Hygiene', emoji: '🧼' },
                      { id: 'toys', label: 'Toys & Gaming', emoji: '🧸' },
                      { id: 'gear', label: 'Strollers & Safety Gear', emoji: '🚗' },
                      { id: 'feeding', label: 'Feeding & Nursing', emoji: '🍼' },
                      { id: 'nursery', label: 'Nursery Bedding Essentials', emoji: '🛌' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryNav(cat.id)}
                        className="w-full text-left py-2 px-3 rounded-lg flex items-center justify-between transition text-xs font-semibold hover:bg-[#FAF6F0]/70 text-neutral-650 cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-sm select-none">{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </span>
                        <ChevronRight size={12} className="text-neutral-350" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extra advice and support links */}
                <div className="border-t border-[#F1ECE4] pt-5">
                  <h4 className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider mb-2 px-1">Customer Care & Support</h4>
                  <div className="space-y-0.5">
                    {[
                      { view: 'offers', label: 'Special Discount Coupons', icon: <Tag size={12} className="text-red-500" /> },
                      { view: 'blog', label: 'Parenting Guidelines Blog', icon: <BookOpen size={12} className="text-neutral-500" /> },
                      { view: 'about', label: 'About Our Journey', icon: <Compass size={12} className="text-neutral-500" /> },
                      { view: 'faq', label: 'Answers & FAQ Library', icon: <HelpCircle size={12} className="text-neutral-500" /> },
                      { view: 'contact', label: 'Helpdesk & Support Care', icon: <User size={12} className="text-neutral-500" /> },
                    ].map((item) => (
                      <button
                        key={item.view}
                        onClick={() => { setView(item.view); setMobileMenuOpen(false); }}
                        className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between transition text-xs font-semibold hover:bg-[#FAF6F0]/70 cursor-pointer ${
                          currentView === item.view ? 'bg-[#FAF6F0] text-[#1A1A1A] font-bold' : 'text-[#555555]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {item.icon}
                          <span>{item.label}</span>
                        </span>
                        <ChevronRight size={12} className="text-neutral-300" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Honeycomb comfort pledge badge */}
                <div className="bg-[#FAF6F0] border border-[#F1ECE4] rounded-2xl p-4 text-[10px] text-zinc-650 leading-relaxed font-semibold">
                  🍯 <strong className="text-zinc-800 font-bold">Comfort and Safety Promise</strong>: Every toy and apparel product in our hive is verified 100% hypoallergenic, chemical-free, and safe for delicate newborn skin.
                </div>
              </div>

              {/* Sidebar Footer Details */}
              <div className="p-4 bg-zinc-55 border-t border-neutral-100 text-[10px] space-y-1 text-neutral-500 font-semibold shrink-0">
                <p>Email: {themeConfig.contactEmail}</p>
                <p>Helpline: {themeConfig.contactPhone}</p>
                <p className="text-[9px] text-[#A39D95] font-mono text-center pt-2 border-t border-neutral-150 mt-1 uppercase">BABY VAN &copy; 2026</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
