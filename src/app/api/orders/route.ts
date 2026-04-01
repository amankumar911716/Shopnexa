import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Safe JSON parse helper — returns fallback on corrupted data
function safeJSONParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

// GET /api/orders — fetch all orders from DB
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sellerId = searchParams.get('sellerId');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (sellerId) where.sellerId = sellerId;

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      orders.map(o => ({
        ...o,
        items: safeJSONParse(o.items, []),
        trackingInfo: safeJSONParse(o.trackingInfo, []),
      }))
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders — create a new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await db.order.create({
      data: {
        userId: body.userId,
        items: JSON.stringify(body.items || []),
        totalAmount: body.totalAmount,
        discount: body.discount || 0,
        status: body.status || 'placed',
        paymentMethod: body.paymentMethod || 'cod',
        paymentStatus: body.paymentStatus || 'pending',
        sellerId: body.sellerId || '',
        address: body.address || '',
        city: body.city || '',
        state: body.state || '',
        pincode: body.pincode || '',
        phone: body.phone || '',
        trackingInfo: JSON.stringify(body.trackingInfo || []),
      },
    });
    return NextResponse.json({
      ...order,
      items: safeJSONParse(order.items, []),
      trackingInfo: safeJSONParse(order.trackingInfo, []),
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// PATCH /api/orders — update an order (status, payment status, etc.)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.status !== undefined) updateData.status = data.status;
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
    if (data.trackingInfo !== undefined) updateData.trackingInfo = JSON.stringify(data.trackingInfo);
    if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount;
    if (data.discount !== undefined) updateData.discount = data.discount;

    const order = await db.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...order,
      items: safeJSONParse(order.items, []),
      trackingInfo: safeJSONParse(order.trackingInfo, []),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE /api/orders — permanently delete an order
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await db.order.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Order permanently deleted' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to delete order';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
