import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { allProducts, categories } from '@/data/seed-data';

// POST /api/products/seed — seed all products & categories into the database
export async function POST() {
  try {
    // 1. Seed categories
    for (const cat of categories) {
      await db.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, image: cat.image, description: cat.description },
        create: { id: cat.id, name: cat.name, slug: cat.slug, image: cat.image, description: cat.description },
      });
    }

    // 2. Check existing product count
    const existingCount = await db.product.count();

    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already has ${existingCount} products. No seed needed.`,
        productCount: existingCount,
      });
    }

    // 3. Seed all 820 products one by one (to handle undefined flashPrice)
    let seeded = 0;

    for (const p of allProducts) {
      try {
        await db.product.upsert({
          where: { id: p.id },
          update: {
            name: p.name,
            slug: p.slug + '-' + p.id,
            description: p.description,
            price: p.price,
            mrp: p.mrp,
            images: JSON.stringify(p.images),
            categoryId: p.categoryId,
            brand: p.brand,
            stock: p.stock,
            sold: p.sold,
            rating: p.rating,
            reviewCount: p.reviewCount,
            specifications: JSON.stringify(p.specifications),
            tags: JSON.stringify(p.tags),
            isFeatured: p.isFeatured,
            isTrending: p.isTrending,
            isFlashDeal: p.isFlashDeal,
            flashPrice: p.flashPrice ?? null,
            sellerId: p.sellerId,
          },
          create: {
            id: p.id,
            name: p.name,
            slug: p.slug + '-' + p.id,
            description: p.description,
            price: p.price,
            mrp: p.mrp,
            images: JSON.stringify(p.images),
            categoryId: p.categoryId,
            brand: p.brand,
            stock: p.stock,
            sold: p.sold,
            rating: p.rating,
            reviewCount: p.reviewCount,
            specifications: JSON.stringify(p.specifications),
            tags: JSON.stringify(p.tags),
            isFeatured: p.isFeatured,
            isTrending: p.isTrending,
            isFlashDeal: p.isFlashDeal,
            flashPrice: p.flashPrice ?? null,
            sellerId: p.sellerId,
          },
        });
        seeded++;
      } catch {
        // Skip duplicate slug entries
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${seeded} products and ${categories.length} categories successfully.`,
      productCount: seeded,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Seeding failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/products/seed — check seed status
export async function GET() {
  try {
    const [productCount, categoryCount] = await Promise.all([
      db.product.count(),
      db.category.count(),
    ]);
    return NextResponse.json({
      seeded: productCount > 0,
      productCount,
      categoryCount,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check seed status' }, { status: 500 });
  }
}
