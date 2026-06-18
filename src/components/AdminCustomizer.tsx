import React, { useState } from 'react';
import { ThemeConfig } from '../types';
import { Settings, X, RefreshCw, Palette, Type, Layout, HelpCircle, Save, Wifi, WifiOff, Database, RotateCw, Link2 } from 'lucide-react';
import { getShopifyConfig, saveShopifyConfig, checkShopifyConnection, clearShopifyConfig, ShopifyConfig } from '../lib/shopify';

interface AdminCustomizerProps {
  themeConfig: ThemeConfig;
  setThemeConfig: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  heroBanner: { title: string; subtitle: string; bgImage: string };
  setHeroBanner: React.Dispatch<React.SetStateAction<{ title: string; subtitle: string; bgImage: string }>>;
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
  setEnabledSections: React.Dispatch<React.SetStateAction<any>>;
  shopifyConnected: boolean;
  isShopifyLoading: boolean;
  shopifyError: string | null;
  onRefreshShopify: () => void;
}


const COLOR_SCHEMES = [
  { id: 'honeybee', name: '🐝 Honeybee Black & Gold', primary: '#f59e0b', secondary: '#18181b', bg: 'bg-yellow-500 hover:bg-yellow-600 text-neutral-900 font-extrabold' },
  { id: 'rose', name: 'Rose Love (Baby Van Style)', primary: '#e11d48', secondary: '#f43f5e', bg: 'bg-rose-600 hover:bg-rose-700 text-white' },
  { id: 'emerald', name: 'Organic Soft Emerald', primary: '#059669', secondary: '#10b981', bg: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  { id: 'sky', name: 'Sky Cradle Blue', primary: '#0284c7', secondary: '#0ea5e9', bg: 'bg-sky-600 hover:bg-sky-700 text-white' },
  { id: 'indigo', name: 'Playful Indigo Magic', primary: '#4f46e5', secondary: '#6366f1', bg: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
];

const FONTS = [
  { id: 'font-sans', name: 'Inter (Clean Modern Sans)' },
  { id: 'font-mono', name: 'JetBrains Mono (Technical Technical)' },
  { id: 'font-serif', name: 'Playfair (Premium Classic Serif)' }
];

export default function AdminCustomizer({
  themeConfig,
  setThemeConfig,
  heroBanner,
  setHeroBanner,
  enabledSections,
  setEnabledSections,
  shopifyConnected,
  isShopifyLoading,
  shopifyError,
  onRefreshShopify
}: AdminCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Shopify Local Settings State
  const [shopifyDomain, setShopifyDomain] = useState(() => getShopifyConfig().storeDomain);
  const [shopifyToken, setShopifyToken] = useState(() => getShopifyConfig().storefrontAccessToken);
  const [shopifyVersion, setShopifyVersion] = useState(() => getShopifyConfig().apiVersion || '2024-04');
  const [verifying, setVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestAndSaveShopify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerificationFeedback(null);

    const config: ShopifyConfig = {
      storeDomain: shopifyDomain.trim(),
      storefrontAccessToken: shopifyToken.trim(),
      apiVersion: shopifyVersion.trim()
    };

    const result = await checkShopifyConnection(config);
    setVerifying(false);

    if (result.success) {
      saveShopifyConfig(config);
      setVerificationFeedback({
        success: true,
        message: `Successfully connected to Shopify Store: ${result.shopName || config.storeDomain}!`
      });
      triggerSuccess('Shopify Integration Connected & Saved!');
      onRefreshShopify(); // trigger refetch in App.tsx
    } else {
      setVerificationFeedback({
        success: false,
        message: `Connection failed: ${result.message}`
      });
    }
  };

  const handleDisconnectShopify = () => {
    clearShopifyConfig();
    setShopifyDomain('');
    setShopifyToken('');
    setVerificationFeedback(null);
    triggerSuccess('Shopify Integration Disconnected');
    onRefreshShopify(); // trigger fallback reload in App.tsx
  };


  const updateTitle = (text: string) => {
    setThemeConfig(prev => ({ ...prev, homepageTitle: text }));
  };

  const selectColor = (colorId: string) => {
    let chosen = COLOR_SCHEMES.find(c => c.id === colorId) || COLOR_SCHEMES[0];
    setThemeConfig(prev => ({
      ...prev,
      primaryColor: colorId
    }));
    triggerSuccess('Theme Colors Applied!');
  };

  const selectFont = (fontId: any) => {
    setThemeConfig(prev => ({
      ...prev,
      fontFamily: fontId
    }));
    triggerSuccess('Typography Updated!');
  };

  const toggleSection = (sectionKey: string) => {
    setEnabledSections((prev: any) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const resetAll = () => {
    setThemeConfig({
      primaryColor: 'rose',
      secondaryColor: 'slate',
      fontFamily: 'font-sans',
      homepageTitle: 'Baby Van Premium Boutique',
      bannerHeadline: 'Premium Newborn Carnival',
      bannerSubline: 'Flat 15% OFF on diapers, clothing, toys, and nursery essentials',
      promoBannerText: '✨ SPECIAL DEALS: Use Coupon BABYVAN to get extra 15% discount!',
      contactEmail: 'care@babyvanstore.com',
      contactPhone: '+1-800-KIDS-CARE'
    });
    setHeroBanner({
      title: 'Mom & Baby Premium Carnival',
      subtitle: 'Flat 15% Discount on strollers, organic clothing, diapers & more!',
      bgImage: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1600&auto=format&fit=crop&q=80'
    });
    setEnabledSections({
      promoHeader: true,
      hero: true,
      categories: true,
      brands: true,
      bestSellers: true,
      flashDeals: true,
      blogs: true,
      faqs: true
    });
    triggerSuccess('Restored Theme Defaults!');
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <>
      {/* Floating customize button */}
      <button
        id="admin-customize-fab"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40 bg-zinc-900 text-white rounded-full p-4 shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all outline-none border border-zinc-700 font-sans text-xs uppercase font-bold tracking-widest cursor-pointer"
        title="Admin Customizer Panel"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <Settings size={18} className="animate-spin" style={{ animationDuration: '6s' }} />
        <span>Theme Editor</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-screen overflow-y-auto flex flex-col shadow-2xl border-l border-neutral-100 font-sans">
            
            {/* Header */}
            <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Settings className="text-rose-400" size={18} />
                <div>
                  <h3 className="font-bold text-sm tracking-wide uppercase">Shopify Theme Customizer</h3>
                  <p className="text-[10px] text-zinc-400">Sections Everywhere 2.0 Emulator</p>
                </div>
              </div>
              <button
                id="close-customizer-btn"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Notification */}
            {successMsg && (
              <div className="bg-emerald-50 border-y border-emerald-200 text-emerald-800 text-xs px-4 py-2 flex items-center justify-between animate-fade-in">
                <span>{successMsg}</span>
                <span className="text-[10px] font-bold">LIVE INSTANT</span>
              </div>
            )}

            {/* Form list scroll */}
            <div className="p-6 space-y-8 flex-1 overflow-y-auto text-zinc-800 text-xs">
              
              {/* SHOPIFY INTEGRATION CONTROLS */}
              <div className="bg-[#FAF6F0] rounded-2xl border border-[#F1ECE4] p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#F1ECE4] pb-2">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-neutral-900">
                    <Database size={15} className="text-zinc-650" />
                    <span>Shopify Live Connect</span>
                  </div>
                  {shopifyConnected ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span>CONNECTED</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                      <span>LOCAL MOCK</span>
                    </span>
                  )}
                </div>

                {isShopifyLoading && (
                  <div className="flex items-center gap-2 text-rose-600 font-semibold bg-rose-50/50 p-2 rounded border border-rose-100 animate-pulse text-[11px]">
                    <RotateCw size={12} className="animate-spin" />
                    <span>Synchronizing Shopify live catalogue...</span>
                  </div>
                )}

                {shopifyError && (
                  <div className="p-2 bg-red-50 border border-red-200 text-red-750 rounded text-[10px] font-semibold leading-relaxed">
                    <strong>API Request Error:</strong> {shopifyError}
                  </div>
                )}

                <form onSubmit={handleTestAndSaveShopify} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Shopify Domain</label>
                    <input
                      type="text"
                      required
                      placeholder="your-store.myshopify.com"
                      value={shopifyDomain}
                      onChange={(e) => setShopifyDomain(e.target.value)}
                      className="w-full p-2 bg-white border border-neutral-300 rounded text-zinc-850 focus:ring-1 focus:ring-rose-500 font-mono text-[11px] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Storefront Access Token</label>
                    <input
                      type="password"
                      required
                      placeholder="shpat_xxxxxx or Public Token"
                      value={shopifyToken}
                      onChange={(e) => setShopifyToken(e.target.value)}
                      className="w-full p-2 bg-white border border-neutral-300 rounded text-zinc-850 focus:ring-1 focus:ring-rose-500 font-mono text-[11px] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider">API Version</label>
                    <input
                      type="text"
                      required
                      placeholder="2024-04"
                      value={shopifyVersion}
                      onChange={(e) => setShopifyVersion(e.target.value)}
                      className="w-full p-2 bg-white border border-neutral-300 rounded text-zinc-850 focus:ring-1 focus:ring-rose-500 font-mono text-[11px] outline-none"
                    />
                  </div>

                  {verificationFeedback && (
                    <div className={`p-2 rounded text-[11px] font-semibold ${
                      verificationFeedback.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      {verificationFeedback.message}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={verifying}
                      className="flex-1 bg-zinc-900 border border-zinc-700 text-white font-bold py-1.5 px-3 rounded uppercase text-[10px] tracking-wider hover:bg-zinc-805 transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {verifying ? <RotateCw size={11} className="animate-spin" /> : <Link2 size={11} />}
                      <span>{shopifyConnected ? 'Update & Test' : 'Connect Store'}</span>
                    </button>

                    {shopifyConnected && (
                      <button
                        type="button"
                        onClick={handleDisconnectShopify}
                        className="bg-transparent border border-red-200 text-red-650 font-bold py-1.5 px-3 rounded uppercase text-[10px] tracking-wider hover:bg-red-50 transition cursor-pointer"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </form>

                <div className="text-[10px] text-zinc-500 leading-relaxed border-t border-[#F1ECE4] pt-2 space-y-1 bg-[#FFFDFB]/50 p-2.5 rounded-lg border border-neutral-200/50">
                  <p className="font-bold text-zinc-800">💡 Instruction Guide:</p>
                  <p>1. Connect your shop to override parent store products dynamically.</p>
                  <p>2. Integrations support live collections, prices, images, colors and responsive checkouts.</p>
                </div>
              </div>

              {/* Reset Default theme */}
              <div className="flex items-center justify-between bg-zinc-50 rounded-lg p-3">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-zinc-900">Want default config?</h4>
                  <p className="text-[10px] text-zinc-500">Restore default Baby Van layout preset</p>
                </div>
                <button
                  id="reset-theme-btn"
                  onClick={resetAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-300 rounded text-[11px] font-semibold hover:bg-neutral-100 text-zinc-800 cursor-pointer shadow-xs transition"
                >
                  <RefreshCw size={12} />
                  Reset
                </button>
              </div>

              {/* 1. BRAND COLORS */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-900 border-b pb-1">
                  <Palette size={14} className="text-zinc-600" />
                  <span>Dynamic Color Schemes</span>
                </div>
                <p className="text-zinc-500 leading-relaxed text-[11px]">
                  Updates headers, buttons, labels and primary layout indicators globally.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {COLOR_SCHEMES.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => selectColor(scheme.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden flex items-center gap-2 ${
                        themeConfig.primaryColor === scheme.id
                          ? 'border-zinc-900 bg-zinc-50/50 shadow-xs'
                          : 'border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full inline-block shrink-0`} style={{ backgroundColor: scheme.primary }} />
                      <div className="leading-tight">
                        <p className="font-semibold text-[11px]">{scheme.name}</p>
                      </div>
                      {themeConfig.primaryColor === scheme.id && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-zinc-900 rounded-bl flex items-center justify-center text-[8px] text-white font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. TYPOGRAPHY */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-900 border-b pb-1">
                  <Type size={14} className="text-zinc-600" />
                  <span>Interactive Typography</span>
                </div>
                <div className="space-y-1">
                  {FONTS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => selectFont(f.id)}
                      className={`w-full p-2.5 rounded border text-left flex items-center justify-between font-semibold tracking-wide ${
                        themeConfig.fontFamily === f.id
                          ? 'border-zinc-950 bg-zinc-50 text-zinc-950'
                          : 'border-zinc-200 text-zinc-600 hover:bg-neutral-50'
                      }`}
                    >
                      <span className={f.id}>{f.name}</span>
                      {themeConfig.fontFamily === f.id && <span className="text-[10px] text-zinc-900 font-bold">Active</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. HERO BANNER CONTENT */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-900 border-b pb-1">
                  <Layout size={14} className="text-zinc-600" />
                  <span>Main Slider Configuration</span>
                </div>
                
                <div className="space-y-2">
                  <label className="block font-semibold text-zinc-700">Hero Slider Headline</label>
                  <input
                    type="text"
                    value={heroBanner.title}
                    onChange={(e) => setHeroBanner(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border border-zinc-200 rounded text-zinc-900 placeholder-zinc-400 outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-zinc-700">Hero Slider Subtitle</label>
                  <textarea
                    rows={2}
                    value={heroBanner.subtitle}
                    onChange={(e) => setHeroBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full p-2 border border-zinc-200 rounded text-zinc-900 placeholder-zinc-400 outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-zinc-700">Hero Slide Image (WebP Supported)</label>
                  <select
                    value={heroBanner.bgImage}
                    onChange={(e) => setHeroBanner(prev => ({ ...prev, bgImage: e.target.value }))}
                    className="w-full p-2 border border-zinc-200 rounded text-zinc-900 outline-hidden bg-white"
                  >
                    <option value="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1600&auto=format&fit=crop&q=80">
                      Cozy Baby Swaddles Banner
                    </option>
                    <option value="https://images.unsplash.com/photo-1515488042361-404e9250afef?w=1600&auto=format&fit=crop&q=80">
                      Sensory Playroom Toy Hub Banner
                    </option>
                    <option value="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1600&auto=format&fit=crop&q=80">
                      Organic Sleepsuits & Clothes Banner
                    </option>
                  </select>
                </div>
              </div>

              {/* 4. ONLINE STORE 2.0 SECTIONS TOGGLE */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-900 border-b pb-1">
                  <Layout size={14} className="text-zinc-600" />
                  <span>Sections Everywhere 2.0</span>
                </div>
                <p className="text-zinc-500 text-[11px] leading-snug">
                  Toggle which widgets show up on the dynamic homepage dynamically. Simulated drag-and-drop hierarchy.
                </p>

                <div className="space-y-2 pt-1">
                  {Object.keys(enabledSections).map((secKey) => (
                    <label
                      key={secKey}
                      className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                        <span className="capitalize font-semibold text-zinc-900">
                          {secKey.replace(/([A-Z])/g, ' $1')}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enabledSections[secKey]}
                        onChange={() => toggleSection(secKey)}
                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. HEADING PROMO TICKERS & SYSTEM INFO */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-900 border-b pb-1">
                  <HelpCircle size={14} className="text-zinc-600" />
                  <span>Header Notification Ticker</span>
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-zinc-700">Ticker Content Text</label>
                  <input
                    type="text"
                    value={themeConfig.promoBannerText}
                    onChange={(e) => setThemeConfig(prev => ({ ...prev, promoBannerText: e.target.value }))}
                    className="w-full p-2 border border-zinc-200 rounded text-zinc-900 placeholder-zinc-400 outline-hidden font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Support Email</label>
                    <input
                      type="text"
                      value={themeConfig.contactEmail}
                      onChange={(e) => setThemeConfig(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full p-2 border border-zinc-200 rounded text-zinc-900 text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Support Helpline</label>
                    <input
                      type="text"
                      value={themeConfig.contactPhone}
                      onChange={(e) => setThemeConfig(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className="w-full p-2 border border-zinc-200 rounded text-zinc-900 text-[10px]"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 grid grid-cols-1">
              <button
                id="save-theme-btn"
                onClick={() => setIsOpen(false)}
                className="w-full bg-zinc-950 text-white font-bold py-2.5 px-4 rounded-md tracking-wider hover:bg-zinc-800 flex items-center justify-center gap-2 text-xs uppercase cursor-pointer"
              >
                <Save size={14} />
                Save Custom Settings
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
