'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BannerSlider } from '@/components/home/BannerSlider';
import { CategorySection } from '@/components/home/CategorySection';
import { TrendingProducts, FeaturedProducts, ProductScrollSection } from '@/components/home/ProductSections';
import { FlashDeals } from '@/components/home/FlashDeals';
import { ProductListing } from '@/components/products/ProductListing';
import { ProductDetail } from '@/components/products/ProductDetail';
import { CartPage } from '@/components/cart/CartPage';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';
import { OrdersPage, OrderDetailPage } from '@/components/orders/OrdersPage';
import { WishlistPage } from '@/components/wishlist/WishlistPage';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { ClientOnly } from '@/components/ClientOnly';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { SellerDashboard } from '@/components/dashboard/SellerDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, ChevronRight, Check, X } from 'lucide-react';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function ProfileForm({ user }: { user: User }) {
  const { updateProfile } = useStore();
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => { setToastMsg(msg); setToastVisible(true); setTimeout(() => setToastVisible(false), 3000); };

  // Personal info fields
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  // Address fields
  const [address, setAddress] = useState(user.address);
  const [city, setCity] = useState(user.city);
  const [stateVal, setStateVal] = useState(user.state);
  const [pincode, setPincode] = useState(user.pincode);

  const handleSavePersonal = () => {
    if (!name.trim()) { showToast('Name cannot be empty'); return; }
    updateProfile({ name: name.trim(), phone: phone.trim() });
    showToast('Personal info saved!');
  };

  const handleSaveAddress = () => {
    if (!address.trim()) { showToast('Address cannot be empty'); return; }
    updateProfile({ address: address.trim(), city: city.trim(), state: stateVal.trim(), pincode: pincode.trim() });
    showToast('Address saved!');
  };

  return (
    <div className="min-h-screen" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
              <Badge variant="secondary" className="mt-3 text-xs">{user.role}</Badge>
              {user.storeName && (
                <p className="text-xs text-orange-600 mt-2 font-medium">{user.storeName}</p>
              )}
            </CardContent>
          </Card>
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="personal">
                  <TabsList className="bg-gray-100 h-auto p-1 w-full">
                    <TabsTrigger value="personal" className="text-sm data-[state=active]:bg-white">Personal Info</TabsTrigger>
                    <TabsTrigger value="address" className="text-sm data-[state=active]:bg-white">Addresses</TabsTrigger>
                  </TabsList>
                  <TabsContent value="personal" className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="text-xs text-muted-foreground mb-1.5 block font-medium">Full Name *</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1.5 block font-medium">Email</label><Input value={user.email} disabled className="bg-gray-50" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1.5 block font-medium">Phone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1.5 block font-medium">Role</label><Input value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled className="bg-gray-50" /></div>
                      <Button className="bg-orange-600 hover:bg-orange-700 mt-2" onClick={handleSavePersonal}><Check className="h-4 w-4 mr-2" /> Save Changes</Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="address" className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2"><label className="text-xs text-muted-foreground mb-1.5 block font-medium">Address *</label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter full address" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1.5 block font-medium">City</label><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1.5 block font-medium">State</label><Input value={stateVal} onChange={(e) => setStateVal(e.target.value)} placeholder="Enter state" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1.5 block font-medium">Pincode</label><Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter pincode" /></div>
                      <Button className="bg-orange-600 hover:bg-orange-700 mt-2" onClick={handleSaveAddress}><Check className="h-4 w-4 mr-2" /> Save Address</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Toast */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 z-[60] bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2" style={{ minWidth: '250px' }}>
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0"><Check className="h-3.5 w-3.5 text-white" /></div>
          <span className="text-sm font-medium flex-1">{toastMsg}</span>
          <button onClick={() => setToastVisible(false)} className="text-gray-400 hover:text-white shrink-0 ml-2"><X className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}

function ProfilePage() {
  const { user, isAuthenticated, navigateTo } = useStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <UserIcon className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please login to view your profile</h2>
        <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => { useStore.getState().setAuthMode('login'); useStore.getState().setShowAuthModal(true); }}>Login</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <button onClick={() => navigateTo('home')} className="hover:text-orange-600 transition-colors">Home</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">My Account</span>
        </div>
        {/* Key prop resets ProfileForm when user changes */}
        <ProfileForm key={user.id} user={user} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { currentPage, products, ensureSeeded } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    // Seed DB if needed and load products from DB on first mount
    ensureSeeded();
    return () => cancelAnimationFrame(id);
  }, [ensureSeeded]);

  const recentlyViewed = products.slice(0, 6);
  const budgetPicks = products.filter(p => p.price < 10000).slice(0, 6);
  const premiumProducts = products.filter(p => p.price > 50000).slice(0, 6);
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={currentPage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {currentPage === 'home' && (
              <div className="max-w-7xl mx-auto px-4">
                <ClientOnly fallback={<div className="py-4"><div className="max-w-7xl mx-auto px-4"><div className="h-[220px] sm:h-[280px] md:h-[380px] rounded-2xl bg-gray-100 animate-pulse" /></div></div>}>
                  <div className="py-4">
                    <BannerSlider />
                  </div>
                </ClientOnly>
                <CategorySection />
                <FlashDeals />
                <TrendingProducts />
                <ClientOnly fallback={<div className="py-8"><div className="h-[320px] rounded-xl bg-gray-100 animate-pulse" /></div>}>
                  <FeaturedProducts />
                </ClientOnly>
                <ClientOnly fallback={<div className="py-8"><div className="h-[320px] rounded-xl bg-gray-100 animate-pulse" /></div>}>
                  <ProductScrollSection title="Budget Picks" products={budgetPicks} />
                </ClientOnly>
                <ClientOnly fallback={<div className="py-8"><div className="h-[320px] rounded-xl bg-gray-100 animate-pulse" /></div>}>
                  <ProductScrollSection title="Premium Collection" products={premiumProducts} />
                </ClientOnly>
                <ClientOnly fallback={<div className="py-8"><div className="h-[320px] rounded-xl bg-gray-100 animate-pulse" /></div>}>
                  <ProductScrollSection title="Top Rated" products={topRated} />
                </ClientOnly>

                {/* Top Offers Grid */}
                <div className="py-4">
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-2 md:grid-cols-4">
                        {[
                          { emoji: '📱', title: 'Top Offers on Mobiles', desc: 'From ₹6,999' },
                          { emoji: '👕', title: 'Fashion Top Deals', desc: '50-80% Off' },
                          { emoji: '🏠', title: 'Best of Electronics', desc: 'From ₹99' },
                          { emoji: '🏡', title: 'Home Makeover', desc: 'Starting ₹149' },
                        ].map((item, idx) => (
                          <button key={idx} onClick={() => { useStore.getState().setFilters({ search: '' }); useStore.getState().navigateTo('products'); }}
                            className={`flex items-center gap-3 p-4 ${idx > 0 ? 'border-l' : ''} hover:bg-orange-50/50 transition-colors group text-left`}>
                            <span className="text-2xl">{item.emoji}</span>
                            <div>
                              <p className="text-sm font-semibold group-hover:text-orange-600 transition-colors">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            {currentPage === 'products' && <ProductListing />}
            {currentPage === 'product-detail' && <ProductDetail />}
            {currentPage === 'cart' && <CartPage />}
            {currentPage === 'checkout' && <CheckoutPage />}
            {currentPage === 'orders' && <OrdersPage />}
            {currentPage === 'order-detail' && <OrderDetailPage />}
            {currentPage === 'wishlist' && <WishlistPage />}
            {currentPage === 'dashboard' && <DashboardPage />}
            {currentPage === 'admin' && <AdminDashboard />}
            {currentPage === 'seller' && <SellerDashboard />}
            {currentPage === 'profile' && <ProfilePage />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      {mounted ? <PWAInstallPrompt /> : null}
    </div>
  );
}
