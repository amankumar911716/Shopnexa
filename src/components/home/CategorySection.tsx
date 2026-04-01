'use client';

import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

export function CategorySection() {
  const { categories, navigateTo, setFilters } = useStore();

  const handleCategoryClick = (category: { id: string; slug: string; name: string }) => {
    setFilters({ search: '', categoryId: category.slug });
    navigateTo('products');
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <p className="text-sm text-muted-foreground mt-1">Browse our wide range of categories</p>
        </div>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {categories.map((category, index) => (
          <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
            onClick={() => handleCategoryClick(category)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCategoryClick(category); } }}
            className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-orange-50 transition-all duration-200 cursor-pointer">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-100 group-hover:shadow-md transition-shadow">
              <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = '/api/placeholder?text=' + encodeURIComponent(category.name.slice(0, 15)) + '&category=' + encodeURIComponent(category.name) + '&w=300&h=300'; }} />
            </div>
            <span className="text-xs sm:text-sm font-medium text-center line-clamp-2 group-hover:text-orange-600 transition-colors">{category.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
