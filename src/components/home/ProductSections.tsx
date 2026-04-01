'use client';

import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, ArrowRight, TrendingUp } from 'lucide-react';
import { ProductImage } from '@/components/products/ProductImage';

function ProductCard({ product, index = 0 }: { product: ReturnType<typeof useStore.getState>['products'][0]; index?: number }) {
  const { goToProduct, addToCart, addToWishlist, isInWishlist } = useStore();
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
      className="group bg-white rounded-xl border hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <ProductImage src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {discount > 0 && <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0">-{discount}%</Badge>}
        {product.isTrending && <Badge className="absolute top-2 right-10 bg-amber-500 text-white text-[10px] px-1.5 py-0"><TrendingUp className="h-3 w-3 mr-0.5" />Hot</Badge>}
        <button onClick={(e) => { e.stopPropagation(); addToWishlist(product); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm">
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button size="sm" className="w-full rounded-none bg-orange-600 hover:bg-orange-700 text-white h-9"
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
            <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
          </Button>
        </div>
      </div>
      <div onClick={() => goToProduct(product.id)} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToProduct(product.id); } }}
        className="p-3 text-left flex-1 flex flex-col cursor-pointer">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.brand}</p>
        <h3 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">{product.name}</h3>
        <span className="flex items-center gap-1 mb-2">
          <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`h-3 w-3 ${star <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
            ))}
          </span>
          <span className="text-xs text-muted-foreground">({product.reviewCount.toLocaleString()})</span>
        </span>
        <span className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
          {discount > 0 && <span className="text-xs text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>}
        </span>
      </div>
    </motion.div>
  );
}

export function TrendingProducts() {
  const { products } = useStore();
  const trending = products.filter(p => p.isTrending).slice(0, 8);
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">Trending Now</h2><p className="text-sm text-muted-foreground mt-1">Most popular products this week</p></div>
        <Button variant="outline" className="hidden sm:flex" onClick={() => useStore.getState().navigateTo('products')}>View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {trending.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

export function FeaturedProducts() {
  const { products } = useStore();
  const featured = products.filter(p => p.isFeatured).slice(0, 10);
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">Featured Products</h2><p className="text-sm text-muted-foreground mt-1">Handpicked picks just for you</p></div>
        <Button variant="outline" className="hidden sm:flex" onClick={() => useStore.getState().navigateTo('products')}>View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
      </div>
      <Carousel opts={{ align: 'start' }} className="w-full">
        <CarouselContent className="-ml-4">
          {featured.map((product) => (
            <CarouselItem key={product.id} className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

export function ProductScrollSection({ title, products: productList }: { title: string; products: ReturnType<typeof useStore.getState>['products'] }) {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">{title}</h2></div>
        <Button variant="outline" className="hidden sm:flex" onClick={() => useStore.getState().navigateTo('products')}>View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
      </div>
      <Carousel opts={{ align: 'start' }} className="w-full">
        <CarouselContent className="-ml-4">
          {productList.map((product) => (
            <CarouselItem key={product.id} className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

export { ProductCard };
