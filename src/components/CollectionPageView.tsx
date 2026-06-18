import React, { useState, useMemo } from 'react';
import { Product, Brand } from '../types';
import ProductCard, { getThemeClasses } from './ProductCard';
import { Filter, SlidersHorizontal, RotateCw, CheckCircle, ChevronDown, RefreshCcw } from 'lucide-react';

interface CollectionPageViewProps {
  products: Product[];
  brands: Brand[];
  activeCategoryId: string | null;
  setActiveCategoryId: (c: string | null) => void;
  activeBrandId: string | null;
  setActiveBrandId: (b: string | null) => void;
  themeConfig: any;
  onAddToCart: (productId: string, size: string, color: string) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
  setView: (v: string) => void;
  setActiveProductId: (id: string | null) => void;
}

export default function CollectionPageView({
  products,
  brands,
  activeCategoryId,
  setActiveCategoryId,
  activeBrandId,
  setActiveBrandId,
  themeConfig,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  setView,
  setActiveProductId
}: CollectionPageViewProps) {
  const colors = getThemeClasses(themeConfig.primaryColor);

  // States
  const [selectedBrand, setSelectedBrand] = useState<string>(activeBrandId || '');
  const [maxPrice, setMaxPrice] = useState<number>(12000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>('best-seller');
  const [isInfinite, setIsInfinite] = useState<boolean>(false); // Switch between pagination and infinite scroll

  // Mobile filters open
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  // Sync internal states when parent props change
  React.useEffect(() => {
    if (activeBrandId) {
      setSelectedBrand(activeBrandId);
    }
  }, [activeBrandId]);

  // Reset Filters helper
  const handleResetFilters = () => {
    setSelectedBrand('');
    setActiveBrandId(null);
    setActiveCategoryId(null);
    setMaxPrice(12000);
    setMinRating(0);
    setOnlyInStock(false);
    setSortOption('best-seller');
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (activeCategoryId) {
      const standards = ['apparel', 'diapering', 'toys', 'gear', 'feeding', 'nursery'];
      if (standards.includes(activeCategoryId)) {
        result = result.filter(p => p.category === activeCategoryId);
      } else {
        // Shopify collection GID or custom handle
        // Filter products where product brand, description, name, category, or subCategory contains parts of the target activeCategoryId
        result = result.filter(p => {
          if (p.shopifyCollectionIds && p.shopifyCollectionIds.includes(activeCategoryId)) {
            return true;
          }
          const lowerId = activeCategoryId.toLowerCase();
          // Extract plain name if GID, e.g. gid://shopify/Collection/12345
          const isStandardCandidate = (item: string) => {
            return item.toLowerCase().includes(lowerId) || lowerId.includes(item.toLowerCase());
          };
          
          return isStandardCandidate(p.category) || 
                 isStandardCandidate(p.name) ||
                 isStandardCandidate(p.brand) ||
                 (p.subCategory && isStandardCandidate(p.subCategory));
        });
      }
    }

    // Brand filter
    if (selectedBrand) {
      result = result.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Price Filter
    result = result.filter(p => p.price <= maxPrice);

    // Rating Filter
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Stock Status Filter
    if (onlyInStock) {
      result = result.filter(p => p.inStock);
    }

    // Sort operations
    if (sortOption === 'price-low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'rating-high') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // Best seller fallback: sort by total review counts
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [products, activeCategoryId, selectedBrand, maxPrice, minRating, onlyInStock, sortOption]);

  // Pagination Calculations
  const paginatedProducts = useMemo(() => {
    if (isInfinite) {
      // Infinite scroll simulation: return items from page 1 up to currentPage
      return filteredProducts.slice(0, currentPage * itemsPerPage);
    } else {
      // Classic pagination slice
      const start = (currentPage - 1) * itemsPerPage;
      return filteredProducts.slice(start, start + itemsPerPage);
    }
  }, [filteredProducts, currentPage, isInfinite]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageSelect = (p: number) => {
    setCurrentPage(p);
    // Smooth scroll to catalog top
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleLoadMoreInfinite = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-xs">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTERS (DESKTOP) */}
        <div className="hidden lg:block space-y-6 text-left shrink-0">
          
          <div className="flex items-center justify-between border-b pb-3 mb-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <Filter size={14} />
              <span>Catalog Filters</span>
            </h4>
            <button
              id="desktop-reset-filters-btn"
              onClick={handleResetFilters}
              className="text-[10px] font-semibold text-zinc-400 hover:text-red-500 flex items-center gap-1 cursor-pointer"
            >
              <RotateCw size={10} />
              Reset All
            </button>
          </div>

          {/* Categories select options */}
          <div className="space-y-2">
            <p className="font-bold text-zinc-900 text-[10px] uppercase tracking-wider">Product Categories</p>
            <div className="space-y-1.5 flex flex-col items-start pl-1">
              {[
                { id: '', name: '👦 Display All' },
                { id: 'apparel', name: '👕 Apparel & Clothes' },
                { id: 'diapering', name: '🧼 Diapering & Hygiene' },
                { id: 'toys', name: '🧸 Toys & Gaming' },
                { id: 'gear', name: '🚗 Baby Gear & Strollers' },
                { id: 'feeding', name: '🍼 Feeding & Nursing' },
                { id: 'nursery', name: '🛌 Nursery Bedding' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategoryId(cat.id || null);
                    setCurrentPage(1);
                  }}
                  className={`text-[11px] font-semibold transition py-1 hover:translate-x-1 cursor-pointer ${
                    (activeCategoryId || '') === cat.id ? `${colors.text} font-bold` : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand facet */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <p className="font-bold text-zinc-900 text-[10px] uppercase tracking-wider">By Baby Brands</p>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2.5 bg-white border border-zinc-200 rounded text-[11px] font-semibold cursor-pointer outline-hidden"
            >
              <option value="">Choose All Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Price facet */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-900">
              <span>Max Price</span>
              <span className="font-mono text-zinc-650">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min={200}
              max={15000}
              step={100}
              value={maxPrice}
              onChange={e => {
                setMaxPrice(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full text-zinc-900 accent-neutral-900 h-1 uppercase bg-gray-200 rounded focus:outline-none cursor-pointer"
            />
          </div>

          {/* Ratings facet */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <p className="font-bold text-zinc-900 text-[10px] uppercase tracking-wider">Rating Threshold</p>
            <div className="space-y-1 pl-1">
              {[0, 4.5, 4.7, 4.8].map(stars => (
                <button
                  key={stars}
                  onClick={() => {
                    setMinRating(stars);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left py-1 text-[11px] font-semibold transition hover:text-zinc-900 cursor-pointer flex items-center justify-between ${
                    minRating === stars ? `${colors.text} font-bold` : 'text-zinc-500'
                  }`}
                >
                  <span>{stars === 0 ? 'All Ratings' : `★ ${stars} and above`}</span>
                  {minRating === stars && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Toggles */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100/70 transition">
              <span className="font-bold text-zinc-800 text-[10px] uppercase tracking-wider">In Stock Only</span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => {
                  setOnlyInStock(e.target.checked);
                  setCurrentPage(1);
                }}
                className="h-4 w-4 text-emerald-600 rounded cursor-pointer border-zinc-300"
              />
            </label>
          </div>

          {/* Infinite Scroll Switch */}
          <div className="pt-1">
            <label className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100/70 transition">
              <span className="font-bold text-zinc-800 text-[10px] uppercase tracking-wider">Active Infinite Click</span>
              <input
                type="checkbox"
                checked={isInfinite}
                onChange={e => {
                  setIsInfinite(e.target.checked);
                  setCurrentPage(1); // reset index
                }}
                className="h-4 w-4 text-zinc-950 rounded cursor-pointer border-zinc-300"
              />
            </label>
          </div>

        </div>

        {/* CATALOG RESULTS GRID */}
        <div className="lg:col-span-3 space-y-6">

          {/* Top Controls toolbar bar */}
          <div className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center text-xs">
            <div className="font-semibold text-zinc-500">
              Showing <span className="font-bold text-zinc-900">{filteredProducts.length}</span> luxury matches
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              {/* Mobile Filter toggle */}
              <button
                id="mobile-filters-trigger"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center gap-1.5 py-1.5 px-3 bg-neutral-100 border rounded font-bold cursor-pointer text-zinc-700 active:scale-95 transition"
              >
                <SlidersHorizontal size={13} />
                Filters
              </button>
              
              <div className="flex items-center gap-2 ml-auto md:ml-0">
                <span className="text-zinc-400 font-semibold uppercase text-[10px]">Sort By:</span>
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value)}
                  className="bg-neutral-50 border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-zinc-800 font-semibold cursor-pointer select-none outline-hidden"
                >
                  <option value="best-seller">Popularity (Best sellers)</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="rating-high">Highly Rated</option>
                  <option value="alphabetical">By Alphabetical A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* EMPTY CATALOG STATUS */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border rounded-3xl p-6 shadow-xs max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center mx-auto text-zinc-400">
                <RefreshCcw size={20} className="animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <h4 className="font-bold text-zinc-900 text-sm">No Baby products match</h4>
              <p className="text-zinc-500 text-xs">Try loosening your price sliders or selection of active category filters.</p>
              <button
                onClick={handleResetFilters}
                className={`py-2 px-6 text-white text-xs font-bold rounded-lg cursor-pointer ${colors.bg}`}
              >
                Reset Store Filters
              </button>
            </div>
          ) : (
            <>
              {/* PRODUCT GRID CONTAINER */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {paginatedProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    themeColorId={themeConfig.primaryColor}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlist.includes(p.id)}
                    onViewProductDetail={setActiveProductId}
                  />
                ))}
              </div>

              {/* PAGINATION OR INFINITE LOADING CONTROLS */}
              {isInfinite ? (
                /* INFINITE CLICK */
                currentPage < totalPages && (
                  <div className="text-center pt-8">
                    <button
                      id="infinite-load-more"
                      onClick={handleLoadMoreInfinite}
                      className="py-2.5 px-8 bg-zinc-950 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-zinc-800 active:scale-95 transition cursor-pointer text-xs"
                    >
                      Load More Baby Products
                    </button>
                  </div>
                )
              ) : (
                /* CLASSIC PAGINATION CONTROLS */
                totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-10 text-xs">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageSelect(pageNum)}
                        className={`w-8 h-8 rounded-full border transition cursor-pointer font-bold ${
                          currentPage === pageNum
                            ? 'bg-zinc-950 border-zinc-950 text-white'
                            : 'bg-white text-zinc-650 hover:bg-neutral-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                )
              )}
            </>
          )}

        </div>

      </div>

      {/* MOBILE SLIDE-UP FILTER DRAWER OVERLAYS */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:hidden">
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 animate-slide-up text-left">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-black text-sm uppercase tracking-wide text-zinc-900">Mobile Filter Drawer</h4>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-[11px] font-bold text-red-500 cursor-pointer">
                Confirm & Apply
              </button>
            </div>

            {/* categories list */}
            <div className="space-y-2">
              <p className="font-bold text-zinc-900 text-[10px] uppercase">Categories</p>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: '', name: 'Display All' },
                  { id: 'apparel', name: 'Clothes' },
                  { id: 'diapering', name: 'Hygiene' },
                  { id: 'toys', name: 'Toys' },
                  { id: 'gear', name: 'Gear' },
                  { id: 'feeding', name: 'Feeding' },
                  { id: 'nursery', name: 'Crib' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategoryId(cat.id || null);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                      (activeCategoryId || '') === cat.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-1.5">
              <p className="font-bold text-zinc-900 text-[10px] uppercase">Brands select</p>
              <select
                value={selectedBrand}
                onChange={e => { setSelectedBrand(e.target.value); setCurrentPage(1); }}
                className="w-full p-2 bg-neutral-50 border rounded"
              >
                <option value="">All Brands</option>
                {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-900">
                <span>Maximum Price:</span>
                <span>₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min={200}
                max={15000}
                value={maxPrice}
                onChange={e => { setMaxPrice(Number(e.target.value)); setCurrentPage(1); }}
                className="w-full bg-neutral-200 rounded h-1 cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t">
              <button
                onClick={() => { handleResetFilters(); setMobileFiltersOpen(false); }}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-zinc-700 font-bold rounded-lg cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
