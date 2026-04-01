'use client';

import { useStore } from '@/store/useStore';
import { formatDate } from '@/lib/dates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  IndianRupee, Package, Users, ShoppingBag, TrendingUp,
  ArrowUpRight, ArrowDownRight, Eye, Edit, Trash2, Activity,
  Plus, X, Check, Search, Video, ImageIcon, ShieldCheck,
  LogIn, Store, UserCog, ChevronDown, Filter, Clock,
  Banknote, Wallet, CreditCard, MapPin,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  Area, AreaChart, Bar, BarChart, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import type { Product, Order, PaymentMethod, PaymentStatus } from '@/types';

/* ------------------------------------------------------------------ */
/*  Demo chart data                                                    */
/* ------------------------------------------------------------------ */
const revenueData = [
  { month: 'Jan', revenue: 420000, orders: 1200 },
  { month: 'Feb', revenue: 380000, orders: 1050 },
  { month: 'Mar', revenue: 510000, orders: 1400 },
  { month: 'Apr', revenue: 460000, orders: 1280 },
  { month: 'May', revenue: 590000, orders: 1650 },
  { month: 'Jun', revenue: 620000, orders: 1780 },
  { month: 'Jul', revenue: 710000, orders: 2050 },
  { month: 'Aug', revenue: 680000, orders: 1920 },
  { month: 'Sep', revenue: 750000, orders: 2180 },
  { month: 'Oct', revenue: 820000, orders: 2400 },
  { month: 'Nov', revenue: 950000, orders: 2800 },
  { month: 'Dec', revenue: 1100000, orders: 3200 },
];

const categoryData = [
  { name: 'Electronics', value: 42, color: '#ea580c' },
  { name: 'Fashion', value: 28, color: '#d97706' },
  { name: 'Home', value: 15, color: '#0891b2' },
  { name: 'Sports', value: 8, color: '#7c3aed' },
  { name: 'Others', value: 7, color: '#64748b' },
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
const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'paid', label: '✓ Received' },
  { value: 'unpaid', label: '✗ Not Received' },
  { value: 'pending', label: '⏳ Pending' },
];

const PAYMENT_STATUS_BADGE: Record<PaymentStatus, string> = {
  paid: 'bg-green-100 text-green-700 border-green-200',
  unpaid: 'bg-red-100 text-red-600 border-red-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

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

function imgHelper(idx: number, val: string, form: ProductFormState, set: (f: ProductFormState) => void) {
  const arr = [...form.images];
  arr[idx] = val;
  set({ ...form, images: arr });
}
function addImg(form: ProductFormState, set: (f: ProductFormState) => void) {
  set({ ...form, images: [...form.images, ''] });
}
function rmImg(idx: number, form: ProductFormState, set: (f: ProductFormState) => void) {
  if (form.images.length <= 1) return;
  set({ ...form, images: form.images.filter((_: string, i: number) => i !== idx) });
}
function vidHelper(idx: number, val: string, form: ProductFormState, set: (f: ProductFormState) => void) {
  const arr = [...form.videos];
  arr[idx] = val;
  set({ ...form, videos: arr });
}
function addVid(form: ProductFormState, set: (f: ProductFormState) => void) {
  set({ ...form, videos: [...form.videos, ''] });
}
function rmVid(idx: number, form: ProductFormState, set: (f: ProductFormState) => void) {
  if (form.videos.length <= 1) return;
  set({ ...form, videos: form.videos.filter((_: string, i: number) => i !== idx) });
}

/* ------------------------------------------------------------------ */
/*  Format currency                                                    */
/* ------------------------------------------------------------------ */
function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */
export function AdminDashboard() {
  const {
    user, isAuthenticated,
    products, orders, categories, registeredUsers,
    goBack, goToProduct, goToOrder,
    addProductToDB, deleteProductFromDB, updateProductInDB,
    updateOrderStatus, deleteOrder, togglePaymentStatus,
    deleteUser,
    setShowAuthModal, setAuthMode,
  } = useStore();

  /* ---- ALL HOOKS FIRST (before any early returns) ------------ */
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<ProductFormState>({ ...EMPTY_FORM, category: categories[0]?.id || '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editProductData, setEditProductData] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<ProductFormState>(EMPTY_FORM);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [deleteUserTarget, setDeleteUserTarget] = useState<{ id: string; name: string } | null>(null);
  const [viewOrderOpen, setViewOrderOpen] = useState(false);
  const [viewOrderData, setViewOrderData] = useState<Order | null>(null);
  const [deleteOrderOpen, setDeleteOrderOpen] = useState(false);
  const [deleteOrderTarget, setDeleteOrderTarget] = useState<{ id: string; name: string } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  /* Stats from real store data */
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.totalAmount, 0), [orders]);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalUsers = registeredUsers.length;

  const stats = useMemo(() => [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: '+12.5%',
      up: true,
      icon: IndianRupee,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: '+8.2%',
      up: true,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Products',
      value: totalProducts.toLocaleString(),
      change: '+' + Math.min(totalProducts, 99),
      up: true,
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: '+3.1%',
      up: true,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ], [totalRevenue, totalOrders, totalProducts, totalUsers]);

  /* User lookup map for orders */
  const userMap = useMemo(() => {
    const map: Record<string, string> = {};
    registeredUsers.forEach((u) => { map[u.id] = u.name; });
    return map;
  }, [registeredUsers]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    );
  }, [products, searchQuery]);

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter((o) => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const customersCount = registeredUsers.filter((u) => u.role === 'customer').length;
  const sellersCount = registeredUsers.filter((u) => u.role === 'seller').length;
  const adminsCount = registeredUsers.filter((u) => u.role === 'admin').length;

  /* ================================================================ */
  /*  EVENT HANDLERS                                                   */
  /* ================================================================ */

  const openAdd = () => {
    setAddForm({ ...EMPTY_FORM, category: categories[0]?.id || '' });
    setAddOpen(true);
  };

  const handleAdd = () => {
    if (!addForm.name.trim() || !addForm.price.trim() || !addForm.brand.trim()) return;
    const cat = categories.find((c) => c.id === addForm.category);
    const newProduct: Product = {
      id: 'prod_' + Date.now(),
      name: addForm.name.trim(),
      slug: addForm.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: addForm.description.trim(),
      price: parseFloat(addForm.price) || 0,
      mrp: parseFloat(addForm.mrp) || parseFloat(addForm.price) || 0,
      images: addForm.images.filter((i) => i.trim()),
      categoryId: addForm.category,
      categoryName: cat?.name,
      brand: addForm.brand.trim(),
      stock: parseInt(addForm.stock) || 0,
      sold: 0,
      rating: 0,
      reviewCount: 0,
      specifications: {},
      tags: [],
      isFeatured: false,
      isTrending: false,
      isFlashDeal: false,
      sellerId: user?.sellerId || user?.id || '',
      videoUrl: addForm.videos.filter((v) => v.trim()).join(',') || undefined,
    };
    addProductToDB(newProduct);
    showToast('Product "' + addForm.name + '" added permanently!');
    setAddOpen(false);
  };

  const openEdit = (product: Product) => {
    setEditProductData(product);
    setEditForm({
      name: product.name,
      brand: product.brand,
      price: String(product.price),
      mrp: String(product.mrp),
      stock: String(product.stock),
      category: product.categoryId,
      description: product.description,
      images: product.images.length > 0 ? [...product.images] : [''],
      videos: product.videoUrl ? product.videoUrl.split(',').filter((v) => v.trim()) : [''],
    });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editProductData || !editForm.name.trim()) return;
    const cat = categories.find((c) => c.id === editForm.category);
    updateProductInDB(editProductData.id, {
      name: editForm.name.trim(),
      brand: editForm.brand.trim(),
      price: parseFloat(editForm.price) || 0,
      mrp: parseFloat(editForm.mrp) || 0,
      stock: parseInt(editForm.stock) || 0,
      categoryId: editForm.category,
      categoryName: cat?.name,
      description: editForm.description.trim(),
      images: editForm.images.filter((i) => i.trim()),
      videoUrl: editForm.videos.filter((v) => v.trim()).join(',') || undefined,
    });
    showToast('Product "' + editForm.name + '" updated permanently!');
    setEditOpen(false);
  };

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
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    showToast('Order ' + orderId + ' status changed to ' + newStatus);
  };

  const openDeleteUser = (userId: string, userName: string) => {
    setDeleteUserTarget({ id: userId, name: userName });
    setDeleteUserOpen(true);
  };

  const handleDeleteUser = () => {
    if (!deleteUserTarget) return;
    const name = deleteUserTarget.name;
    deleteUser(deleteUserTarget.id);
    showToast('User "' + name + '" deleted successfully!');
    setDeleteUserOpen(false);
  };

  /* View order detail */
  const openViewOrder = (order: Order) => {
    setViewOrderData(order);
    setViewOrderOpen(true);
  };

  /* Delete order */
  const openDeleteOrder = (orderId: string) => {
    setDeleteOrderTarget({ id: orderId, name: orderId });
    setDeleteOrderOpen(true);
  };

  const handleDeleteOrder = () => {
    if (!deleteOrderTarget) return;
    deleteOrder(deleteOrderTarget.id);
    showToast('Order #' + deleteOrderTarget.id + ' deleted permanently!');
    setDeleteOrderOpen(false);
  };

  /* Payment status toggle */
  const handlePaymentStatusChange = (orderId: string, status: PaymentStatus) => {
    togglePaymentStatus(orderId, status);
    const label = PAYMENT_STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
    showToast('Order #' + orderId + ' payment status: ' + label);
  };

  /* ---- Access control (after all hooks) ------------------------- */
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center p-8">
          <LogIn className="h-16 w-16 mx-auto text-orange-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to log in with an admin account to access the dashboard.
          </p>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
          >
            <LogIn className="h-4 w-4 mr-2" /> Login as Admin
          </Button>
        </Card>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center p-8">
          <ShieldCheck className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You do not have permission to view the admin dashboard. Please create an admin account or log in with admin credentials.
          </p>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
          >
            <UserCog className="h-4 w-4 mr-2" /> Create Admin Account
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
            <ShieldCheck className="h-6 w-6 text-orange-600" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user.name}! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        <Badge className="bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 text-sm">
          Admin
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className={`flex items-center text-xs font-medium ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders" className="relative">
            Orders
            {orders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* ===================== OVERVIEW TAB ===================== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Area Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" /> Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => '₹' + (v / 100000).toFixed(0) + 'L'} />
                      <Tooltip formatter={(value: number) => ['₹' + value.toLocaleString(), 'Revenue']} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#ea580c"
                        fillOpacity={1}
                        fill="url(#adminRevenueGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={'cell-' + index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                      </div>
                      <span className="font-medium">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Orders Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" /> Monthly Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#0891b2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== PRODUCTS TAB ===================== */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                Product Management ({products.length})
              </CardTitle>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={openAdd}>
                <Plus className="h-4 w-4 mr-1" /> Add Product
              </Button>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or brand..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Product</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Brand</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden lg:table-cell">Category</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Price</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Stock</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Sold</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-muted-foreground">
                          No products found
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                {product.images[0] ? (
                                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=' + encodeURIComponent(product.name.slice(0, 20)) + '&category=' + encodeURIComponent(product.categoryName || ''); }} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="h-4 w-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <p className="font-medium truncate max-w-[160px]">{product.name}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{product.brand}</td>
                          <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell">
                            <Badge variant="outline" className="text-xs font-normal">{product.categoryName}</Badge>
                          </td>
                          <td className="py-3 px-2 text-right font-medium">{formatCurrency(product.price)}</td>
                          <td className="py-3 px-2 text-right">
                            <span className={product.stock < 20 ? 'text-red-600 font-semibold' : ''}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right hidden sm:table-cell">{product.sold.toLocaleString()}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-center gap-0.5">
                              <Button
                                variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50"
                                title="View" onClick={() => goToProduct(product.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50"
                                title="Edit" onClick={() => openEdit(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50"
                                title="Delete" onClick={() => openDelete(product)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== ORDERS TAB ======================= */}
        <TabsContent value="orders" className="space-y-4">
          {/* Order status summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {ORDER_STATUSES.map((s) => (
              <Card key={s.value} className="cursor-pointer hover:shadow-md transition-shadow"
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
                    <SelectItem value="all">
                      All Orders ({orderCounts.all})
                    </SelectItem>
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
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Customer</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden lg:table-cell">Items</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden lg:table-cell">Payment</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden xl:table-cell">Pay Status</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground">Status</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground">Change</th>
                        <th className="text-center py-3 px-2 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const pm = PAYMENT_METHOD_CONFIG[order.paymentMethod] || PAYMENT_METHOD_CONFIG.cod;
                        const PmIcon = pm.icon;
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
                            <td className="py-3 px-2 hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                  <span className="text-orange-700 text-xs font-semibold">
                                    {(userMap[order.userId] || '?').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="truncate max-w-[140px]">{userMap[order.userId] || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center hidden lg:table-cell">
                              <Badge variant="outline" className="text-xs font-normal">
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right font-semibold">
                              {formatCurrency(order.totalAmount)}
                            </td>
                            {/* Payment Method */}
                            <td className="py-3 px-2 text-center hidden lg:table-cell">
                              <Badge variant="outline" className={'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border ' + pm.badge}>
                                <PmIcon className="h-3 w-3" />
                                {pm.label}
                              </Badge>
                            </td>
                            {/* Payment Status */}
                            <td className="py-3 px-2 text-center hidden xl:table-cell">
                              <Select
                                value={order.paymentStatus}
                                onValueChange={(val) => handlePaymentStatusChange(order.id, val as PaymentStatus)}
                              >
                                <SelectTrigger className={'w-[140px] h-7 text-xs mx-auto border-0 p-0 ' + PAYMENT_STATUS_BADGE[order.paymentStatus]}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PAYMENT_STATUS_OPTIONS.map((ps) => (
                                    <SelectItem key={ps.value} value={ps.value} className="text-xs">
                                      {ps.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            {/* Order Status Badge */}
                            <td className="py-3 px-2 text-center">
                              <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ' + STATUS_BADGE_CLASS[order.status]}>
                                <span className={'w-1.5 h-1.5 rounded-full ' + STATUS_DOT_CLASS[order.status]} />
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            {/* Order Status Change */}
                            <td className="py-3 px-2 text-center">
                              <Select
                                value={order.status}
                                onValueChange={(val) => handleStatusChange(order.id, val as OrderStatus)}
                              >
                                <SelectTrigger className="w-[110px] h-8 text-xs mx-auto">
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
                            {/* View + Delete Actions */}
                            <td className="py-3 px-2">
                              <div className="flex items-center justify-center gap-0.5">
                                <Button
                                  variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50"
                                  title="View Order Details" onClick={() => openViewOrder(order)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50"
                                  title="Delete Order" onClick={() => openDeleteOrder(order.id)}
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

        {/* ===================== USERS TAB ======================== */}
        <TabsContent value="users" className="space-y-6">
          {/* Mini stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{customersCount}</p>
                  <p className="text-sm text-muted-foreground">Customers</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Store className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sellersCount}</p>
                  <p className="text-sm text-muted-foreground">Sellers</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{adminsCount}</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Registered Users ({registeredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden lg:table-cell">Store Name</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Joined</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsers.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                              <span className="text-orange-700 text-xs font-semibold">
                                {u.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium truncate max-w-[140px]">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden md:table-cell truncate max-w-[180px]">
                          {u.email}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge
                            variant="outline"
                            className={
                              u.role === 'admin'
                                ? 'border-purple-200 bg-purple-50 text-purple-700'
                                : u.role === 'seller'
                                  ? 'border-orange-200 bg-orange-50 text-orange-700'
                                  : 'border-blue-200 bg-blue-50 text-blue-700'
                            }
                          >
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell">
                          {u.storeName || (
                            <span className="text-muted-foreground/50 italic">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground text-xs hidden sm:table-cell">
                          {u.createdAt ? formatDate(u.createdAt) : '-'}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {u.id === user.id ? (
                            <span className="text-xs text-muted-foreground italic">You</span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-red-50"
                              title="Delete User"
                              onClick={() => openDeleteUser(u.id, u.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============ ADD PRODUCT DIALOG ============ */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-600" /> Add New Product
            </DialogTitle>
            <DialogDescription>Fill in the details to add a new product to the store.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Product Name *</Label>
              <Input placeholder="Enter product name" className="mt-1" value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Brand *</Label>
              <Input placeholder="Enter brand name" className="mt-1" value={addForm.brand}
                onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Selling Price (&#8377;) *</Label>
                <Input type="number" placeholder="0" className="mt-1" value={addForm.price}
                  onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} />
              </div>
              <div>
                <Label>MRP (&#8377;)</Label>
                <Input type="number" placeholder="0" className="mt-1" value={addForm.mrp}
                  onChange={(e) => setAddForm({ ...addForm, mrp: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock Quantity *</Label>
                <Input type="number" placeholder="0" className="mt-1" value={addForm.stock}
                  onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })} />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={addForm.category} onValueChange={(v) => setAddForm({ ...addForm, category: v })}>
                  <SelectTrigger className="mt-1 w-full">
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
            <div>
              <Label>Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none mt-1"
                placeholder="Enter product description"
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              />
            </div>
            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> Product Images</Label>
                <button type="button" onClick={() => addImg(addForm, setAddForm)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Image
                </button>
              </div>
              <div className="space-y-2">
                {addForm.images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      {img.trim() ? (
                        <img src={img} alt="" className="w-full h-full rounded-lg object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=Product'; }} />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <Input placeholder={'Image URL ' + (idx + 1)} className="flex-1 h-9"
                      value={img} onChange={(e) => imgHelper(idx, e.target.value, addForm, setAddForm)} />
                    {addForm.images.length > 1 && (
                      <button type="button" onClick={() => rmImg(idx, addForm, setAddForm)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Videos */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="flex items-center gap-1.5"><Video className="h-3.5 w-3.5" /> Video Links</Label>
                <button type="button" onClick={() => addVid(addForm, setAddForm)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Video
                </button>
              </div>
              <div className="space-y-2">
                {addForm.videos.map((vid, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Video className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input placeholder={'Video URL ' + (idx + 1) + ' (YouTube, etc.)'} className="flex-1 h-9"
                      value={vid} onChange={(e) => vidHelper(idx, e.target.value, addForm, setAddForm)} />
                    {addForm.videos.length > 1 && (
                      <button type="button" onClick={() => rmVid(idx, addForm, setAddForm)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ EDIT PRODUCT DIALOG ============ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" /> Edit Product
            </DialogTitle>
            <DialogDescription>Update product details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Product Name *</Label>
              <Input className="mt-1" value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Brand *</Label>
              <Input className="mt-1" value={editForm.brand}
                onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Selling Price (&#8377;) *</Label>
                <Input type="number" className="mt-1" value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
              </div>
              <div>
                <Label>MRP (&#8377;)</Label>
                <Input type="number" className="mt-1" value={editForm.mrp}
                  onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock Quantity *</Label>
                <Input type="number" className="mt-1" value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                  <SelectTrigger className="mt-1 w-full">
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
            <div>
              <Label>Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none mt-1"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> Product Images</Label>
                <button type="button" onClick={() => addImg(editForm, setEditForm)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Image
                </button>
              </div>
              <div className="space-y-2">
                {editForm.images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      {img.trim() ? (
                        <img src={img} alt="" className="w-full h-full rounded-lg object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=Product'; }} />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <Input placeholder={'Image URL ' + (idx + 1)} className="flex-1 h-9"
                      value={img} onChange={(e) => imgHelper(idx, e.target.value, editForm, setEditForm)} />
                    {editForm.images.length > 1 && (
                      <button type="button" onClick={() => rmImg(idx, editForm, setEditForm)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Videos */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="flex items-center gap-1.5"><Video className="h-3.5 w-3.5" /> Video Links</Label>
                <button type="button" onClick={() => addVid(editForm, setEditForm)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Video
                </button>
              </div>
              <div className="space-y-2">
                {editForm.videos.map((vid, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Video className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input placeholder={'Video URL ' + (idx + 1) + ' (YouTube, etc.)'} className="flex-1 h-9"
                      value={vid} onChange={(e) => vidHelper(idx, e.target.value, editForm, setEditForm)} />
                    {editForm.videos.length > 1 && (
                      <button type="button" onClick={() => rmVid(idx, editForm, setEditForm)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleEdit}>
              <Check className="h-4 w-4 mr-1" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ DELETE PRODUCT CONFIRM DIALOG ============ */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {deleteTarget.images[0] ? (
                  <img src={deleteTarget.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=' + encodeURIComponent(deleteTarget.name.slice(0, 20)); }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{deleteTarget.name}</p>
                <p className="text-sm text-muted-foreground">{deleteTarget.brand} &middot; {formatCurrency(deleteTarget.price)}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ DELETE USER CONFIRM DIALOG ============ */}
      <Dialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &ldquo;{deleteUserTarget?.name}&rdquo;?
              All their data will be removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteUserTarget && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-700 text-lg font-bold">
                  {deleteUserTarget.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{deleteUserTarget.name}</p>
                <p className="text-sm text-muted-foreground">This user account will be permanently deleted</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteUserOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ VIEW ORDER DETAIL DIALOG ============ */}
      <Dialog open={viewOrderOpen} onOpenChange={setViewOrderOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" /> Order Details
            </DialogTitle>
            <DialogDescription>Complete order information and tracking details.</DialogDescription>
          </DialogHeader>
          {viewOrderData && (() => {
            const ord = viewOrderData;
            const pmConfig = PAYMENT_METHOD_CONFIG[ord.paymentMethod] || PAYMENT_METHOD_CONFIG.cod;
            const PmIcon = pmConfig.icon;
            const subtotal = ord.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
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
                    <p className="text-sm font-medium">
                      {formatDate(ord.createdAt)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ' + STATUS_BADGE_CLASS[ord.status]}>
                      <span className={'w-1.5 h-1.5 rounded-full ' + STATUS_DOT_CLASS[ord.status]} />
                      {ord.status.charAt(0).toUpperCase() + ord.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Customer */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Customer</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <span className="text-orange-700 text-sm font-semibold">
                        {(userMap[ord.userId] || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-sm">{userMap[ord.userId] || 'Unknown'}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">Payment Information</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Method:</span>
                      <Badge variant="outline" className={'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border ' + pmConfig.badge}>
                        <PmIcon className="h-3 w-3" />
                        {pmConfig.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Status:</span>
                      <Select
                        value={ord.paymentStatus}
                        onValueChange={(val) => {
                          togglePaymentStatus(ord.id, val as PaymentStatus);
                          const label = PAYMENT_STATUS_OPTIONS.find((o) => o.value === val)?.label || val;
                          showToast('Order #' + ord.id + ' payment: ' + label);
                        }}
                      >
                        <SelectTrigger className={'w-[150px] h-7 text-xs border-0 p-0 ' + PAYMENT_STATUS_BADGE[ord.paymentStatus]}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_STATUS_OPTIONS.map((ps) => (
                            <SelectItem key={ps.value} value={ps.value} className="text-xs">
                              {ps.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Order Items ({ord.items.length})</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg border">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {item.product.images[0] ? (
                            <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=Product'; }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product.name}</p>
                          {item.product.brand && (
                            <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-sm">{formatCurrency(item.product.price)}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">-{formatCurrency(ord.discount)}</span>
                  </div>
                  <div className="border-t pt-2 flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg text-orange-700">{formatCurrency(ord.totalAmount)}</span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> Delivery Address
                  </p>
                  <div className="text-sm space-y-0.5">
                    <p className="font-medium">{ord.address}</p>
                    <p className="text-muted-foreground">{ord.city}, {ord.state} - {ord.pincode}</p>
                    <p className="text-muted-foreground">{ord.phone}</p>
                  </div>
                </div>

                {/* Tracking Timeline */}
                {ord.trackingInfo && ord.trackingInfo.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-3">Tracking Timeline</p>
                    <div className="space-y-0">
                      {ord.trackingInfo.map((step, idx) => (
                        <div key={idx} className="flex gap-3">
                          {/* Timeline line + dot */}
                          <div className="flex flex-col items-center">
                            <div className={'w-3 h-3 rounded-full shrink-0 mt-1 ' + (step.completed ? 'bg-orange-500' : 'bg-gray-300')} />
                            {idx < ord.trackingInfo.length - 1 && (
                              <div className={'w-0.5 flex-1 min-h-[24px] ' + (step.completed ? 'bg-orange-300' : 'bg-gray-200')} />
                            )}
                          </div>
                          {/* Content */}
                          <div className="pb-4 min-w-0">
                            <p className={'text-sm font-medium ' + (step.completed ? '' : 'text-muted-foreground')}>
                              {step.status}
                            </p>
                            <p className="text-xs text-muted-foreground">{step.message}</p>
                            <p className="text-xs text-muted-foreground/60 mt-0.5">
                              {formatDate(step.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Open Full View Button */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setViewOrderOpen(false);
                      goToOrder(ord.id);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" /> Open Full View
                  </Button>
                </div>
              </div>
            );
          })()}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewOrderOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ DELETE ORDER CONFIRM DIALOG ============ */}
      <Dialog open={deleteOrderOpen} onOpenChange={setDeleteOrderOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Delete Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete order #{deleteOrderTarget?.id}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteOrderTarget && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-6 w-6 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="font-mono font-semibold text-red-700">#{deleteOrderTarget.id}</p>
                <p className="text-sm text-red-600/70">This order will be permanently removed</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOrderOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
