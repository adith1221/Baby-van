import React, { useState } from 'react';
import { Product, CartItem, Address, Order, PromoCode } from '../types';
import { MapPin, CreditCard, Tag, Check, ChevronRight, AlertCircle, ShoppingBag, Truck, Percent, RotateCw, ExternalLink } from 'lucide-react';
import { getThemeClasses } from './ProductCard';
import { getShopifyConfig, createShopifyCheckout } from '../lib/shopify';


interface CheckoutStepsProps {
  cart: CartItem[];
  products: Product[];
  addresses: Address[];
  onAddAddress: (addr: Omit<Address, 'id'>) => void;
  promoCodes: PromoCode[];
  onPlaceOrder: (order: Order) => void;
  onClearCart: () => void;
  setView: (v: string) => void;
  themeColorId: string;
}

export default function CheckoutSteps({
  cart,
  products,
  addresses,
  onAddAddress,
  promoCodes,
  onPlaceOrder,
  onClearCart,
  setView,
  themeColorId
}: CheckoutStepsProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Shipping, 2: Payment, 3: Discounts, 4: Success
  const colors = getThemeClasses(themeColorId);

  // Shopify checkout state helper
  const [shopifyCheckoutLoading, setShopifyCheckoutLoading] = useState(false);
  const [shopifyCheckoutError, setShopifyCheckoutError] = useState<string | null>(null);
  
  const shopifyConfig = getShopifyConfig();
  const isShopifyActive = !!(shopifyConfig.storefrontAccessToken && shopifyConfig.storeDomain);


  // Address picking
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find(a => a.isDefault)?.id || addresses[0]?.id || ''
  );

  // Address addition form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZip, setNewZip] = useState('');

  // Payment form
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('cod');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  // Promo Code form
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');

  // Calculations
  const cartItemsDetailed = cart.map(item => {
    const prod = products.find(p => p.id === item.productId);
    return {
      item,
      product: prod
    };
  }).filter(d => d.product !== undefined) as { item: CartItem; product: Product }[];

  const subtotal = cartItemsDetailed.reduce((acc, curr) => {
    return acc + (curr.product.price * curr.item.quantity);
  }, 0);

  // Calculate discount
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedPromo.value) / 100);
    } else {
      discountAmount = appliedPromo.value;
    }
  }

  const shipping = subtotal > 999 ? 0 : 99; // Free shipping over 999
  const tax = Math.round(subtotal * 0.12); // 12% standard GST/Tax
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping + tax);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    const found = promoCodes.find(p => p.code === code);

    if (!found) {
      setPromoError('Invalid coupon code. Try FIRSTBABY or TOYJOY20');
      return;
    }

    if (found.minSpend && subtotal < found.minSpend) {
      setPromoError(`Coupon applies only to orders of ₹${found.minSpend} or more.`);
      return;
    }

    setAppliedPromo(found);
    setPromoInput('');
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newLine1 || !newCity || !newState || !newZip) {
      alert('Fill all items please.');
      return;
    }
    const newAddr: Address = {
      id: 'addr-custom-' + Date.now(),
      fullName: newName,
      phone: newPhone,
      addressLine1: newLine1,
      city: newCity,
      state: newState,
      zipCode: newZip,
      country: 'India',
      isDefault: addresses.length === 0
    };
    onAddAddress(newAddr);
    setSelectedAddressId(newAddr.id);
    setShowAddressForm(false);
    
    // Clear outputs
    setNewName('');
    setNewPhone('');
    setNewLine1('');
    setNewCity('');
    setNewState('');
    setNewZip('');
  };

  const currentAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  const handleConfirmOrderSubmit = async () => {
    if (!currentAddress) {
      alert('Please add or select a shipping delivery address before continuing.');
      return;
    }

    if (isShopifyActive) {
      setShopifyCheckoutLoading(true);
      setShopifyCheckoutError(null);
      
      try {
        // Compile lines with Shopify Variant IDs
        const itemsToCheckout = cartItemsDetailed.map(({ item, product }) => {
          let variantId = '';
          
          // Look up if v has selectedOptions matching our choice
          if (product.shopifyVariants && product.shopifyVariants.length > 0) {
            const match = product.shopifyVariants.find((v: any) => {
              if (!v.selectedOptions) return false;
              return v.selectedOptions.every((opt: any) => {
                const name = opt.name.toLowerCase();
                const val = opt.value.toLowerCase();
                if ((name === 'size' || name === 'sizes') && item.selectedSize) {
                  return val === item.selectedSize.toLowerCase();
                }
                if ((name === 'color' || name === 'colors') && item.selectedColor) {
                  return val === item.selectedColor.toLowerCase();
                }
                return true;
              });
            });
            variantId = match?.id || product.shopifyVariants[0]?.id;
          }
          
          return {
            shopifyVariantId: variantId,
            quantity: item.quantity
          };
        }).filter(line => line.shopifyVariantId !== '');

        if (itemsToCheckout.length === 0) {
          throw new Error("No active Shopify product variants found in your cart. Check if your Shopify connection matches current inventory.");
        }

        const checkoutUrl = await createShopifyCheckout(shopifyConfig, itemsToCheckout);
        
        onClearCart();
        // Redirect to Shopify Live Checkout
        window.location.href = checkoutUrl;
        return;
      } catch (err: any) {
        console.error("Shopify Checkout generation failed", err);
        setShopifyCheckoutError(err.message || "Could not generate Shopify Checkout. You can continue with standard in-app simulation below.");
        setShopifyCheckoutLoading(false);
        // Stop going to step 4, let them read the error or bypass if needed
        return;
      }
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv)) {
      alert('Please complete credit card details.');
      return;
    }
    if (paymentMethod === 'upi' && !upiId) {
      alert('Please enter a valid UPI address (e.g. user@paytm)');
      return;
    }

    // Register active order object
    const createdOrder: Order = {
      id: 'OD-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString().split('T')[0],
      status: 'Processing',
      items: cartItemsDetailed.map(d => ({
        productId: d.product.id,
        productName: d.product.name,
        productImage: d.product.images[0],
        brand: d.product.brand,
        price: d.product.price,
        quantity: d.item.quantity,
        selectedSize: d.item.selectedSize,
        selectedColor: d.item.selectedColor
      })),
      shippingAddress: currentAddress,
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' :
                     paymentMethod === 'card' ? 'Credit Card (Paid)' : `UPI: ${upiId}`,
      subtotal,
      discount: discountAmount,
      shipping,
      tax,
      total: grandTotal,
      trackingNumber: 'TRK-' + Math.floor(100000000 + Math.random() * 900000000),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days in future
    };

    onPlaceOrder(createdOrder);
    onClearCart();
    setStep(4); // Trigger Success View
  };

  if (cart.length === 0 && step !== 4) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 font-sans space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag size={30} />
        </div>
        <h3 className="text-sm font-bold text-zinc-900 uppercase">Your Cart is empty</h3>
        <p className="text-zinc-500 text-xs">Add items to your checkout cart before placing an order.</p>
        <button
          onClick={() => setView('home')}
          className={`py-2 px-6 text-white rounded-lg cursor-pointer text-xs font-bold ${colors.bg}`}
        >
          Return to Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      
      {/* Steps indicator bar */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-1.5 md:gap-4 mb-8 text-[11px] font-semibold text-neutral-400">
          <button onClick={() => setStep(1)} className={`flex items-center gap-1 border-b-2 pb-1.5 transition ${step >= 1 ? 'border-zinc-900 text-zinc-900 font-bold' : 'border-transparent'}`} disabled={step < 1}>
            <span className="w-4 h-4 rounded-full bg-zinc-950 text-white font-mono flex items-center justify-center text-[10px]">1</span>
            <span>Shipping</span>
          </button>
          <ChevronRight size={14} />
          <button onClick={() => step >= 2 && setStep(2)} className={`flex items-center gap-1 border-b-2 pb-1.5 transition ${step >= 2 ? 'border-zinc-900 text-zinc-900 font-bold' : 'border-transparent'}`} disabled={step < 2}>
            <span className="w-4 h-4 rounded-full bg-zinc-400 text-white font-mono flex items-center justify-center text-[10px]">2</span>
            <span>Payment</span>
          </button>
          <ChevronRight size={14} />
          <button onClick={() => step >= 3 && setStep(3)} className={`flex items-center gap-1 border-b-2 pb-1.5 transition ${step >= 3 ? 'border-zinc-900 text-zinc-900 font-bold' : 'border-transparent'}`} disabled={step < 3}>
            <span className="w-4 h-4 rounded-full bg-zinc-400 text-white font-mono flex items-center justify-center text-[10px]">3</span>
            <span>Promos & Review</span>
          </button>
        </div>
      )}

      {step === 4 ? (
        /* SUCCESS PAGE COMPONENT */
        <div className="max-w-xl mx-auto text-center py-12 px-6 bg-white border border-neutral-100 rounded-3xl shadow-xl space-y-6 animate-fade-in text-xs">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <Check size={32} className="stroke-[3]" />
          </div>
          <p className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full font-bold uppercase py-1 px-3 inline-block">
            Order successfully registered!
          </p>
          <h2 className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight leading-none">
            Welcome to the Care Family!
          </h2>
          <p className="text-zinc-600 leading-relaxed max-w-sm mx-auto">
            Your shopping order has been successfully logged inside the system database emulator. We are preparing the dispatch packages.
          </p>

          <div className="bg-neutral-50 rounded-2xl p-4 text-left border border-neutral-200 space-y-2 max-w-md mx-auto">
            <p className="font-bold text-zinc-900 border-b pb-1.5">Shipment Metadata</p>
            <p className="text-[11px] text-zinc-750 flex justify-between"><span>Payment Method:</span> <span className="font-semibold text-zinc-900">Paid In full</span></p>
            <p className="text-[11px] text-zinc-750 flex justify-between"><span>Shipping Destination:</span> <span className="font-semibold text-zinc-900">{currentAddress?.fullName} ({currentAddress?.city})</span></p>
            <p className="text-[11px] text-zinc-750 flex justify-between"><span>Delivery Method:</span> <span className="font-semibold text-zinc-950 flex items-center gap-0.5"><Truck size={12} className="text-emerald-600" /> Free Carrier Express</span></p>
          </div>

          <div className="flex gap-3 justify-center max-w-md mx-auto pt-2">
            <button
              onClick={() => setView('home')}
              className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-zinc-800 font-bold rounded-xl cursor-pointer shadow-xs transition"
            >
              Continue Baskets
            </button>
            <button
              onClick={() => {
                setView('account');
              }}
              className={`flex-1 py-2.5 text-white font-bold rounded-xl cursor-pointer shadow-xs transition ${colors.bg}`}
            >
              Check Orders list
            </button>
          </div>
        </div>
      ) : (
        /* MAIN STEPS SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form according to active step */}
          <div className="lg:col-span-2 space-y-6">

            {/* STEP 1: Address select */}
            {step === 1 && (
              <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                    <MapPin size={18} className="text-rose-500" />
                    <span>Shipping delivery address</span>
                  </h3>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    {showAddressForm ? 'Select Address' : '+ Add New Address'}
                  </button>
                </div>

                {showAddressForm ? (
                  /* Form addition */
                  <form onSubmit={handleAddNewAddress} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-600">Full Name</label>
                        <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Sreya Verma" className="w-full p-2.5 bg-white border rounded" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-600">Active Mobile Number</label>
                        <input type="tel" required value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="10 Digit Number" className="w-full p-2.5 bg-white border rounded" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">Flat/Street Address Line 1</label>
                      <input type="text" required value={newLine1} onChange={e => setNewLine1(e.target.value)} placeholder="House floor, block number or street name" className="w-full p-2.5 bg-white border rounded" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-600">City / District</label>
                        <input type="text" required value={newCity} onChange={e => setNewCity(e.target.value)} placeholder="Mumbai" className="w-full p-2.5 bg-white border rounded" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-600">State</label>
                        <input type="text" required value={newState} onChange={e => setNewState(e.target.value)} placeholder="Maharashtra" className="w-full p-2.5 bg-white border rounded" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-600">PIN Code / ZIP</label>
                        <input type="text" required value={newZip} onChange={e => setNewZip(e.target.value)} placeholder="400001" className="w-full p-2.5 bg-white border rounded font-mono" />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 hover:bg-neutral-100 rounded border">Cancel</button>
                      <button type="submit" className={`px-5 py-2 text-white font-bold rounded cursor-pointer ${colors.bg}`}>Add and Apply</button>
                    </div>
                  </form>
                ) : (
                  /* Address Select radio list */
                  <div className="space-y-3">
                    {addresses.length === 0 ? (
                      <p className="text-zinc-500 text-xs text-center py-4">No logged addresses. Click "+ Add New Address" above to write delivery coordinates is required</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex gap-3 ${
                              selectedAddressId === addr.id
                                ? 'border-zinc-950 bg-neutral-50/50 ring-2 ring-zinc-950/20'
                                : 'border-zinc-200 hover:bg-neutral-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="shipping_addr"
                              checked={selectedAddressId === addr.id}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-1 h-4 w-4 text-zinc-800 focus:ring-zinc-800"
                            />
                            <div className="text-xs space-y-1">
                              <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                                {addr.fullName}
                                {addr.isDefault && <span className="bg-neutral-200 text-zinc-700 text-[9px] px-1.5 py-0.2 rounded">Default</span>}
                              </p>
                              <p className="text-zinc-600">{addr.addressLine1}, {addr.city}, {addr.state} - <span className="font-mono font-bold">{addr.zipCode}</span></p>
                              <p className="text-zinc-500">Helpline Phone: <span className="font-mono">{addr.phone}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t flex justify-end">
                      <button
                        onClick={() => setStep(2)}
                        disabled={addresses.length === 0}
                        className={`py-2 px-6 text-white font-bold rounded-xl cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] transition ${
                          addresses.length === 0 ? 'bg-zinc-300 pointer-events-none' : colors.bg
                        }`}
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Payment select */}
            {step === 2 && (
              <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
                <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 pb-3 border-b">
                  <CreditCard size={18} className="text-rose-500" />
                  <span>Choose billing payment method</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition ${
                      paymentMethod === 'cod' ? 'border-zinc-950 bg-neutral-50 ring-2 ring-zinc-900/10' : 'border-zinc-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Option 1</span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-zinc-900 text-xs">Cash on Delivery (COD)</p>
                      <p className="text-[10px] text-zinc-500">Pay cash at arrival desk</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition ${
                      paymentMethod === 'card' ? 'border-zinc-950 bg-neutral-50 ring-2 ring-zinc-900/10' : 'border-zinc-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Option 2</span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-zinc-900 text-xs">Credit & Debit Cards</p>
                      <p className="text-[10px] text-zinc-500">Visa, Mastercard, RuPay</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition ${
                      paymentMethod === 'upi' ? 'border-zinc-950 bg-neutral-50 ring-2 ring-zinc-900/10' : 'border-zinc-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Option 3</span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-zinc-900 text-xs">UPI payments</p>
                      <p className="text-[10px] text-zinc-500">Instant GooglePay / PhonePe</p>
                    </div>
                  </button>
                </div>

                {/* Sub-Forms */}
                {paymentMethod === 'card' && (
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-250 animate-fade-in text-xs space-y-3">
                    <p className="font-bold text-zinc-800">Secure 256-Bit SSL Encrypted Card details</p>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">Cardholder Name</label>
                      <input type="text" placeholder="Johnathan Doe" className="w-full p-2 bg-white border rounded text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        placeholder="4123 5678 9123 4567"
                        className="w-full p-2 bg-white border rounded text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-600">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value.slice(0, 5))}
                          placeholder="08/29"
                          className="w-full p-2 bg-white border rounded text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-600">CVV Pin</label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="***"
                          className="w-full p-2 bg-white border rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-250 animate-fade-in text-xs space-y-2">
                    <p className="font-bold text-zinc-800">Unified Payment Interface</p>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600">Enter Your UPI Address</label>
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="e.g. adith@paytm"
                        className="w-full p-2.5 bg-white border rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t flex justify-between items-center text-xs">
                  <button onClick={() => setStep(1)} className="font-bold text-zinc-500 hover:text-zinc-800">← Back</button>
                  <button
                    onClick={() => setStep(3)}
                    className={`py-2 px-6 text-white font-bold rounded-xl cursor-pointer ${colors.bg}`}
                  >
                    Apply Coupon & Confirm
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Coupons & Placements */}
            {step === 3 && (
              <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                
                {/* Coupon Application */}
                <div className="space-y-3 pb-4 border-b">
                  <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Tag size={14} className="text-rose-500 animate-pulse" />
                    <span>Apply dynamic Shopify promo coupon</span>
                  </h4>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Check out available promo codes listed in footer or use <code className="bg-zinc-100 text-zinc-800 px-1 py-0.2 rounded font-mono font-bold">FIRSTBABY</code> (15% Off) or <code className="bg-zinc-100 text-zinc-800 px-1 py-0.2 rounded font-mono font-bold">TOYJOY20</code> (₹200 Off for ₹1499 limits).
                  </p>

                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      placeholder="e.g. FIRSTBABY"
                      className="flex-1 p-2 bg-neutral-50 hover:bg-neutral-50/80 border border-neutral-200 focus:bg-white text-xs font-mono font-bold text-zinc-900 uppercase placeholder-zinc-400 outline-hidden"
                    />
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white font-bold text-xs rounded transition cursor-pointer ${colors.bg}`}
                    >
                      Apply Code
                    </button>
                  </form>

                  {promoError && (
                    <p className="text-red-500 text-[10px] font-bold flex items-center gap-1">
                      <AlertCircle size={10} />
                      {promoError}
                    </p>
                  )}

                  {appliedPromo && (
                    <p className="text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded text-[10px] font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5 uppercase font-mono font-bold">
                        <Percent size={12} />
                        Coupon Applied: {appliedPromo.code} ({appliedPromo.discountType === 'percentage' ? `${appliedPromo.value}%` : `₹${appliedPromo.value}`} Off)
                      </span>
                      <button
                        id="remove-promo-btn"
                        onClick={() => setAppliedPromo(null)}
                        className="text-red-600 hover:underline hover:text-red-800 text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Remove
                      </button>
                    </p>
                  )}
                </div>

                {/* Confirm overview summary */}
                <div className="space-y-3">
                  <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wide">Shipment Verification</h4>
                  <div className="bg-neutral-50 rounded-2xl p-4 text-xs space-y-1">
                    <p className="flex justify-between text-zinc-650">
                      <span>Shipping Address:</span>
                      <span className="font-bold text-zinc-900">{currentAddress?.fullName}, {currentAddress?.addressLine1}, {currentAddress?.city}</span>
                    </p>
                    <p className="flex justify-between text-zinc-650">
                      <span>Payment Method Selected:</span>
                      <strong className="font-bold text-zinc-950 uppercase">{paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : paymentMethod === 'card' ? 'Visa / Card' : 'UPI Instant Portal'}</strong>
                    </p>
                    {appliedPromo && (
                      <p className="flex justify-between text-emerald-800">
                        <span>Active Coupon:</span>
                        <strong className="font-bold uppercase font-mono">"{appliedPromo.code}" Eligible</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Place button */}
                {isShopifyActive && (
                  <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#F1ECE4] space-y-1 text-[10px] text-zinc-600">
                    <p className="font-bold text-zinc-800 flex items-center gap-1">
                      <ExternalLink size={12} className="text-zinc-650" />
                      <span>Live Shopify checkout session redirect is active.</span>
                    </p>
                    <p>Clicking the payment button below will dynamically request a Shopify Storefront Checkout session and instantly securely forward your basket items to your real payment gateway.</p>
                  </div>
                )}

                {shopifyCheckoutError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-750 rounded text-xs leading-relaxed space-y-1">
                    <p className="font-bold">Error creating Shopify checkout:</p>
                    <p>{shopifyCheckoutError}</p>
                    <p className="text-[10px] font-normal text-zinc-500">Usually happens if product GIDs/variant selections don't match your active storefront, or token permissions are missing.</p>
                  </div>
                )}

                <div className="pt-4 border-t flex justify-between items-center text-xs">
                  <button onClick={() => setStep(2)} className="font-bold text-zinc-500 hover:text-zinc-850">← Change Payment</button>
                  <button
                    id="submit-order-master"
                    onClick={handleConfirmOrderSubmit}
                    disabled={shopifyCheckoutLoading}
                    className={`py-3 px-8 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] transition tracking-wider uppercase flex items-center gap-2 ${colors.bg} ${shopifyCheckoutLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {shopifyCheckoutLoading ? (
                      <>
                        <RotateCw size={15} className="animate-spin" />
                        <span>Generating Shopify Link...</span>
                      </>
                    ) : isShopifyActive ? (
                      <>
                        <ExternalLink size={15} />
                        <span>Go To Shopify Checkout</span>
                      </>
                    ) : (
                      <span>Place Order & Pay ₹{grandTotal}</span>
                    )}
                  </button>
                </div>


              </div>
            )}

          </div>

          {/* Right Column: Order Products Summary */}
          <div className="space-y-6">
            <div className="bg-neutral-50 rounded-3xl border border-neutral-100 p-6 shadow-xs text-xs space-y-4 font-sans">
              <h3 className="font-black text-sm text-zinc-900 uppercase border-b pb-2">Purchase items ({cartItemsDetailed.length})</h3>
              
              {/* Product item listings */}
              <div className="space-y-3 divide-y divide-neutral-150/50 max-h-72 overflow-y-auto pr-1">
                {cartItemsDetailed.map(({ item, product }) => {
                  return (
                    <div key={`${product.id}-${item.selectedSize}`} className="flex gap-3 pt-3 first:pt-0">
                      <img src={product.images[0]} alt={product.name} referrerPolicy="no-referrer" className="w-12 h-12 object-cover rounded bg-white border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold tracking-tight text-zinc-900 leading-tight truncate">{product.name}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wide font-medium">{product.brand} · Qty: {item.quantity}</p>
                        <p className="text-[10px] text-zinc-500 flex gap-2">
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        </p>
                      </div>
                      <span className="font-bold text-zinc-900 shrink-0">₹{product.price * item.quantity}</span>
                    </div>
                  );
                })}
              </div>

              {/* Price Details */}
              <div className="border-t pt-4 space-y-2 mt-4 text-[11px] text-zinc-700">
                <p className="flex justify-between">
                  <span>Cart Items Total</span>
                  <span className="font-bold text-zinc-900">₹{subtotal}</span>
                </p>
                {discountAmount > 0 && (
                  <p className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span>Simulated Tax (12% GST)</span>
                  <span className="font-mono text-zinc-900 font-medium">₹{tax}</span>
                </p>
                <p className="flex justify-between">
                  <span>Carrier Cargo Shipping</span>
                  <span className="font-semibold text-zinc-900">
                    {shipping === 0 ? <strong className="text-emerald-600 font-bold uppercase">FREE</strong> : `₹${shipping}`}
                  </span>
                </p>
                {shipping > 0 && (
                  <p className="text-[9px] text-zinc-400 text-right leading-none">Add ₹{Math.max(0, 999 - subtotal)} more for free delivery</p>
                )}

                <div className="border-t border-dashed border-zinc-300 pt-3 flex justify-between items-baseline font-black text-sm text-zinc-950 mt-2">
                  <span>Grand Total</span>
                  <span className="text-base text-zinc-950">₹{grandTotal}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
