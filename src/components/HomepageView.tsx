import React, { useState, useEffect, useMemo } from 'react';
import { Product, Brand, BlogPost, ShopifyCollection } from '../types';
import { Shirt, Sparkles, Gamepad2, Car, Milk, Bed, HelpCircle, ArrowRight, Clock, Star, Flame } from 'lucide-react';
import { getThemeClasses } from './ProductCard';

interface HomepageViewProps {
  products: Product[];
  brands: Brand[];
  blogs: BlogPost[];
  shopifyCollections: ShopifyCollection[];
  faqs: { q: string; a: string }[];
  themeConfig: any;
  heroBanner: { title: string; subtitle: string; bgImage: string };
  shopifyThemeData?: any;
  enabledSections: {
    promoHeader: boolean;
    hero: boolean;
    categories: boolean;
    brands: boolean;
    bestSellers: boolean;
    flashDeals: boolean;
    blogs: boolean;
    faqs: boolean;
  };
  setView: (v: string) => void;
  setActiveProductId: (id: string | null) => void;
  setActiveCategory: (cat: string | null) => void;
  setActiveBrandId: (id: string | null) => void;
  onAddToCart: (productId: string, size: string, color: string) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
}

export default function HomepageView({
  products,
  brands,
  blogs,
  shopifyCollections = [],
  faqs,
  themeConfig,
  heroBanner,
  shopifyThemeData,
  enabledSections,
  setView,
  setActiveProductId,
  setActiveCategory,
  setActiveBrandId,
  onAddToCart,
  onToggleWishlist,
  wishlist
}: HomepageViewProps) {
  const colors = getThemeClasses(themeConfig.primaryColor);

  // Dynamic slider content based on Shopify live sync choice
  const sliderHeadline = useMemo(() => {
    if (themeConfig.shopifyThemeSyncEnabled && shopifyThemeData) {
      if (themeConfig.shopifyThemeSyncSource === 'page') {
        return shopifyThemeData.pageTitle || heroBanner.title;
      } else {
        return shopifyThemeData.shopName || heroBanner.title;
      }
    }
    return heroBanner.title;
  }, [themeConfig.shopifyThemeSyncEnabled, themeConfig.shopifyThemeSyncSource, shopifyThemeData, heroBanner.title]);

  const sliderSubtitle = useMemo(() => {
    if (themeConfig.shopifyThemeSyncEnabled && shopifyThemeData) {
      if (themeConfig.shopifyThemeSyncSource === 'page') {
        return shopifyThemeData.pageBody || heroBanner.subtitle;
      } else {
        return shopifyThemeData.shortDescription || shopifyThemeData.shopDescription || heroBanner.subtitle;
      }
    }
    return heroBanner.subtitle;
  }, [themeConfig.shopifyThemeSyncEnabled, themeConfig.shopifyThemeSyncSource, shopifyThemeData, heroBanner.subtitle]);

  const sliderBgImage = useMemo(() => {
    if (themeConfig.shopifyThemeSyncEnabled && shopifyThemeData && themeConfig.shopifyThemeSyncSource !== 'page' && shopifyThemeData.coverImageUrl) {
      return shopifyThemeData.coverImageUrl;
    }
    return heroBanner.bgImage;
  }, [themeConfig.shopifyThemeSyncEnabled, themeConfig.shopifyThemeSyncSource, shopifyThemeData, heroBanner.bgImage]);

  const sliderSlogan = useMemo(() => {
    if (themeConfig.shopifyThemeSyncEnabled && shopifyThemeData && themeConfig.shopifyThemeSyncSource !== 'page' && shopifyThemeData.slogan) {
      return shopifyThemeData.slogan;
    }
    return null;
  }, [themeConfig.shopifyThemeSyncEnabled, themeConfig.shopifyThemeSyncSource, shopifyThemeData]);

  // Simulated countdown timer (starts fresh each mount, e.g., 2 hours 14 mins 32 secs)
  const [timeLeft, setTimeLeft] = useState(8072); // in seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 8000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // FAQ Accordion toggles
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Best sellers: high rating products
  const bestSellers = products.filter(p => p.rating >= 4.7).slice(0, 4);

  // Flash deals: products with discount
  const flashDeals = products.filter(p => p.originalPrice !== undefined).slice(0, 4);

  // Memoized 6 random stable collections from Shopify Storefront data
  const random6Collections = useMemo(() => {
    if (!shopifyCollections || shopifyCollections.length === 0) return [];
    const list = [...shopifyCollections];
    // Stable pseudo-shuffle to avoid layout jumps on local state changes
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor((Math.sin(i + list.length) + 1) * 0.5 * (i + 1)) % (i + 1);
      const temp = list[i];
      list[i] = list[j];
      list[j] = temp;
    }
    return list.slice(0, 6);
  }, [shopifyCollections]);

  // Map category icons helper
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt': return <Shirt className="text-zinc-700" size={24} />;
      case 'Sparkles': return <Sparkles className="text-zinc-700" size={24} />;
      case 'Gamepad2': return <Gamepad2 className="text-zinc-700" size={24} />;
      case 'Car': return <Car className="text-zinc-700" size={24} />;
      case 'Milk': return <Milk className="text-zinc-700" size={24} />;
      case 'Bed': return <Bed className="text-zinc-700" size={24} />;
      default: return <Sparkles className="text-zinc-700" size={24} />;
    }
  };

  return (
    <div className="space-y-12 pb-20 font-sans text-xs">
      
      {/* 1. HERO SLIDER BANNER SECTION */}
      {enabledSections.hero && (
        <section
          id="hero-banner-section"
          className="relative bg-gradient-to-tr from-[#FFFDFB] via-[#FAF6F0] to-[#E9EFF2] overflow-hidden min-h-[300px] md:min-h-[480px] flex items-center border-b border-[#F1ECE4]"
        >
          {/* Background Illustration */}
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src={sliderBgImage}
              alt="Baby Store Hero Banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale-xs"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDFB] via-[#FFFDFB]/80 to-transparent z-1" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 space-y-4 md:space-y-6 max-w-lg md:max-w-2xl text-left">
            <div className={`p-1.5 px-3 rounded-full inline-block font-sans font-bold tracking-widest uppercase text-[10px] text-rose-700 bg-rose-50/90 border border-rose-100`}>
              ✨ {sliderSlogan || themeConfig.bannerHeadline || "Limited Period Premium Carnival"}
            </div>
            
            <h2 id="hero-headline" className="text-3xl sm:text-4xl md:text-6xl font-serif text-[#1A1A1A] tracking-tight leading-tight italic font-normal">
              {sliderHeadline}
            </h2>

            <p id="hero-subtitle" className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans max-w-md">
              {sliderSubtitle}
            </p>

            {/* Shopify Live Discounts list */}
            {flashDeals.length > 0 && (
              <div className="bg-[#FAF6F0]/90 backdrop-blur-md border border-[#E9E2D8] p-3 md:p-4 rounded-2xl max-w-md space-y-2.5 shadow-xs animate-fade-in">
                <div className="flex items-center gap-1.5 text-rose-700 font-sans font-bold text-[10px] uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span>🏪 Shopify Active Discounts (Compare At Rates)</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {flashDeals.slice(0, 3).map(p => {
                    const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveProductId(p.id);
                          setView('product');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-rose-50/20 border border-neutral-100 hover:border-rose-200 transition text-[11px] cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <img src={p.images[0]} referrerPolicy="no-referrer" alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-neutral-150" />
                          <div>
                            <p className="font-bold text-neutral-800 line-clamp-1 group-hover:text-rose-700 transition max-w-[170px]">{p.name}</p>
                            <p className="text-[10px] text-neutral-400 font-sans">Compare: <span className="line-through">₹{p.originalPrice}</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md font-bold font-sans text-[9px] border border-red-100 animate-pulse">
                            -{discount}% OFF
                          </span>
                          <span className="font-extrabold text-[#1A1A1A] font-mono text-xs">
                            ₹{p.price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] text-neutral-500 font-sans flex items-center justify-between">
                  <span>*Click any deal to buy on web store.</span>
                  <span id="shopify-offers-direct-link" className="text-rose-600 font-bold hover:underline cursor-pointer" onClick={() => setView('offers')}>See All Deals &rarr;</span>
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                id="hero-cta-collection"
                onClick={() => {
                  setActiveCategory(null);
                  setView('collection');
                }}
                className={`py-3 px-8 font-sans font-bold text-white rounded-full shadow-sm hover:shadow-md cursor-pointer transition transform hover:scale-[1.03] active:scale-95 ${colors.bg}`}
              >
                Shop Premium Collection
              </button>
              <button
                id="hero-cta-offers"
                onClick={() => setView('offers')}
                className="py-3 px-8 font-sans font-bold text-neutral-800 bg-[#FFFDFB] hover:bg-[#FAF6F0] border border-[#E9E2D8] rounded-full shadow-xs cursor-pointer transition transform hover:scale-[1.03]"
              >
                Explore Active Coupons
              </button>
            </div>
          </div>

          {/* Scrapbook photo frame slightly rotated */}
          <div className="absolute right-16 bottom-10 top-10 w-96 hidden lg:flex items-center justify-center z-10 pointer-events-none">
            <div className="relative w-80 h-96 bg-[#FFFDFB] p-4 pb-12 border border-[#E9E2D8] shadow-lg rotate-3 rounded-xs transition-transform duration-500 hover:rotate-1">
              <img src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-4 right-4 text-center">
                <span className="font-serif italic text-neutral-500 text-xs tracking-wider">the nursery lookbook</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. DYNAMIC CIRCULAR CATEGORY RAIL */}
      {enabledSections.categories && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex justify-between items-baseline border-b border-[#F1ECE4] pb-2 mb-4">
            <h3 className="font-serif italic text-lg sm:text-2xl text-[#1A1A1A]">
              Shop by Collection
            </h3>
            <button
              onClick={() => {
                setView('shopify-collections');
              }}
              className="text-neutral-400 hover:text-zinc-900 font-sans font-bold text-[11px] uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            >
              <span>See All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 pt-2">
            {random6Collections.map((col) => (
              <div
                key={col.id}
                id={`shopify-col-${col.id}`}
                onClick={() => {
                  setActiveCategory(col.id);
                  setView('collection');
                }}
                className="p-3 bg-white border border-[#F1ECE4] hover:border-neutral-400 rounded-2xl shadow-xs text-center flex flex-col items-center gap-2 group transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer overflow-hidden"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-1 border border-neutral-100 flex items-center justify-center transform group-hover:scale-110 transition duration-300">
                  <img
                    src={col.image}
                    alt={col.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-[#1A1A1A] group-hover:text-neutral-900 text-[11px] sm:text-xs leading-tight line-clamp-1">
                    {col.name}
                  </p>
                  <p className="text-[9px] text-[#A39D95] font-semibold tracking-wide">
                    {col.count || 20} Products
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. DYNAMIC FLASH DEALS countdown panel */}
      {enabledSections.flashDeals && (
        <section className="bg-[#FAF6F0] border-y border-[#F1ECE4] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Flame className="text-rose-500 animate-pulse fill-rose-500" size={20} />
                  <h3 className="font-serif italic text-lg sm:text-2xl text-[#1A1A1A]">
                    Flash Offers Ending Soon!
                  </h3>
                </div>
                <p className="text-zinc-500 text-xs font-sans font-semibold">Immediate reductions up to 35% on certified child-safe organic inventory</p>
              </div>

              {/* Real working ticking component */}
              <div className="flex items-center gap-2 bg-[#1A1A1A] text-white font-mono px-4 py-2 rounded-full border border-neutral-800 text-xs shadow-sm">
                <Clock size={14} className="text-rose-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Timer Left:</span>
                <span className="font-bold text-rose-300 font-mono tracking-widest">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Product list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flashDeals.map(p => {
                const colorsClass = getThemeClasses(themeConfig.primaryColor);
                const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveProductId(p.id);
                      setView('product');
                    }}
                    className="p-3 bg-white rounded-2xl border border-neutral-100 shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-square overflow-hidden bg-neutral-50 rounded-xl mb-3">
                      <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">
                        -{discount}% OFF
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">{p.brand}</p>
                      <h4 className="font-bold text-zinc-850 text-xs leading-snug line-clamp-1">{p.name}</h4>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-zinc-950">₹{p.price}</span>
                        {p.originalPrice && <span className="line-through text-zinc-400 text-[10px]">₹{p.originalPrice}</span>}
                      </div>

                      <button
                        id={`flash-detail-btn-${p.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProductId(p.id);
                          setView('product');
                        }}
                        className={`w-full text-white text-[10px] font-bold py-1.5 rounded-lg text-center cursor-pointer transition ${colorsClass.bg}`}
                      >
                        Grab Best Deal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. PREMIUM SECTIONS: BEST SELLERS LIST */}
      {enabledSections.bestSellers && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-between items-baseline border-b border-[#F1ECE4] pb-2">
            <h3 className="font-serif italic text-lg sm:text-2xl text-[#1A1A1A]">
              Curated Favorites & Best Sellers
            </h3>
            <button
              onClick={() => {
                setActiveCategory(null);
                setView('collection');
              }}
              className="text-neutral-400 hover:text-zinc-900 font-sans font-bold text-[11px] uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            >
              <span>View All Products</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bestSellers.map(p => {
              const checkWishlist = wishlist.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveProductId(p.id);
                    setView('product');
                  }}
                  className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-xs hover:shadow-lg transition flex flex-col justify-between h-full cursor-pointer relative p-3"
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-50 rounded-xl mb-3 shrink-0">
                    <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    
                    <button
                      id={`fav-heart-${p.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(p.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-xs text-zinc-400 hover:text-red-500 cursor-pointer"
                    >
                      <Star size={12} className={checkWishlist ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'} />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col justify-between pt-1">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                        <span>{p.brand}</span>
                        <span className="text-amber-500 font-bold flex items-center gap-0.5">★ {p.rating}</span>
                      </div>
                      <h4 className="font-bold text-zinc-800 text-xs leading-snug line-clamp-2">{p.name}</h4>
                    </div>

                    <div className="pt-2">
                      <p className="font-bold text-zinc-900 mb-2">₹{p.price}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(p.id, p.variants.sizes[0] || 'Standard', p.variants.colors[0]?.name || 'Standard');
                          alert('Added ' + p.name + ' to your cart bag!');
                        }}
                        className={`w-full bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold py-1.5 rounded-lg text-center cursor-pointer transition`}
                      >
                        Add to Bag Bag
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. SHOP CARTER'S vs BABYHUG (BRANDS CORNER) */}
      {enabledSections.brands && (
        <section className="bg-[#FAF6F0] border-y border-[#F1ECE4] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <div className="space-y-1">
              <h3 className="font-serif italic text-lg sm:text-2xl text-[#1A1A1A]">
                Official Co-Branded Partners
              </h3>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto font-sans font-semibold">Click any partner brand to browse official premium inventory matches.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {brands.map(b => (
                <button
                  key={b.id}
                  id={`brand-btn-${b.id}`}
                  onClick={() => {
                    setActiveBrandId(b.id);
                    setView('brands');
                  }}
                  className="px-6 py-4 bg-white border border-neutral-150 hover:border-neutral-400 rounded-3xl shadow-xs flex items-center gap-3 transition transform hover:scale-105 active:scale-95 cursor-pointer max-w-xs text-left"
                >
                  <div className={`w-10 h-10 rounded-full ${colors.bg} text-white flex items-center justify-center font-black tracking-tighter text-sm`}>
                    {b.logo}
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-950 text-xs leading-none">{b.name}</h4>
                    <span className="text-[10px] text-zinc-400 font-semibold">{b.specialty}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. PARENTING BLOG & ADVICE TICKER */}
      {enabledSections.blogs && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-between items-baseline border-b border-[#F1ECE4] pb-2">
            <h3 className="font-serif italic text-lg sm:text-2xl text-[#1A1A1A]">
              Parenting Guides & Wisdom
            </h3>
            <button
              onClick={() => setView('blog')}
              className="text-neutral-400 hover:text-zinc-900 font-sans font-bold text-[11px] uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            >
              <span>See All Articles</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map(post => (
              <div
                key={post.id}
                id={`blog-card-${post.id}`}
                onClick={() => {
                  setActiveProductId(post.id); // Storing the blog post id under dynamic helper triggers
                  setView('blog-article');
                }}
                className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-xs hover:shadow-lg hover:border-neutral-300 transition-all flex flex-col md:flex-row cursor-pointer"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full md:w-1/3 aspect-video md:aspect-square object-cover bg-neutral-100 shrink-0"
                />
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <span className="bg-neutral-100 text-zinc-700 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                    <h4 className="font-black text-zinc-950 text-sm md:text-base leading-snug tracking-tight">
                      {post.title}
                    </h4>
                    <p className="text-zinc-500 line-clamp-2 text-xs leading-relaxed font-semibold">
                      {post.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 border-t pt-2 mt-auto">
                    <span>By {post.author}</span>
                    <span className="font-mono">{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. PARENTS FAQ ACCORDION BOARD */}
      {enabledSections.faqs && (
        <section className="max-w-3xl mx-auto px-4 space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="font-black text-sm md:text-base uppercase tracking-wider text-zinc-900 flex items-center justify-center gap-1.5">
              <HelpCircle size={16} />
              <span>Nursery Setup FAQ Accordions</span>
            </h3>
            <p className="text-zinc-500 text-xs">Essential answers for new mothers and dads regarding material safety and shipping</p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-neutral-150 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  id={`faq-btn-${idx}`}
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full text-left p-4  font-bold text-zinc-900 hover:bg-neutral-50 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg text-zinc-400">{openFaqIndex === idx ? '−' : '+'}</span>
                </button>
                {openFaqIndex === idx && (
                  <div className="px-4 pb-4 pt-1 text-zinc-600 leading-relaxed text-xs border-t border-neutral-50 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
