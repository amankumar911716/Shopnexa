'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, CreditCard, ShieldCheck, CheckCircle2,
  ChevronRight, Wallet, Banknote
} from 'lucide-react';

export function CheckoutPage() {
  const {
    cart, getCartTotal, getCartMRPTotal, getCartCount, navigateTo, user, isAuthenticated,
    appliedCoupon, couponDiscount, placeOrder, setShowAuthModal, setAuthMode, goBack,
  } = useStore();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderId, setOrderId] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShieldCheck className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please login to continue</h2>
        <p className="text-muted-foreground mb-4">You need to be logged in to place an order</p>
        <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>
          Login / Register
        </Button>
      </div>
    );
  }

  if (cart.length === 0 && !orderId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <Button onClick={() => navigateTo('products')} className="bg-orange-600 hover:bg-orange-700 mt-4">
          Browse Products
        </Button>
      </div>
    );
  }

  if (orderId) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto px-4 py-16 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <CheckCircle2 className="h-20 w-20 mx-auto text-orange-500 mb-6" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
        <p className="text-muted-foreground mb-1">Thank you for your purchase</p>
        <p className="text-lg font-semibold text-orange-600 mb-6">Order ID: {orderId}</p>
        <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
          <p className="text-sm text-muted-foreground">Estimated Delivery</p>
          <p className="font-semibold">{new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { useStore.getState().goToOrder(orderId); }}>
            Track Order
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => navigateTo('home')}>
            Continue Shopping
          </Button>
        </div>
      </motion.div>
    );
  }

  const cartTotal = getCartTotal();
  const deliveryFee = cartTotal > 499 ? 0 : 49;
  const finalTotal = cartTotal + deliveryFee;

  const handlePlaceOrder = () => {
    const newOrderId = placeOrder({
      userId: user!.id,
      items: cart,
      totalAmount: finalTotal,
      discount: couponDiscount,
      status: 'placed',
      paymentMethod: paymentMethod as 'cod' | 'upi' | 'visa' | 'mastercard',
      paymentStatus: paymentMethod === 'cod' ? 'unpaid' as const : 'paid' as const,
      address,
      city,
      state,
      pincode,
      phone,
      trackingInfo: [
        { status: 'Order Placed', message: 'Your order has been placed successfully', timestamp: new Date().toISOString(), completed: true },
        { status: 'Confirmed', message: 'Order confirmed by seller', timestamp: '', completed: false },
        { status: 'Shipped', message: 'Your order has been shipped', timestamp: '', completed: false },
        { status: 'Delivered', message: 'Order delivered to your address', timestamp: '', completed: false },
      ],
    });
    setOrderId(newOrderId);
  };

  const steps = [
    { num: 1, label: 'Address', icon: MapPin },
    { num: 2, label: 'Payment', icon: CreditCard },
    { num: 3, label: 'Confirm', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" onClick={goBack} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Cart
      </Button>

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <button
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step >= s.num
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-muted-foreground'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step > s.num ? 'bg-orange-600 text-white' : step === s.num ? 'border-2 border-orange-600 text-orange-600' : 'border-2 border-gray-300 text-muted-foreground'
              }`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-0.5 mx-1 ${step > s.num ? 'bg-orange-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <h2 className="text-lg font-semibold">Delivery Address</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input id="address" placeholder="House no, Street, Area" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" placeholder="6-digit pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="mt-1" maxLength={6} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input id="phone" placeholder="10-digit number" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" maxLength={10} />
                  </div>
                </div>
                <Button className="w-full mt-6 bg-orange-600 hover:bg-orange-700" onClick={() => {
                  if (address && city && state && pincode && phone) setStep(2);
                }} disabled={!address || !city || !state || !pincode || !phone}>
                  Continue to Payment <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  <h2 className="text-lg font-semibold">Payment Method</h2>
                </div>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {[
                    { value: 'upi', label: 'UPI', desc: 'Pay using any UPI app', icon: Wallet },
                    { value: 'visa', label: 'Visa Card', desc: 'Pay using Visa credit/debit card', icon: CreditCard },
                    { value: 'mastercard', label: 'Mastercard', desc: 'Pay using Mastercard credit/debit card', icon: CreditCard },
                    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: Banknote },
                  ].map(({ value, label, desc, icon: Icon }) => (
                    <div
                      key={value}
                      onClick={() => setPaymentMethod(value)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        paymentMethod === value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <RadioGroupItem value={value} />
                      <Icon className={`h-5 w-5 ${paymentMethod === value ? 'text-orange-600' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => setStep(3)}>
                    Review Order <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Address summary */}
                <div className="bg-white rounded-xl border p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold text-sm">Delivery Address</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Change</Button>
                  </div>
                  <p className="text-sm">{address}</p>
                  <p className="text-sm text-muted-foreground">{city}, {state} - {pincode}</p>
                  <p className="text-sm text-muted-foreground">Phone: {phone}</p>
                </div>

                {/* Payment summary */}
                <div className="bg-white rounded-xl border p-5 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold text-sm">Payment Method</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(2)}>Change</Button>
                  </div>
                  <p className="text-sm font-medium capitalize">
                    {paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'visa' ? 'Visa Card' : paymentMethod === 'mastercard' ? 'Mastercard' : 'Cash on Delivery'}
                  </p>
                </div>

                {/* Items */}
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-semibold text-sm mb-3">Items ({getCartCount()})</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                          <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=' + encodeURIComponent(item.product.name.slice(0, 20)) + '&category=' + encodeURIComponent(item.product.categoryName || ''); }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button
                    className="flex-1 bg-orange-600 hover:bg-orange-700 h-11 font-semibold"
                    onClick={handlePlaceOrder}
                  >
                    <ShieldCheck className="mr-2 h-5 w-5" /> Place Order - ₹{finalTotal.toLocaleString()}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-xl border p-5">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{getCartMRPTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>Product Discount</span>
                <span>-₹{(getCartMRPTotal() - cartTotal).toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Coupon ({appliedCoupon})</span>
                  <span>-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className={deliveryFee === 0 ? 'text-orange-600' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-600">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
