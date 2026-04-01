import type { Product } from '@/types';

/**
 * Compact product data: [name, brand, price, mrp, rating, reviews, stock, sold, isFeatured, isTrending, isFlashDeal, flashPrice, sellerId]
 * slug, id, description, categoryId, categoryName, specifications, tags, images are auto-generated
 */

type RawProduct = [string, string, number, number, number, number, number, number, boolean, boolean, boolean, number | undefined, string];

export function generateCategoryProducts(
  categoryId: string,
  categoryName: string,
  rawProducts: RawProduct[],
  imagePool: string[],
  tagKeywords: string[],
  specTemplates: string[][],
  descTemplate: (name: string, brand: string, specs: string[]) => string,
  startId: number = 100,
): Product[] {
  return rawProducts.map((raw, idx) => {
    const [name, brand, price, mrp, rating, reviews, stock, sold, featured, trending, flash, flashPrice, sellerId] = raw;
    const id = `p${startId + idx}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const imgIdx1 = idx % imagePool.length;
    const imgIdx2 = (idx + 7) % imagePool.length;
    const images = [imagePool[imgIdx1], imagePool[imgIdx2]].filter((v, i, a) => a.indexOf(v) === i);

    const specs: Record<string, string> = {};
    const specVals: string[] = [];
    specTemplates.forEach((template, si) => {
      const val = template[idx % template.length];
      const key = getCategorySpecKey(categoryName, si);
      specs[key] = val;
      specVals.push(val);
    });

    const words = name.toLowerCase().split(/[\s\-_,]+/);
    const baseTags = [...new Set([...words.slice(0, 3), ...tagKeywords.slice(0, 4), brand.toLowerCase(), categoryName.toLowerCase().replace(/[\s&]+/g, '-')])];

    return {
      id,
      name,
      slug,
      description: descTemplate(name, brand, specVals),
      price,
      mrp,
      images,
      categoryId,
      categoryName,
      brand,
      stock,
      sold,
      rating,
      reviewCount: reviews,
      specifications: specs,
      tags: baseTags,
      isFeatured: featured,
      isTrending: trending,
      isFlashDeal: flash,
      ...(flash ? { flashPrice } : {}),
      sellerId,
    };
  });
}

function getCategorySpecKey(cat: string, idx: number): string {
  const specKeys: Record<string, string[]> = {
    'Electronics': ['Display', 'Processor', 'RAM', 'Storage', 'Battery', 'Connectivity', 'Weight'],
    'Fashion': ['Material', 'Fit', 'Occasion', 'Care', 'Pattern', 'Length'],
    'Home & Furniture': ['Material', 'Dimensions', 'Color', 'Weight Capacity', 'Warranty', 'Assembly'],
    'Sports & Fitness': ['Material', 'Size', 'Suitable For', 'Weight', 'Durability', 'Warranty'],
    'Books & Media': ['Author', 'Pages', 'Language', 'Format', 'Publisher', 'ISBN'],
    'Beauty & Personal Care': ['Skin Type', 'Key Ingredients', 'Volume', 'Suitable For', 'Certification', 'Shelf Life'],
    'Toys & Games': ['Age Range', 'Material', 'Players', 'Battery', 'Safety', 'Dimensions'],
    'Grocery & Gourmet': ['Weight', 'Type', 'Shelf Life', 'Storage', 'Certification', 'Origin'],
  };
  const keys = specKeys[cat] || ['Type', 'Size', 'Material', 'Brand', 'Warranty', 'Origin'];
  return keys[idx % keys.length];
}

// ─── Image Pools (local product images) ────────────────────────────────

export const IMAGE_POOLS: Record<string, string[]> = {
  'cat1': [ // Electronics
    '/images/products/iphone15.png', '/images/products/samsung24.png', '/images/products/macbook-air.png',
    '/images/products/sony-headphone.png', '/images/products/ipad-air.png', '/images/products/wireless-earbuds.png',
    '/images/products/dslr-camera.png', '/images/categories/electronics.png', '/images/products/iphone15.png',
    '/images/products/samsung24.png', '/images/products/macbook-air.png', '/images/products/sony-headphone.png',
    '/images/products/ipad-air.png', '/images/products/wireless-earbuds.png', '/images/products/dslr-camera.png',
    '/images/categories/electronics.png', '/images/products/iphone15.png', '/images/products/samsung24.png',
    '/images/products/macbook-air.png',
  ],
  'cat2': [ // Fashion
    '/images/products/leather-jacket.png', '/images/products/silk-saree.png', '/images/products/running-shoes.png',
    '/images/products/backpack.png', '/images/categories/fashion.png', '/images/products/leather-jacket.png',
    '/images/products/silk-saree.png', '/images/products/running-shoes.png', '/images/products/backpack.png',
    '/images/categories/fashion.png', '/images/products/leather-jacket.png', '/images/products/silk-saree.png',
    '/images/products/running-shoes.png', '/images/products/backpack.png', '/images/categories/fashion.png',
    '/images/products/leather-jacket.png', '/images/products/silk-saree.png', '/images/products/running-shoes.png',
    '/images/products/backpack.png',
  ],
  'cat3': [ // Home & Furniture
    '/images/products/office-chair.png', '/images/products/led-tv.png', '/images/products/mattress.png',
    '/images/categories/home-furniture.png', '/images/products/office-chair.png', '/images/products/led-tv.png',
    '/images/products/mattress.png', '/images/categories/home-furniture.png', '/images/products/office-chair.png',
    '/images/products/led-tv.png', '/images/products/mattress.png', '/images/categories/home-furniture.png',
    '/images/products/office-chair.png', '/images/products/led-tv.png', '/images/products/mattress.png',
    '/images/categories/home-furniture.png', '/images/products/office-chair.png', '/images/products/led-tv.png',
    '/images/products/mattress.png',
  ],
  'cat4': [ // Sports & Fitness
    '/images/products/fitness-watch.png', '/images/products/yoga-mat.png', '/images/categories/sports-fitness.png',
    '/images/products/fitness-watch.png', '/images/products/yoga-mat.png', '/images/categories/sports-fitness.png',
    '/images/products/fitness-watch.png', '/images/products/yoga-mat.png', '/images/categories/sports-fitness.png',
    '/images/products/fitness-watch.png', '/images/products/yoga-mat.png', '/images/categories/sports-fitness.png',
    '/images/products/fitness-watch.png', '/images/products/yoga-mat.png', '/images/categories/sports-fitness.png',
    '/images/products/fitness-watch.png', '/images/products/yoga-mat.png', '/images/categories/sports-fitness.png',
    '/images/products/fitness-watch.png',
  ],
  'cat5': [ // Books & Media
    '/images/products/atomic-habits.png', '/images/categories/books-media.png', '/images/products/atomic-habits.png',
    '/images/categories/books-media.png', '/images/products/atomic-habits.png', '/images/categories/books-media.png',
    '/images/products/atomic-habits.png', '/images/categories/books-media.png', '/images/products/atomic-habits.png',
    '/images/categories/books-media.png', '/images/products/atomic-habits.png', '/images/categories/books-media.png',
    '/images/products/atomic-habits.png', '/images/categories/books-media.png', '/images/products/atomic-habits.png',
    '/images/categories/books-media.png', '/images/products/atomic-habits.png', '/images/categories/books-media.png',
    '/images/products/atomic-habits.png', '/images/categories/books-media.png',
  ],
  'cat6': [ // Beauty & Personal Care
    '/images/products/vitamin-serum.png', '/images/categories/beauty-personal-care.png', '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png', '/images/products/vitamin-serum.png', '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png', '/images/categories/beauty-personal-care.png', '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png', '/images/products/vitamin-serum.png', '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png', '/images/categories/beauty-personal-care.png', '/images/products/vitamin-serum.png',
    '/images/categories/beauty-personal-care.png', '/images/products/vitamin-serum.png', '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png', '/images/categories/beauty-personal-care.png',
    '/images/products/vitamin-serum.png',
  ],
  'cat7': [ // Toys & Games
    '/images/products/lego-arch.png', '/images/categories/toys-games.png', '/images/products/lego-arch.png',
    '/images/categories/toys-games.png', '/images/products/lego-arch.png', '/images/categories/toys-games.png',
    '/images/products/lego-arch.png', '/images/categories/toys-games.png', '/images/products/lego-arch.png',
    '/images/categories/toys-games.png', '/images/products/lego-arch.png', '/images/categories/toys-games.png',
    '/images/products/lego-arch.png', '/images/categories/toys-games.png', '/images/products/lego-arch.png',
    '/images/categories/toys-games.png',
  ],
  'cat8': [ // Grocery & Gourmet
    '/images/products/coffee-beans.png', '/images/categories/grocery-gourmet.png', '/images/products/coffee-beans.png',
    '/images/categories/grocery-gourmet.png', '/images/products/coffee-beans.png', '/images/categories/grocery-gourmet.png',
    '/images/products/coffee-beans.png', '/images/categories/grocery-gourmet.png', '/images/products/coffee-beans.png',
    '/images/categories/grocery-gourmet.png', '/images/products/coffee-beans.png', '/images/categories/grocery-gourmet.png',
    '/images/products/coffee-beans.png', '/images/categories/grocery-gourmet.png', '/images/products/coffee-beans.png',
    '/images/categories/grocery-gourmet.png', '/images/products/coffee-beans.png', '/images/categories/grocery-gourmet.png',
    '/images/products/coffee-beans.png', '/images/categories/grocery-gourmet.png',
  ],
};
