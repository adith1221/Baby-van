import React, { useState, useEffect } from 'react';
import { Home, Grid, Search, ShoppingBag, User, Heart } from 'lucide-react';
import { getThemeClasses } from './ProductCard';
import { CartItem } from '../types';

interface BottomNavigationProps {
  currentView: string;
  setView: (v: string) => void;
  cart: CartItem[];
  wishlist: string[];
  themeColorId: string;
  setIsSearchModalOpen: (open: boolean) => void;
  setActiveCategory?: (v: string | null) => void;
}

export default function BottomNavigation({
  currentView,
  setView,
  cart,
  wishlist,
  themeColorId,
  setIsSearchModalOpen,
  setActiveCategory
}: BottomNavigationProps) {
  const colors = getThemeClasses(themeColorId);
  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScroll = window.scrollY;
    
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      
      // Ignore negative scroll offsets (iOS bounce scroll)
      if (currentScroll < 0) return;

      // Detect direction change only after crossing a small threshold
      if (Math.abs(currentScroll - lastScroll) > 5) {
        if (currentScroll > lastScroll && currentScroll > 50) {
          // Scrolling down - hide menu
          setIsVisible(false);
        } else {
          // Scrolling up - show menu
          setIsVisible(true);
        }
        lastScroll = currentScroll;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleCategoriesClick = () => {
    if (setActiveCategory) {
      setActiveCategory(null);
    }
    setView('shopify-collections');
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, action: () => setView('home') },
    { id: 'collection', label: 'Categories', icon: Grid, action: handleCategoriesClick },
    { id: 'search', label: 'Search', icon: Search, action: () => setIsSearchModalOpen(true) },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, action: () => setView('cart'), badge: cartCount },
    { id: 'account', label: 'Account', icon: User, action: () => setView('account') }
  ];

  return (
    <div
      id="mobile-bottom-nav"
      className={`fixed bottom-0 inset-x-0 bg-[#FDFCFB]/95 backdrop-blur-md border-t border-[#F1ECE4] py-1.5 px-3 z-40 md:hidden grid grid-cols-5 gap-1 shadow-xs transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id || (item.id === 'collection' && currentView === 'collection');
        
        return (
          <button
            key={item.id}
            id={`m-nav-${item.id}`}
            onClick={item.action}
            className="flex flex-col items-center justify-center gap-0.5 py-1 text-center select-none active:scale-95 transition-transform cursor-pointer relative"
            style={{ minHeight: '44px' }}
          >
            <div className="relative">
              <Icon
                size={20}
                className={`transition ${isActive ? colors.text : 'text-zinc-400 hover:text-zinc-600'}`}
              />
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`absolute -top-1.5 -right-2 text-[9px] text-white font-bold rounded-full w-4 h-4 flex items-center justify-center ${colors.bg}`}>
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-semibold tracking-wide ${isActive ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
