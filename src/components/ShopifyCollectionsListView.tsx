import React, { useState } from 'react';
import { ShopifyCollection, Product } from '../types';
import { ArrowRight } from 'lucide-react';
import { getThemeClasses } from './ProductCard';

interface ShopifyCollectionsListViewProps {
  products: Product[];
  shopifyCollections: ShopifyCollection[];
  setActiveCategory: (id: string | null) => void;
  setView: (v: string) => void;
  themeConfig: any;
}

export default function ShopifyCollectionsListView({
  products,
  shopifyCollections,
  setActiveCategory,
  setView,
  themeConfig
}: ShopifyCollectionsListViewProps) {
  const colors = getThemeClasses(themeConfig.primaryColor);
  const [searchTerm, setSearchTerm] = useState('');

  const getCollectionProductCount = (collectionId: string) => {
    const standards = ['apparel', 'diapering', 'toys', 'gear', 'feeding', 'nursery'];
    if (standards.includes(collectionId)) {
      return products.filter(p => p.category === collectionId).length;
    } else {
      // Shopify collection GID or custom handle
      return products.filter(p => {
        if (p.shopifyCollectionIds && p.shopifyCollectionIds.includes(collectionId)) {
          return true;
        }
        const lowerId = collectionId.toLowerCase();
        const isStandardCandidate = (item: string) => {
          return item.toLowerCase().includes(lowerId) || lowerId.includes(item.toLowerCase());
        };
        return isStandardCandidate(p.category) || 
               isStandardCandidate(p.name) ||
               isStandardCandidate(p.brand) ||
               (p.subCategory && isStandardCandidate(p.subCategory));
      }).length;
    }
  };

  const filtered = shopifyCollections.filter(col =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    col.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 font-sans space-y-8 text-left">
      {/* Grid of collections */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((col) => (
            <div
              key={col.id}
              id={`shopify-col-${col.id}`}
              onClick={() => {
                setActiveCategory(col.id);
                setView('collection');
              }}
              className="bg-white border border-[#F1ECE4]/80 hover:border-neutral-400 rounded-2xl md:rounded-3xl shadow-xs overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 border-b border-neutral-105">
                <img
                  src={col.image}
                  alt={col.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent flex items-end p-4">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-white px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs">
                    {getCollectionProductCount(col.id)} Premium Products
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="flex flex-col space-y-1">
                  <h3 className="font-serif italic text-lg text-zinc-950 font-bold group-hover:text-zinc-900 transition">
                    {col.name}
                  </h3>
                  <p className="text-zinc-500 text-[11px] leading-relaxed line-clamp-2">
                    {col.description}
                  </p>
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono mt-1">
                    {getCollectionProductCount(col.id)} items listed
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F1ECE4]/50">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text} font-mono`}>
                    View Collection
                  </span>
                  <div className={`w-7 h-7 rounded-full bg-neutral-50 group-hover:${colors.bg} group-hover:text-white flex items-center justify-center transition border border-neutral-100`}>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-4">
          <div className="text-3xl">🔍</div>
          <h3 className="text-sm font-bold text-neutral-800">No matching collections found</h3>
          <p className="text-neutral-500 text-xs">Try adjusting your search keywords to locate collections.</p>
        </div>
      )}
    </div>
  );
}
