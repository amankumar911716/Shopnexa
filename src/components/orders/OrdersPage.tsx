'use client';

import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, Clock, CheckCircle2, Truck, XCircle, RotateCcw,
  MapPin, Trash2
} from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { formatDate } from '@/lib/dates';

export function OrdersPage() {
  const { orders, navigateTo, goToOrder, goBack, deleteOrder } = useStore();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
        <Button onClick={() => navigateTo('products')} className="bg-orange-600 hover:bg-orange-700">
          Start Shopping
        </Button>
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
    pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
    placed: { color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock },
    confirmed: { color: 'text-purple-600', bg: 'bg-purple-50', icon: CheckCircle2 },
    shipped: { color: 'text-orange-600', bg: 'bg-orange-50', icon: Truck },
    delivered: { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
    cancelled: { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
    returned: { color: 'text-gray-600', bg: 'bg-gray-50', icon: RotateCcw },
    rejected: { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" onClick={goBack} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order, idx) => {
          const config = statusConfig[order.status] || statusConfig.placed;
          const StatusIcon = config.icon;
          
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Order #{order.id}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <Badge className={`${config.bg} ${config.color} border-0`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0 relative">
                          <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=' + encodeURIComponent(item.product.name.slice(0, 20)) + '&category=' + encodeURIComponent(item.product.categoryName || ''); }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>
                    )}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <Badge variant="outline" className={`text-[10px] ${order.paymentMethod === 'cod' ? 'bg-amber-100 text-amber-700' : order.paymentMethod === 'upi' ? 'bg-blue-100 text-blue-700' : order.paymentMethod === 'visa' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>{order.paymentMethod.toUpperCase()}</Badge>
                        <span className={`text-[9px] font-medium ${order.paymentStatus === 'paid' ? 'text-orange-600' : order.paymentStatus === 'unpaid' ? 'text-red-600' : 'text-yellow-600'}`}>{order.paymentStatus === 'paid' ? '✓ Received' : order.paymentStatus === 'unpaid' ? '✗ Not Received' : '⏳ Pending'}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50" title="Delete" onClick={() => { setDeleteId(order.id); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Delete Order Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Order</DialogTitle><DialogDescription>Are you sure you want to delete order #{deleteId}? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) { deleteOrder(deleteId); setDeleteOpen(false); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function OrderDetailPage() {
  const { selectedOrderId, orders, goBack } = useStore();
  const order = orders.find(o => o.id === selectedOrderId);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Order not found</h2>
        <Button onClick={goBack}>Back</Button>
      </div>
    );
  }

  const statusSteps = [
    { key: 'placed', label: 'Order Placed', icon: Package },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];
  const currentStepIdx = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" onClick={goBack} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-xs ${order.paymentMethod === 'cod' ? 'bg-amber-100 text-amber-700' : order.paymentMethod === 'upi' ? 'bg-blue-100 text-blue-700' : order.paymentMethod === 'visa' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
            {order.paymentMethod.toUpperCase()}
          </Badge>
          <Badge className={
            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
            order.status === 'cancelled' || order.status === 'rejected' ? 'bg-red-100 text-red-700' :
            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-blue-100 text-blue-700'
          }>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Payment Status */}
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Payment Status:</span>
            <span className={`text-sm font-semibold ${order.paymentStatus === 'paid' ? 'text-orange-600' : order.paymentStatus === 'unpaid' ? 'text-red-600' : 'text-yellow-600'}`}>
              {order.paymentStatus === 'paid' ? '✓ Payment Received' : order.paymentStatus === 'unpaid' ? '✗ Payment Not Received' : '⏳ Payment Pending'}
            </span>
          </div>
          <Badge variant="outline" className="text-xs uppercase">{order.paymentMethod}</Badge>
        </CardContent>
      </Card>

      {/* Tracking */}
      {order.status !== 'cancelled' && order.status !== 'returned' && order.status !== 'rejected' && order.status !== 'pending' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-600" /> Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200">
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${(currentStepIdx / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const StepIcon = step.icon;
                return (
                  <div key={step.key} className="flex flex-col items-center z-10 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted && idx < currentStepIdx ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center ${isCompleted ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {order.trackingInfo.length > 0 && (
              <div className="mt-6 space-y-3">
                {order.trackingInfo.filter(t => t.completed).map((info, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{info.message}</p>
                      {info.timestamp && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(info.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item) => (
            <div key={item.product.id} className="flex gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0 relative">
                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=' + encodeURIComponent(item.product.name.slice(0, 20)) + '&category=' + encodeURIComponent(item.product.categoryName || ''); }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.product.price.toLocaleString()}</p>
              </div>
              <p className="font-semibold text-sm">₹{(item.product.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery Address & Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-600" /> Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{order.address}</p>
            <p className="text-muted-foreground">{order.city}, {order.state} - {order.pincode}</p>
            <p className="text-muted-foreground">{order.phone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium uppercase">{order.paymentMethod}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-orange-600">₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
