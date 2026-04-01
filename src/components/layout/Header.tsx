'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Heart, User as UserIcon, Menu, X, Bell,
  Package, LogOut, ChevronDown, Store, ShieldCheck, LayoutDashboard,
  Minus, Plus, Trash2, ArrowRight, Camera, Mic, MicOff, KeyRound,
  ArrowLeft, Check,
} from 'lucide-react';

export function Header() {
  const {
    currentPage, navigateTo, searchQuery, setSearchQuery, setFilters,
    cart, getCartCount, getCartTotal, removeFromCart, updateCartQuantity,
    wishlist, showCartDrawer, setShowCartDrawer, showMobileMenu, setShowMobileMenu,
    user, isAuthenticated, showAuthModal, setShowAuthModal, setAuthMode,
    notifications, getUnreadCount, markNotificationRead,
    appliedCoupon, couponDiscount, getCartMRPTotal, products, categories,
  } = useStore();

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();
  const wishlistCount = wishlist.length;
  const unreadCount = getUnreadCount();
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const { toast } = useToast();
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image search state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState('');

  // Voice search state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const q = searchQuery.toLowerCase();
      const suggestions: string[] = [];
      products.forEach(p => {
        if (p.name.toLowerCase().includes(q) && suggestions.length < 5) suggestions.push(p.name);
        if (p.brand.toLowerCase().includes(q) && suggestions.length < 5) suggestions.push(p.brand);
      });
      setSearchSuggestions([...new Set(suggestions)]);
      setShowSearchDropdown(suggestions.length > 0);
    } else {
      setShowSearchDropdown(false);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = searchRef.current || mobileSearchRef.current;
      if (el && !el.contains(e.target as Node)) setShowSearchDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchRef, mobileSearchRef]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters({ search: searchQuery, categoryId: '' });
      navigateTo('products');
      setShowSearchDropdown(false);
    }
  };

  const selectSuggestion = (s: string) => {
    setSearchQuery(s);
    setFilters({ search: s, categoryId: '' });
    navigateTo('products');
    setShowSearchDropdown(false);
  };

  // Camera / Image Search
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image size must be less than 10MB.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
      setImageSearchQuery('');
      setImageSearchOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleImageSearch = () => {
    if (imageSearchQuery.trim()) {
      setSearchQuery(imageSearchQuery.trim());
      setFilters({ search: imageSearchQuery.trim(), categoryId: '' });
      navigateTo('products');
      setImageSearchOpen(false);
      setImagePreview(null);
      setImageSearchQuery('');
    }
  };

  const closeImageSearch = () => {
    setImageSearchOpen(false);
    setImagePreview(null);
    setImageSearchQuery('');
  };

  // Voice Search - Uses browser native Web Speech API (works without backend)
  const handleMicClick = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      toast({ title: 'Not supported', description: 'Voice search is not supported in this browser. Please use Chrome or Edge.', variant: 'destructive' });
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsRecording(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          setSearchQuery(transcript.trim());
          setFilters({ search: transcript.trim(), categoryId: '' });
          navigateTo('products');
        }
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          toast({ title: 'Microphone denied', description: 'Please allow microphone access in browser settings.', variant: 'destructive' });
        } else if (event.error === 'no-speech') {
          toast({ title: 'No speech detected', description: 'Please try again and speak clearly.', variant: 'destructive' });
        } else if (event.error !== 'aborted') {
          toast({ title: 'Voice search error', description: 'Error: ' + event.error + '. Please try again.', variant: 'destructive' });
        }
      };

      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } catch {
      toast({ title: 'Voice search failed', description: 'Voice search failed to start. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        {/* Top promo */}
        <div className="bg-orange-600 text-white text-xs py-1.5">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <span className="hidden sm:block">Free delivery on orders above ₹499 | Use code <strong>WELCOME</strong> for 15% off</span>
            <span className="sm:hidden text-center w-full">Free delivery above ₹499</span>
            <div className="hidden sm:flex items-center gap-4">
              <button onClick={() => navigateTo('seller')} className="hover:underline">Sell on Shopnexa</button>
              <span>|</span>
              <button onClick={() => navigateTo('admin')} className="hover:underline">Admin Panel</button>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo */}
            <button onClick={() => navigateTo('home')} className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-extrabold leading-none tracking-tight">
                  <span className="text-foreground">Shop</span><span className="bg-gradient-to-r from-orange-600 to-rose-500 bg-clip-text text-transparent">nexa</span>
                </h1>
                <p className="text-[10px] text-muted-foreground -mt-0.5 font-medium tracking-wide">Explore. Shop. Save.</p>
              </div>
            </button>

            {/* Hidden file input for camera search */}
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />

            {/* Search - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search for products, brands and more..."
                  className="pl-10 pr-24 rounded-full border-primary/20 focus-visible:border-primary h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 1 && setShowSearchDropdown(true)}
                />
                {/* Camera & Mic buttons inside search bar */}
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <button type="button" onClick={handleCameraClick}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-muted-foreground hover:text-orange-600"
                    title="Search by image">
                    <Camera className="h-4 w-4" />
                  </button>
                  <div className="w-px h-5 bg-gray-200" />
                  <button type="button" onClick={handleMicClick}
                    className={("p-1.5 rounded-full hover:bg-gray-100 transition-colors " + (isRecording ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-muted-foreground hover:text-orange-600") + " disabled:opacity-50")}
                    title={isRecording ? 'Stop recording' : 'Search by voice'}>
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                </div>
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border z-50 max-h-72 overflow-hidden">
                    {searchSuggestions.map((s) => (
                      <button key={s} onClick={() => selectSuggestion(s)}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 hover:bg-orange-50 text-sm text-muted-foreground transition-colors">
                        <Search className="h-3.5 w-3.5 shrink-0 text-orange-600" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => navigateTo('products')}>
                <Search className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="relative" onClick={() => navigateTo('wishlist')}>
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-rose-500 text-white">{wishlistCount}</Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-orange-500 text-white">{unreadCount}</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {notifications.slice(0, 5).map((n) => (
                    <DropdownMenuItem key={n.id} onClick={() => markNotificationRead(n.id)} className="flex flex-col items-start gap-1 py-2.5 cursor-pointer">
                      <span className="font-medium text-sm">{n.title}</span>
                      <span className="text-xs text-muted-foreground">{n.message}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="relative" onClick={() => setShowCartDrawer(true)}>
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-orange-500 text-white">{cartCount}</Badge>
                )}
              </Button>

              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hidden sm:flex items-center gap-2 px-2.5">
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-700 text-xs font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium max-w-[80px] truncate hidden lg:block">{user.name.split(' ')[0]}</span>
                      <ChevronDown className="h-3.5 w-3.5 hidden lg:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px]">{user.role}</Badge>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigateTo('dashboard')}><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigateTo('orders')}><Package className="mr-2 h-4 w-4" /> My Orders</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigateTo('profile')}><UserIcon className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigateTo('wishlist')}><Heart className="mr-2 h-4 w-4" /> Wishlist</DropdownMenuItem>
                    {(user.role === 'seller' || user.role === 'admin') && (
                      <DropdownMenuItem onClick={() => navigateTo('seller')}><Store className="mr-2 h-4 w-4" /> Seller Dashboard</DropdownMenuItem>
                    )}
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigateTo('admin')}><ShieldCheck className="mr-2 h-4 w-4" /> Admin Panel</DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => useStore.getState().logout()} className="text-destructive"><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="default" className="hidden sm:flex bg-orange-600 hover:bg-orange-700 rounded-full px-5" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="md:hidden mt-3" ref={mobileSearchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input placeholder="Search products..." className="pl-10 pr-20 rounded-full h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <button type="button" onClick={handleCameraClick}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors text-muted-foreground hover:text-orange-600"
                  title="Search by image">
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <div className="w-px h-4 bg-gray-200" />
                <button type="button" onClick={handleMicClick}
                  className={("p-1 rounded-full hover:bg-gray-100 transition-colors " + (isRecording ? "text-red-500 bg-red-50" : "text-muted-foreground hover:text-orange-600") + " disabled:opacity-50")}
                  title={isRecording ? 'Stop recording' : 'Search by voice'}>
                  {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Category nav */}
        <nav className="border-t bg-gray-50/70 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center gap-6 text-sm overflow-x-auto py-2 scroll-x-hidden">
              {categories.map((cat) => (
                <li key={cat.id} className="shrink-0">
                  <button onClick={() => { setFilters({ search: '', categoryId: cat.slug }); navigateTo('products'); }}
                    className="whitespace-nowrap text-muted-foreground hover:text-orange-600 font-medium transition-colors">
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Image Search Modal - Works without backend */}
      <AnimatePresence>
        {imageSearchOpen && imagePreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base">Search by Image</h3>
                <button type="button" onClick={closeImageSearch} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="w-full aspect-square max-h-52 rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50 mb-4">
                <img src={imagePreview} alt="Uploaded" className="w-full h-full object-contain" />
              </div>
              <p className="text-xs text-muted-foreground mb-3">Describe what you see in the image to search for similar products</p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. red running shoes, laptop stand..."
                  value={imageSearchQuery}
                  onChange={(e) => setImageSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleImageSearch(); }}
                  className="flex-1"
                />
                <Button className="bg-orange-600 hover:bg-orange-700 shrink-0" onClick={handleImageSearch} disabled={!imageSearchQuery.trim()}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60]">
            <div className="bg-white rounded-full px-5 py-2.5 shadow-lg border border-red-200 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-red-300 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <span className="text-sm font-medium text-red-600">Listening... speak now</span>
              <button type="button" onClick={() => recognitionRef.current?.stop()}
                className="p-1 rounded-full hover:bg-red-50 transition-colors">
                <MicOff className="h-4 w-4 text-red-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div initial={{ opacity: 0, x: -300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -300 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileMenu(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
              <div className="p-4 border-b bg-gradient-to-r from-orange-600 to-rose-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-white" />
                    </div>
                    <h2 className="font-extrabold text-lg tracking-tight">
                      <span className="text-white">Shop</span><span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">nexa</span>
                    </h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(false)} className="text-white hover:bg-white/20"><X className="h-5 w-5" /></Button>
                </div>
                {isAuthenticated && user ? <p className="text-sm mt-1 opacity-90">{user.name}</p> : (
                  <button onClick={() => { setShowAuthModal(true); setAuthMode('login'); setShowMobileMenu(false); }} className="text-sm mt-1 underline">Login / Register</button>
                )}
              </div>
              <ScrollArea className="h-[calc(100%-100px)]">
                <div className="p-2">
                  {[
                    { icon: '🏠', label: 'Home', action: () => navigateTo('home') },
                    { icon: '📊', label: 'Dashboard', action: () => navigateTo('dashboard') },
                    { icon: '📦', label: 'All Products', action: () => navigateTo('products') },
                    { icon: '❤️', label: `Wishlist (${wishlistCount})`, action: () => navigateTo('wishlist') },
                    { icon: '📋', label: 'My Orders', action: () => navigateTo('orders') },
                    { icon: '🏪', label: 'Seller Dashboard', action: () => navigateTo('seller') },
                    { icon: '🛠️', label: 'Admin Panel', action: () => navigateTo('admin') },
                  ].map((item) => (
                    <button key={item.label} onClick={() => { item.action(); setShowMobileMenu(false); }}
                      className="w-full text-left px-3 py-3 rounded-xl text-sm flex items-center gap-3 hover:bg-orange-50 transition-colors">
                      <span>{item.icon}</span><span>{item.label}</span>
                    </button>
                  ))}
                  <Separator className="my-2" />
                  <p className="px-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Categories</p>
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => { setFilters({ search: '', categoryId: cat.slug }); navigateTo('products'); setShowMobileMenu(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-orange-50 transition-colors">{cat.name}</button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <Sheet open={showCartDrawer} onOpenChange={setShowCartDrawer}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-orange-600" /> My Cart ({cartCount} items)</SheetTitle>
            <SheetDescription className="sr-only">Your shopping cart items</SheetDescription>
          </SheetHeader>
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
              <h3 className="font-semibold text-lg mb-1">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-4">Add items to get started</p>
              <Button onClick={() => { setShowCartDrawer(false); navigateTo('products'); }} className="bg-orange-600 hover:bg-orange-700">Browse Products</Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" onClick={() => { setShowCartDrawer(false); useStore.getState().goToProduct(item.product.id); }} onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=' + encodeURIComponent(item.product.name.slice(0, 20)) + '&category=' + encodeURIComponent(item.product.categoryName || ''); }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-orange-600">₹{item.product.price.toLocaleString()}</span>
                          {item.product.mrp > item.product.price && <span className="text-xs text-muted-foreground line-through">₹{item.product.mrp.toLocaleString()}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border rounded-lg">
                            <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="px-2 py-0.5 hover:bg-gray-100 rounded-l-lg"><Minus className="h-3 w-3" /></button>
                            <span className="px-2 py-0.5 text-sm font-medium border-x min-w-[36px] text-center">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))} className="px-2 py-0.5 hover:bg-gray-100 rounded-r-lg"><Plus className="h-3 w-3" /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t p-4 space-y-2 bg-white">
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-sm p-2 bg-orange-50 rounded-lg">
                    <span className="text-orange-700">✓ Coupon: {appliedCoupon}</span>
                    <button onClick={() => useStore.getState().removeCoupon()} className="text-xs text-orange-600 underline">Remove</button>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">MRP Total</span><span className="line-through">₹{getCartMRPTotal().toLocaleString()}</span></div>
                {couponDiscount > 0 && <div className="flex items-center justify-between text-sm text-orange-600"><span>Coupon ({appliedCoupon})</span><span>-₹{couponDiscount.toLocaleString()}</span></div>}
                <div className="flex items-center justify-between text-lg font-bold"><span>Total</span><span className="text-orange-600">₹{cartTotal.toLocaleString()}</span></div>
                <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Savings</span><span className="text-orange-600 font-medium">₹{(getCartMRPTotal() - cartTotal).toLocaleString()}</span></div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 h-11 text-base font-semibold" onClick={() => { setShowCartDrawer(false); navigateTo('checkout'); }}>
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Auth Modal */}
      <Sheet open={showAuthModal} onOpenChange={setShowAuthModal}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader className="mb-6"><SheetTitle className="text-center">{useStore.getState().authMode === 'login' ? 'Welcome Back' : useStore.getState().authMode === 'register' ? 'Create Account' : 'Reset Password'}</SheetTitle>
            <SheetDescription className="sr-only">Login or create your Shopnexa account</SheetDescription>
          </SheetHeader>
          <AuthForm />
        </SheetContent>
      </Sheet>
    </>
  );
}

function AuthForm() {
  const { login, register, setAuthMode, authMode, authError, resetPassword, getSecurityQuestion } = useStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [localError, setLocalError] = useState('');
  const [role, setRole] = useState<'customer' | 'seller' | 'admin'>('customer');

  // Forgot password state
  const [forgotStep, setForgotStep] = useState(0); // 0=email, 1=question, 2=new password, 3=success
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Security question for registration
  const [regSecurityQuestion, setRegSecurityQuestion] = useState('');
  const [regSecurityAnswer, setRegSecurityAnswer] = useState('');

  const clearErrors = () => { setLocalError(''); useStore.setState({ authError: '' }); };

  const SECURITY_QUESTIONS = [
    'What is your favourite color?',
    'What city were you born in?',
    'What is your pet name?',
    'What is your mother\'s maiden name?',
    'What was your first school name?',
    'What is your favourite food?',
    'What is your childhood best friend\'s name?',
  ];

  const displayError = localError || authError;

  // Clear errors when switching modes
  const switchMode = (mode: 'login' | 'register' | 'forgot') => {
    clearErrors();
    setEmail('');
    setPassword('');
    setForgotStep(0);
    setSecurityQuestion('');
    setSecurityAnswer('');
    setNewPassword('');
    setConfirmNewPassword('');
    setAuthMode(mode);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }
    login(email, password);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!name.trim()) { setLocalError('Please enter your name.'); return; }
    if (!email.trim()) { setLocalError('Please enter your email.'); return; }
    if (password.length < 4) { setLocalError('Password must be at least 4 characters.'); return; }
    if (password !== confirmPassword) { setLocalError('Password and confirm password do not match.'); return; }
    if (!regSecurityQuestion) { setLocalError('Please select a security question.'); return; }
    if (!regSecurityAnswer.trim()) { setLocalError('Please answer the security question.'); return; }
    register(name, email, password, role, storeName, regSecurityQuestion, regSecurityAnswer.trim());
  };

  const handleForgotEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!email.trim()) { setLocalError('Please enter your email address.'); return; }
    const question = getSecurityQuestion(email);
    if (!question) {
      setLocalError('No account found with this email. Please check and try again.');
      return;
    }
    setSecurityQuestion(question);
    setForgotStep(1);
  };

  const handleForgotAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!securityAnswer.trim()) { setLocalError('Please enter your answer.'); return; }
    const error = resetPassword(email, securityAnswer, newPassword);
    if (error) return;
    setForgotStep(2);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!newPassword) { setLocalError('Please enter a new password.'); return; }
    if (newPassword.length < 4) { setLocalError('New password must be at least 4 characters.'); return; }
    if (newPassword !== confirmNewPassword) { setLocalError('New password and confirm password do not match.'); return; }
    setForgotStep(3);
    setTimeout(() => {
      setAuthMode('login');
      setForgotStep(0);
      setEmail('');
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }, 3000);
  };

  // ─── FORGOT PASSWORD UI ───
  if (authMode === 'forgot') {
    if (forgotStep === 3) {
      return (
        <div className="text-center space-y-4 py-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-700">Password Reset Successfully!</h3>
          <p className="text-sm text-muted-foreground">You can now login with your new password.</p>
          <p className="text-xs text-muted-foreground">Redirecting to login...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <button type="button" onClick={() => switchMode('login')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </button>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
            <KeyRound className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold">Reset Password</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {forgotStep === 0 && 'Enter your email to get started'}
            {forgotStep === 1 && 'Answer your security question'}
            {forgotStep === 2 && 'Enter your new password'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((step) => (
            <div key={step} className={"h-1.5 rounded-full flex-1 transition-colors " + (step <= forgotStep ? 'bg-orange-500' : 'bg-gray-200')} />
          ))}
        </div>

        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
            <span className="shrink-0 text-red-500 font-bold">!</span>
            <span>{displayError}</span>
          </div>
        )}

        {/* Step 0: Enter email */}
        {forgotStep === 0 && (
          <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Email Address *</label>
              <Input type="email" placeholder="Enter your registered email" value={email} onChange={(e) => { setEmail(e.target.value); clearErrors(); }} autoFocus />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Find My Account</Button>
          </form>
        )}

        {/* Step 1: Security question */}
        {forgotStep === 1 && (
          <form onSubmit={handleForgotAnswerSubmit} className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-800">{securityQuestion}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Your Answer *</label>
              <Input placeholder="Type your answer" value={securityAnswer} onChange={(e) => { setSecurityAnswer(e.target.value); clearErrors(); }} autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">New Password *</label>
              <Input type="password" placeholder="Enter new password (min 4 chars)" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); clearErrors(); }} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Confirm New Password *</label>
              <Input type="password" placeholder="Re-enter new password" value={confirmNewPassword} onChange={(e) => { setConfirmNewPassword(e.target.value); clearErrors(); }} />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Reset Password</Button>
          </form>
        )}

        {/* Step 2: Enter new password (redundant now since combined with step 1) */}
        {forgotStep === 2 && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">New Password *</label>
              <Input type="password" placeholder="Enter new password (min 4 chars)" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); clearErrors(); }} autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Confirm New Password *</label>
              <Input type="password" placeholder="Re-enter new password" value={confirmNewPassword} onChange={(e) => { setConfirmNewPassword(e.target.value); clearErrors(); }} />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" /> Confirm New Password
            </Button>
          </form>
        )}
      </div>
    );
  }

  // ─── LOGIN / REGISTER UI ───
  return (
    <form onSubmit={authMode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
      {displayError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
          <span className="shrink-0 text-red-500 font-bold">!</span>
          <span>{displayError}</span>
        </div>
      )}
      {authMode === 'register' && (
        <>
          <div>
            <label className="text-sm font-medium mb-1 block">Full Name *</label>
            <Input placeholder="Enter your name" value={name} onChange={(e) => { setName(e.target.value); clearErrors(); }} required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['customer', 'seller', 'admin'] as const).map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={"py-2.5 rounded-lg border-2 text-xs font-semibold transition-all " + (role === r ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-muted-foreground hover:border-gray-300")}>
                  {r === 'customer' && '👤 '}{r === 'seller' && '🏪 '}{r === 'admin' && '🛠️ '}
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            {(role === 'seller' || role === 'admin') && (
              <div className="mt-3">
                <label className="text-sm font-medium mb-1 block">Store Name {role === 'admin' ? '(Optional)' : ''}</label>
                <Input placeholder={role === 'seller' ? "Enter your store name" : "e.g. Shopnexa Official"} value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Your store name will be displayed to customers</p>
              </div>
            )}
          </div>
        </>
      )}
      <div><label className="text-sm font-medium mb-1 block">Email *</label><Input type="email" placeholder="Enter your email" value={email} onChange={(e) => { setEmail(e.target.value); clearErrors(); }} required /></div>
      <div><label className="text-sm font-medium mb-1 block">Password *</label><Input type="password" placeholder={authMode === 'register' ? 'Min 4 characters' : 'Enter password'} value={password} onChange={(e) => { setPassword(e.target.value); clearErrors(); }} required /></div>
      {authMode === 'register' && (
        <>
          <div><label className="text-sm font-medium mb-1 block">Confirm Password *</label><Input type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearErrors(); }} required /></div>
          <div>
            <label className="text-sm font-medium mb-1 block">Security Question *</label>
            <select value={regSecurityQuestion} onChange={(e) => { setRegSecurityQuestion(e.target.value); clearErrors(); }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
              <option value="">-- Select a security question --</option>
              {SECURITY_QUESTIONS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Security Answer *</label><Input placeholder="Your answer (used for password recovery)" value={regSecurityAnswer} onChange={(e) => { setRegSecurityAnswer(e.target.value); clearErrors(); }} /></div>
        </>
      )}
      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">{authMode === 'login' ? 'Login' : 'Create Account'}</Button>
      <div className="text-center text-sm text-muted-foreground">
        {authMode === 'login' ? (
          <>
            <button type="button" className="text-orange-600 font-medium hover:underline" onClick={() => switchMode('forgot')}>Forgot Password?</button>
            <span className="mx-1">·</span>
            <span>Don&apos;t have an account? </span>
            <button type="button" className="text-orange-600 font-medium" onClick={() => switchMode('register')}>Register</button>
          </>
        ) : (
          <>
            <span>Already have an account? </span>
            <button type="button" className="text-orange-600 font-medium" onClick={() => switchMode('login')}>Login</button>
          </>
        )}
      </div>
      <Separator />
      <div className="text-center"><p className="text-xs text-muted-foreground mb-3">Quick Login (Demo Accounts)</p>
        <div className="flex flex-col gap-2">
          <Button variant="outline" type="button" onClick={() => { clearErrors(); login('cswithaman91customer@shopnexa.com', 'AMAN@2026'); }}>👤 Customer — Aman Kumar</Button>
          <Button variant="outline" type="button" onClick={() => { clearErrors(); login('cswithaman91seller@shopnexa.com', 'AMAN@2026'); }}>🏪 Seller — Aman's Store</Button>
          <Button variant="outline" type="button" onClick={() => { clearErrors(); login('cswithaman91admin@shopnexa.com', 'AMAN@2026'); }}>🛠️ Admin — Platform Owner</Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Password for all: AMAN@2026</p>
      </div>
    </form>
  );
}
