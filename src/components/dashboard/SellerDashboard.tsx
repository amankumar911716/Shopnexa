'use client';

import { useStore } from '@/store/useStore';
import { formatDate } from '@/lib/dates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DollarSign, Package, ShoppingBag, Star,
  ArrowUpRight, ArrowDownRight, Eye, Edit, Trash2,
  Plus, X, Check, Search, Video, ImageIcon, Store,
  LogIn, BarChart3, TrendingUp, Clock, Filter, AlertTriangle,
  Banknote, Wallet, CreditCard, MapPin,
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { Product, Order, PaymentMethod, PaymentStatus } from '@/types';

/* ------------------------------------------------------------------ */
/*  Demo chart data                                                    */
/* ------------------------------------------------------------------ */
const salesData = [
  { month: 'Jan', sales: 45000 },
  { month: 'Feb', sales: 38000 },
  { month: 'Mar', sales: 62000 },
  { month: 'Apr', sales: 55000 },
  { month: 'May', sales: 71000 },
  { month: 'Jun', sales: 85000 },
  { month: 'Jul', sales: 78000 },
  { month: 'Aug', sales: 92000 },
];

/* ------------------------------------------------------------------ */
/*  Order status config                                                */
/* ------------------------------------------------------------------ */
type OrderStatus = Order['status'];

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  placed: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-purple-100 text-purple-700 border-purple-200',
  shipped: 'bg-orange-100 text-orange-700 border-orange-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
  returned: 'bg-orange-100 text-orange-700 border-orange-200',
  rejected: 'bg-red-100 text-red-700 border-red-300',
};

const STATUS_DOT_CLASS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500',
  placed: 'bg-blue-500',
  confirmed: 'bg-purple-500',
  shipped: 'bg-orange-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
  returned: 'bg-orange-500',
  rejected: 'bg-red-700',
};

/* ------------------------------------------------------------------ */
/*  Payment method config                                              */
/* ------------------------------------------------------------------ */
const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { icon: typeof Banknote; label: string; badge: string }> = {
  cod: { icon: Banknote, label: 'COD', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  upi: { icon: Wallet, label: 'UPI', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  visa: { icon: CreditCard, label: 'VISA', badge: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  mastercard: { icon: CreditCard, label: 'MC', badge: 'bg-rose-100 text-rose-700 border-rose-200' },
};

/* ------------------------------------------------------------------ */
/*  Payment status config                                              */
/* ------------------------------------------------------------------ */
const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string; display: string; badge: string }[] = [
  { value: 'paid', label: 'Received', display: '\u2713 Received', badge: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'unpaid', label: 'Not Received', display: '\u2717 Not Received', badge: 'bg-red-100 text-red-600 border-red-200' },
  { value: 'pending', label: 'Pending', display: '\u23F3 Pending', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
];

/* ------------------------------------------------------------------ */
/*  Product form helpers                                               */
/* ------------------------------------------------------------------ */
interface ProductFormState {
  name: string;
  brand: string;
  price: string;
  mrp: string;
  stock: string;
  category: string;
  description: string;
  images: string[];
  videos: string[];
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  brand: '',
  price: '',
  mrp: '',
  stock: '',
  category: '',
  description: '',
  images: [''],
  videos: [''],
};

/* ------------------------------------------------------------------ */
/*  Format helpers                                                     */
/* ------------------------------------------------------------------ */
function formatCurrency(amount: number): string {
  return '\u20B9' + amount.toLocaleString('en-IN');
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */
export function SellerDashboard() {
  const {
    user, isAuthenticated,
    products, orders, categories, registeredUsers,
    goBack, goToProduct, goToOrder,
    addProductToDB, deleteProductFromDB, updateProductInDB,
    updateOrderStatus,
    deleteOrder, togglePaymentStatus,
    setShowAuthModal, setAuthMode,
    syncOnLogin,
  } = useStore();

  /* ---- ALL HOOKS FIRST (before any early returns) ------------ */
  const [toast, setToast] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<ProductFormState>({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [viewOrderOpen, setViewOrderOpen] = useState(false);
  const [viewOrderData, setViewOrderData] = useState<Order | null>(null);
  const [deleteOrderOpen, setDeleteOrderOpen] = useState(false);
  const [deleteOrderTarget, setDeleteOrderTarget] = useState<{ id: string; name: string } | null>(null);
  /* ---- Edit product modal state ---------------------------- */
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<ProductFormState>({ ...EMPTY_FORM });

  const currentSellerId = user?.sellerId || user?.id;
  const storeName = user?.storeName || user?.name || 'My Store';

  /* ---- Re-sync data when seller changes (proper isolation) ---- */
  const lastSyncedSellerId = useRef<string | null>(null);
  useEffect(() => {
    if (isAuthenticated && currentSellerId && currentSellerId !== lastSyncedSellerId.current) {
      lastSyncedSellerId.current = currentSellerId;
      syncOnLogin();
    }
  }, [isAuthenticated, currentSellerId, syncOnLogin]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  /* ---- Computed: seller's own products ----------------------- */
  const sellerProducts = useMemo(() => {
    if (!currentSellerId) return [];
    return products.filter((p) => p.sellerId === currentSellerId);
  }, [products, currentSellerId]);

  const totalRevenue = useMemo(
    () => sellerProducts.reduce((sum, p) => sum + p.price * p.sold, 0),
    [sellerProducts],
  );
  const totalSold = useMemo(
    () => sellerProducts.reduce((sum, p) => sum + p.sold, 0),
    [sellerProducts],
  );
  const avgRating = useMemo(() => {
    if (sellerProducts.length === 0) return 0;
    return sellerProducts.reduce((sum, p) => sum + p.rating, 0) / sellerProducts.length;
  }, [sellerProducts]);

  const stats = useMemo(() => [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: '+15.3%',
      up: true,
      icon: DollarSign,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Total Sold',
      value: totalSold.toLocaleString(),
      change: '+8.1%',
      up: true,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Products',
      value: sellerProducts.length.toString(),
      change: sellerProducts.length > 0 ? '+2' : '0',
      up: true,
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Avg Rating',
      value: avgRating.toFixed(1),
      change: avgRating >= 4 ? '+0.2' : '-0.1',
      up: avgRating >= 4,
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ], [totalRevenue, totalSold, sellerProducts.length, avgRating]);

  /* ---- Computed: seller's own orders (ISOLATED) ------------ */
  const sellerOrders = useMemo(() => {
    if (!currentSellerId) return [];
    return orders.filter((o) => {
      const orderSellerId = o.sellerId || o.items?.[0]?.product?.sellerId;
      return orderSellerId === currentSellerId;
    });
  }, [orders, currentSellerId]);

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return sellerOrders;
    return sellerOrders.filter((o) => o.status === orderStatusFilter);
  }, [sellerOrders, orderStatusFilter]);

  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: sellerOrders.length };
    sellerOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [sellerOrders]);

  const topProducts = useMemo(
    () => [...sellerProducts].sort((a, b) => b.sold - a.sold).slice(0, 5),
    [sellerProducts],
  );

  /* ================================================================ */
  /*  EVENT HANDLERS                                                   */
  /* ================================================================ */

  /* ---- Stock editing ----------------------------------------- */
  const startEditStock = (productId: string, currentStock: number) => {
    setEditingId(productId);
    setEditStock(currentStock);
  };

  const saveStock = () => {
    if (editingId) {
      updateProductInDB(editingId, { stock: editStock });
      showToast('Stock updated to ' + editStock + '!');
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStock(0);
  };

  /* ---- Add product ------------------------------------------- */
  const openAdd = () => {
    setAddForm({ ...EMPTY_FORM });
    setFormErrors({});
    setAddOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!addForm.name.trim()) errors.name = 'Product name is required';
    if (!addForm.brand.trim()) errors.brand = 'Brand is required';
    if (!addForm.price || Number(addForm.price) <= 0) errors.price = 'Valid price is required';
    if (!addForm.mrp || Number(addForm.mrp) <= 0) errors.mrp = 'Valid MRP is required';
    if (!addForm.stock || Number(addForm.stock) < 0) errors.stock = 'Valid stock is required';
    if (!addForm.category) errors.category = 'Select a category';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduct = () => {
    if (!validateForm()) return;
    const selectedCat = categories.find((c) => c.id === addForm.category);
    const validImages = addForm.images.filter((img) => img.trim() !== '');
    const validVideos = addForm.videos.filter((v) => v.trim() !== '');

    const newProduct: Product = {
      id: 'p' + Date.now(),
      name: addForm.name.trim(),
      slug: addForm.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: addForm.description.trim() || 'New product added by seller',
      price: Number(addForm.price),
      mrp: Number(addForm.mrp),
      images: validImages.length > 0
        ? validImages
        : ['/api/placeholder?text=New+Product&category=electronics'],
      categoryId: addForm.category,
      categoryName: selectedCat?.name || '',
      brand: addForm.brand.trim(),
      stock: Number(addForm.stock),
      sold: 0,
      rating: 0,
      reviewCount: 0,
      specifications: {},
      tags: [addForm.brand.trim().toLowerCase()],
      isFeatured: false,
      isTrending: false,
      isFlashDeal: false,
      sellerId: currentSellerId || 'unknown',
      videoUrl: validVideos.length > 0 ? validVideos.join(',') : undefined,
    };
    addProductToDB(newProduct);
    setAddOpen(false);
    setAddForm({ ...EMPTY_FORM });
    setFormErrors({});
    showToast('Product "' + newProduct.name + '" added successfully!');
  };

  /* ---- Delete product ---------------------------------------- */
  const openDelete = (product: Product) => {
    setDeleteTarget(product);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteProductFromDB(deleteTarget.id);
    showToast('Product "' + name + '" deleted permanently!');
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  /* ---- Edit product (full edit modal) ----------------------- */
  const openEditProduct = (product: Product) => {
    setEditTarget(product);
    setEditForm({
      name: product.name,
      brand: product.brand,
      price: String(product.price),
      mrp: String(product.mrp),
      stock: String(product.stock),
      category: product.categoryId,
      description: product.description || '',
      images: product.images.length > 0 ? [...product.images] : [''],
      videos: product.videoUrl ? product.videoUrl.split(',').filter(Boolean) : [''],
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEditProduct = () => {
    if (!editTarget) return;
    if (!editForm.name.trim()) { setFormErrors({ name: 'Product name is required' }); return; }
    if (!editForm.brand.trim()) { setFormErrors({ brand: 'Brand is required' }); return; }
    if (!editForm.price || Number(editForm.price) <= 0) { setFormErrors({ price: 'Valid price is required' }); return; }
    if (!editForm.mrp || Number(editForm.mrp) <= 0) { setFormErrors({ mrp: 'Valid MRP is required' }); return; }

    const selectedCat = categories.find((c) => c.id === editForm.category);
    const validImages = editForm.images.filter((img) => img.trim() !== '');
    const validVideos = editForm.videos.filter((v) => v.trim() !== '');

    const updatedData: Partial<Product> = {
      name: editForm.name.trim(),
      slug: editForm.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: editForm.description.trim(),
      price: Number(editForm.price),
      mrp: Number(editForm.mrp),
      stock: Number(editForm.stock),
      categoryId: editForm.category,
      categoryName: selectedCat?.name || '',
      brand: editForm.brand.trim(),
      images: validImages.length > 0 ? validImages : ['/api/placeholder?text=Product'],
      tags: [editForm.brand.trim().toLowerCase()],
      videoUrl: validVideos.length > 0 ? validVideos.join(',') : undefined,
    };
    updateProductInDB(editTarget.id, updatedData);
    showToast('Product "' + editTarget.name + '" updated permanently!');
    setEditOpen(false);
    setEditTarget(null);
    setEditForm({ ...EMPTY_FORM });
    setFormErrors({});
  };

  /* ---- Edit form helpers ------------------------------------ */
  const addEditImageField = () => setEditForm({ ...editForm, images: [...editForm.images, ''] });
  const removeEditImageField = (idx: number) => {
    if (editForm.images.length <= 1) return;
    setEditForm({ ...editForm, images: editForm.images.filter((_, i) => i !== idx) });
  };
  const updateEditImageField = (idx: number, val: string) => {
    const arr = [...editForm.images];
    arr[idx] = val;
    setEditForm({ ...editForm, images: arr });
  };
  const addEditVideoField = () => setEditForm({ ...editForm, videos: [...editForm.videos, ''] });
  const removeEditVideoField = (idx: number) => {
    if (editForm.videos.length <= 1) return;
    setEditForm({ ...editForm, videos: editForm.videos.filter((_, i) => i !== idx) });
  };
  const updateEditVideoField = (idx: number, val: string) => {
    const arr = [...editForm.videos];
    arr[idx] = val;
    setEditForm({ ...editForm, videos: arr });
  };

  /* ---- Order status change ----------------------------------- */
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    showToast('Order ' + orderId + ' status changed to ' + newStatus);
  };

  /* ---- View order detail ------------------------------------- */
  const openViewOrder = (order: Order) => {
    setViewOrderData(order);
    setViewOrderOpen(true);
  };

  /* ---- Delete order ------------------------------------------ */
  const openDeleteOrder = (orderId: string) => {
    setDeleteOrderTarget({ id: orderId, name: orderId });
    setDeleteOrderOpen(true);
  };

  const handleDeleteOrder = () => {
    if (!deleteOrderTarget) return;
    deleteOrder(deleteOrderTarget.id);
    showToast('Order #' + deleteOrderTarget.id + ' deleted successfully!');
    setDeleteOrderOpen(false);
    setDeleteOrderTarget(null);
  };

  /* ---- Payment status toggle --------------------------------- */
  const handlePaymentStatusChange = (orderId: string, status: PaymentStatus) => {
    togglePaymentStatus(orderId, status);
    const label = PAYMENT_STATUS_OPTIONS.find((o) => o.value === status)?.display || status;
    showToast('Payment status updated to ' + label);
  };

  /* ---- Image/Video helpers ----------------------------------- */
  const addImageField = () => setAddForm({ ...addForm, images: [...addForm.images, ''] });
  const removeImageField = (idx: number) => {
    if (addForm.images.length <= 1) return;
    setAddForm({ ...addForm, images: addForm.images.filter((_, i) => i !== idx) });
  };
  const updateImageField = (idx: number, val: string) => {
    const arr = [...addForm.images];
    arr[idx] = val;
    setAddForm({ ...addForm, images: arr });
  };

  const addVideoField = () => setAddForm({ ...addForm, videos: [...addForm.videos, ''] });
  const removeVideoField = (idx: number) => {
    if (addForm.videos.length <= 1) return;
    setAddForm({ ...addForm, videos: addForm.videos.filter((_, i) => i !== idx) });
  };
  const updateVideoField = (idx: number, val: string) => {
    const arr = [...addForm.videos];
    arr[idx] = val;
    setAddForm({ ...addForm, videos: arr });
  };

  /* ================================================================ */
  /*  ACCESS CONTROL (after all hooks)                                */
  /* ================================================================ */
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center p-8">
          <LogIn className="h-16 w-16 mx-auto text-orange-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Seller Access Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in with a seller account to access the dashboard.
          </p>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
          >
            <LogIn className="h-4 w-4 mr-2" /> Login
          </Button>
        </Card>
      </div>
    );
  }

  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center p-8">
          <Store className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            Only seller and admin accounts can access this dashboard. Create a seller account to get started.
          </p>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
          >
            <Store className="h-4 w-4 mr-2" /> Create Seller Account
          </Button>
        </Card>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 relative">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-[100] bg-orange-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Back + Header */}
      <Button variant="ghost" size="sm" onClick={goBack} className="mb-4 -ml-2">
        &larr; Back
      </Button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-orange-600" />
            Seller Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {storeName} &mdash; Manage your products, orders, and sales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 text-sm">
            {user.role === 'admin' ? 'Admin' : 'Seller'}
          </Badge>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={'w-10 h-10 rounded-lg ' + stat.bg + ' flex items-center justify-center'}>
                  <stat.icon className={'h-5 w-5 ' + stat.color} />
                </div>
                {stat.change && (
                  <span className={'flex items-center text-xs font-medium ' + (stat.up ? 'text-green-600' : 'text-red-600')}>
                    {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">My Products</TabsTrigger>
          <TabsTrigger value="orders" className="relative">
            Orders
            {sellerOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {sellerOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* ===================== MY PRODUCTS TAB ===================== */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                Product Inventory ({sellerProducts.length})
              </CardTitle>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={openAdd}>
                <Plus className="h-4 w-4 mr-1" /> Add New
              </Button>
            </CardHeader>
            <CardContent>
              {sellerProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No products yet</p>
                  <p className="text-sm mt-1">Start by adding your first product to your store.</p>
                  <Button className="bg-orange-600 hover:bg-orange-700 mt-4" onClick={openAdd}>
                    <Plus className="h-4 w-4 mr-1" /> Add Your First Product
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {sellerProducts.map((product) => {
                    const stockPercent = Math.min(100, (product.stock / 100) * 100);
                    const isEditing = editingId === product.id;
                    return (
                      <div
                        key={product.id}
                        className={
                          'flex items-center gap-4 p-3 rounded-lg border transition-colors ' +
                          (isEditing ? 'bg-orange-50 border-orange-300' : 'hover:bg-muted/50')
                        }
                      >
                        {/* Image */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.images[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=' + encodeURIComponent(product.name.slice(0, 20)) + '&category=' + encodeURIComponent(product.categoryName || ''); }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            {product.stock < 20 && (
                              <Badge className="bg-red-100 text-red-700 text-[10px] border border-red-200 shrink-0">
                                <AlertTriangle className="h-3 w-3 mr-0.5" />
                                Low Stock
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{product.brand} &bull; {product.categoryName}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-semibold">{formatCurrency(product.price)}</span>
                            <span className="text-xs text-muted-foreground">Sold: {product.sold}</span>
                          </div>
                        </div>

                        {/* Stock - Inline Edit */}
                        <div className="w-28 sm:w-32 shrink-0">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min={0}
                                value={editStock}
                                onChange={(e) => setEditStock(Math.max(0, parseInt(e.target.value) || 0))}
                                className="h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveStock();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                              />
                              <Button
                                size="icon"
                                className="h-8 w-8 bg-orange-600 hover:bg-orange-700 shrink-0"
                                onClick={saveStock}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={cancelEdit}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Stock</span>
                                <span className={'font-medium ' + (product.stock < 20 ? 'text-red-600' : '')}>{product.stock}</span>
                              </div>
                              <Progress value={stockPercent} className="h-1.5" />
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-orange-50"
                            title="View Product"
                            onClick={() => goToProduct(product.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!isEditing && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-50"
                              title="Edit Product"
                              onClick={() => openEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-red-50"
                            title="Delete Product"
                            onClick={() => openDelete(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Low stock warning */}
              {sellerProducts.filter((p) => p.stock < 20).length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                  <p className="text-sm text-orange-700 font-medium">
                    {sellerProducts.filter((p) => p.stock < 20).length} product(s) running low on stock
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== ORDERS TAB (CRITICAL) ============= */}
        <TabsContent value="orders" className="space-y-4">
          {/* Order status summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {ORDER_STATUSES.map((s) => (
              <Card
                key={s.value}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setOrderStatusFilter(orderStatusFilter === s.value ? 'all' : s.value)}
              >
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <div className={'w-2 h-2 rounded-full ' + STATUS_DOT_CLASS[s.value]} />
                  </div>
                  <p className="text-lg font-bold">{orderCounts[s.value] || 0}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-orange-600" />
                Order Management ({filteredOrders.length})
                {orderStatusFilter !== 'all' && (
                  <Badge variant="outline" className="text-xs ml-1">
                    {ORDER_STATUSES.find((s) => s.value === orderStatusFilter)?.label}
                    <button onClick={() => setOrderStatusFilter('all')} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3 inline" />
                    </button>
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-[160px] h-8 text-xs">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders ({orderCounts.all})</SelectItem>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label} ({orderCounts[s.value] || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No orders found</p>
                  <p className="text-sm mt-1">
                    {orderStatusFilter !== 'all'
                      ? 'No orders with "' + ORDER_STATUSES.find((s) => s.value === orderStatusFilter)?.label + '" status.'
                      : 'Orders will appear here when customers place them.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Order ID</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Items</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden lg:table-cell">Payment</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden xl:table-cell">Pay Status</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground">Status</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden lg:table-cell">Change Status</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const pm = PAYMENT_METHOD_CONFIG[order.paymentMethod] || PAYMENT_METHOD_CONFIG.cod;
                        const PmIcon = pm.icon;
                        const psOption = PAYMENT_STATUS_OPTIONS.find((p) => p.value === order.paymentStatus) || PAYMENT_STATUS_OPTIONS[2];
                        return (
                          <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-2">
                              <button
                                onClick={() => goToOrder(order.id)}
                                className="font-mono font-semibold text-orange-700 hover:text-orange-900 hover:underline"
                              >
                                #{order.id}
                              </button>
                            </td>
                            <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="py-3 px-2 text-center hidden md:table-cell">
                              <Badge variant="outline" className="text-xs font-normal">
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right font-semibold">
                              {formatCurrency(order.totalAmount)}
                            </td>
                            <td className="py-3 px-2 text-center hidden lg:table-cell">
                              <Badge variant="outline" className={'inline-flex items-center gap-1 text-[11px] font-medium border ' + pm.badge}>
                                <PmIcon className="h-3 w-3" />
                                {pm.label}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-center hidden xl:table-cell">
                              <Select
                                value={order.paymentStatus || 'pending'}
                                onValueChange={(val) => handlePaymentStatusChange(order.id, val as PaymentStatus)}
                              >
                                <SelectTrigger className="w-[140px] h-8 text-xs mx-auto">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PAYMENT_STATUS_OPTIONS.map((ps) => (
                                    <SelectItem key={ps.value} value={ps.value} className="text-xs">
                                      {ps.display}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span
                                className={
                                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ' +
                                  STATUS_BADGE_CLASS[order.status]
                                }
                              >
                                <span className={'w-1.5 h-1.5 rounded-full ' + STATUS_DOT_CLASS[order.status]} />
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center hidden lg:table-cell">
                              <Select
                                value={order.status}
                                onValueChange={(val) => handleStatusChange(order.id, val as OrderStatus)}
                              >
                                <SelectTrigger className="w-[130px] h-8 text-xs mx-auto">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.map((s) => (
                                    <SelectItem key={s.value} value={s.value} className="text-xs">
                                      {s.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-blue-50"
                                  title="View Order Details"
                                  onClick={() => openViewOrder(order)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:bg-red-50"
                                  title="Delete Order"
                                  onClick={() => openDeleteOrder(order.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== ANALYTICS TAB ===================== */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Sales Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" /> Monthly Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => '\u20B9' + (v / 1000).toFixed(0) + 'K'} />
                      <Tooltip formatter={(value: number) => ['\u20B9' + value.toLocaleString(), 'Sales']} />
                      <Bar dataKey="sales" fill="#ea580c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" /> Top Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>No products to show</p>
                    </div>
                  ) : (
                    topProducts.map((product, idx) => (
                      <div key={product.id} className="flex items-center gap-3 group">
                        <span className="text-sm font-bold text-muted-foreground w-6 shrink-0">#{idx + 1}</span>
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.images[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=' + encodeURIComponent(product.name.slice(0, 20)) + '&category=' + encodeURIComponent(product.categoryName || ''); }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sold} units sold</p>
                        </div>
                        <p className="text-sm font-semibold shrink-0">
                          {formatCurrency(product.price * product.sold)}
                        </p>
                        {/* View / Edit / Delete buttons */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-orange-50"
                            title="View Product"
                            onClick={() => goToProduct(product.id)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-blue-50"
                            title="Edit Product"
                            onClick={() => openEditProduct(product)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-red-50"
                            title="Delete Product"
                            onClick={() => openDelete(product)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSold}</p>
                  <p className="text-sm text-muted-foreground">Total Units Sold</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sellerProducts.length}</p>
                  <p className="text-sm text-muted-foreground">Active Products</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgRating.toFixed(1)} / 5</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ===================== ADD PRODUCT MODAL ===================== */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-600" />
              Add New Product
            </DialogTitle>
            <DialogDescription>
              Fill in the details to add a new product to your store.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Product Name */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Product Name <span className="text-red-500">*</span></label>
              <Input placeholder="Enter product name" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
            </div>

            {/* Brand */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Brand <span className="text-red-500">*</span></label>
              <Input placeholder="Enter brand name" value={addForm.brand} onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })} />
              {formErrors.brand && <p className="text-xs text-red-500 mt-1">{formErrors.brand}</p>}
            </div>

            {/* Price + MRP */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Selling Price ({'\u20B9'}) <span className="text-red-500">*</span></label>
                <Input type="number" placeholder="0" value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} />
                {formErrors.price && <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">MRP ({'\u20B9'}) <span className="text-red-500">*</span></label>
                <Input type="number" placeholder="0" value={addForm.mrp} onChange={(e) => setAddForm({ ...addForm, mrp: e.target.value })} />
                {formErrors.mrp && <p className="text-xs text-red-500 mt-1">{formErrors.mrp}</p>}
              </div>
            </div>

            {/* Stock + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Stock Quantity <span className="text-red-500">*</span></label>
                <Input type="number" placeholder="0" value={addForm.stock} onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })} />
                {formErrors.stock && <p className="text-xs text-red-500 mt-1">{formErrors.stock}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category <span className="text-red-500">*</span></label>
                <Select value={addForm.category} onValueChange={(val) => setAddForm({ ...addForm, category: val })}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                placeholder="Enter product description"
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              />
            </div>

            {/* Multiple Image URLs */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" /> Product Images
                </label>
                <button type="button" onClick={addImageField} className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Image
                </button>
              </div>
              <div className="space-y-2">
                {addForm.images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {img.trim() ? (
                        <img src={img} alt="" className="w-full h-full rounded-lg object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=Product'; }} />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <Input
                      placeholder={'Image URL ' + (idx + 1)}
                      value={img}
                      onChange={(e) => updateImageField(idx, e.target.value)}
                      className="flex-1 h-9"
                    />
                    {addForm.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(idx)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Add multiple product images for better display</p>
            </div>

            {/* Multiple Video URLs */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5" /> Product Videos
                </label>
                <button type="button" onClick={addVideoField} className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Video
                </button>
              </div>
              <div className="space-y-2">
                {addForm.videos.map((vid, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Video className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      placeholder={'Video URL ' + (idx + 1) + ' (YouTube, etc.)'}
                      value={vid}
                      onChange={(e) => updateVideoField(idx, e.target.value)}
                      className="flex-1 h-9"
                    />
                    {addForm.videos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideoField(idx)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Optional: Add YouTube or video links for product demo</p>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={handleAddProduct}>
              <Check className="h-4 w-4 mr-2" /> Save Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== EDIT PRODUCT MODAL =========== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-orange-600" />
              Edit Product
            </DialogTitle>
            <DialogDescription>
              Update product details. All changes will be saved permanently.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Product Name */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Product Name <span className="text-red-500">*</span></label>
              <Input placeholder="Enter product name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
            </div>
            {/* Brand */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Brand <span className="text-red-500">*</span></label>
              <Input placeholder="Enter brand name" value={editForm.brand} onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })} />
              {formErrors.brand && <p className="text-xs text-red-500 mt-1">{formErrors.brand}</p>}
            </div>
            {/* Price + MRP */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Selling Price ({'\u20B9'}) <span className="text-red-500">*</span></label>
                <Input type="number" placeholder="0" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                {formErrors.price && <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">MRP ({'\u20B9'}) <span className="text-red-500">*</span></label>
                <Input type="number" placeholder="0" value={editForm.mrp} onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value })} />
                {formErrors.mrp && <p className="text-xs text-red-500 mt-1">{formErrors.mrp}</p>}
              </div>
            </div>
            {/* Stock + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Stock Quantity <span className="text-red-500">*</span></label>
                <Input type="number" placeholder="0" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category <span className="text-red-500">*</span></label>
                <Select value={editForm.category} onValueChange={(val) => setEditForm({ ...editForm, category: val })}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                placeholder="Enter product description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            {/* Multiple Image URLs */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" /> Product Images
                </label>
                <button type="button" onClick={addEditImageField} className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Image
                </button>
              </div>
              <div className="space-y-2">
                {editForm.images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {img.trim() ? (
                        <img src={img} alt="" className="w-full h-full rounded-lg object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=Product'; }} />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <Input placeholder={'Image URL ' + (idx + 1)} value={img} onChange={(e) => updateEditImageField(idx, e.target.value)} className="flex-1 h-9" />
                    {editForm.images.length > 1 && (
                      <button type="button" onClick={() => removeEditImageField(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Multiple Video URLs */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5" /> Product Videos
                </label>
                <button type="button" onClick={addEditVideoField} className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Video
                </button>
              </div>
              <div className="space-y-2">
                {editForm.videos.map((vid, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Video className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input placeholder={'Video URL ' + (idx + 1)} value={vid} onChange={(e) => updateEditVideoField(idx, e.target.value)} className="flex-1 h-9" />
                    {editForm.videos.length > 1 && (
                      <button type="button" onClick={() => removeEditVideoField(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1">Cancel</Button>
            <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={handleEditProduct}>
              <Check className="h-4 w-4 mr-2" /> Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== DELETE PRODUCT CONFIRMATION DIALOG =========== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== VIEW ORDER DETAIL MODAL =========== */}
      <Dialog open={viewOrderOpen} onOpenChange={setViewOrderOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-600" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              Full order information and tracking details.
            </DialogDescription>
          </DialogHeader>
          {viewOrderData && (() => {
            const ord = viewOrderData;
            const pmConfig = PAYMENT_METHOD_CONFIG[ord.paymentMethod] || PAYMENT_METHOD_CONFIG.cod;
            const PmIcon = pmConfig.icon;
            const psOption = PAYMENT_STATUS_OPTIONS.find((p) => p.value === ord.paymentStatus) || PAYMENT_STATUS_OPTIONS[2];
            const subtotal = ord.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            const customer = registeredUsers.find((u) => u.id === ord.userId);
            const customerName = customer?.name || 'Unknown Customer';
            return (
              <div className="space-y-5 py-2">
                {/* Order Info Header */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                    <p className="font-mono font-semibold text-sm text-orange-700">#{ord.id}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <p className="font-medium text-sm">{formatDate(ord.createdAt)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ' + STATUS_BADGE_CLASS[ord.status]}>
                      <span className={'w-1.5 h-1.5 rounded-full ' + STATUS_DOT_CLASS[ord.status]} />
                      {ord.status.charAt(0).toUpperCase() + ord.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Customer */}
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Customer</p>
                  <p className="font-medium text-sm">{customerName}</p>
                </div>

                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1.5">Payment Method</p>
                    <Badge variant="outline" className={'inline-flex items-center gap-1.5 text-xs font-medium border ' + pmConfig.badge}>
                      <PmIcon className="h-3.5 w-3.5" />
                      {pmConfig.label}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1.5">Payment Status</p>
                    <Badge variant="outline" className={'text-xs font-medium border ' + psOption.badge}>
                      {psOption.display}
                    </Badge>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-sm font-medium mb-2">Items ({ord.items.length})</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg border">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {item.product.images[0] ? (
                            <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=Product'; }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.product.brand} &middot; Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold shrink-0">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-3 rounded-lg border space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {ord.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-green-600">-{formatCurrency(ord.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-1.5 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-orange-700">{formatCurrency(ord.totalAmount)}</span>
                  </div>
                </div>

                {/* Delivery Address */}
                {ord.address && (
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Delivery Address
                    </p>
                    <div className="text-sm space-y-0.5">
                      <p className="font-medium">{ord.address}</p>
                      <p className="text-muted-foreground">
                        {[ord.city, ord.state].filter(Boolean).join(', ')}
                        {ord.pincode ? ' - ' + ord.pincode : ''}
                      </p>
                      {ord.phone && (
                        <p className="text-muted-foreground">{ord.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tracking Timeline */}
                {ord.trackingInfo && ord.trackingInfo.length > 0 && (
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-3 font-medium">Tracking Timeline</p>
                    <div className="space-y-0">
                      {ord.trackingInfo.map((step, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={'w-3 h-3 rounded-full mt-0.5 shrink-0 ' + STATUS_DOT_CLASS[step.status as OrderStatus] || 'bg-gray-400'} />
                            {idx < ord.trackingInfo.length - 1 && (
                              <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                            )}
                          </div>
                          <div className="pb-3">
                            <p className="text-sm font-medium">{step.message}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(step.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <DialogFooter className="gap-2 pt-2">
                  <Button variant="outline" onClick={() => setViewOrderOpen(false)} className="flex-1">
                    Close
                  </Button>
                  <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => { goToOrder(ord.id); setViewOrderOpen(false); }}>
                    <Eye className="h-4 w-4 mr-2" /> Open Full View
                  </Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ===================== DELETE ORDER CONFIRMATION DIALOG =========== */}
      <Dialog open={deleteOrderOpen} onOpenChange={setDeleteOrderOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order <span className="font-mono font-semibold text-red-600">#{deleteOrderTarget?.id}</span>? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOrderOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrder} className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" /> Delete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
