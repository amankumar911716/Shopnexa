'use client';

import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Zap, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ProductImage } from '@/components/products/ProductImage';

export function FlashDeals() {
  const { products, goToProduct, addToCart, addToWishlist, isInWishlist } = useStore();
  const flashDeals = products.filter(p => p.isFlashDeal && p.flashPrice);
  const [timeLeft, setTimeLeft] = useState({ h: 7, m: 45, s: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 11; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-white">
            <Zap className="h-4 w-4" /><span className="font-bold text-sm">Flash Deals</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /><span>Ends in</span>
            <div className="flex items-center gap-0.5 font-mono text-sm font-bold text-red-500">
              {[timeLeft.h, timeLeft.m, timeLeft.s].map((t, i) => (
                <span key={i} className="bg-red-100 text-red-600 rounded px-1.5 py-0.5 text-xs">{String(t).padStart(2, '0')}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {flashDeals.map((product, index) => {
          const discount = Math.round(((product.mrp - (product.flashPrice || product.price)) / product.mrp) * 100);
          const wishlisted = isInWishlist(product.id);
          return (
            <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-xl border-2 border-red-100 hover:border-red-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <ProductImage src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold">{discount}% OFF</Badge>
                <button onClick={(e) => { e.stopPropagation(); addToWishlist(product); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-red-50 transition-colors">
                  <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="p-3">
                <div onClick={() => goToProduct(product.id)} className="text-left w-full cursor-pointer">
                  <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-lg font-bold text-red-600">₹{(product.flashPrice || product.price).toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={"h-3 w-3 " + (star <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300")} />
                      ))}
                    </div>
                    <Button size="sm" className="inline-flex items-center justify-center rounded-lg text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white h-7 px-2.5"
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                      <ShoppingCart className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (product.sold / (product.sold + product.stock)) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{product.stock} left</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
