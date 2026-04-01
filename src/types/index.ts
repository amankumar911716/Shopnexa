export type UserRole = 'customer' | 'seller' | 'admin';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  images: string[];
  categoryId: string;
  categoryName?: string;
  brand: string;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  specifications: Record<string, string>;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isFlashDeal: boolean;
  flashPrice?: number;
  sellerId: string;
  videoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  parentId?: string;
  children?: Category[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

export type PaymentMethod = 'cod' | 'upi' | 'visa' | 'mastercard';
export type PaymentStatus = 'paid' | 'unpaid' | 'pending';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  discount: number;
  status: 'pending' | 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'rejected';
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  sellerId?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  trackingInfo: TrackingStep[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackingStep {
  status: string;
  message: string;
  timestamp: string;
  completed: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  minOrder: number;
  maxDiscount: number;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  sellerId?: string;
  storeName?: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'offer' | 'delivery' | 'system';
  read: boolean;
  createdAt: string;
}

export type PageView = 
  | 'home' 
  | 'products' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'orders' 
  | 'order-detail' 
  | 'wishlist'
  | 'dashboard'
  | 'admin'
  | 'seller'
  | 'profile';

export interface FilterState {
  search: string;
  categoryId: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  brand: string;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popularity';
  inStock: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
  link: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  recentOrders: Order[];
  topProducts: Product[];
  monthlyRevenue: { month: string; revenue: number }[];
}
