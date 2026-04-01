'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { sampleReviews } from '@/data/seed-data';
import { motion } from 'framer-motion';
import {
  Star, Heart, ShoppingCart, ArrowLeft, Share2, Truck, ShieldCheck, RotateCcw, ChevronRight,
  ChevronDown, ChevronUp, ThumbsUp, Check, CreditCard, Tag, Gift
} from 'lucide-react';
import { ProductImage } from './ProductImage';

export function ProductDetail() {
  const { selectedProductId, products, goBack, addToCart, addToWishlist, isInWishlist, navigateTo } = useStore();
  const product = products.find(p => p.id === selectedProductId);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [pincode, setPincode] = useState('400001');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-xl font-medium mb-2">Product not found</h2>
        <Button onClick={() => navigateTo('products')} className="bg-orange-600 hover:bg-orange-700">Go to Products</Button>
      </div>
    );
  }

  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const wishlisted = isInWishlist(product.id);
  const reviews = sampleReviews.filter(r => r.productId === product.id);
  const relatedProducts = products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2.5 text-xs text-muted-foreground flex items-center gap-1.5">
          <button onClick={() => navigateTo('home')} className="hover:text-orange-600 transition-colors">Home</button>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => { useStore.getState().setFilters({ search: '', categoryId: product.categoryId }); navigateTo('products'); }}
            className="hover:text-orange-600 transition-colors">{product.categoryName}</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" onClick={goBack} className="mb-4 -ml-2 text-muted-foreground hover:text-orange-600">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to results
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column - Images */}
          <div className="md:col-span-5">
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border mb-3 group">
                  <ProductImage src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {discount > 0 && (
                    <Badge className="absolute top-3 left-3 bg-orange-600 text-white text-xs font-semibold">{discount}% OFF</Badge>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2">
                    {product.images.map((img, idx) => (
                      <button key={idx} onClick={() => setSelectedImage(idx)}
                        className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${selectedImage === idx ? 'border-orange-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                        <ProductImage src={img} alt={product.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <button onClick={() => addToWishlist(product)}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${wishlisted ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}>
                    <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500' : ''}`} />
                    {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-orange-600 transition-colors">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Product Info */}
          <div className="md:col-span-7">
            <Card className="mb-4">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">{product.brand}</p>
                <h1 className="text-xl font-bold text-foreground mb-3">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-orange-600 text-white font-semibold text-xs px-2.5 py-1">
                    {product.rating} <Star className="h-3 w-3 ml-0.5 fill-white" />
                  </Badge>
                  <span className="text-sm text-muted-foreground">{product.reviewCount.toLocaleString()} Ratings & {Math.floor(product.reviewCount * 0.7).toLocaleString()} Reviews</span>
                  <Badge variant="secondary" className="text-xs gap-1"><ShieldCheck className="h-3 w-3" /> Shopnexa Assured</Badge>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-2xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                  {discount > 0 && (
                    <>
                      <span className="text-base text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
                      <span className="text-sm font-semibold text-orange-600">{discount}% off</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">inclusive of all taxes</p>

                {/* Offers */}
                <div className="mt-5">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-orange-600" /> Available Offers
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { title: 'Bank Offer', desc: '5% Cashback on Axis Bank Card' },
                      { title: 'Bank Offer', desc: '10% off on HDFC Credit Card, up to ₹1,500' },
                      { title: 'Special Price', desc: `Get extra ${Math.floor(discount / 3)}% off (price inclusive of cashback/coupon)` },
                      { title: 'No Cost EMI', desc: `starting from ₹${Math.round(product.price / 6).toLocaleString()}/month` },
                    ].map((offer, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Gift className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                        <p><span className="font-semibold text-foreground">{offer.title}</span> <span className="text-muted-foreground">{offer.desc}</span></p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-5" />

                {/* Delivery */}
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-orange-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Delivery</span>
                      {!pincodeChecked ? (
                        <button onClick={() => setPincodeChecked(true)} className="text-sm text-orange-600 font-medium hover:underline">Change pincode</button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <input className="border rounded-md px-2 py-1 w-24 text-sm focus:border-orange-500 outline-none" placeholder="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                          <Button variant="outline" size="sm" className="h-7 text-xs">Check</Button>
                        </div>
                      )}
                    </div>
                    {pincodeChecked && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Delivery by <span className="font-medium text-foreground">{new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className="text-orange-600 font-medium"> | FREE Delivery</span>
                      </p>
                    )}
                    {!pincodeChecked && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Delivery by <span className="font-medium text-foreground">{new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-5" />

                {/* Specifications Toggle */}
                <div>
                  <button onClick={() => setShowSpecs(!showSpecs)}
                    className="flex items-center gap-2 text-sm font-semibold text-foreground w-full">
                    {showSpecs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {showSpecs ? 'Hide' : 'View'} {Object.keys(product.specifications).length} Specifications
                  </button>
                  {showSpecs && (
                    <div className="mt-3 border rounded-lg overflow-hidden">
                      {Object.entries(product.specifications).map(([key, value], idx) => (
                        <div key={key} className={`flex text-sm ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <span className="w-[140px] py-2.5 px-3 text-muted-foreground font-medium shrink-0">{key}</span>
                          <span className="py-2.5 px-3 text-foreground border-l">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="my-5" />

                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1.5 hover:bg-gray-50 text-sm">−</button>
                    <span className="px-3 py-1.5 text-sm font-medium border-x min-w-[36px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="px-3 py-1.5 hover:bg-gray-50 text-sm">+</button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-5">
                  <Button size="lg" onClick={() => addToCart(product, quantity)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 h-12 text-base font-semibold rounded-xl">
                    <ShoppingCart className="h-5 w-5 mr-2" /> ADD TO CART
                  </Button>
                  <Button size="lg" onClick={() => { addToCart(product, quantity); navigateTo('checkout'); }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 h-12 text-base font-semibold rounded-xl">
                    BUY NOW
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assurance */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-6 flex-wrap">
                  {[
                    { icon: <ShieldCheck className="h-4 w-4" />, text: 'Shopnexa Assured', color: 'text-orange-600' },
                    { icon: <Truck className="h-4 w-4" />, text: 'Top Brand', color: 'text-orange-600' },
                    { icon: <RotateCcw className="h-4 w-4" />, text: '7 Day Return Policy', color: 'text-orange-600' },
                    { icon: <CreditCard className="h-4 w-4" />, text: 'Secure Transactions', color: 'text-orange-600' },
                  ].map((a) => (
                    <div key={a.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={a.color}>{a.icon}</span> {a.text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Details & Reviews Tabs */}
            <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="px-5 border-b">
                  <TabsList className="bg-transparent h-auto p-0">
                    <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold text-muted-foreground data-[state=active]:text-orange-600">
                      Product Details
                    </TabsTrigger>
                    <TabsTrigger value="specifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold text-muted-foreground data-[state=active]:text-orange-600">
                      Specifications
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold text-muted-foreground data-[state=active]:text-orange-600">
                      Ratings & Reviews
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="description" className="px-5 py-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </TabsContent>

                <TabsContent value="specifications" className="px-5 py-5">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2.5"><span className="text-sm font-bold text-foreground">General</span></div>
                    {Object.entries(product.specifications).map(([key, value], idx) => (
                      <div key={key} className={`flex text-sm border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                        <span className="w-[200px] py-2.5 px-4 text-muted-foreground shrink-0">{key}</span>
                        <span className="py-2.5 px-4 text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="px-5 py-5">
                  <div className="flex gap-6 mb-6 p-4 bg-orange-50 rounded-xl">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">{product.rating}</div>
                      <div className="flex items-center gap-0.5 mt-1 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-3.5 w-3.5 ${star <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{product.reviewCount.toLocaleString()} Ratings</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const pct = star === 5 ? 65 : star === 4 ? 22 : star === 3 ? 8 : star === 2 ? 3 : 2;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-orange-600 font-medium w-3">{star}</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <div className="flex-1 bg-white rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full" style={{ width: `${pct}%` }} /></div>
                            <span className="text-[10px] text-muted-foreground w-7 text-right">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-0 border rounded-xl overflow-hidden">
                    {reviews.length > 0 ? reviews.map((review, idx) => (
                      <div key={review.id} className={`p-4 ${idx > 0 ? 'border-t' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">{review.userName.charAt(0)}</div>
                            <span className="text-sm font-medium text-foreground">{review.userName}</span>
                            {review.isVerified && <Badge className="text-[10px] bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50"><Check className="h-3 w-3 mr-0.5" /> Verified Purchase</Badge>}
                          </div>
                          <button className="text-muted-foreground hover:text-orange-600 transition-colors"><ThumbsUp className="h-4 w-4" /></button>
                        </div>
                        <div className="flex items-center gap-0.5 mb-1.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}</div>
                        {review.title && <h4 className="text-sm font-medium text-foreground mb-1">{review.title}</h4>}
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    )) : (
                      <p className="text-center text-muted-foreground py-8 text-sm">No reviews yet for this product.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <Card className="mt-4">
                <CardContent className="p-5">
                  <h3 className="text-lg font-bold text-foreground mb-4">Similar Products</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {relatedProducts.map((p) => {
                      const d = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
                      return (
                        <motion.div key={p.id} whileHover={{ y: -2 }} onClick={() => { setSelectedImage(0); setQuantity(1); useStore.getState().goToProduct(p.id); }}
                          className="cursor-pointer group border rounded-xl p-3 hover:shadow-md transition-all">
                          <div className="aspect-square bg-gray-50 mb-2 rounded-lg overflow-hidden">
                            <ProductImage src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">{p.brand}</p>
                          <p className="text-sm text-foreground line-clamp-1 mt-0.5 group-hover:text-orange-600 transition-colors">{p.name}</p>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-sm font-bold">₹{p.price.toLocaleString()}</span>
                            {d > 0 && <span className="text-xs text-muted-foreground line-through">₹{p.mrp.toLocaleString()}</span>}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge className="bg-orange-600 text-white text-[10px] px-1.5 py-0">{p.rating}<Star className="h-2.5 w-2.5 ml-0.5 fill-white" /></Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
