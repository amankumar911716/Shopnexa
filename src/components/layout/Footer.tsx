'use client';

import { useStore } from '@/store/useStore';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const { categories, navigateTo, setFilters } = useStore();

  const handleCategoryClick = (slug: string) => {
    setFilters({ search: '', categoryId: slug });
    navigateTo('products');
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-white" />
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                <span>Shop</span><span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">nexa</span>
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">Your one-stop destination for premium products at unbeatable prices. Shop smart, save more!</p>
            <div className="flex gap-3">
              {['𝕏', 'f', 'in', '📷'].map((icon) => (
                <button key={icon} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs hover:bg-orange-600 transition-colors">{icon}</button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home', page: 'home' as const },
                { label: 'All Products', page: 'products' as const },
                { label: 'My Orders', page: 'orders' as const },
                { label: 'Wishlist', page: 'wishlist' as const },
                { label: 'Seller Dashboard', page: 'seller' as const },
              ].map((item) => (
                <li key={item.label}><button onClick={() => navigateTo(item.page)} className="hover:text-orange-400 transition-colors">{item.label}</button></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {categories.map((cat) => (
                <li key={cat.id}><button onClick={() => handleCategoryClick(cat.slug)} className="hover:text-orange-400 transition-colors">{cat.name}</button></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><span>📍</span><span>98, 04 Noorsarai Street, Noorsarai, BiharSharif, Nalanda, Bihar, INDIA - 803113</span></li>
              <li className="flex items-start gap-2">
                <span>📞</span>
                <div>
                  <span>+91 - 911 719 6506</span>
                  <p className="text-xs text-orange-400 font-medium mt-0.5">⏰ Mon - Sat: 9:00 AM - 6:00 PM</p>
                </div>
              </li>
              <li className="flex items-center gap-2"><span>✉️</span><span>cswithaman91@gmail.com</span></li>
            </ul>
            <div className="mt-4 pt-3 border-t border-gray-800">
              <p className="text-xs text-gray-400"><span className="text-orange-400 font-semibold">Platform Owner:</span> Aman Kumar</p>
            </div>
            <div className="mt-4"><p className="text-xs text-gray-500">We accept</p>
              <div className="flex gap-2 mt-2">{['VISA', 'UPI', 'MC', 'COD'].map((p) => (<span key={p} className="px-2 py-1 bg-gray-800 rounded text-[10px] font-semibold">{p}</span>))}</div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Shopnexa. All rights reserved. Designed by <span className="text-orange-400">Aman Kumar</span></p>
          <div className="flex gap-4">
            <button className="hover:text-gray-300">Privacy Policy</button>
            <button className="hover:text-gray-300">Terms of Service</button>
            <button className="hover:text-gray-300">Returns Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
