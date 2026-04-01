'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Star, Grid3X3, LayoutList, Heart, ChevronDown, ChevronUp, ChevronRight, TrendingUp, ShoppingCart } from 'lucide-react';
import { ProductImage } from './ProductImage';

export function ProductListing() {
  const {
    products, categories, filters, setFilters, resetFilters, getFilteredProducts,
    navigateTo, setSearchQuery, searchQuery,
  } = useStore();

  const filteredProducts = getFilteredProducts();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortByOpen, setSortByOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;
  const maxPrice = Math.max(...products.map(p => p.price));
  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE);
  const paginatedProducts = filteredProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters({ search: searchQuery });
      navigateTo('products');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <button onClick={() => navigateTo('home')} className="hover:text-foreground">Home</button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Products</span>
        {filters.categoryId && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{categories.find(c => c.slug === filters.categoryId)?.name}</span>
          </>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 pr-4 rounded-full border-primary/20 focus-visible:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700 rounded-full px-5">Search</Button>
          <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Active filters */}
      {(filters.search || filters.categoryId || filters.brand || filters.minRating > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              {filters.search}
              <button onClick={() => { setSearchQuery(''); setFilters({ search: '' }); }}><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filters.categoryId && (
            <Badge variant="secondary" className="gap-1">
              {categories.find(c => c.slug === filters.categoryId)?.name}
              <button onClick={() => setFilters({ categoryId: '' })}><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filters.brand && (
            <Badge variant="secondary" className="gap-1">
              {filters.brand}
              <button onClick={() => setFilters({ brand: '' })}><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              {filters.minRating}+<Star className="h-3 w-3 ml-0.5 fill-amber-400 text-amber-400" />
              <button onClick={() => setFilters({ minRating: 0 })}><X className="h-3 w-3" /></button>
            </Badge>
          )}
          <button onClick={() => { resetFilters(); setPage(1); }} className="text-sm text-orange-600 hover:underline">Clear all</button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-xl border p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Mobile filter overlay */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
              <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="absolute left-0 top-0 h-full w-80 bg-white p-5 overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}><X className="h-4 w-4" /></Button>
                </div>
                <FilterContent />
                <Button className="w-full bg-orange-600 hover:bg-orange-700 mt-4" onClick={() => setShowFilters(false)}>Apply Filters</Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl border p-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={"p-1.5 rounded-lg " + (viewMode === 'grid' ? 'bg-orange-100' : '')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={"p-1.5 rounded-lg " + (viewMode === 'list' ? 'bg-orange-100' : '')}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <button onClick={() => setSortByOpen(!sortByOpen)} className="flex items-center gap-1.5 text-sm font-medium border rounded-lg px-3 py-2 hover:bg-gray-50">
                  Sort: <span className="capitalize ml-1">{filters.sortBy.replace('-', ' ')}</span>
                  {sortByOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                {sortByOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white shadow-lg border rounded-xl w-52 z-10 py-1">
                    {[
                      { value: 'relevance', label: 'Relevance' },
                      { value: 'popularity', label: 'Popularity' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                      { value: 'rating', label: 'Top Rated' },
                      { value: 'newest', label: 'Newest First' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => { setFilters({ sortBy: value as 'relevance' | 'popularity' | 'price-low' | 'price-high' | 'rating' | 'newest' }); setSortByOpen(false); }}
                        className={"w-full text-left px-3 py-2 text-sm " + (filters.sortBy === value ? 'bg-orange-50 text-orange-700 font-medium' : 'text-muted-foreground hover:bg-gray-50')}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search term</p>
              <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedProducts.map((product) => (
                <ListProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="bg-white rounded-xl border p-4 mt-4 flex items-center justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} className={page <= 1 ? 'pointer-events-none opacity-40' : ''} />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink onClick={() => setPage(i + 1)} isActive={page === i} className="rounded-lg">{i + 1}</PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={page >= totalPages ? 'pointer-events-none opacity-40' : ''} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterContent() {
  const { categories, filters, setFilters, products } = useStore();
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  const maxPrice = Math.max(...products.map(p => p.price));
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true, price: true, brand: true, rating: true,
  });

  const toggle = (s: string) => setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }));

  return (
    <div className="space-y-5">
      {/* Categories */}
      <div className="border-b pb-4">
        <button onClick={() => toggle('categories')} className="flex items-center justify-between w-full text-left">
          <span className="font-semibold text-sm">Categories</span>
          {expandedSections.categories ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expandedSections.categories && (
          <div className="mt-2 space-y-1.5">
            <button
              onClick={() => setFilters({ categoryId: '' })}
              className={"block w-full text-left text-sm py-1 rounded-md px-2 " + (!filters.categoryId ? 'text-orange-600 bg-orange-50 font-medium' : 'text-muted-foreground hover:bg-gray-50')}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilters({ categoryId: filters.categoryId === cat.slug ? '' : cat.slug })}
                className={"block w-full text-left text-sm py-1 rounded-md px-2 " + (filters.categoryId === cat.slug ? 'text-orange-600 bg-orange-50 font-medium' : 'text-muted-foreground hover:bg-gray-50')}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="border-b pb-4">
        <button onClick={() => toggle('price')} className="flex items-center justify-between w-full text-left">
          <span className="font-semibold text-sm">Price Range</span>
          {expandedSections.price ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expandedSections.price && (
          <div className="mt-2">
            <Slider min={0} max={maxPrice} step={1000} value={[filters.maxPrice]} onValueChange={([val]) => setFilters({ maxPrice: val })} />
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>₹0</span>
              <span className="font-medium text-foreground">₹{filters.maxPrice.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="border-b pb-4">
        <button onClick={() => toggle('brand')} className="flex items-center justify-between w-full text-left">
          <span className="font-semibold text-sm">Brand</span>
          {expandedSections.brand ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expandedSections.brand && (
          <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brand === brand}
                  onChange={() => setFilters({ brand: filters.brand === brand ? '' : brand })}
                  className="w-3.5 h-3.5 rounded accent-orange-600"
                />
                <span className="text-sm text-muted-foreground hover:text-foreground">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="pb-4">
        <button onClick={() => toggle('rating')} className="flex items-center justify-between w-full text-left">
          <span className="font-semibold text-sm">Rating</span>
          {expandedSections.rating ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expandedSections.rating && (
          <div className="mt-2 space-y-1.5">
            {[4, 3, 2, 1].map((rating) => {
              const isActive = filters.minRating === rating;
              const btnClass = isActive ? 'bg-orange-50 text-orange-700 font-medium' : 'text-muted-foreground hover:bg-gray-50';
              return (
                <button
                  key={rating}
                  onClick={() => setFilters({ minRating: isActive ? 0 : rating })}
                  className={"flex items-center gap-1.5 w-full text-left py-1 rounded-md px-2 " + btnClass}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={"h-3.5 w-3.5 " + (star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300")}
                    />
                  ))}
                  <span className="text-sm">& up</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: ReturnType<typeof useStore.getState>['products'][0] }) {
  const { goToProduct, addToCart, addToWishlist, isInWishlist } = useStore();
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-xl border hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0">
            -{discount}%
          </Badge>
        )}
        {product.isTrending && (
          <Badge className="absolute top-2 right-12 bg-amber-500 text-white text-[10px] px-1.5 py-0">
            <TrendingUp className="h-3 w-3 mr-0.5" />Hot
          </Badge>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); addToWishlist(product); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white/90 transition-colors shadow-sm"
        >
          <Heart className={"h-4 w-4 " + (wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600')} />
        </button>
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            size="sm"
            className="w-full rounded-none bg-orange-600 hover:bg-orange-700 text-white h-9"
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          >
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
              <Star
                key={star}
                className={"h-3 w-3 " + (star <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300')}
              />
            ))}
          </span>
          <span className="text-xs text-muted-foreground">({product.reviewCount.toLocaleString()})</span>
        </span>
        <span className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
          {discount > 0 && (
            <span className="text-xs text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
          )}
        </span>
      </div>
    </motion.div>
  );
}

function ListProductCard({ product }: { product: ReturnType<typeof useStore.getState>['products'][0] }) {
  const { goToProduct, addToCart, addToWishlist, isInWishlist } = useStore();
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 p-4 bg-white rounded-xl border hover:shadow-md transition-shadow">
      <div
        className="w-28 h-28 rounded-lg overflow-hidden bg-gray-50 shrink-0 cursor-pointer"
        onClick={() => goToProduct(product.id)}
      >
        <ProductImage src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div onClick={() => goToProduct(product.id)} role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToProduct(product.id); } }}
          className="text-left cursor-pointer">
          <p className="font-medium text-sm truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.brand}</p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Badge className="bg-orange-600 text-white text-[10px] px-1.5 py-0 h-4">
            {product.rating}★
          </Badge>
          <span className="text-xs text-muted-foreground">({product.reviewCount.toLocaleString()})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-sm font-bold">₹{product.price.toLocaleString()}</span>
          {discount > 0 && (
            <>
              <span className="text-xs text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
              <span className="text-xs font-semibold text-orange-600">{discount}% off</span>
            </>
          )}
        </div>
        <div className="mt-auto flex items-center gap-2">
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => addToCart(product)}>
            Add to Cart
          </Button>
          <Button variant="outline" size="sm" onClick={() => addToWishlist(product)}>
            <Heart className={"h-4 w-4 " + (wishlisted ? 'fill-red-500 text-red-500' : '')} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
