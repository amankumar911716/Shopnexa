import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const where: Record<string, unknown> = {};
    if (productId) where.productId = productId;

    const reviews = await db.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rating = Math.min(5, Math.max(1, parseInt(body.rating) || 5));
    if (!body.productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    const review = await db.review.create({
      data: {
        productId: body.productId,
        userId: body.userId || '',
        userName: body.userName || 'Anonymous',
        userAvatar: body.userAvatar || '',
        rating,
        title: body.title || '',
        comment: body.comment || '',
        isVerified: body.isVerified || false,
      },
    });

    // Update product rating
    const reviews = await db.review.findMany({
      where: { productId: body.productId },
    });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : 0;
    await db.product.update({
      where: { id: body.productId },
      data: { rating: avgRating, reviewCount: reviews.length },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
