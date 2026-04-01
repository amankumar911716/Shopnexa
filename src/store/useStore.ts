import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Product, CartItem, WishlistItem, User, UserRole,
  PageView, FilterState, Order, Notification, Banner,
  PaymentMethod, PaymentStatus,
} from '@/types';
import { categories as seedCategories, banners as seedBanners } from '@/data/seed-data';

// ─── Seed data versions — bump these to force reset when seed data changes ───
const USERS_VERSION = 'uv3';

interface AppState {
  // Navigation
  currentPage: PageView;
  previousPage: PageView | null;
  selectedProductId: string | null;
  selectedOrderId: string | null;
  navigateTo: (page: PageView) => void;
  goToProduct: (productId: string) => void;
  goToOrder: (orderId: string) => void;
  goBack: () => void;

  // Products
  products: Product[];
  categories: typeof seedCategories;
  banners: Banner[];
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  getFilteredProducts: () => Product[];
  updateProductStock: (productId: string, stock: number) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  editProduct: (productId: string, data: Partial<Product>) => void;
  syncProductsFromDB: () => void;
  syncProductsFromDBAsync: () => Promise<void>;
  addProductToDB: (product: Product) => void;
  deleteProductFromDB: (productId: string) => void;
  updateProductInDB: (productId: string, data: Partial<Product>) => void;
  ensureSeeded: () => Promise<void>;
  syncOnLogin: () => void;
  syncOrdersFromDB: () => void;
  syncOrdersFromDBAsync: () => Promise<void>;
  deleteUser: (userId: string) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartMRPTotal: () => number;
  getCartCount: () => number;
  
  // Wishlist
  wishlist: WishlistItem[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  registeredUsers: Array<User & { password: string; securityQuestion?: string; securityAnswer?: string }>;
  authError: string;
  login: (email: string, password: string) => string | null;
  register: (name: string, email: string, password: string, role?: UserRole, storeName?: string, securityQuestion?: string, securityAnswer?: string) => string | null;
  resetPassword: (email: string, securityAnswer: string, newPassword: string) => string | null;
  getSecurityQuestion: (email: string) => string | null;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  
  // Orders
  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  togglePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => void;
  
  // Coupons
  appliedCoupon: string | null;
  couponDiscount: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  getUnreadCount: () => number;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchSuggestions: string[];
  
  // UI State
  showCartDrawer: boolean;
  setShowCartDrawer: (show: boolean) => void;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authMode: 'login' | 'register' | 'forgot';
  setAuthMode: (mode: 'login' | 'register' | 'forgot') => void;

  // Persistence
  _hasHydrated: boolean;
  _resetToSeed: () => void;
  _usersVersion?: string;
}

const defaultFilters: FilterState = {
  search: '',
  categoryId: '',
  minPrice: 0,
  maxPrice: 100000,
  minRating: 0,
  brand: '',
  sortBy: 'relevance',
  inStock: false,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentPage: 'home',
  previousPage: null,
  selectedProductId: null,
  selectedOrderId: null,
  
  navigateTo: (page) => set((state) => ({ 
    previousPage: state.currentPage, 
    currentPage: page 
  })),
  
  goToProduct: (productId) => set({ 
    previousPage: get().currentPage, 
    currentPage: 'product-detail', 
    selectedProductId: productId 
  }),
  
  goToOrder: (orderId) => set({ 
    previousPage: get().currentPage, 
    currentPage: 'order-detail', 
    selectedOrderId: orderId 
  }),
  
  goBack: () => set((state) => ({ 
    currentPage: state.previousPage || 'home',
    previousPage: null 
  })),
  
  // Products — start empty, DB is the single source of truth (fetched via ensureSeeded)
  products: [],
  categories: seedCategories,
  banners: seedBanners,
  filters: defaultFilters,
  
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  getFilteredProducts: () => {
    const { products, filters } = get();
    let filtered = [...products];
    
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    
    if (filters.categoryId) {
      // categoryId filter can be either a slug or an id — resolve slug → id
      const cat = get().categories.find(c => c.slug === filters.categoryId);
      const catId = cat ? cat.id : filters.categoryId;
      filtered = filtered.filter(p => p.categoryId === catId);
    }
    
    if (filters.brand) {
      filtered = filtered.filter(p => p.brand === filters.brand);
    }
    
    filtered = filtered.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(p => p.rating >= filters.minRating);
    }
    
    if (filters.inStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }
    
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.sold - a.sold);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.id > a.id ? 1 : -1));
        break;
    }
    
    return filtered;
  },

  updateProductStock: (productId, stock) => set((state) => ({
    products: state.products.map(p => p.id === productId ? { ...p, stock: Math.max(0, stock) } : p),
  })),

  addProduct: (product) => set((state) => ({
    products: [product, ...state.products],
  })),

  deleteProduct: (productId) => set((state) => ({
    products: state.products.filter(p => p.id !== productId),
  })),

  editProduct: (productId, data) => set((state) => ({
    products: state.products.map(p => p.id === productId ? { ...p, ...data } : p),
  })),

  // Product sync with database (callback version — delegates to async)
  syncProductsFromDB: () => {
    get().syncProductsFromDBAsync();
  },

  addProductToDB: (product) => {
    // Add to local state immediately for instant UI
    set((state) => ({ products: [product, ...state.products] }));
    // Persist to database
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    }).catch(() => {});
  },

  deleteProductFromDB: (productId) => {
    // Remove from local state immediately
    set((state) => ({ products: state.products.filter(p => p.id !== productId) }));
    // Delete from database
    fetch('/api/products?id=' + productId, { method: 'DELETE' }).catch(() => {});
  },

  updateProductInDB: (productId, data) => {
    // Update local state immediately
    set((state) => ({
      products: state.products.map(p => p.id === productId ? { ...p, ...data } : p),
    }));
    // Persist to database
    fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId, ...data }),
    }).catch(() => {});
  },

  // Ensure DB is seeded and data is synced. Called on app mount.
  // Uses async/await for reliability — no fragile .then() chains.
  ensureSeeded: async () => {
    try {
      // 0. Migrate any old dates to March 2026+ (fixes data from previous seeds)
      await fetch('/api/migrate', { method: 'POST' }).catch(() => {});

      // 1. Check & seed products
      const prodCheck = await fetch('/api/products/seed').then(r => r.json()).catch(() => null);
      if (!prodCheck?.seeded || prodCheck.productCount === 0) {
        await fetch('/api/products/seed', { method: 'POST' }).catch(() => {});
      }
      // Always sync products from DB (DB is single source of truth)
      await get().syncProductsFromDBAsync();

      // 2. Check & seed orders
      const ordCheck = await fetch('/api/orders/seed').then(r => r.json()).catch(() => null);
      if (!ordCheck?.seeded || ordCheck.orderCount === 0) {
        await fetch('/api/orders/seed', { method: 'POST' }).catch(() => {});
      }
      // Always sync orders from DB (DB is single source of truth)
      await get().syncOrdersFromDBAsync();
    } catch {
      // Silently fail — data stays empty until next successful sync
    }
  },

  // Async version of syncProductsFromDB for use in ensureSeeded
  syncProductsFromDBAsync: async () => {
    try {
      const res = await fetch('/api/products?limit=2000');
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        const mapped = data.products.map((p: Record<string, unknown>) => ({
          id: p.id as string,
          name: p.name as string,
          slug: p.slug as string,
          description: (p.description as string) || '',
          price: p.price as number,
          mrp: p.mrp as number,
          images: (p.images as string[]) || [],
          categoryId: (p.categoryId as string) || '',
          categoryName: (p.categoryName as string) || '',
          brand: (p.brand as string) || '',
          stock: (p.stock as number) || 0,
          sold: (p.sold as number) || 0,
          rating: (p.rating as number) || 0,
          reviewCount: (p.reviewCount as number) || 0,
          specifications: (p.specifications as Record<string, string>) || {},
          tags: (p.tags as string[]) || [],
          isFeatured: (p.isFeatured as boolean) || false,
          isTrending: (p.isTrending as boolean) || false,
          isFlashDeal: (p.isFlashDeal as boolean) || false,
          flashPrice: (p.flashPrice as number) || undefined,
          sellerId: (p.sellerId as string) || '',
          videoUrl: (p.videoUrl as string) || undefined,
        }));
        set({ products: mapped });
      }
    } catch {
      // Keep current state on failure
    }
  },

  // Async version of syncOrdersFromDB for use in ensureSeeded
  syncOrdersFromDBAsync: async () => {
    const currentUser = get().user;
    const currentSellerId = currentUser?.sellerId || currentUser?.id;
    const isAdmin = currentUser?.role === 'admin';
    const url = (currentSellerId && !isAdmin)
      ? '/api/orders?sellerId=' + currentSellerId
      : '/api/orders';
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        const allProducts = get().products;
        const mapped: Order[] = data.map((o: Record<string, unknown>) => {
          const rawItems = (o.items as Array<Record<string, unknown>>) || [];
          const cartItems: CartItem[] = rawItems.map((item) => {
            const fullProduct = allProducts.find((p) => p.id === (item.productId as string));
            if (fullProduct) {
              return { product: fullProduct, quantity: (item.quantity as number) || 1 };
            }
            return {
              product: {
                id: (item.productId as string) || '',
                name: (item.name as string) || 'Unknown Product',
                slug: '',
                description: '',
                price: (item.price as number) || 0,
                mrp: (item.price as number) || 0,
                images: [],
                categoryId: '',
                brand: '',
                stock: 0,
                sold: 0,
                rating: 0,
                reviewCount: 0,
                specifications: {},
                tags: [],
                isFeatured: false,
                isTrending: false,
                isFlashDeal: false,
                sellerId: (o.sellerId as string) || '',
              },
              quantity: (item.quantity as number) || 1,
            };
          });
          return {
            id: o.id as string,
            userId: o.userId as string,
            sellerId: (o.sellerId as string) || '',
            items: cartItems,
            totalAmount: (o.totalAmount as number) || 0,
            discount: (o.discount as number) || 0,
            status: (o.status as Order['status']) || 'placed',
            paymentMethod: (o.paymentMethod as PaymentMethod) || 'cod',
            paymentStatus: (o.paymentStatus as PaymentStatus) || 'pending',
            address: (o.address as string) || '',
            city: (o.city as string) || '',
            state: (o.state as string) || '',
            pincode: (o.pincode as string) || '',
            phone: (o.phone as string) || '',
            trackingInfo: (o.trackingInfo as Order['trackingInfo']) || [],
            createdAt: (o.createdAt as string) || new Date().toISOString(),
            updatedAt: (o.updatedAt as string) || new Date().toISOString(),
          };
        });
        set({ orders: mapped });
      }
    } catch {
      // Keep current state on failure
    }
  },

  // Re-sync data from DB when a seller logs in or switches accounts.
  // This ensures seller isolation: each seller only sees their own products/orders.
  syncOnLogin: () => {
    // Re-sync products from DB (always fetch all for the store)
    get().syncProductsFromDB();
    // Re-sync orders filtered by current seller
    get().syncOrdersFromDB();
  },

  deleteUser: (userId) => set((state) => ({
    registeredUsers: state.registeredUsers.filter(u => u.id !== userId),
  })),
  
  // Cart
  cart: [],
  
  addToCart: (product, quantity = 1) => set((state) => {
    const existing = state.cart.find(item => item.product.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        ),
      };
    }
    return { cart: [...state.cart, { product, quantity }] };
  }),
  
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.product.id !== productId),
  })),
  
  updateCartQuantity: (productId, quantity) => set((state) => ({
    cart: quantity <= 0
      ? state.cart.filter(item => item.product.id !== productId)
      : state.cart.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
  })),
  
  clearCart: () => set({ cart: [], appliedCoupon: null, couponDiscount: 0 }),
  
  getCartTotal: () => {
    const { cart, couponDiscount } = get();
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return Math.max(0, total - couponDiscount);
  },
  
  getCartMRPTotal: () => {
    return get().cart.reduce((sum, item) => sum + item.product.mrp * item.quantity, 0);
  },
  
  getCartCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },
  
  // Wishlist
  wishlist: [],
  
  addToWishlist: (product) => set((state) => {
    if (state.wishlist.find(item => item.product.id === product.id)) return state;
    return { wishlist: [...state.wishlist, { product, addedAt: new Date().toISOString() }] };
  }),
  
  removeFromWishlist: (productId) => set((state) => ({
    wishlist: state.wishlist.filter(item => item.product.id !== productId),
  })),
  
  isInWishlist: (productId) => {
    return get().wishlist.some(item => item.product.id === productId);
  },
  
  // Auth
  user: null,
  isAuthenticated: false,
  authError: '',
  
  registeredUsers: [
    // 👤 Customer Account - Aman Kumar
    {
      id: 'customer_aman',
      name: 'Aman Kumar',
      email: 'cswithaman91customer@shopnexa.com',
      role: 'customer',
      avatar: '',
      phone: '9117196506',
      address: '98, 04 Noorsarai Street, Noorsarai',
      city: 'BiharSharif',
      state: 'Bihar',
      pincode: '803113',
      password: 'AMAN@2026',
      securityQuestion: 'What is your favourite color?',
      securityAnswer: 'orange',
      createdAt: '2026-03-01T10:30:00.000Z',
    },
    // 🏪 Seller Account - Aman's Store
    {
      id: 'seller_aman',
      name: "Aman's Store",
      email: 'cswithaman91seller@shopnexa.com',
      role: 'seller',
      avatar: '',
      phone: '9117196506',
      address: '98, 04 Noorsarai Street, Noorsarai',
      city: 'BiharSharif',
      state: 'Bihar',
      pincode: '803113',
      sellerId: 'seller1',
      storeName: "Aman's Store",
      password: 'AMAN@2026',
      securityQuestion: 'What city were you born in?',
      securityAnswer: 'BiharSharif',
      createdAt: '2026-03-01T10:35:00.000Z',
    },
    // 🛠️ Admin Account - Platform Owner
    {
      id: 'admin_aman',
      name: 'Platform Owner Aman Kumar',
      email: 'cswithaman91admin@shopnexa.com',
      role: 'admin',
      avatar: '',
      phone: '9117196506',
      address: '98, 04 Noorsarai Street, Noorsarai',
      city: 'BiharSharif',
      state: 'Bihar',
      pincode: '803113',
      sellerId: 'admin1',
      storeName: 'Shopnexa Official',
      password: 'AMAN@2026',
      securityQuestion: 'What is your pet name?',
      securityAnswer: 'Shopnexa',
      createdAt: '2026-03-01T00:00:00.000Z',
    },
    // 👤 Demo Customer - Priya
    { id: 'customer_priya', name: 'Priya Sharma', email: 'priya@example.com', role: 'customer', avatar: '', phone: '9876543210', address: 'MG Road, Andheri', city: 'Mumbai', state: 'Maharashtra', pincode: '400058', password: 'pass', createdAt: '2026-03-05T10:30:00.000Z' },
    // 👤 Demo Customer - Rahul
    { id: 'customer_rahul', name: 'Rahul Verma', email: 'rahul@example.com', role: 'customer', avatar: '', phone: '8765432109', address: 'Sector 18, Noida', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', password: 'pass', createdAt: '2026-03-08T15:00:00.000Z' },
    // 👤 Demo Customer - Sneha
    { id: 'customer_sneha', name: 'Sneha Gupta', email: 'sneha@example.com', role: 'customer', avatar: '', phone: '7654321098', address: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033', password: 'pass', createdAt: '2026-03-10T09:00:00.000Z' },
    // 👤 Demo Customer - Amit
    { id: 'customer_amit', name: 'Amit Patel', email: 'amit@example.com', role: 'customer', avatar: '', phone: '7777777777', address: 'CG Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380006', password: 'pass', createdAt: '2026-03-12T08:00:00.000Z' },
    // 🏪 Demo Seller - TechWorld
    { id: 'seller_techworld', name: 'TechWorld Store', email: 'techworld@example.com', role: 'seller', avatar: '', phone: '9999999999', address: 'SP Infocity', city: 'Hyderabad', state: 'Telangana', pincode: '500081', sellerId: 'seller2', storeName: 'TechWorld', password: 'pass', createdAt: '2026-03-02T11:00:00.000Z' },
    // 🏪 Demo Seller - FashionHub
    { id: 'seller_fashionhub', name: 'Fashion Hub', email: 'fashionhub@example.com', role: 'seller', avatar: '', phone: '8888888888', address: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001', sellerId: 'seller3', storeName: 'Fashion Hub', password: 'pass', createdAt: '2026-03-04T14:30:00.000Z' },
    // 🏪 Demo Seller - HomeDecor Plus
    { id: 'seller_homedecor', name: 'HomeDecor Plus', email: 'homedecor@example.com', role: 'seller', avatar: '', phone: '6666666666', address: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', sellerId: 'seller4', storeName: 'HomeDecor Plus', password: 'pass', createdAt: '2026-03-06T12:00:00.000Z' },
  ],

  login: (email, password) => {
    const userRecord = get().registeredUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!userRecord) {
      set({ authError: 'No account found with this email. Please register first.' });
      return 'No account found';
    }

    if (userRecord.password !== password) {
      set({ authError: 'Wrong password. Please try again.' });
      return 'Wrong password';
    }

    const { password: _pw, ...userData } = userRecord;
    set({ user: userData, isAuthenticated: true, showAuthModal: false, authError: '' });
    get().addNotification({
      title: 'Welcome back!',
      message: 'You\'ve logged in as ' + userData.name + (userData.role === 'seller' ? ' (Seller)' : userData.role === 'admin' ? ' (Admin)' : ''),
      type: 'system',
    });
    // Re-sync data from DB for proper seller isolation
    setTimeout(() => get().syncOnLogin(), 300);
    return null;
  },

  register: (name, email, password, role, storeName, securityQuestion, securityAnswer) => {
    const trimmedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const exists = get().registeredUsers.find(
      u => u.email.toLowerCase() === trimmedEmail
    );
    if (exists) {
      set({ authError: 'An account with this email already exists. Please login instead.' });
      return 'Email already registered';
    }

    // Validate password length
    if (password.length < 4) {
      set({ authError: 'Password must be at least 4 characters long.' });
      return 'Password too short';
    }

    const userId = 'user_' + Date.now();
    const userRole = role || 'customer';
    const isSeller = userRole === 'seller' || userRole === 'admin';

    const newRecord: User & { password: string; securityQuestion?: string; securityAnswer?: string } = {
      id: userId,
      name: name.trim(),
      email: trimmedEmail,
      role: userRole,
      avatar: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      sellerId: isSeller ? userId : undefined,
      storeName: isSeller ? (storeName || name.trim() + "'s Store") : undefined,
      password,
      securityQuestion: securityQuestion || undefined,
      securityAnswer: securityAnswer || undefined,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      registeredUsers: [...state.registeredUsers, newRecord],
      authError: '',
    }));

    // Auto-login after register
    const { password: _pw, ...userData } = newRecord;
    set({ user: userData, isAuthenticated: true, showAuthModal: false });
    get().addNotification({
      title: isSeller ? 'Seller Account Created!' : 'Account created!',
      message: isSeller
        ? 'Welcome to Shopnexa, ' + name + '! Your store "' + newRecord.storeName + '" is ready. Start adding products!'
        : 'Welcome to Shopnexa, ' + name + '!',
      type: 'system',
    });
    // Re-sync data from DB for proper seller isolation
    setTimeout(() => get().syncOnLogin(), 300);
    return null;
  },

  getSecurityQuestion: (email) => {
    const userRecord = get().registeredUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim()
    );
    if (!userRecord) return null;
    return userRecord.securityQuestion || null;
  },

  resetPassword: (email, securityAnswer, newPassword) => {
    const trimmedEmail = email.toLowerCase().trim();
    const userRecord = get().registeredUsers.find(
      u => u.email.toLowerCase() === trimmedEmail
    );
    if (!userRecord) {
      set({ authError: 'No account found with this email.' });
      return 'No account found';
    }

    if (!userRecord.securityQuestion || !userRecord.securityAnswer) {
      set({ authError: 'This account does not have a security question set. Please contact support.' });
      return 'No security question';
    }

    if (securityAnswer.trim().toLowerCase() !== userRecord.securityAnswer.toLowerCase()) {
      set({ authError: 'Wrong answer. Please try again.' });
      return 'Wrong answer';
    }

    if (newPassword.length < 4) {
      set({ authError: 'New password must be at least 4 characters.' });
      return 'Password too short';
    }

    set((state) => ({
      registeredUsers: state.registeredUsers.map(u =>
        u.email.toLowerCase() === trimmedEmail ? { ...u, password: newPassword } : u
      ),
      authError: '',
    }));

    set({ authError: '' });
    return null;
  },

  logout: () => set({ user: null, isAuthenticated: false, authError: '' }),

  updateProfile: (data) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updatedUser: User = { ...currentUser, ...data };
    set((state) => ({
      user: updatedUser,
      registeredUsers: state.registeredUsers.map(u =>
        u.id === currentUser.id ? { ...u, ...data } : u
      ),
    }));
    get().addNotification({
      title: 'Profile Updated',
      message: 'Your profile has been saved successfully.',
      type: 'system',
    });
  },
  
  // Orders — start empty, DB is the single source of truth
  orders: [],
  
  placeOrder: (order) => {
    const id = 'ORD' + Date.now().toString().slice(-8);
    const currentUser = get().user;
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    
    // Persist to database permanently
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newOrder,
        id,
        sellerId: currentUser?.sellerId || currentUser?.id || order.items?.[0]?.product?.sellerId || '',
      }),
    }).catch(() => {});
    
    get().addNotification({
      title: 'Order Placed!',
      message: `Order ${id} has been placed successfully`,
      type: 'order',
    });
    
    get().clearCart();
    return id;
  },
  
  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o),
    }));
    // Persist to database permanently
    fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status }),
    }).catch(() => {});
  },

  deleteOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.filter(o => o.id !== orderId),
    }));
    // Permanently delete from database
    fetch('/api/orders?id=' + orderId, { method: 'DELETE' }).catch(() => {});
  },

  togglePaymentStatus: (orderId, paymentStatus) => {
    set((state) => ({
      orders: state.orders.map(o => o.id === orderId ? { ...o, paymentStatus, updatedAt: new Date().toISOString() } : o),
    }));
    // Persist to database permanently
    fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, paymentStatus }),
    }).catch(() => {});
  },

  // Sync orders from database (callback version — delegates to async)
  syncOrdersFromDB: () => {
    get().syncOrdersFromDBAsync();
  },

  // Coupons
  appliedCoupon: null,
  couponDiscount: 0,
  
  applyCoupon: (code) => {
    const coupons: Record<string, { discount: number; minOrder: number; maxDiscount: number }> = {
      'SAVE10': { discount: 10, minOrder: 500, maxDiscount: 200 },
      'FLAT20': { discount: 20, minOrder: 1000, maxDiscount: 500 },
      'WELCOME': { discount: 15, minOrder: 0, maxDiscount: 300 },
      'MEGA50': { discount: 50, minOrder: 2000, maxDiscount: 1000 },
    };
    
    const coupon = coupons[code.toUpperCase()];
    if (!coupon) return false;
    
    const cartTotal = get().getCartTotal();
    if (cartTotal < coupon.minOrder) return false;
    
    const discount = Math.min((cartTotal * coupon.discount) / 100, coupon.maxDiscount);
    set({ appliedCoupon: code.toUpperCase(), couponDiscount: discount });
    return true;
  },
  
  removeCoupon: () => set({ appliedCoupon: null, couponDiscount: 0 }),
  
  // Notifications
  notifications: [
    {
      id: 'n1',
      title: 'Flash Sale Live!',
      message: 'Up to 70% off on electronics. Limited time offer!',
      type: 'offer',
      read: false,
      createdAt: '2026-03-15T10:00:00.000Z',
    },
    {
      id: 'n2',
      title: 'Free Delivery Weekend',
      message: 'Enjoy free delivery on all orders this weekend',
      type: 'delivery',
      read: false,
      createdAt: '2026-03-15T09:00:00.000Z',
    },
  ],
  
  addNotification: (notification) => set((state) => ({
    notifications: [{
      id: 'n' + Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    }, ...state.notifications],
  })),
  
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
  })),
  
  getUnreadCount: () => get().notifications.filter(n => !n.read).length,
  
  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  searchSuggestions: [],
  
  // UI State
  showCartDrawer: false,
  setShowCartDrawer: (show) => set({ showCartDrawer: show }),
  showMobileMenu: false,
  setShowMobileMenu: (show) => set({ showMobileMenu: show }),
  showAuthModal: false,
  setShowAuthModal: (show) => set({ showAuthModal: show }),
  authMode: 'login',
  setAuthMode: (mode) => set({ authMode: mode }),

  // Persistence
  _hasHydrated: false,
  _usersVersion: USERS_VERSION,
  _resetToSeed: () => {
    localStorage.removeItem('shopnexa-store');
    window.location.reload();
  },
    }),
    {
      name: 'shopnexa-store',
      // Products & orders are NEVER persisted to localStorage.
      // They are ALWAYS fetched from the database (single source of truth).
      // Only auth, users, cart, and wishlist are persisted locally.
      partialize: (state) => ({
        registeredUsers: state.registeredUsers,
        cart: state.cart,
        wishlist: state.wishlist,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        _usersVersion: USERS_VERSION,
      }),
      merge: (persisted, current) => {
        const p = persisted as Record<string, unknown>;
        const result = { ...current };

        // Products & orders: ALWAYS from default (empty) — DB sync will populate them
        // Do NOT restore from localStorage to prevent stale data

        // Users: use persisted if version matches
        if (p._usersVersion === USERS_VERSION && Array.isArray(p.registeredUsers)) {
          (result as Record<string, unknown>).registeredUsers = p.registeredUsers;
        }

        // Cart & wishlist: always restore from persisted
        if (Array.isArray(p.cart)) (result as Record<string, unknown>).cart = p.cart;
        if (Array.isArray(p.wishlist)) (result as Record<string, unknown>).wishlist = p.wishlist;

        // Auth state: restore
        if (p.user) (result as Record<string, unknown>).user = p.user;
        if (typeof p.isAuthenticated === 'boolean') (result as Record<string, unknown>).isAuthenticated = p.isAuthenticated;

        return result as typeof current;
      },
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state._hasHydrated = true;
          }
        };
      },
    },
  ),
);
