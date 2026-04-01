import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo orders to seed into DB (all dates are March 2026+)
const DEMO_ORDERS = [
  {
    id: 'ORD10001234',
    userId: 'customer_aman',
    sellerId: 'seller1',
    items: JSON.stringify([{ productId: 'p1', name: 'Premium Wireless Headphones', quantity: 1, price: 24998 }, { productId: 'p4', name: 'Smart Fitness Watch Pro', quantity: 2, price: 3998 }]),
    totalAmount: 32994,
    discount: 500,
    status: 'delivered',
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    address: '98, Noorsarai Street',
    city: 'BiharSharif',
    state: 'Bihar',
    pincode: '803113',
    phone: '9117196506',
    trackingInfo: JSON.stringify([
      { status: 'placed', message: 'Order placed successfully', timestamp: '2026-03-01T10:00:00Z', completed: true },
      { status: 'confirmed', message: 'Order confirmed by seller', timestamp: '2026-03-01T12:00:00Z', completed: true },
      { status: 'shipped', message: 'Package shipped via BlueDart', timestamp: '2026-03-02T09:00:00Z', completed: true },
      { status: 'delivered', message: 'Delivered to your address', timestamp: '2026-03-04T14:00:00Z', completed: true },
    ]),
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-04T14:00:00.000Z',
  },
  {
    id: 'ORD10002345',
    userId: 'customer_priya',
    sellerId: 'seller2',
    items: JSON.stringify([{ productId: 'p2', name: 'Ultra HD 4K Smart TV', quantity: 1, price: 44999 }]),
    totalAmount: 44999,
    discount: 0,
    status: 'shipped',
    paymentMethod: 'visa',
    paymentStatus: 'paid',
    address: 'MG Road, Andheri',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400058',
    phone: '9876543210',
    trackingInfo: JSON.stringify([
      { status: 'placed', message: 'Order placed successfully', timestamp: '2026-03-05T08:00:00Z', completed: true },
      { status: 'confirmed', message: 'Order confirmed by seller', timestamp: '2026-03-05T10:00:00Z', completed: true },
      { status: 'shipped', message: 'Package shipped via DTDC', timestamp: '2026-03-06T09:00:00Z', completed: true },
    ]),
    createdAt: '2026-03-05T08:00:00.000Z',
    updatedAt: '2026-03-06T09:00:00.000Z',
  },
  {
    id: 'ORD10003456',
    userId: 'customer_rahul',
    sellerId: 'seller1',
    items: JSON.stringify([{ productId: 'p6', name: 'Professional DSLR Camera', quantity: 1, price: 12999 }, { productId: 'p8', name: 'Portable Bluetooth Speaker', quantity: 1, price: 2499 }]),
    totalAmount: 15498,
    discount: 200,
    status: 'confirmed',
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    address: 'Sector 18, Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    phone: '8765432109',
    trackingInfo: JSON.stringify([
      { status: 'placed', message: 'Order placed successfully', timestamp: '2026-03-08T14:00:00Z', completed: true },
      { status: 'confirmed', message: 'Order confirmed by seller', timestamp: '2026-03-08T16:00:00Z', completed: true },
    ]),
    createdAt: '2026-03-08T14:00:00.000Z',
    updatedAt: '2026-03-08T16:00:00.000Z',
  },
  {
    id: 'ORD10004567',
    userId: 'customer_sneha',
    sellerId: 'seller3',
    items: JSON.stringify([{ productId: 'p3', name: 'Designer Handbag Collection', quantity: 1, price: 8999 }]),
    totalAmount: 8999,
    discount: 0,
    status: 'placed',
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    address: 'Jubilee Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    phone: '7654321098',
    trackingInfo: JSON.stringify([
      { status: 'placed', message: 'Order placed successfully', timestamp: '2026-03-10T11:00:00Z', completed: true },
    ]),
    createdAt: '2026-03-10T11:00:00.000Z',
    updatedAt: '2026-03-10T11:00:00.000Z',
  },
  {
    id: 'ORD10005678',
    userId: 'customer_amit',
    sellerId: 'seller1',
    items: JSON.stringify([{ productId: 'p11', name: 'Running Sports Shoes', quantity: 2, price: 1599 }, { productId: 'p13', name: 'Premium Backpack', quantity: 1, price: 8999 }]),
    totalAmount: 12197,
    discount: 300,
    status: 'cancelled',
    paymentMethod: 'mastercard',
    paymentStatus: 'paid',
    address: 'CG Road',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380006',
    phone: '7777777777',
    trackingInfo: JSON.stringify([
      { status: 'placed', message: 'Order placed successfully', timestamp: '2026-03-12T09:00:00Z', completed: true },
    ]),
    createdAt: '2026-03-12T09:00:00.000Z',
    updatedAt: '2026-03-13T10:00:00.000Z',
  },
  {
    id: 'ORD10006789',
    userId: 'customer_aman',
    sellerId: 'seller4',
    items: JSON.stringify([{ productId: 'p5', name: 'Organic Skin Care Set', quantity: 1, price: 5999 }]),
    totalAmount: 5999,
    discount: 0,
    status: 'rejected',
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    address: '98, Noorsarai Street',
    city: 'BiharSharif',
    state: 'Bihar',
    pincode: '803113',
    phone: '9117196506',
    trackingInfo: JSON.stringify([]),
    createdAt: '2026-03-15T15:00:00.000Z',
    updatedAt: '2026-03-16T09:00:00.000Z',
  },
  {
    id: 'ORD10007890',
    userId: 'customer_priya',
    sellerId: 'seller2',
    items: JSON.stringify([{ productId: 'p9', name: 'Wireless Charging Pad', quantity: 1, price: 3499 }, { productId: 'p12', name: 'USB-C Hub Adapter', quantity: 3, price: 699 }]),
    totalAmount: 5596,
    discount: 150,
    status: 'pending',
    paymentMethod: 'visa',
    paymentStatus: 'pending',
    address: 'MG Road, Andheri',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400058',
    phone: '9876543210',
    trackingInfo: JSON.stringify([]),
    createdAt: '2026-03-18T16:30:00.000Z',
    updatedAt: '2026-03-18T16:30:00.000Z',
  },
  {
    id: 'ORD10008901',
    userId: 'customer_rahul',
    sellerId: 'seller1',
    items: JSON.stringify([{ productId: 'p7', name: 'Noise Cancelling Earbuds', quantity: 2, price: 7999 }]),
    totalAmount: 15998,
    discount: 0,
    status: 'pending',
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    address: 'Sector 18, Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    phone: '8765432109',
    trackingInfo: JSON.stringify([]),
    createdAt: '2026-03-20T09:00:00.000Z',
    updatedAt: '2026-03-20T09:00:00.000Z',
  },
];

// Seed data version — bump this to force re-seed with updated dates
const ORDER_SEED_VERSION = 'v2';

// GET /api/orders/seed — check if orders need seeding
export async function GET() {
  try {
    const orderCount = await db.order.count();
    return NextResponse.json({
      seeded: orderCount > 0,
      orderCount,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check seed status' }, { status: 500 });
  }
}

// POST /api/orders/seed — seed demo orders into DB
// Always deletes and re-seeds to ensure dates are correct
export async function POST() {
  try {
    // Always delete existing orders and re-seed to ensure correct dates
    await db.order.deleteMany({});

    let seeded = 0;
    for (const order of DEMO_ORDERS) {
      try {
        await db.order.create({
          data: {
            id: order.id,
            userId: order.userId,
            sellerId: order.sellerId,
            items: order.items,
            totalAmount: order.totalAmount,
            discount: order.discount,
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            address: order.address,
            city: order.city,
            state: order.state,
            pincode: order.pincode,
            phone: order.phone,
            trackingInfo: order.trackingInfo,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
          },
        });
        seeded++;
      } catch {
        // Skip duplicates
      }
    }

    return NextResponse.json({
      success: true,
      message: `Re-seeded ${seeded} orders with March 2026 dates.`,
      orderCount: seeded,
      version: ORDER_SEED_VERSION,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Seeding failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
