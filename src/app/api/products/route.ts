import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products — fetch all products from DB
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const brand = searchParams.get('brand');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '100')));
    const countOnly = searchParams.get('count') === 'true';

    const sellerId = searchParams.get('sellerId');
    const where: Record<string, unknown> = {};
    if (category) where.categoryId = category;
    if (sellerId) where.sellerId = sellerId;
    if (search) {
      (where as Record<string, unknown>).OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } },
        { tags: { contains: search } },
      ];
    }
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, unknown> = {};
      const min = parseFloat(minPrice || '');
      const max = parseFloat(maxPrice || '');
      if (!isNaN(min)) priceFilter.gte = Math.max(0, min);
      if (!isNaN(max)) priceFilter.lte = Math.max(0, max);
      where.price = priceFilter;
    }
    if (brand) where.brand = brand;

    const orderBy: Record<string, string> = sortBy === 'price-low' ? { price: 'asc' }
      : sortBy === 'price-high' ? { price: 'desc' }
      : sortBy === 'rating' ? { rating: 'desc' }
      : sortBy === 'newest' ? { createdAt: 'desc' }
      : { sold: 'desc' };

    if (countOnly) {
      const total = await db.product.count({ where });
      return NextResponse.json({ total });
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: { select: { name: true } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map((p: { images: string; specifications: string; tags: string; category: { name: string } }) => ({
        ...p,
        images: JSON.parse(p.images || '[]'),
        specifications: JSON.parse(p.specifications || '{}'),
        tags: JSON.parse(p.tags || '[]'),
        categoryName: p.category?.name || '',
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products — create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clientId = body.id;
    const product = await db.product.create({
      data: {
        id: clientId || undefined,
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now(),
        description: body.description || '',
        price: parseFloat(body.price) || 0,
        mrp: parseFloat(body.mrp) || parseFloat(body.price) || 0,
        images: JSON.stringify(body.images || []),
        categoryId: body.categoryId || 'cat1',
        brand: body.brand || '',
        stock: parseInt(body.stock) || 0,
        sold: parseInt(body.sold) || 0,
        rating: parseFloat(body.rating) || 0,
        reviewCount: parseInt(body.reviewCount) || 0,
        specifications: JSON.stringify(body.specifications || {}),
        tags: JSON.stringify(body.tags || []),
        isFeatured: Boolean(body.isFeatured),
        isTrending: Boolean(body.isTrending),
        isFlashDeal: Boolean(body.isFlashDeal),
        flashPrice: body.flashPrice ? parseFloat(body.flashPrice) : null,
        sellerId: body.sellerId || 'seller1',
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/products — update an existing product
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const data: Record<string, unknown> = { updatedAt: new Date() };
    const allowedFields = ['name', 'slug', 'description', 'price', 'mrp', 'categoryId', 'brand', 'stock', 'sold', 'rating', 'reviewCount', 'isFeatured', 'isTrending', 'isFlashDeal', 'flashPrice', 'sellerId'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (data as Record<string, unknown>)[field] = body[field];
      }
    }
    // JSON fields
    if (body.images !== undefined) data.images = JSON.stringify(body.images);
    if (body.specifications !== undefined) data.specifications = JSON.stringify(body.specifications);
    if (body.tags !== undefined) data.tags = JSON.stringify(body.tags);

    const product = await db.product.update({
      where: { id: body.id },
      data,
    });

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/products — delete a product
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
