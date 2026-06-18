import React, { useState } from 'react';
import { Product } from '../types';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  themeColorId: string;
  onAddToCart: (productId: string, size: string, color: string) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  onViewProductDetail: (productId: string) => void;
}

export function getThemeClasses(colorId: string) {
  switch (colorId) {
    case 'emerald':
      return {
        bg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        text: 'text-emerald-600',
        border: 'border-emerald-600',
        ring: 'focus:ring-emerald-500',
        accentBg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    case 'sky':
      return {
        bg: 'bg-sky-600 hover:bg-sky-700 text-white',
        text: 'text-sky-600',
        border: 'border-sky-600',
        ring: 'focus:ring-sky-500',
        accentBg: 'bg-sky-50 text-sky-800 border-sky-200'
      };
    case 'indigo':
      return {
        bg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        text: 'text-indigo-600',
        border: 'border-indigo-600',
        ring: 'focus:ring-indigo-500',
        accentBg: 'bg-indigo-50 text-indigo-800 border-indigo-200'
      };
    case 'rose':
      return {
        bg: 'bg-rose-600 hover:bg-rose-700 text-white',
        text: 'text-rose-600',
        border: 'border-rose-600',
        ring: 'focus:ring-rose-500',
        accentBg: 'bg-rose-50 text-rose-800 border-rose-200'
      };
    case 'honeybee':
    default:
      return {
        bg: 'bg-yellow-500 hover:bg-amber-500 text-neutral-950 font-bold',
        text: 'text-yellow-600',
        border: 'border-yellow-500',
        ring: 'focus:ring-yellow-400',
        accentBg: 'bg-yellow-50 text-neutral-900 border-yellow-250 font-medium'
      };
  }
}

export default function ProductCard({
  product,
  themeColorId,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onViewProductDetail
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.variants.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState(product.variants.colors[0]?.name || 'Standard');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const colors = getThemeClasses(themeColorId);

  // Calculate percentage discount
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product.id, selectedSize, selectedColor);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setQuickAddOpen(false);
    }, 1500);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-[#FFFDFB] rounded-3xl border border-[#F1ECE4] overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col h-full font-sans cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setQuickAddOpen(false);
      }}
      onClick={() => onViewProductDetail(product.id)}
    >
      {/* Absolute Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {discountPercent > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
            {discountPercent}% OFF
          </span>
        )}
        {!product.inStock && (
          <span className="bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
            Out of stock
          </span>
        )}
        {product.stockCount <= 8 && product.inStock && (
          <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            Only {product.stockCount} left
          </span>
        )}
      </div>

      {/* Wishlist triggers */}
      <button
        id={`wish-btn-${product.id}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product.id);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer bg-white/90 backdrop-blur-xs`}
      >
        <Heart
          id={`wish-icon-${product.id}`}
          size={16}
          className={`${isWishlisted ? 'fill-red-500 text-red-500' : 'text-zinc-400 group-hover:text-red-400'} transition-all`}
        />
      </button>

      {/* Product Image Frame */}
      <div className="relative aspect-square overflow-hidden bg-neutral-50 shrink-0">
        <img
          src={hovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-all duration-500"
        />
        
        {/* Action Tray */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 via-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-1.5">
          <button
            id={`quick-view-${product.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewProductDetail(product.id);
            }}
            className="p-2.5 bg-white/90 hover:bg-white text-zinc-800 rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer"
            title="View Details"
          >
            <Eye size={15} />
          </button>

          {product.inStock && (
            <button
              id={`quick-add-btn-${product.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuickAddOpen(!quickAddOpen);
              }}
              className={`flex-1 py-1.5 px-3 bg-white hover:bg-zinc-50 text-zinc-950 text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-1 hover:scale-105 cursor-pointer`}
            >
              <ShoppingCart size={13} />
              Quick Add
            </button>
          )}
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Stars */}
          <div className="flex items-center justify-between text-neutral-400 text-[10px] font-semibold tracking-wider uppercase mb-1">
            <span>{product.brand}</span>
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-zinc-700 font-bold text-[10px]">{product.rating}</span>
              <span className="text-zinc-400 lowercase font-medium">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h4 className="font-bold text-zinc-800 text-xs md:text-sm leading-snug tracking-tight mb-2 group-hover:text-neutral-900 transition-colors line-clamp-2">
            {product.name}
          </h4>
        </div>

        <div>
          {/* Dynamic variants quick drawers */}
          {quickAddOpen && product.inStock && (
            <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-2.5 mb-3 space-y-2 animate-fade-in text-[10px]" onClick={e => e.stopPropagation()}>
              
              {/* Sizes swatches */}
              <div className="space-y-1">
                <p className="font-semibold text-zinc-500">Pick Size:</p>
                <div className="flex flex-wrap gap-1">
                  {product.variants.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-2 py-0.5 rounded text-[9px] border transition cursor-pointer font-medium ${
                        selectedSize === sz
                          ? 'bg-zinc-950 border-zinc-950 text-white font-bold'
                          : 'bg-white border-zinc-200 text-zinc-600 hover:bg-neutral-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors swatches */}
              {product.variants.colors.length > 0 && (
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500">Pick Color: <span className="text-zinc-800 font-bold">{selectedColor}</span></p>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {product.variants.colors.map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setSelectedColor(col.name)}
                        className={`w-3.5 h-3.5 rounded-full border ring-offset-1 transition cursor-pointer ${col.class} ${
                          selectedColor === col.name ? 'ring-2 ring-zinc-800' : 'border-zinc-300'
                        }`}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm add */}
              <button
                id={`add-bag-confirm-${product.id}`}
                onClick={handleQuickAdd}
                className={`w-full text-white text-[10px] font-bold py-1.5 rounded-md flex items-center justify-center gap-1 cursor-pointer transition ${colors.bg}`}
              >
                {showNotification ? '✓ Added to Cart!' : 'Confirm Quick Add'}
              </button>
            </div>
          )}

          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="font-bold text-zinc-900 text-sm md:text-base">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-zinc-400 line-through text-[11px] font-medium">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
