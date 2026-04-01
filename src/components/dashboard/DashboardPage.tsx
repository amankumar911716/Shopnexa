'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import type { Order, User, UserRole, PaymentMethod, PaymentStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  Store,
  Shield,
  UserCheck,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Eye,
  Trash2,
  Banknote,
  Wallet,
  CreditCard,
  Check,
  MapPin,
  Package as PackageIcon,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatDate as safeFormatDate, formatDateTime as safeFormatDateTime } from '@/lib/dates';

// ---------- helpers ----------

const INDIAN_NUM = new Intl.NumberFormat('en-IN');

function formatINR(amount: number): string {
  return '\u20B9' + INDIAN_NUM.format(amount);
}

function formatDate(iso: string): string {
  return safeFormatDate(iso);
}

function formatDateTime(iso: string): string {
  return safeFormatDateTime(iso);
}

const STATUS_STYLES: Record<
  Order['status'],
  { color: string; icon: React.ReactNode }
> = {
  pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock className="size-3" /> },
  placed: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Clock className="size-3" /> },
  confirmed: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <CheckCircle2 className="size-3" /> },
  shipped: { color: 'bg-violet-100 text-violet-700 border-violet-200', icon: <Truck className="size-3" /> },
  delivered: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="size-3" /> },
  cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="size-3" /> },
  returned: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <RotateCcw className="size-3" /> },
  rejected: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <Ban className="size-3" /> },
};

const ROLE_STYLES: Record<UserRole, string> = {
  customer: 'bg-blue-100 text-blue-700 border-blue-200',
  seller: 'bg-orange-100 text-orange-700 border-orange-200',
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
};

const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { icon: React.ReactNode; label: string; color: string }> = {
  cod: { icon: <Banknote className="size-3" />, label: 'COD', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  upi: { icon: <Wallet className="size-3" />, label: 'UPI', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  visa: { icon: <CreditCard className="size-3" />, label: 'VISA', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  mastercard: { icon: <CreditCard className="size-3" />, label: 'MC', color: 'bg-rose-100 text-rose-700 border-rose-200' },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  paid: { label: '\u2713 Received', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  unpaid: { label: '\u2717 Not Received', color: 'bg-red-100 text-red-700 border-red-200' },
  pending: { label: '\u23F3 Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
};

const TRACKING_ICONS: Record<string, React.ReactNode> = {
  placed: <Clock className="size-4" />,
  confirmed: <CheckCircle2 className="size-4" />,
  shipped: <Truck className="size-4" />,
  delivered: <PackageIcon className="size-4" />,
};

const PIE_COLORS = [
  '#ea580c',
  '#f97316',
  '#fb923c',
  '#fdba74',
  '#fed7aa',
  '#f59e0b',
  '#ef4444',
  '#e11d48',
];

// ---------- demo monthly revenue ----------

const monthlyRevenue = [
  { month: 'Jan', revenue: 420000 },
  { month: 'Feb', revenue: 380000 },
  { month: 'Mar', revenue: 510000 },
  { month: 'Apr', revenue: 470000 },
  { month: 'May', revenue: 620000 },
  { month: 'Jun', revenue: 590000 },
  { month: 'Jul', revenue: 710000 },
  { month: 'Aug', revenue: 680000 },
  { month: 'Sep', revenue: 820000 },
  { month: 'Oct', revenue: 940000 },
  { month: 'Nov', revenue: 1150000 },
  { month: 'Dec', revenue: 1380000 },
];

// ---------- component ----------

export function DashboardPage() {
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const registeredUsers = useStore((s) => s.registeredUsers);
  const user = useStore((s) => s.user);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const goToOrder = useStore((s) => s.goToOrder);
  const deleteOrder = useStore((s) => s.deleteOrder);

  /* ---- ALL HOOKS FIRST (before any early returns) ---- */
  const [toast, setToast] = useState<string | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteClick = (order: Order) => {
    setDeleteTarget(order);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteOrder(deleteTarget.id);
      showToast('Order ' + deleteTarget.id + ' has been deleted');
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  // --- computed stats ---

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + o.totalAmount - o.discount, 0),
    [orders],
  );

  const totalOrders = orders.length;

  const totalProducts = products.length;

  const totalCustomers = useMemo(
    () => registeredUsers.filter((u) => u.role === 'customer').length,
    [registeredUsers],
  );

  const totalSellers = useMemo(
    () => registeredUsers.filter((u) => u.role === 'seller').length,
    [registeredUsers],
  );

  const totalAdmins = useMemo(
    () => registeredUsers.filter((u) => u.role === 'admin').length,
    [registeredUsers],
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [orders],
  );

  // category distribution for pie chart
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const name = p.categoryName || categories.find((c) => c.id === p.categoryId)?.name || 'Other';
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [products, categories]);

  // orders by status count
  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      placed: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
      rejected: 0,
    };
    orders.forEach((o) => {
      if (o.status in counts) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

  // helper: look up user by id
  function lookupUser(userId: string): string {
    const found = registeredUsers.find((u) => u.id === userId);
    return found ? found.name : 'Unknown';
  }

  // helper: look up user email by id
  function lookupUserEmail(userId: string): string {
    const found = registeredUsers.find((u) => u.id === userId);
    return found ? found.email : '';
  }

  // helper: look up full user object
  function lookupFullUser(userId: string): User | undefined {
    return registeredUsers.find((u) => u.id === userId);
  }

  // ---------- auth guard ----------

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="size-16 text-muted-foreground/40" />
        <h2 className="text-2xl font-semibold">Access Restricted</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You must be logged in to view the platform dashboard. Please sign in
          with your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-[100] bg-orange-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Platform Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, <span className="font-medium text-foreground">{user.name}</span>
            {' '}&mdash; here&apos;s what&apos;s happening across Shopnexa today.
          </p>
        </div>
        <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs px-3 py-1">
          <TrendingUp className="size-3 mr-1" />
          Live Overview
        </Badge>
      </div>

      {/* ---------- 4 Stats Cards ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="rounded-lg bg-orange-100 p-2">
              <IndianRupee className="size-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUpRight className="size-3 text-orange-500" />
              From delivered orders only
            </p>
          </CardContent>
          {/* Decorative bar */}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-orange-500 to-orange-300" />
        </Card>

        {/* Total Orders */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <div className="rounded-lg bg-blue-100 p-2">
              <ShoppingCart className="size-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{INDIAN_NUM.format(totalOrders)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Package className="size-3 text-blue-500" />
              All-time platform orders
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-300" />
        </Card>

        {/* Total Products */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <div className="rounded-lg bg-amber-100 p-2">
              <Package className="size-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{INDIAN_NUM.format(totalProducts)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Store className="size-3 text-amber-500" />
              Listed across all categories
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-amber-300" />
        </Card>

        {/* Total Customers */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
            <div className="rounded-lg bg-purple-100 p-2">
              <Users className="size-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{INDIAN_NUM.format(totalCustomers)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <UserCheck className="size-3 text-purple-500" />
              Registered customer accounts
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-purple-300" />
        </Card>
      </div>

      {/* ---------- Tabs ---------- */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* ========== Overview Tab ========== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue Area Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenue}>
                      <defs>
                        <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ea580c" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#d1d5db' }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#d1d5db' }}
                        tickFormatter={(v: number) =>
                          v >= 100000 ? (v / 100000).toFixed(0) + 'L' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : String(v)
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [formatINR(value), 'Revenue']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '13px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#ea580c"
                        strokeWidth={2.5}
                        fill="url(#orangeGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Products by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((_entry, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [value + ' products', 'Count']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '13px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {categoryData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="inline-block size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">({item.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="sr-only">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => {
                      const style = STATUS_STYLES[order.status];
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell>{lookupUser(order.userId)}</TableCell>
                          <TableCell className="text-right">
                            {order.items.length}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatINR(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={style.color}
                            >
                              {style.icon}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              onClick={() => goToOrder(order.id)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {recentOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No orders yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== Users Tab ========== */}
        <TabsContent value="users" className="space-y-6">
          {/* Mini stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <div className="rounded-lg bg-slate-100 p-2">
                  <Users className="size-4 text-slate-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registeredUsers.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sellers
                </CardTitle>
                <div className="rounded-lg bg-orange-100 p-2">
                  <Store className="size-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSellers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Admins
                </CardTitle>
                <div className="rounded-lg bg-purple-100 p-2">
                  <Shield className="size-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAdmins}</div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">Joined</TableHead>
                      <TableHead className="hidden lg:table-cell">Store</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registeredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex size-8 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-sm font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={ROLE_STYLES[u.role]}
                          >
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                          {u.createdAt ? formatDate(u.createdAt) : 'N/A'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                          {u.storeName || '\u2014'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {registeredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No registered users.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== Orders Tab ========== */}
        <TabsContent value="orders" className="space-y-6">
          {/* Status summary badges */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                {(Object.entries(ordersByStatus) as [Order['status'], number][]).map(
                  ([status, count]) => {
                    const style = STATUS_STYLES[status];
                    return (
                      <Badge
                        key={status}
                        variant="outline"
                        className={`${style.color} gap-1.5 px-3 py-1.5 text-sm`}
                      >
                        {style.icon}
                        <span className="capitalize font-medium">{status}</span>
                        <span className="font-bold ml-0.5">{count}</span>
                      </Badge>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[32rem] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Pay Status</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const statusStyle = STATUS_STYLES[order.status];
                      const payMethod = PAYMENT_METHOD_CONFIG[order.paymentMethod];
                      const payStatus = PAYMENT_STATUS_CONFIG[order.paymentStatus || 'pending'];
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell>{lookupUser(order.userId)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={payMethod.color}>
                              {payMethod.icon}
                              <span className="ml-1">{payMethod.label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={payStatus.color}>
                              {payStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {order.items.length}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatINR(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusStyle.color}
                            >
                              {statusStyle.icon}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="size-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => setViewOrder(order)}
                                title="View order details"
                              >
                                <Eye className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="size-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteClick(order)}
                                title="Delete order"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {orders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          No orders placed yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========== Delete Order Confirmation Dialog ========== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="size-5" />
              Delete Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order{' '}
              <span className="font-mono font-semibold text-foreground">
                {deleteTarget?.id}
              </span>
              ? This action cannot be undone. The order will be permanently removed from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              <Trash2 className="size-4 mr-1" />
              Delete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== View Order Detail Dialog ========== */}
      <Dialog open={!!viewOrder} onOpenChange={(open) => { if (!open) setViewOrder(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {viewOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <PackageIcon className="size-5 text-orange-600" />
                  Order Details
                </DialogTitle>
                <DialogDescription>
                  Full details for order {viewOrder.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* Order Info Header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Order ID</p>
                    <p className="font-mono font-semibold text-sm">{viewOrder.id}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Order Date</p>
                    <p className="text-sm font-medium">{formatDateTime(viewOrder.createdAt)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                    <Badge variant="outline" className={STATUS_STYLES[viewOrder.status].color}>
                      {STATUS_STYLES[viewOrder.status].icon}
                      {viewOrder.status.charAt(0).toUpperCase() + viewOrder.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">Customer</p>
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-sm font-bold shrink-0">
                      {lookupUser(viewOrder.userId).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{lookupUser(viewOrder.userId)}</p>
                      <p className="text-xs text-muted-foreground">{lookupUserEmail(viewOrder.userId)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1.5 font-medium">Payment Method</p>
                    <Badge variant="outline" className={PAYMENT_METHOD_CONFIG[viewOrder.paymentMethod].color}>
                      {PAYMENT_METHOD_CONFIG[viewOrder.paymentMethod].icon}
                      <span className="ml-1">{PAYMENT_METHOD_CONFIG[viewOrder.paymentMethod].label}</span>
                    </Badge>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1.5 font-medium">Payment Status</p>
                    <Badge variant="outline" className={PAYMENT_STATUS_CONFIG[viewOrder.paymentStatus || 'pending'].color}>
                      {PAYMENT_STATUS_CONFIG[viewOrder.paymentStatus || 'pending'].label}
                    </Badge>
                  </div>
                </div>

                {/* Order Items */}
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">Order Items ({viewOrder.items.length})</p>
                  <div className="space-y-3">
                    {viewOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        {/* Product image */}
                        <div className="size-12 rounded-lg bg-muted border overflow-hidden shrink-0">
                          {item.product.images && item.product.images[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="size-full object-cover"
                              onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=' + encodeURIComponent(item.product.name.slice(0, 20)) + '&category=' + encodeURIComponent(item.product.categoryName || ''); }}
                            />
                          ) : null}
                        </div>
                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold">{formatINR(item.product.price)}</span>
                            <span className="text-xs text-muted-foreground">&times; {item.quantity}</span>
                            <span className="text-sm font-semibold text-orange-600 ml-auto">{formatINR(item.product.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">Price Breakdown</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatINR(viewOrder.totalAmount + viewOrder.discount)}</span>
                    </div>
                    {viewOrder.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-orange-600">- {formatINR(viewOrder.discount)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between text-sm">
                      <span className="font-semibold">Total Amount</span>
                      <span className="font-bold text-lg">{formatINR(viewOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium flex items-center gap-1.5">
                    <MapPin className="size-3" />
                    Delivery Address
                  </p>
                  <div className="text-sm space-y-0.5">
                    <p className="font-medium">{lookupUser(viewOrder.userId)}</p>
                    <p className="text-muted-foreground">{viewOrder.address}</p>
                    <p className="text-muted-foreground">{viewOrder.city}, {viewOrder.state} - {viewOrder.pincode}</p>
                    <p className="text-muted-foreground">Phone: {viewOrder.phone}</p>
                  </div>
                </div>

                {/* Tracking Timeline */}
                {viewOrder.trackingInfo && viewOrder.trackingInfo.length > 0 && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-3 font-medium flex items-center gap-1.5">
                      <Truck className="size-3" />
                      Tracking Timeline
                    </p>
                    <div className="relative pl-6">
                      {/* Vertical line */}
                      <div className="absolute left-[11px] top-1 bottom-1 w-0.5 bg-border" />
                      {viewOrder.trackingInfo.map((step, idx) => (
                        <div key={idx} className="relative mb-4 last:mb-0">
                          {/* Dot */}
                          <div className={`absolute -left-6 top-0.5 size-[22px] rounded-full flex items-center justify-center border-2 ${
                            step.completed
                              ? 'bg-orange-100 border-orange-500 text-orange-600'
                              : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                          }`}>
                            {TRACKING_ICONS[step.status] || <PackageIcon className="size-3" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{step.message}</p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(step.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewOrder(null)}
                >
                  Close
                </Button>
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => {
                    setViewOrder(null);
                    goToOrder(viewOrder.id);
                  }}
                >
                  <Eye className="size-4 mr-1" />
                  Open Full View
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
