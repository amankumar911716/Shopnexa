'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Tag, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { ProductImage } from '@/components/products/ProductImage';

export function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, getCartMRPTotal, getCartCount, navigateTo, appliedCoupon, applyCoupon, removeCoupon, couponDiscount, goBack } = useStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = () => {
    const success = applyCoupon(couponInput);
    if (!success) { setCouponError('Invalid coupon or minimum order not met'); setTimeout(() => setCouponError(''), 3000); }
    else { setCouponError(''); setCouponInput(''); }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground/20 mb-4" />
        <h2 className="text-xl font-semibold mb-1">Your cart is empty!</h2>
        <p className="text-sm text-muted-foreground mb-4">Add items to it now.</p>
        <Button onClick={() => navigateTo('products')} className="bg-orange-600 hover:bg-orange-700">Shop now</Button>
      </div>
    );
  }

  const cartTotal = getCartTotal();
  const mrpTotal = getCartMRPTotal();
  const totalDiscount = mrpTotal - cartTotal;
  const deliveryFee = cartTotal > 499 ? 0 : 40;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <button onClick={() => navigateTo('home')} className="hover:text-orange-600 transition-colors">Home</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">Cart ({getCartCount()})</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          <Button variant="ghost" size="sm" onClick={goBack} className="mb-2 -ml-2 text-muted-foreground hover:text-orange-600">
            <ArrowLeft className="h-4 w-4 mr-1" /> Continue Shopping
          </Button>

          <AnimatePresence>
            {cart.map((item) => (
              <motion.div key={item.product.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card className="overflow-hidden">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50 shrink-0 cursor-pointer"
                      onClick={() => useStore.getState().goToProduct(item.product.id)}>
                      <ProductImage src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div onClick={() => useStore.getState().goToProduct(item.product.id)} role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); useStore.getState().goToProduct(item.product.id); } }}
                        className="text-sm font-medium text-foreground hover:text-orange-600 line-clamp-1 text-left transition-colors cursor-pointer">
                        {item.product.name}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.product.brand}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Badge className="bg-orange-600 text-white text-[10px] px-1.5 py-0">{item.product.rating}★</Badge>
                        <span className="text-xs text-muted-foreground">Ratings</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-base font-bold text-foreground">₹{item.product.price.toLocaleString()}</span>
                        {item.product.mrp > item.product.price && (
                          <>
                            <span className="text-xs text-muted-foreground line-through">₹{item.product.mrp.toLocaleString()}</span>
                            <span className="text-xs font-semibold text-orange-600">{Math.round(((item.product.mrp - item.product.price) / item.product.mrp) * 100)}% off</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center border rounded-lg overflow-hidden">
                          <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-50 text-sm">−</button>
                          <span className="px-3 py-1 text-sm font-medium border-x min-w-[32px] text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))} className="px-3 py-1 hover:bg-gray-50 text-sm">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-sm text-orange-600 font-medium hover:underline">Remove</button>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Delivery by {new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-orange-600 font-medium mt-0.5">FREE Delivery</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Coupon */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-semibold">Apply Coupon</span>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Enter coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} className="flex-1" />
                <Button onClick={handleApplyCoupon} disabled={!couponInput} className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50">Apply</Button>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between mt-3 p-2.5 bg-orange-50 rounded-lg border border-orange-100">
                  <span className="text-sm text-orange-700 font-medium">✓ Coupon {appliedCoupon} applied!</span>
                  <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline font-medium">Remove</button>
                </div>
              )}
              {couponError && <p className="text-xs text-destructive mt-2">{couponError}</p>}
              <p className="text-[11px] text-muted-foreground mt-2">Try: SAVE10, FLAT20, WELCOME, MEGA50</p>
            </CardContent>
          </Card>
        </div>

        {/* Price Details Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Price Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Price ({getCartCount()} items)</span><span className="font-medium">₹{mrpTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-orange-600"><span>Discount</span><span className="font-medium">−₹{(totalDiscount + couponDiscount).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charges</span>
                <span className={deliveryFee === 0 ? 'text-orange-600 font-medium' : 'font-medium'}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold"><span>Total Amount</span><span>₹{(cartTotal + deliveryFee).toLocaleString()}</span></div>
              <p className="text-sm text-orange-600 font-medium">You will save ₹{(totalDiscount + couponDiscount).toLocaleString()} on this order</p>
              <Button size="lg" onClick={() => navigateTo('checkout')} className="w-full bg-amber-500 hover:bg-amber-600 h-12 text-base font-semibold rounded-xl mt-2">
                PLACE ORDER <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-orange-600" /> Safe and Secure Payments. Easy returns.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
