import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product, Address, User, Order, CartItem, Review, BlogPost, ThemeConfig, ShopifyCollection } from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_REVIEWS,
  INITIAL_BLOGS,
  PROMO_CODES,
  INITIAL_FAQS
} from './data';
import Navbar from './components/Navbar';
import BottomNavigation from './components/BottomNavigation';
import AdminCustomizer from './components/AdminCustomizer';
import HomepageView from './components/HomepageView';
import CollectionPageView from './components/CollectionPageView';
import ProductPageView from './components/ProductPageView';
import CheckoutSteps from './components/CheckoutSteps';
import AccountDashboardView from './components/AccountDashboardView';
import ProductCard, { getThemeClasses } from './components/ProductCard';
import { Check, X, Phone, Mail, Clock, HelpCircle, BookOpen, Heart, Tag, ArrowRight, ShieldCheck, MapPin, Search } from 'lucide-react';
import {
  getShopifyConfig,
  fetchShopifyProducts,
  createShopifyCustomer,
  createShopifyCustomerAccessToken,
  fetchShopifyCustomerProfile,
  updateShopifyCustomerProfile,
  fetchShopifyCollections,
  fetchShopifyThemeData
} from './lib/shopify';
import ShopifyCollectionsListView from './components/ShopifyCollectionsListView';

export default function App() {
  // ----------------------------------------
  // 1. DURABLE PERSISTENT STATES
  // ----------------------------------------
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  const [blogs] = useState<BlogPost[]>(INITIAL_BLOGS);

  // Fallback fallback lists of Baby/Kids collections
  const LOCAL_FALLBACK_COLLECTIONS: ShopifyCollection[] = [
    { id: 'apparel', name: 'Apparel Clothes', handle: 'apparel', description: 'Soft organic clothing and comfortable wear for kids.', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=60', count: 124 },
    { id: 'diapering', name: 'Diapering Care', handle: 'diapering', description: 'Skin-safe premium diapers and pediatric care products.', image: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=500&auto=format&fit=crop&q=60', count: 48 },
    { id: 'toys', name: 'Toys & Fun', handle: 'toys', description: 'Educational sensory toys and creative wood tools.', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=60', count: 86 },
    { id: 'gear', name: 'Travel Gear', handle: 'gear', description: 'Lightweight agile strollers and certified high-grade car seats.', image: 'https://images.unsplash.com/photo-1591938424262-b2a1a8c88680?w=500&auto=format&fit=crop&q=60', count: 32 },
    { id: 'feeding', name: 'Bottles & Feeds', handle: 'feeding', description: 'BPA-free nursing needs and chemical-free storage bottles.', image: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=500&auto=format&fit=crop&q=60', count: 59 },
    { id: 'nursery', name: 'Sleep & Crib', handle: 'nursery', description: 'Hypoallergenic nursery sheets and cute crib cushions.', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60', count: 18 }
  ];

  const [shopifyCollections, setShopifyCollections] = useState<ShopifyCollection[]>(LOCAL_FALLBACK_COLLECTIONS);
  const [shopifyThemeData, setShopifyThemeData] = useState<any>(null);

  // Shopify products loader hook
  const [shopifyReloadCount, setShopifyReloadCount] = useState(0);
  const [shopifyConnected, setShopifyConnected] = useState(false);
  const [isShopifyLoading, setIsShopifyLoading] = useState(false);
  const [shopifyError, setShopifyError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShop() {
      const config = getShopifyConfig();
      if (config.storefrontAccessToken && config.storeDomain) {
        setIsShopifyLoading(true);
        setShopifyError(null);
        try {
          const [shopifyProds, shopifyCols, shopifyTheme] = await Promise.all([
            fetchShopifyProducts(config),
            fetchShopifyCollections(config),
            fetchShopifyThemeData(config)
          ]);

          if (shopifyProds && shopifyProds.length > 0) {
            setProducts(shopifyProds);
            setShopifyConnected(true);
          } else {
            setProducts(INITIAL_PRODUCTS);
            setShopifyConnected(false);
            setShopifyError("Connected to Shopify storefront successfully, but no active products were found.");
          }

          if (shopifyCols && shopifyCols.length > 0) {
            setShopifyCollections(shopifyCols);
          } else {
            setShopifyCollections(LOCAL_FALLBACK_COLLECTIONS);
          }

          if (shopifyTheme) {
            setShopifyThemeData(shopifyTheme);
          } else {
            setShopifyThemeData(null);
          }
        } catch (err: any) {
          console.error("Shopify loading failed", err);
          setShopifyError(err.message || "Failed to retrieve Shopify storefront data.");
          setShopifyConnected(false);
          setProducts(INITIAL_PRODUCTS);
          setShopifyCollections(LOCAL_FALLBACK_COLLECTIONS);
          setShopifyThemeData(null);
        } finally {
          setIsShopifyLoading(false);
        }
      } else {
        setProducts(INITIAL_PRODUCTS);
        setShopifyCollections(LOCAL_FALLBACK_COLLECTIONS);
        setShopifyConnected(false);
        setShopifyError(null);
        setShopifyThemeData(null);
      }
    }
    loadShop();
  }, [shopifyReloadCount]);


  const [loggedInUser, setLoggedInUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fc_user');
    return saved ? JSON.parse(saved) : null;
  });

  const loadedUserEmailRef = useRef<string>(() => {
    const saved = localStorage.getItem('fc_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u && u.email ? u.email.toLowerCase() : 'guest';
      } catch (e) {}
    }
    return 'guest';
  });

  const [localRegisteredUsers, setLocalRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('fc_registered_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'usr-default-mock',
        email: 'parent@example.com',
        fullName: 'Jane Doe',
        phone: '+919876543210'
      }
    ];
  });

  // Storage Persistence Helpers
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('fc_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedUser = localStorage.getItem('fc_user');
    const userObj = savedUser ? JSON.parse(savedUser) : null;
    const key = userObj ? `fc_cart_${userObj.email.toLowerCase()}` : 'fc_cart_guest';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const savedUser = localStorage.getItem('fc_user');
    const userObj = savedUser ? JSON.parse(savedUser) : null;
    const key = userObj ? `fc_wishlist_${userObj.email.toLowerCase()}` : 'fc_wishlist_guest';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
    const savedUser = localStorage.getItem('fc_user');
    const userObj = savedUser ? JSON.parse(savedUser) : null;
    const key = userObj ? `fc_addresses_${userObj.email.toLowerCase()}` : 'fc_addresses_guest';
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'addr-default-init',
        fullName: userObj ? userObj.fullName : 'Adith Saseendran',
        phone: userObj?.phone || '9876543210',
        addressLine1: 'Flat 402, Sunshine Apartment, Linking Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
        isDefault: true
      }
    ];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const savedUser = localStorage.getItem('fc_user');
    const userObj = savedUser ? JSON.parse(savedUser) : null;
    const key = userObj ? `fc_orders_${userObj.email.toLowerCase()}` : 'fc_orders_guest';
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'OD-582963',
        date: '2026-06-12',
        status: 'Delivered',
        items: [
          {
            productId: 'p1',
            productName: 'Organic Cotton Printed Front-Open Sleepsuit',
            productImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=60',
            brand: 'Carter\'s',
            price: 499,
            quantity: 1,
            selectedSize: '0-3M',
            selectedColor: 'Peach Pink'
          }
        ],
        shippingAddress: {
          id: 'addr-default-init',
          fullName: userObj ? userObj.fullName : 'Adith Saseendran',
          phone: userObj?.phone || '9876543210',
          addressLine1: 'Flat 402, Sunshine Apartment, Linking Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          isDefault: true
        },
        paymentMethod: 'UPI: adith@paytm',
        subtotal: 499,
        discount: 0,
        shipping: 99,
        tax: 60,
        total: 658,
        trackingNumber: 'TRK-981240124',
        estimatedDelivery: '2026-06-15'
      }
    ];
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const saved = localStorage.getItem('fc_recent');
    return saved ? JSON.parse(saved) : [];
  });

  // Theme Customizations State (Simulated Admin Customizer)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('fc_theme');
    return saved ? JSON.parse(saved) : {
      primaryColor: 'honeybee',
      secondaryColor: 'slate',
      fontFamily: 'font-sans',
      homepageTitle: 'Baby Van Premium Boutique',
      bannerHeadline: 'Premium Newborn Carnival',
      bannerSubline: 'Flat 15% OFF on diapers, clothing, toys, and nursery essentials',
      promoBannerText: '✨ SPECIAL DEALS: Use Coupon BABYVAN to get extra 15% discount!',
      contactEmail: 'care@babyvanstore.com',
      contactPhone: '+1-800-KIDS-CARE'
    };
  });

  const [heroBanner, setHeroBanner] = useState(() => {
    const saved = localStorage.getItem('fc_hero');
    return saved ? JSON.parse(saved) : {
      title: 'Mom & Baby Premium Carnival',
      subtitle: 'Flat 15% Discount on strollers, organic clothing, diapers & more!',
      bgImage: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1600&auto=format&fit=crop&q=80'
    };
  });

  const [enabledSections, setEnabledSections] = useState(() => {
    const saved = localStorage.getItem('fc_sections');
    return saved ? JSON.parse(saved) : {
      promoHeader: true,
      hero: true,
      categories: true,
      brands: true,
      bestSellers: true,
      flashDeals: true,
      blogs: true,
      faqs: true
    };
  });

  // Write changes to disk on modification
  useEffect(() => {
    localStorage.setItem('fc_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    const targetUserEmail = loggedInUser ? loggedInUser.email.toLowerCase() : 'guest';
    if (loadedUserEmailRef.current === targetUserEmail) {
      const key = loggedInUser ? `fc_cart_${targetUserEmail}` : 'fc_cart_guest';
      localStorage.setItem(key, JSON.stringify(cart));

      if (loggedInUser) {
        fetch('/api/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetUserEmail, cart })
        }).catch(err => console.error("Cloud cart sync error:", err));
      }
    }
  }, [cart, loggedInUser]);

  useEffect(() => {
    const targetUserEmail = loggedInUser ? loggedInUser.email.toLowerCase() : 'guest';
    if (loadedUserEmailRef.current === targetUserEmail) {
      const key = loggedInUser ? `fc_wishlist_${targetUserEmail}` : 'fc_wishlist_guest';
      localStorage.setItem(key, JSON.stringify(wishlist));

      if (loggedInUser) {
        fetch('/api/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetUserEmail, wishlist })
        }).catch(err => console.error("Cloud wishlist sync error:", err));
      }
    }
  }, [wishlist, loggedInUser]);

  useEffect(() => {
    const targetUserEmail = loggedInUser ? loggedInUser.email.toLowerCase() : 'guest';
    if (loadedUserEmailRef.current === targetUserEmail) {
      const key = loggedInUser ? `fc_addresses_${targetUserEmail}` : 'fc_addresses_guest';
      localStorage.setItem(key, JSON.stringify(addresses));

      if (loggedInUser) {
        fetch('/api/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetUserEmail, addresses })
        }).catch(err => console.error("Cloud addresses sync error:", err));
      }
    }
  }, [addresses, loggedInUser]);

  useEffect(() => {
    const targetUserEmail = loggedInUser ? loggedInUser.email.toLowerCase() : 'guest';
    if (loadedUserEmailRef.current === targetUserEmail) {
      const key = loggedInUser ? `fc_orders_${targetUserEmail}` : 'fc_orders_guest';
      localStorage.setItem(key, JSON.stringify(orders));

      if (loggedInUser) {
        fetch('/api/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetUserEmail, orders })
        }).catch(err => console.error("Cloud orders sync error:", err));
      }
    }
  }, [orders, loggedInUser]);

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('fc_user', JSON.stringify(loggedInUser));
      // Also register/update on cloud DB as a synced user session
      fetch('/api/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loggedInUser.email.toLowerCase(), user: loggedInUser })
      }).catch(err => console.error("User sync error:", err));
    } else {
      localStorage.removeItem('fc_user');
    }
  }, [loggedInUser]);

  useEffect(() => {
    localStorage.setItem('fc_registered_users', JSON.stringify(localRegisteredUsers));
  }, [localRegisteredUsers]);

  // Load registered users from server on mount
  useEffect(() => {
    fetch('/api/registered-users')
      .then(r => r.json())
      .then(res => {
        if (res.success && Array.isArray(res.users) && res.users.length > 0) {
          setLocalRegisteredUsers(res.users);
        }
      })
      .catch(err => console.error("Could not fetch cloud-registered users:", err));
  }, []);

  // Sync isolated context instantly when user signs in or out
  useEffect(() => {
    if (loggedInUser) {
      const email = loggedInUser.email.toLowerCase();
      loadedUserEmailRef.current = 'loading';

      fetch(`/api/sync-data?email=${encodeURIComponent(email)}`)
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            setCart(res.cart || []);
            setWishlist(res.wishlist || []);
            if (res.addresses && res.addresses.length > 0) {
              setAddresses(res.addresses);
            } else {
              setAddresses([
                {
                  id: 'addr-default-init',
                  fullName: loggedInUser?.fullName || 'Adith Saseendran',
                  phone: loggedInUser?.phone || '9876543210',
                  addressLine1: 'Flat 402, Sunshine Apartment, Linking Road',
                  city: 'Mumbai',
                  state: 'Maharashtra',
                  zipCode: '400001',
                  country: 'India',
                  isDefault: true
                }
              ]);
            }
            setOrders(res.orders || []);
          }
          loadedUserEmailRef.current = email;
        })
        .catch(err => {
          console.error("Could not load synced cloud data:", err);
          loadedUserEmailRef.current = email;
        });
    } else {
      const savedCart = localStorage.getItem('fc_cart_guest');
      setCart(savedCart ? JSON.parse(savedCart) : []);

      const savedWish = localStorage.getItem('fc_wishlist_guest');
      setWishlist(savedWish ? JSON.parse(savedWish) : []);

      const savedAddr = localStorage.getItem('fc_addresses_guest');
      if (savedAddr) {
        setAddresses(JSON.parse(savedAddr));
      } else {
        setAddresses([
          {
            id: 'addr-default-init',
            fullName: 'Adith Saseendran',
            phone: '9876543210',
            addressLine1: 'Flat 402, Sunshine Apartment, Linking Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India',
            isDefault: true
          }
        ]);
      }

      const savedOrd = localStorage.getItem('fc_orders_guest');
      setOrders(savedOrd ? JSON.parse(savedOrd) : []);
      
      loadedUserEmailRef.current = 'guest';
    }
  }, [loggedInUser]);

  useEffect(() => {
    localStorage.setItem('fc_recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('fc_theme', JSON.stringify(themeConfig));
  }, [themeConfig]);

  useEffect(() => {
    localStorage.setItem('fc_hero', JSON.stringify(heroBanner));
  }, [heroBanner]);

  useEffect(() => {
    localStorage.setItem('fc_sections', JSON.stringify(enabledSections));
  }, [enabledSections]);

  // ----------------------------------------
  // 2. CLIENT ROUTING STATE & NAVIGATION
  // ----------------------------------------
  // 'home' | 'collection' | 'product' | 'search' | 'cart' | 'wishlist' | 'account' |
  // 'about' | 'contact' | 'faq' | 'policies' | 'blog' | 'blog-article' | 'brands' | 'offers' | 'checkout'
  const [currentView, setView] = useState<string>('home');
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI Drawer states
  const [cartOpen, setCartOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Contact support form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactType, setContactType] = useState('Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');

  const colors = getThemeClasses(themeConfig.primaryColor);

  // ----------------------------------------
  // 3. CORE ACTION HANDLERS
  // ----------------------------------------
  const handleAddToCart = (prodId: string, size: string, color: string, qty: number = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.productId === prodId && item.selectedSize === size && item.selectedColor === color);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      } else {
        return [...prev, { productId: prodId, quantity: qty, selectedSize: size, selectedColor: color }];
      }
    });
  };

  const handleUpdateCartQuantity = (prodId: string, size: string, color: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === prodId && item.selectedSize === size && item.selectedColor === color) {
          const nextVal = item.quantity + change;
          return nextVal > 0 ? { ...item, quantity: nextVal } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (prodId: string, size: string, color: string) => {
    setCart(prev => prev.filter(item => !(item.productId === prodId && item.selectedSize === size && item.selectedColor === color)));
  };

  const handleToggleWishlist = (prodId: string) => {
    setWishlist(prev => {
      if (prev.includes(prodId)) {
        return prev.filter(id => id !== prodId);
      } else {
        return [...prev, prodId];
      }
    });
  };

  const handleAddReview = (newRev: Omit<Review, 'id' | 'date'>) => {
    const rev: Review = {
      ...newRev,
      id: 'rev-' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    
    setReviews(prev => [rev, ...prev]);

    // Recalculate average rating of product in memory
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        if (p.id === newRev.productId) {
          const matchingRevs = [rev, ...reviews.filter(r => r.productId === p.id)];
          const sum = matchingRevs.reduce((acc, r) => acc + r.rating, 0);
          const newAvg = parseFloat((sum / matchingRevs.length).toFixed(1));
          return {
            ...p,
            rating: newAvg,
            reviewsCount: matchingRevs.length
          };
        }
        return p;
      });
    });
  };

  // Auth Operations
  const handleLogin = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const config = getShopifyConfig();
    const isShopifyActive = !(!config.storefrontAccessToken || !config.storeDomain);

    if (isShopifyActive) {
      try {
        const tokenRes = await createShopifyCustomerAccessToken(config, { email, password: pass });
        if (tokenRes.success && tokenRes.accessToken) {
          const profileRes = await fetchShopifyCustomerProfile(config, tokenRes.accessToken);
          if (profileRes.success && profileRes.customer) {
            setLoggedInUser({
              id: profileRes.customer.id,
              email: profileRes.customer.email,
              fullName: profileRes.customer.displayName || `${profileRes.customer.firstName} ${profileRes.customer.lastName}`.trim(),
              phone: profileRes.customer.phone || '',
              shopifyAccessToken: tokenRes.accessToken
            });
            return { success: true };
          } else {
            return { success: false, message: profileRes.message || 'Authenticated successfully, but could not retrieve your Shopify profile details.' };
          }
        } else {
          return { success: false, message: tokenRes.message || 'Invalid email or password.' };
        }
      } catch (err: any) {
        return { success: false, message: err.message || 'An unexpected error occurred during Shopify login.' };
      }
    } else {
      // Fallback local prototype login
      if (email.includes('@')) {
        const normalizedEmail = email.trim().toLowerCase();
        // Look up registered user details first
        const userFound = localRegisteredUsers.find(u => u.email.trim().toLowerCase() === normalizedEmail);
        
        if (userFound) {
          setLoggedInUser(userFound);
          return { success: true };
        }

        // If not found, dynamically initialize a prototype session safely on the fly
        const parts = email.split('@');
        const newUser: User = {
          id: 'usr-' + Date.now(),
          email: email.trim(),
          fullName: parts[0].charAt(0).toUpperCase() + parts[0].slice(1),
          phone: '+919876543210'
        };
        setLocalRegisteredUsers(prev => [...prev, newUser]);
        setLoggedInUser(newUser);
        return { success: true };
      }
      return { success: false, message: 'Please specify a valid email address.' };
    }
  };

  const handleRegister = async (email: string, fullName: string, pass: string, phone?: string): Promise<{ success: boolean; message?: string }> => {
    const config = getShopifyConfig();
    const isShopifyActive = !(!config.storefrontAccessToken || !config.storeDomain);

    if (isShopifyActive) {
      try {
        const names = fullName.trim().split(/\s+/);
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || 'Parent';
        const res = await createShopifyCustomer(config, { firstName, lastName, email, password: pass, phone });
        if (res.success) {
          return { success: true };
        } else {
          return { success: false, message: res.message };
        }
      } catch (err: any) {
        return { success: false, message: err.message || 'Shopify customer registration failed.' };
      }
    } else {
      // Fallback local registration
      const cleanPhone = phone ? phone.trim().replace(/\s+/g, '') : '';
      const emailExists = localRegisteredUsers.some(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());

      // If they already exist in localRegisteredUsers, update their details beautifully & log them in!
      if (emailExists) {
        const updatedUsers = localRegisteredUsers.map(u => {
          if (u.email.trim().toLowerCase() === email.trim().toLowerCase()) {
            return {
              ...u,
              fullName,
              phone: phone || u.phone
            };
          }
          return u;
        });
        setLocalRegisteredUsers(updatedUsers);
        const existingUser = updatedUsers.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase())!;
        setLoggedInUser(existingUser);
        return { success: true };
      }

      const newUser: User = {
        id: 'usr-' + Date.now(),
        email,
        fullName,
        phone
      };

      setLocalRegisteredUsers(prev => [...prev, newUser]);
      setLoggedInUser(newUser);
      return { success: true };
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setView('home');
    alert('You have signed out of your account session. Safe parenting!');
  };

  const handleUpdateProfile = async (updated: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    const config = getShopifyConfig();
    const isShopifyActive = !(!config.storefrontAccessToken || !config.storeDomain);

    if (isShopifyActive && loggedInUser?.shopifyAccessToken) {
      try {
        const names = (updated.fullName || loggedInUser.fullName).trim().split(/\s+/);
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || '';
        const res = await updateShopifyCustomerProfile(config, loggedInUser.shopifyAccessToken, {
          firstName,
          lastName,
          phone: updated.phone || undefined
        });
        if (res.success) {
          setLoggedInUser(prev => prev ? { ...prev, ...updated } : null);
          return { success: true };
        } else {
          return { success: false, message: res.message };
        }
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to update credentials in Shopify.' };
      }
    } else {
      // Local fallback
      setLoggedInUser(prev => prev ? { ...prev, ...updated } : null);
      if (loggedInUser) {
        setLocalRegisteredUsers(prev => prev.map(u => u.email.trim().toLowerCase() === loggedInUser.email.trim().toLowerCase() ? { ...u, ...updated } : u));
      }
      return { success: true };
    }
  };

  // Address directory modifiers
  const handleAddAddress = (addr: Address) => {
    setAddresses(prev => {
      let next = prev.filter(a => a.id !== addr.id);
      if (addr.isDefault) {
        next = next.map(a => ({ ...a, isDefault: false }));
      }
      return [...next, addr];
    });
  };

  const handleRemoveAddress = (addrId: string) => {
    setAddresses(prev => prev.filter(a => a.id !== addrId));
  };

  const handleSetDefaultAddress = (addrId: string) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === addrId
    })));
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // Record viewed items
  const handleViewProduct = (prodId: string) => {
    setActiveProductId(prodId);
    setView('product');
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== prodId);
      return [prodId, ...filtered].slice(0, 5); // list of up to 5 items
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      alert('Please fill out all the fields.');
      return;
    }
    setContactSuccess(`Successfully received! Your ${contactType} ticket has been logged into the Merchant Admin Desk with ID: TKT-${Math.floor(100000 + Math.random() * 900000)}.`);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    setTimeout(() => setContactSuccess(''), 4500);
  };

  // Search results memo
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Cart helper quantities and pricing calculations
  const cartDetailedItems = useMemo(() => {
    return cart.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        item,
        product: prod
      };
    }).filter(d => d.product !== undefined) as { item: CartItem; product: Product }[];
  }, [cart, products]);

  const cartSubtotal = useMemo(() => {
    return cartDetailedItems.reduce((acc, curr) => {
      return acc + (curr.product.price * curr.item.quantity);
    }, 0);
  }, [cartDetailedItems]);

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setView('search');
      setIsSearchModalOpen(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50/20 text-neutral-800 flex flex-col ${themeConfig.fontFamily} antialiased`}>
      
      {/* ----------------------------------------
          NAVIGATION BAR & DESKTOP HEADER
          ---------------------------------------- */}
      <Navbar
        currentView={currentView}
        setView={setView}
        cart={cart}
        wishlist={wishlist}
        products={products}
        setActiveProductId={handleViewProduct}
        setActiveCategory={setActiveCategoryId}
        setSearchQueryState={setSearchQuery}
        loggedInUser={loggedInUser}
        setLoggedInUser={setLoggedInUser}
        themeConfig={themeConfig}
        setCartOpen={setCartOpen}
        setActiveBrandId={setActiveBrandId}
      />

      {/* ----------------------------------------
          MAIN CONTEXT ROUTER LAYOUTS
          ---------------------------------------- */}
      <main className="flex-1">

        {/* VIEW 1: HOMEPAGE */}
        {currentView === 'home' && (
          <HomepageView
            products={products}
            brands={brands}
            blogs={blogs}
            shopifyCollections={shopifyCollections}
            faqs={INITIAL_FAQS}
            themeConfig={themeConfig}
            heroBanner={heroBanner}
            shopifyThemeData={shopifyThemeData}
            enabledSections={enabledSections}
            setView={setView}
            setActiveProductId={handleViewProduct}
            setActiveCategory={setActiveCategoryId}
            setActiveBrandId={setActiveBrandId}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
          />
        )}

        {/* VIEW 1.5: SHOPIFY COLLECTIONS SPECIAL VIEW */}
        {currentView === 'shopify-collections' && (
          <ShopifyCollectionsListView
            products={products}
            shopifyCollections={shopifyCollections}
            setActiveCategory={setActiveCategoryId}
            setView={setView}
            themeConfig={themeConfig}
          />
        )}

        {/* VIEW 2: COLLECTION CATALOG */}
        {currentView === 'collection' && (
          <CollectionPageView
            products={products}
            brands={brands}
            activeCategoryId={activeCategoryId}
            setActiveCategoryId={setActiveCategoryId}
            activeBrandId={activeBrandId}
            setActiveBrandId={setActiveBrandId}
            themeConfig={themeConfig}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            setView={setView}
            setActiveProductId={handleViewProduct}
          />
        )}

        {/* VIEW 3: PRODUCT PAGE */}
        {currentView === 'product' && activeProductId && (() => {
          const prod = products.find(p => p.id === activeProductId);
          if (!prod) return <div className="p-8 text-center text-xs">Product not found.</div>;
          return (
            <ProductPageView
              product={prod}
              products={products}
              reviews={reviews}
              onAddReview={handleAddReview}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlist={wishlist}
              themeConfig={themeConfig}
              setView={setView}
              setActiveProductId={handleViewProduct}
            />
          );
        })()}

        {/* VIEW 4: SEARCH RESULTS */}
        {currentView === 'search' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-xs text-left space-y-6">
            <div className="bg-white border rounded-3xl p-6 border-neutral-100 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Shop Search Coordinates</p>
                <h2 className="text-xl md:text-2xl font-black text-zinc-950">
                  Search Results for: <span className="text-rose-600 font-mono">"{searchQuery}"</span>
                </h2>
                <p className="text-zinc-500 text-xs mt-1">Found {searchResults.length} matching premium products</p>
              </div>
              <button
                onClick={() => { setSearchQuery(''); setView('collection'); }}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Clear Query
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-20 bg-white border border-neutral-100 rounded-3xl p-6 shadow-xs max-w-sm mx-auto space-y-3">
                <p className="text-zinc-500 font-medium">No direct catalog matches found. Try queries like "sleepsuit", "diaper", "stroller", or "chicco" to locate premium matches.</p>
                <button
                  onClick={() => { setSearchQuery('romper'); }}
                  className={`py-2 px-6 text-white rounded-lg cursor-pointer ${colors.bg}`}
                >
                  Search "romper"
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {searchResults.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    themeColorId={themeConfig.primaryColor}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.includes(p.id)}
                    onViewProductDetail={handleViewProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: BASKET CART PAGE */}
        {currentView === 'cart' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-xs text-left space-y-6">
            <h2 className="text-xl md:text-2xl font-black text-neutral-950 uppercase border-b pb-3">Shopping Bags Overview ({cartDetailedItems.length} styles)</h2>
            
            {cartDetailedItems.length === 0 ? (
              <div className="max-w-md mx-auto text-center py-20 bg-white border rounded-3xl p-6 shadow-xs space-y-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                  <Tag size={28} />
                </div>
                <h3 className="font-extrabold text-sm uppercase">Your shopping bag is clean</h3>
                <p className="text-zinc-550 leading-relaxed text-xs">Verify your active lists or browse apparel, toys, strollers, and wellness formulas inside our premium collections catalog.</p>
                <button
                  onClick={() => setView('collection')}
                  className={`py-2.5 px-6 text-white font-bold rounded-xl cursor-pointer ${colors.bg}`}
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-4">
                  {cartDetailedItems.map(({ item, product }) => {
                    return (
                      <div
                        key={`${product.id}-${item.selectedSize}`}
                        className="bg-white border rounded-2xl p-4 shadow-xs flex gap-4 items-center justify-between text-xs"
                      >
                        <div className="flex gap-3 items-center min-w-0">
                          <img src={product.images[0]} alt={product.name} referrerPolicy="no-referrer" className="w-16 h-16 object-cover bg-neutral-50 rounded-xl" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-zinc-950 leading-tight truncate hover:underline cursor-pointer" onClick={() => handleViewProduct(product.id)}>{product.name}</h4>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mt-0.5">{product.brand}</p>
                            <div className="flex gap-2 text-[10px] text-zinc-500 mt-1">
                              {item.selectedSize && <span>Size: <strong className="text-zinc-700">{item.selectedSize}</strong></span>}
                              {item.selectedColor && <span>Color: <strong className="text-zinc-700">{item.selectedColor}</strong></span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                          {/* Quantity selector */}
                          <div className="flex items-center border rounded overflow-hidden bg-white shrink-0">
                            <button
                              onClick={() => handleUpdateCartQuantity(product.id, item.selectedSize || '', item.selectedColor || '', -1)}
                              className="px-2 py-1 hover:bg-neutral-100 text-zinc-555 font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 text-zinc-900 font-bold font-mono">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateCartQuantity(product.id, item.selectedSize || '', item.selectedColor || '', 1)}
                              className="px-2 py-1 hover:bg-neutral-100 text-zinc-555 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-bold text-zinc-950 font-mono text-sm shrink-0">₹{product.price * item.quantity}</span>

                          <button
                            id={`remove-cart-${product.id}`}
                            onClick={() => handleRemoveFromCart(product.id, item.selectedSize || '', item.selectedColor || '')}
                            className="text-red-500 hover:text-red-600 font-bold shrink-0"
                            title="Remove item"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing side summary */}
                <div className="space-y-4">
                  <div className="bg-neutral-50 border rounded-3xl p-6 text-xs space-y-4">
                    <h3 className="font-black text-sm uppercase text-zinc-900 border-b pb-2">Nursery Cart Summary</h3>
                    
                    <div className="space-y-2 text-zinc-700">
                      <p className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="font-bold text-zinc-950 font-mono">₹{cartSubtotal}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Simulated Taxes (12% GST)</span>
                        <span className="font-mono">₹{Math.round(cartSubtotal * 0.12)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Express Carrier Cargo</span>
                        <span>{cartSubtotal > 999 ? <strong className="text-emerald-600 font-bold underline">FREE</strong> : '₹99'}</span>
                      </p>
                    </div>

                    <div className="border-t border-dashed pt-3 flex justify-between items-baseline font-black text-sm text-zinc-950">
                      <span>Subtotal amount</span>
                      <span className="text-base font-mono">₹{cartSubtotal + (cartSubtotal > 999 ? 0 : 99) + Math.round(cartSubtotal * 0.12)}</span>
                    </div>

                    <button
                      id="cart-checkout-trigger"
                      onClick={() => setView('checkout')}
                      className={`w-full text-white py-3 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${colors.bg}`}
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: CHECKOUT INTEGRATOR STEPS */}
        {currentView === 'checkout' && (
          <CheckoutSteps
            cart={cart}
            products={products}
            addresses={addresses}
            onAddAddress={handleAddAddress}
            promoCodes={PROMO_CODES}
            onPlaceOrder={handlePlaceOrder}
            onClearCart={() => setCart([])}
            setView={setView}
            themeColorId={themeConfig.primaryColor}
          />
        )}

        {/* VIEW 7: ACCOUNT HUB PORTAL */}
        {currentView === 'account' && (
          <AccountDashboardView
            loggedInUser={loggedInUser}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            addresses={addresses}
            onAddAddress={handleAddAddress}
            onRemoveAddress={handleRemoveAddress}
            onSetDefaultAddress={handleSetDefaultAddress}
            orders={orders}
            themeColorId={themeConfig.primaryColor}
            setView={setView}
            registeredUsers={localRegisteredUsers}
            products={products}
            cart={cart}
            wishlist={wishlist}
            recentlyViewed={recentlyViewed}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onViewProductDetail={handleViewProduct}
            onClearRecent={() => setRecentlyViewed([])}
          />
        )}

        {/* VIEW 8: WISHLIST VIEW */}
        {currentView === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-xs text-left space-y-6">
            <h2 className="text-lg md:text-xl font-black text-neutral-900 border-b pb-3 uppercase tracking-wider">My parenting Wishlist ({wishlist.length} item favorites)</h2>
            
            {wishlist.length === 0 ? (
              <div className="max-w-md mx-auto text-center py-20 bg-white border rounded-3xl p-6 shadow-xs space-y-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Heart size={20} className="fill-rose-500 text-rose-500" />
                </div>
                <h4 className="font-bold text-zinc-950 uppercase">Wishlist is entirely clear</h4>
                <p className="text-zinc-500 text-xs">Bookmark clothes, gear strollers, or toys and check them out at once later.</p>
                <button onClick={() => setView('collection')} className={`py-2 px-6 text-white text-[10px] font-bold rounded-lg cursor-pointer ${colors.bg}`}>
                  Find Baby Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.filter(p => wishlist.includes(p.id)).map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    themeColorId={themeConfig.primaryColor}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={true}
                    onViewProductDetail={handleViewProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 9: ABOUT US PAGE */}
        {currentView === 'about' && (
          <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-xs text-left space-y-6">
            <h2 className="text-xl md:text-3xl font-black text-neutral-950 uppercase border-b pb-3">Our Parenting Journey</h2>
            <p className="text-zinc-650 leading-relaxed text-sm">
              Founded on the singular mission of bringing ultimate micro-comfort to children and hassle-free peace of mind to new mothers, our Baby Van premium platform provides curated safety solutions under one continuous digital hub.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs">
              <div className="bg-white border rounded-3xl p-6 space-y-2 shadow-xs">
                <span className="text-rose-600 font-extrabold text-lg">👼 100% Cotton Comforts</span>
                <p className="text-zinc-500 leading-relaxed">
                  Every apparel line item is strictly GOTS Organic Certified. This guarantees zero synthetic chemicals close to tender infant skins, avoiding irritation breakouts.
                </p>
              </div>

              <div className="bg-white border rounded-3xl p-6 space-y-2 shadow-xs">
                <span className="text-teal-600 font-extrabold text-lg">🛡️ Saliva & Drop Safety checks</span>
                <p className="text-zinc-500 leading-relaxed">
                  Our toys undergo physical pressure stress drops, avoiding choking shards, and rely wholly on medical-grade lead-free organic wood elements.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 10: FAQ LIST */}
        {currentView === 'faq' && (
          <div className="max-w-3xl mx-auto px-4 py-12 font-sans text-xs text-left space-y-6">
            <div className="text-center space-y-1 pb-3 border-b">
              <h2 className="text-xl md:text-3xl font-black text-zinc-950 uppercase">Nursery Care FAQ Guides</h2>
              <p className="text-zinc-500">Every answers surrounding shipping speeds, physical safety tests, and cash returns.</p>
            </div>

            <div className="space-y-4">
              {INITIAL_FAQS.map((faq, idx) => (
                <div key={idx} className="bg-white border p-5 rounded-2xl shadow-xs space-y-2">
                  <h4 className="font-bold text-zinc-900 text-xs flex gap-2 items-center">
                    <span className="w-5 h-5 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-zinc-500 shrink-0">Q</span>
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-zinc-600 leading-relaxed text-xs pl-7 border-l-2 border-neutral-200">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 11: CONTACT US */}
        {currentView === 'contact' && (
          <div className="max-w-xl mx-auto px-4 py-12 font-sans text-xs text-left space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl md:text-3xl font-black text-zinc-950 uppercase">Contact Customer Care</h2>
              <p className="text-zinc-500">Are you having issues tracking your package? Message our operators directly.</p>
            </div>

            {contactSuccess && (
              <p className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold leading-relaxed">
                {contactSuccess}
              </p>
            )}

            <form onSubmit={handleContactSubmit} className="bg-white border rounded-3xl p-6 shadow-xl space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-650">Inquirer Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="e.g. Priyal Verma"
                  className="w-full p-2.5 bg-neutral-50 rounded border text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-655">Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full p-2.5 bg-neutral-50 rounded border text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-655">Category of Query</label>
                <select
                  value={contactType}
                  onChange={e => setContactType(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 rounded border text-xs bg-white"
                >
                  <option value="Inquiry">General Inquiry</option>
                  <option value="Shipping">Shipping Delivery Tracking</option>
                  <option value="Refund">Refunds / Exchanges</option>
                  <option value="Nursery">Crib Setup Support</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-655">What is your question or message?</label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  placeholder="Describe details regarding sizing, material tags, missing packages..."
                  className="w-full p-2.5 bg-neutral-50 rounded border text-xs"
                />
              </div>

              <button
                id="contact-submit-btn"
                type="submit"
                className={`w-full py-2.5 text-white font-extrabold rounded-lg cursor-pointer ${colors.bg}`}
              >
                Send Message
              </button>
            </form>
          </div>
        )}

        {/* VIEW 12: POLICIES PAGES */}
        {currentView === 'policies' && (
          <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-xs text-left space-y-6">
            <h2 className="text-xl md:text-3xl font-black text-neutral-950 uppercase border-b pb-3">Legal Guidelines & Shop Policies</h2>
            <div className="space-y-6 text-xs text-zinc-600">
              <section className="space-y-2">
                <h4 className="font-extrabold text-zinc-900 border-b pb-1">1. Dispatch & Shipping Guidelines</h4>
                <p className="leading-relaxed font-semibold">
                  We package cargo using temperature-controlled biodegradable wraps directly from verified sanitised hubs. All order transactions are verified up to 10-digit pinpoint checks. Free delivery applies globally for total orders exceeding ₹999 limits.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-zinc-900 border-b pb-1">2. 10-day Zero Stress Exchange terms</h4>
                <p className="leading-relaxed font-semibold">
                  While formulas, nipples, creams, and sanitising bath liquids are strictly non-returnable due to pediatric standards, clothes rompers, sleepwear, and gear strollers are completely eligible for free return exchange credits up to 10 days of verified delivery.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-zinc-900 border-b pb-1">3. Privacy and SSL Certificates</h4>
                <p className="leading-relaxed font-semibold">
                  Our app uses Shopify payments gateway structure incorporating 256-bit hashing code layers. We never access, log, or store raw banking cards or UPI codes, keeping user privacy completely safe.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* VIEW 13: BLOG INSIGHTS HUB */}
        {currentView === 'blog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-xs text-left space-y-6">
            <div className="text-center space-y-1 border-b pb-4">
              <h2 className="text-xl md:text-3xl font-black text-zinc-950 uppercase tracking-tight">Parenting Advice & Wisdom Articles</h2>
              <p className="text-zinc-500">Expert pediatric essays on safe nursery sleep crib designs, cognitive activities, and growth guidelines.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map(post => (
                <div
                  key={post.id}
                  onClick={() => { setActiveProductId(post.id); setView('blog-article'); }}
                  className="bg-white border rounded-3xl overflow-hidden hover:border-neutral-350 shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col md:flex-row"
                >
                  <img src={post.image} className="w-full md:w-1/3 object-cover shrink-0" />
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="bg-neutral-100 text-[9px] font-bold text-zinc-700 px-2 py-0.5 rounded uppercase tracking-wider">{post.category}</span>
                      <h4 className="font-black text-zinc-950 text-sm leading-tight leading-snug">{post.title}</h4>
                      <p className="text-zinc-500 font-semibold text-[11px] leading-relaxed line-clamp-3">{post.summary}</p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold border-t pt-2">
                      <span>{post.author}</span>
                      <span>{post.date} · {post.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 14: BLOG SINGLE VIEW */}
        {currentView === 'blog-article' && activeProductId && (() => {
          const article = blogs.find(b => b.id === activeProductId);
          if (!article) return <div className="p-8 text-center text-xs">Article not found.</div>;
          return (
            <div className="max-w-3xl mx-auto px-4 py-12 font-sans text-xs text-left space-y-6">
              {/* Back CTA */}
              <button onClick={() => setView('blog')} className="text-zinc-500 hover:text-zinc-900 font-bold flex items-center gap-1 cursor-pointer">
                <span>← Back to Articles</span>
              </button>

              <div className="space-y-3">
                <span className="bg-neutral-100 text-zinc-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{article.category}</span>
                <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">{article.title}</h1>
                <p className="text-[11px] text-zinc-400 font-medium">Published on: {article.date} · Written by: <span className="font-bold text-zinc-800">{article.author}</span></p>
              </div>

              <img src={article.image} alt={article.title} className="w-full aspect-video object-cover rounded-3xl" />

              {/* Renders simulated content */}
              <article className="prose max-w-none text-xs text-zinc-700 leading-relaxed space-y-4">
                <p className="text-sm font-semibold text-zinc-900 italic border-l-4 border-zinc-950 pl-3">
                  {article.summary}
                </p>

                {/* Preformatted layout to fit multi-line markdown logs */}
                <div className="whitespace-pre-wrap leading-relaxed text-zinc-600">
                  {article.content}
                </div>
              </article>

              <div className="pt-8 border-t space-y-4">
                <h4 className="font-black text-neutral-900 uppercase">Need Safe Products listed?</h4>
                <button
                  onClick={() => { setView('collection'); setActiveCategoryId('nursery'); }}
                  className={`py-2 px-6 text-white rounded-lg font-bold cursor-pointer ${colors.bg}`}
                >
                  Shop Crib Mattress and CoSleeper beds
                </button>
              </div>

            </div>
          );
        })()}

        {/* VIEW 15: BRAND DETAILS VIEW */}
        {currentView === 'brands' && activeBrandId && (() => {
          const entry = brands.find(b => b.id === activeBrandId);
          if (!entry) return <div className="p-8 text-center text-xs">Brand not found.</div>;
          const brandedProducts = products.filter(p => p.brand.toLowerCase() === entry.name.toLowerCase());
          
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-xs text-left space-y-6">
              <div className="bg-neutral-50 rounded-3xl p-6 md:p-8 border border-neutral-150 relative space-y-3">
                <div className="flex gap-4 items-center">
                  <div className={`w-14 h-14 rounded-full ${colors.bg} text-white flex items-center justify-center font-black tracking-tighter text-base`}>
                    {entry.logo}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-zinc-950">{entry.name}</h2>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Founded Year: {entry.founded} · Specialty: {entry.specialty}</p>
                  </div>
                </div>
                <p className="text-zinc-600 leading-relaxed text-xs max-w-2xl font-medium">{entry.description}</p>
              </div>

              <h3 className="font-black text-zinc-900 uppercase border-b pb-2 text-sm tracking-wide">
                Official Catalog Inventory ({brandedProducts.length} results)
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brandedProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    themeColorId={themeConfig.primaryColor}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.includes(p.id)}
                    onViewProductDetail={handleViewProduct}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {/* VIEW 16: OFFERS / DISCOUNT CORNER */}
        {currentView === 'offers' && (
          <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-xs text-left space-y-6">
            <div className="text-center space-y-1 border-b pb-4">
              <h2 className="text-xl md:text-3xl font-black text-zinc-900 uppercase">Flash Discount Coupon Codes</h2>
              <p className="text-zinc-500">Copy these active codes on checkout page to get instant percentage flat subtractions!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROMO_CODES.map((promo, idx) => (
                <div key={idx} className="bg-white border p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:border-neutral-450 transition relative overflow-hidden">
                  <div className="absolute -top-1 md:top-2 right-2 rotate-6 text-red-500 font-extrabold text-[44px] uppercase tracking-tighter opacity-10 select-none">
                    SALE
                  </div>
                  <div className="space-y-2">
                    <span className="bg-rose-50 text-rose-800 text-[9px] font-bold border rounded px-2.5 py-0.5 inline-block uppercase">Simulated Shopify Code</span>
                    <h3 className="font-black text-zinc-950 uppercase select-all text-sm font-mono tracking-wider">{promo.code}</h3>
                    <p className="text-zinc-500 font-medium leading-relaxed">{promo.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(promo.code);
                      alert(`Successfully copied coupon code: "${promo.code}" to check out bag!`);
                    }}
                    className={`mt-4 py-2 font-bold hover:scale-[1.01] active:scale-[0.99] text-white text-[10px] uppercase rounded-xl transition cursor-pointer text-center ${colors.bg}`}
                  >
                    Copy Promotional Code
                  </button>
                </div>
              ))}
            </div>

            {/* Featured discounted products catalog preview */}
            <h3 className="font-black text-zinc-950 uppercase border-b pt-6 pb-2">Top promotional deals inside clothing & apparel</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.filter(p => p.originalPrice !== undefined).map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  themeColorId={themeConfig.primaryColor}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlist.includes(p.id)}
                  onViewProductDetail={handleViewProduct}
                />
              ))}
            </div>

          </div>
        )}

      </main>

      {/* ----------------------------------------
          GENEROUS FOOTER LAYOUT
          ---------------------------------------- */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.4)] border-t border-slate-800 font-sans text-xs text-left shrink-0 pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <h4 className="font-black text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5 leading-none">
              <span className={`w-3.5 h-3.5 rounded bg-white text-slate-900 border font-extrabold flex items-center justify-center text-[10px]`}>B</span>
              <span>Baby Van Boutique</span>
            </h4>
            <p className="text-[11px] leading-relaxed select-none text-slate-400">
              Complete fully-functional baby products ecosystem. Fully mobile responsive, featuring Online Store 2.0 dynamic customizable segments and localized caching persistence.
            </p>
            <div className="text-[10px] text-slate-400 space-y-0.5">
              <p>📍 Mumbai corporate safety office</p>
              <p>📞 Helpline Support: <span className="text-white font-mono">{themeConfig.contactPhone}</span></p>
              <p>✉️ Inbox Care: <span className="text-white select-all">{themeConfig.contactEmail}</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">Nursery Categories</h4>
            <div className="flex flex-col gap-2 font-medium">
              <button onClick={() => { setActiveCategoryId('apparel'); setView('collection'); }} className="text-left select-none hover:text-white transition">👕 Organic Clothes rompers</button>
              <button onClick={() => { setActiveCategoryId('diapering'); setView('collection'); }} className="text-left select-none hover:text-white transition">🧼 Skin-safe Diapers</button>
              <button onClick={() => { setActiveCategoryId('toys'); setView('collection'); }} className="text-left select-none hover:text-white transition">🧸 Sensory Developmental Toys</button>
              <button onClick={() => { setActiveCategoryId('gear'); setView('collection'); }} className="text-left select-none hover:text-white transition">🚗 Auto cabin Folding strollers</button>
              <button onClick={() => { setActiveCategoryId('nursery'); setView('collection'); }} className="text-left select-none hover:text-white transition">🛌 Bamboo Crib bedding</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">Parenting Advices</h4>
            <div className="flex flex-col gap-2 font-medium">
              <button onClick={() => setView('blog')} className="text-left select-none hover:text-white transition">🩺 Pediatric advice columns</button>
              <button onClick={() => setView('faq')} className="text-left select-none hover:text-white transition">❓ Frequently Asked Questions</button>
              <button onClick={() => setView('about')} className="text-left select-none hover:text-white transition">🎒 Our organic yarn journey</button>
              <button onClick={() => setView('contact')} className="text-left select-none hover:text-white transition">📬 Contact support helpdesk</button>
              <button onClick={() => setView('policies')} className="text-left select-none hover:text-white transition">⚖️ Legal terms & SSL keys</button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">Parenting Newsletter</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">Join the Baby Van Parenting club to receive active code releases.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Success! Email successfully registered to organic parenting guides.');
              }}
              className="flex gap-1.5"
            >
              <input
                type="email"
                required
                placeholder="parent@example.com"
                className="p-2 bg-slate-800 border border-slate-700 rounded text-[11px] w-full text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className={`py-1.5 px-3 rounded text-white font-bold uppercase transition cursor-pointer text-[10px] shrink-0 ${colors.bg}`}
              >
                Join
              </button>
            </form>
            <div className="flex gap-2 text-slate-500 text-[10px] items-center">
              <ShieldCheck size={14} className="text-slate-400" />
              <span>SSL Secure Certified</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 font-medium">
          <p>© 2026 Baby Van Premium Baby Products Inc. Inspired layout platform.</p>
          <div className="flex gap-4 pt-3 md:pt-0">
            <button onClick={() => setView('policies')} className="hover:text-white select-none">Privacy policies</button>
            <span>·</span>
            <button onClick={() => setView('policies')} className="hover:text-white select-none">Cargo Shipping rates</button>
            <span>·</span>
            <button onClick={() => setView('policies')} className="hover:text-white select-none">Returns Exchanges</button>
          </div>
        </div>
      </footer>

      {/* ----------------------------------------
          MOBILE HEADING APP PORTAL BOTTOM NAVIGATION
          ---------------------------------------- */}
      <BottomNavigation
        currentView={currentView}
        setView={setView}
        cart={cart}
        wishlist={wishlist}
        themeColorId={themeConfig.primaryColor}
        setIsSearchModalOpen={setIsSearchModalOpen}
        setActiveCategory={setActiveCategoryId}
      />

      {/* ----------------------------------------
          AJAX SHOPPING CART DRAWER (SLIDE-OUT)
          ---------------------------------------- */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="w-full max-w-sm bg-white h-screen overflow-y-auto flex flex-col shadow-2xl animate-slide-in text-xs text-left">
            
            {/* Header */}
            <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-1.5">
                <Tag size={15} />
                <span className="font-bold text-sm tracking-wide uppercase">Your Shopping Drawer ({cartDetailedItems.length})</span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartDetailedItems.length === 0 ? (
                <div className="text-center py-16 space-y-4 text-zinc-400">
                  <div className="w-12 h-12 rounded bg-neutral-100 flex items-center justify-center mx-auto">
                    📬
                  </div>
                  <p>Your dynamic basket drawer is empty.</p>
                  <button onClick={() => { setCartOpen(false); setView('collection'); }} className={`py-1.5 px-4 text-white rounded font-bold cursor-pointer ${colors.bg}`}>
                    Browse diaper pants
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 divide-y divide-neutral-100 pr-1">
                  {cartDetailedItems.map(({ item, product }) => (
                    <div key={`${product.id}-${item.selectedSize}`} className="flex gap-3 pt-3.5 first:pt-0">
                      <img src={product.images[0]} alt={product.name} referrerPolicy="no-referrer" className="w-12 h-12 object-cover rounded bg-neutral-50 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 leading-tight truncate hover:underline cursor-pointer" onClick={() => { handleViewProduct(product.id); setCartOpen(false); }}>{product.name}</p>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">{product.brand}</p>
                        <div className="flex gap-2 text-[10px] text-zinc-500 mt-1">
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        </div>
                        
                        {/* Increments */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateCartQuantity(product.id, item.selectedSize || '', item.selectedColor || '', -1)}
                            className="w-5 h-5 bg-neutral-100 hover:bg-neutral-200 font-bold flex items-center justify-center rounded"
                          >
                            -
                          </button>
                          <span className="font-bold font-mono text-zinc-900 text-[11px]">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQuantity(product.id, item.selectedSize || '', item.selectedColor || '', 1)}
                            className="w-5 h-5 bg-neutral-100 hover:bg-neutral-200 font-bold flex items-center justify-center rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-between shrink-0">
                        <span className="font-bold text-zinc-950 font-mono">₹{product.price * item.quantity}</span>
                        <button
                          onClick={() => handleRemoveFromCart(product.id, item.selectedSize || '', item.selectedColor || '')}
                          className="text-red-500 hover:underline text-[10px] font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total panel */}
            {cartDetailedItems.length > 0 && (
              <div className="p-4 bg-zinc-50 border-t border-neutral-250 mb-0 space-y-3.5">
                <div className="flex justify-between items-baseline font-black border-dashed pb-2 border-b">
                  <span>Cumulative Subtotal:</span>
                  <span className="text-sm font-mono">₹{cartSubtotal}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setCartOpen(false); setView('cart'); }}
                    className="w-full bg-white hover:bg-neutral-100 text-zinc-805 py-2.5 font-bold rounded-lg border cursor-pointer select-none text-center"
                  >
                    View Bags Page
                  </button>
                  <button
                    onClick={() => { setCartOpen(false); setView('checkout'); }}
                    className={`w-full text-white py-2.5 font-bold rounded-lg cursor-pointer transform transition uppercase ${colors.bg}`}
                  >
                    Go Checkout
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 text-center leading-none">Free delivery active on orders exceeding ₹999.</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ----------------------------------------
          MOBILE NATIVE APP SEARCH OVERLAY DIALOG MODAL
          ---------------------------------------- */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-start p-4 md:hidden">
          <div className="bg-white rounded-3xl p-5 w-full space-y-4 animate-slide-up text-left shadow-2xl mt-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-xs uppercase tracking-wider text-zinc-800">Search Baby Toys & Apparel</span>
              <button onClick={() => setIsSearchModalOpen(false)} className="p-1 hover:bg-neutral-100 rounded text-neutral-400 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleMobileSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border rounded-xl text-neutral-800 focus:outline-none"
              />
              <button type="submit" className="absolute right-3 top-3 text-zinc-400 cursor-pointer">
                <Search size={18} />
              </button>
            </form>

            <div className="space-y-1">
              <p className="text-[10px] text-zinc-400 font-extrabold uppercase">Sensory Quick Suggestions</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Apparel', 'Carter\'s', 'Diapering', 'Stroller', 'Toys'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setView('search');
                      setIsSearchModalOpen(false);
                    }}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-zinc-705 rounded-full text-[11px] font-semibold transition cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------
          SHOPIFY LIVE THEME ADMINISTRATOR PANEL
          ---------------------------------------- */}
      <AdminCustomizer
        themeConfig={themeConfig}
        setThemeConfig={setThemeConfig}
        heroBanner={heroBanner}
        setHeroBanner={setHeroBanner}
        enabledSections={enabledSections}
        setEnabledSections={setEnabledSections}
        shopifyConnected={shopifyConnected}
        isShopifyLoading={isShopifyLoading}
        shopifyError={shopifyError}
        onRefreshShopify={() => setShopifyReloadCount(prev => prev + 1)}
        shopifyThemeData={shopifyThemeData}
      />

    </div>
  );
}
