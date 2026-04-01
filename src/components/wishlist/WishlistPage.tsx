'use client';

import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import { ProductImage } from '@/components/products/ProductImage';

export function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart, navigateTo, goBack, goToProduct } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Heart className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-6">Save items you love for later</p>
        <Button onClick={() => navigateTo('products')} className="bg-orange-600 hover:bg-orange-700">
          Explore Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" onClick={goBack} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <h1 className="text-2xl font-bold mb-6">
        My Wishlist <span className="text-muted-foreground font-normal">({wishlist.length} items)</span>
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        <AnimatePresence>
          {wishlist.map(({ product }) => {
            const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white rounded-xl border hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <ProductImage
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                  {discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px]">{discount}% off</Badge>
                  )}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </button>
                </div>
                <div className="p-3">
                  <div onClick={() => goToProduct(product.id)} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToProduct(product.id); } }}
                    className="text-left w-full cursor-pointer">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.brand}</p>
                    <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
                    {discount > 0 && (
                      <span className="text-xs text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-xs h-8"
                      onClick={() => { addToCart(product); removeFromWishlist(product.id); }}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" /> Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
