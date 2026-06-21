export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory?: string;
  price: number;
  originalPrice?: number; // For discount styling
  images: string[];
  description: string;
  rating: number;
  reviewsCount: number;
  variants: {
    sizes: string[];
    colors: { name: string; class: string }[];
  };
  inStock: boolean;
  stockCount: number;
  features: string[];
  frequentlyBoughtTogether?: string[]; // array of product ids
  shopifyVariants?: {
    id: string;
    title: string;
    price: number;
    availableForSale: boolean;
    selectedOptions: { name: string; value: string }[];
  }[];
  shopifyCollectionIds?: string[];
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Order {
  id: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: {
    productId: string;
    productName: string;
    productImage: string;
    brand: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }[];
  shippingAddress: Address;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Child {
  id: string;
  name: string;
  birthdate: string;
  gender: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  gender?: string;
  childBirthdate?: string; // Legacy or expected date
  dob?: string;            // Customer own Date of Birth
  profileImage?: string;   // Image URL for profile
  children?: Child[];      // Multiple baby profiles
  shopifyAccessToken?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string; // Markdown supported
  category: string;
  author: string;
  date: string;
  image: string;
  readTime: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  founded: string;
  specialty: string;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend?: number;
  description: string;
}

export interface ThemeConfig {
  primaryColor: string; // Tailwind color class or hex, default to rose-500/emerald-500
  secondaryColor: string; // slate/blue/amber
  fontFamily: 'font-sans' | 'font-mono' | 'font-serif';
  homepageTitle: string;
  bannerHeadline: string;
  bannerSubline: string;
  promoBannerText: string;
  contactEmail: string;
  contactPhone: string;
  shopifyThemeSyncEnabled?: boolean;
  shopifyThemeSyncSource?: 'brand' | 'page';
}

export interface ShopifyCollection {
  id: string;
  name: string;
  handle: string;
  description: string;
  image: string;
  count?: number;
}

