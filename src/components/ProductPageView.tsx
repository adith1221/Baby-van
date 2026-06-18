import React, { useState, useMemo } from 'react';
import { Product, Review, CartItem } from '../types';
import { getThemeClasses } from './ProductCard';
import ReviewsSection from './ReviewsSection';
import { Star, Truck, Calendar, Share2, Heart, ShieldAlert, ShoppingBag, Plus, Minus, Check, Users } from 'lucide-react';

interface ProductPageViewProps {
  product: Product;
  products: Product[]; // full list for recommendations
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
  onAddToCart: (productId: string, size: string, color: string, qty?: number) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
  themeConfig: any;
  setView: (v: string) => void;
  setActiveProductId: (id: string | null) => void;
}

export default function ProductPageView({
  product,
  products,
  reviews,
  onAddReview,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  themeConfig,
  setView,
  setActiveProductId
}: ProductPageViewProps) {
  const colors = getThemeClasses(themeConfig.primaryColor);

  // States
  const [activeImage, setActiveImage] = useState<string>(product.images[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.variants.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState<string>(product.variants.colors[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState<number>(1);

  // Delivery Pincode Estimator State
  const [pinCode, setPinCode] = useState<string>('');
  const [deliveryResult, setDeliveryResult] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Bundle pricing for "Frequently Bought Together"
  const bundleProducts = useMemo(() => {
    if (!product.frequentlyBoughtTogether) return [];
    return products.filter(p => product.frequentlyBoughtTogether?.includes(p.id));
  }, [product, products]);

  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>([]);

  // Toggle bundle product selection
  const toggleBundleSelection = (id: string) => {
    setSelectedBundleIds(prev =>
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const bundleTotal = useMemo(() => {
    const included = bundleProducts.filter(b => selectedBundleIds.includes(b.id));
    return product.price + included.reduce((sum, b) => sum + b.price, 0);
  }, [product, bundleProducts, selectedBundleIds]);

  const handleAddBundleToCart = () => {
    // 1. Add current product
    onAddToCart(product.id, selectedSize, selectedColor, quantity);

    // 2. Add picked bundle products
    const included = bundleProducts.filter(b => selectedBundleIds.includes(b.id));
    included.forEach(b => {
      onAddToCart(b.id, b.variants.sizes[0] || 'Standard', b.variants.colors[0]?.name || 'Standard', 1);
    });

    alert(`Successfully added product bundle (${1 + included.length} items) to your cart folder!`);
  };

  // Pincode calculation helper
  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setDeliveryResult('');

    const formatted = pinCode.trim();
    if (!/^\d{6}$/.test(formatted)) {
      setPinError('Invalid Code. Please write a real 6-digit Indian Postal Code.');
      return;
    }

    // Simulate different delivery speeds based on digits
    const firstDigit = parseInt(formatted.charAt(0));
    if (firstDigit % 2 === 0) {
      setDeliveryResult(`⚡ FASTEST: We deliver to ${formatted} within 2 days! Eligible for Free Cash on Delivery & Express Cargo.`);
    } else {
      setDeliveryResult(`📦 DISPATCHED: Estimated arrival to ${formatted} within 3-4 business days. Secure transit guaranteed.`);
    }
  };

  const handleShareProduct = () => {
    const mockUrl = `${window.location.origin}/product/${product.id}`;
    navigator.clipboard.writeText(mockUrl).then(() => {
      alert(`Copied product details link to sharing clipboard!\nLink: ${mockUrl}`);
    }).catch(() => {
      alert(`Product detail URL: ${mockUrl}`);
    });
  };

  // Cross-sell Recommendations: products in same category
  const recommendations = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-xs text-left">
      
      {/* Breadcrumb row */}
      <div className="flex items-center gap-1.5 text-zinc-400 font-bold mb-6 text-[10px] uppercase tracking-wider">
        <button onClick={() => setView('home')} className="hover:text-zinc-900 cursor-pointer">Home</button>
        <span>/</span>
        <button onClick={() => { setView('collection'); }} className="hover:text-zinc-900 cursor-pointer">{product.category}</button>
        <span>/</span>
        <span className="text-zinc-650 truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT COLUMN: Gallery & Est */}
        <div className="space-y-6">
          {/* Main Large Visual Frame */}
          <div className="aspect-square bg-neutral-50 rounded-3xl overflow-hidden border border-neutral-100 relative shadow-sm">
            <img src={activeImage} alt={product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            
            {product.originalPrice && (
              <span className="absolute top-4 left-4 bg-red-600 text-white font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                Sale active
              </span>
            )}
          </div>

          {/* Miniature sub-thumbs */}
          <div className="flex gap-2">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 bg-neutral-50 rounded-2xl overflow-hidden border transition cursor-pointer shrink-0 ${
                  activeImage === img ? `border-zinc-900 ring-2 ring-zinc-950/20` : 'border-zinc-200 hover:border-zinc-400'
                }`}
              >
                <img src={img} alt={`sub-view-${index}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* REAL DELIVERY ESTIMATOR */}
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-150 space-y-3.5">
            <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b pb-2">
              <Truck size={15} className="text-zinc-700" />
              <span>Nursery Delivery Locator</span>
            </h4>
            <p className="text-zinc-500 font-medium">Verify actual safety transport speeds and cash-on-delivery availability:</p>

            <form onSubmit={handlePincodeSubmit} className="flex gap-2 text-xs">
              <input
                type="text"
                value={pinCode}
                onChange={e => setPinCode(e.target.value)}
                placeholder="Write Pincode (e.g., 400001)"
                className="flex-1 p-2 bg-white border border-zinc-250 focus:border-zinc-800 rounded font-mono font-bold"
              />
              <button
                type="submit"
                className={`px-4 py-2 text-white font-bold rounded transition cursor-pointer ${colors.bg}`}
              >
                Verify Code
              </button>
            </form>

            {pinError && <p className="text-red-600 text-[10px] font-bold">{pinError}</p>}
            {deliveryResult && (
              <p className="text-emerald-800 font-semibold bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-1.5 leading-normal animate-fade-in">
                <span>✓</span>
                <span>{deliveryResult}</span>
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Swatches & Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p id="p-brand-tag" className="text-xs uppercase font-bold text-neutral-400 tracking-wider font-semibold leading-none">{product.brand}</p>
            <h2 id="p-main-title" className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight leading-snug">{product.name}</h2>
            
            {/* Rating summary */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={15} className={`${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} />
                ))}
              </div>
              <span className="font-bold text-zinc-900">{product.rating} Rating Stars</span>
              <span className="text-neutral-300">|</span>
              <span className="text-zinc-500">{reviews.filter(r => r.productId === product.id).length || product.reviewsCount} Buyer Reviews</span>
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* Pricing Panel */}
          <div className="space-y-1">
            <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest block leading-none">Best Selling Price:</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-black text-zinc-950">₹{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="line-through text-zinc-400 font-semibold text-sm">₹{product.originalPrice}</span>
                  <span className="bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Save ₹{product.originalPrice - product.price}!
                  </span>
                </>
              )}
            </div>
            <p className="text-zinc-400 text-[9px] font-semibold leading-none pt-0.5">Includes all simulated transport taxes and GST credits.</p>
          </div>

          {/* High demand stock warnings */}
          {product.stockCount <= 8 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 flex gap-2 items-center font-bold">
              <ShieldAlert size={16} className="text-amber-600 shrink-0" />
              <span>Hurry up! Custom reserves show only {product.stockCount} bundle kits remaining inside nearest hub.</span>
            </div>
          )}

          {/* Size choices swatches */}
          <div className="space-y-2">
            <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wide">Select Appropriate Size:</span>
            <div className="flex flex-wrap gap-2">
              {product.variants.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition cursor-pointer ${
                    selectedSize === sz
                      ? 'bg-zinc-950 border-zinc-950 text-white shadow-xs'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color choices swatches */}
          {product.variants.colors.length > 0 && (
            <div className="space-y-2">
              <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wide">
                Pick Aesthetic Color: <strong className="text-zinc-900 font-black">{selectedColor}</strong>
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                {product.variants.colors.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col.name)}
                    className={`w-6 h-6 rounded-full border ring-offset-2 transition cursor-pointer ${col.class} ${
                      selectedColor === col.name ? 'ring-2 ring-zinc-800' : 'border-zinc-300'
                    }`}
                    title={col.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions trigger */}
          <div className="flex items-center gap-4 text-xs pt-2">
            <div className="space-y-1 shrink-0">
              <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wide block">Quantity:</span>
              <div className="flex items-center border border-zinc-300 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-zinc-655 font-bold cursor-pointer"
                >
                  <Minus size={12} />
                </button>
                <span className="px-4 py-1 font-bold text-zinc-900 select-none">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-zinc-655 font-bold cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Main Primary adds button */}
            <div className="flex-1 space-y-1 pt-3">
              <button
                id="main-cart-submit"
                onClick={() => {
                  onAddToCart(product.id, selectedSize, selectedColor, quantity);
                  alert(`Successfully added ${quantity} pack(s) of "${product.name}" into your Shopping Bag.`);
                }}
                disabled={!product.inStock}
                className={`w-full py-3 px-6 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                  product.inStock ? colors.bg : 'bg-zinc-400 pointer-events-none'
                }`}
              >
                <ShoppingBag size={14} />
                {product.inStock ? 'Add to Shopping Bag' : 'Out of Stock Option'}
              </button>
            </div>
          </div>

          {/* Wishlist & Share controls */}
          <div className="flex gap-3 text-xs pt-1 border-t border-neutral-100 text-zinc-650">
            <button
              onClick={() => onToggleWishlist(product.id)}
              className="flex-1 py-2 border rounded-xl hover:bg-neutral-50 transition flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
            >
              <Heart size={14} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-zinc-400'} />
              <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
            </button>
            <button
              onClick={handleShareProduct}
              className="flex-1 py-2 border rounded-xl hover:bg-neutral-50 transition flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
            >
              <Share2 size={14} className="text-zinc-400" />
              <span>Share product details</span>
            </button>
          </div>

          <hr className="border-neutral-100" />

          {/* Product description highlights & features list */}
          <div className="space-y-3">
            <h4 className="font-bold text-zinc-950 uppercase text-[10px] tracking-wide">Safety description and Specifications</h4>
            <p className="text-zinc-650 leading-relaxed text-xs font-medium">{product.description}</p>
            
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-1 text-[11px] font-semibold text-zinc-700">
              {product.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold text-sm">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* NEW FEATURE: FREQUENTLY BOUGHT TOGETHER BUNDLES */}
          {bundleProducts.length > 0 && (
            <div className="bg-neutral-50 border border-neutral-150 rounded-3xl p-5 space-y-4 text-left">
              <div className="flex items-center gap-1.5 border-b pb-2">
                <Users size={16} className={`text-zinc-700`} />
                <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wide">Frequently Bought Together</h4>
              </div>

              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Save time and bundle these highly requested matching products. Toggle checkboxes to recalculate total.
              </p>

              <div className="space-y-3 pt-1">
                {/* 1. Primary Product */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center text-emerald-600 bg-emerald-50 rounded text-xs font-bold shrink-0">
                    ✓
                  </div>
                  <img src={product.images[0]} alt="current" className="w-10 h-10 object-cover bg-white border rounded shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-800 leading-tight truncate">This Item: {product.name}</p>
                    <span className="font-black text-zinc-950 text-[11px]">₹{product.price}</span>
                  </div>
                </div>

                {/* 2. Bundle Accessories */}
                {bundleProducts.map(b => {
                  const isChecked = selectedBundleIds.includes(b.id);
                  return (
                    <div key={b.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBundleSelection(b.id)}
                        className="w-4 h-4 text-zinc-850 rounded border-zinc-300 cursor-pointer focus:ring-zinc-800 shrink-0"
                      />
                      <img src={b.images[0]} alt={b.name} className="w-10 h-10 object-cover bg-white border rounded shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-800 leading-tight truncate hover:underline cursor-pointer" onClick={() => setActiveProductId(b.id)}>
                          {b.name}
                        </p>
                        <span className="font-black text-zinc-950 text-[11px]">₹{b.price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total bundle purchase math */}
              <div className="bg-white border rounded-2xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-3">
                <div className="space-y-0.5">
                  <p className="text-zinc-400 text-[10px] font-bold uppercase">Bundle Cumulative Total:</p>
                  <p className="font-black text-zinc-950 text-base">₹{bundleTotal}</p>
                </div>
                <button
                  id="bundle-add-bag"
                  onClick={handleAddBundleToCart}
                  className={`text-white text-[10px] font-bold py-2 px-4 rounded-xl cursor-pointer transition shadow-xs ${colors.bg}`}
                >
                  Add Selected Bundle to Bag
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* RECOMMENDED CROSS-CELL SECTION */}
      {recommendations.length > 0 && (
        <div className="mt-16 space-y-6">
          <h3 className="font-black text-neutral-900 border-b pb-3 uppercase tracking-wider text-sm">
            Suggested Product Recommendations
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recommendations.map(p => {
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveProductId(p.id);
                    setActiveImage(p.images[0]);
                    setQuantity(1);
                  }}
                  className="bg-white border rounded-2xl p-3 shadow-xs hover:shadow-md cursor-pointer flex gap-3 transition hover:border-neutral-350"
                >
                  <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="w-16 h-16 object-cover bg-neutral-50 rounded-xl" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">{p.brand}</p>
                      <h4 className="font-bold text-zinc-800 leading-tight truncate">{p.name}</h4>
                    </div>
                    <span className="font-black text-zinc-950 mt-1">₹{p.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SHOPIFY VERIFIED CUSTOMER REVIEWS WRAPPER */}
      <ReviewsSection
        product={product}
        reviews={reviews}
        onAddReview={onAddReview}
        primaryColorId={themeConfig.primaryColor}
      />

    </div>
  );
}
