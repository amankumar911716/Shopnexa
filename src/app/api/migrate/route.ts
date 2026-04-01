import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/migrate — fix all pre-March-2026 dates in the database
// This ensures existing data from old seeds is corrected
const PLATFORM_LAUNCH = '2026-03-01T00:00:00.000Z';

export async function POST() {
  try {
    let ordersFixed = 0;
    let productsFixed = 0;

    // Fix orders with pre-March-2026 createdAt
    const oldOrders = await db.order.findMany({
      where: { createdAt: { lt: new Date(PLATFORM_LAUNCH) } },
    });

    for (const order of oldOrders) {
      await db.order.update({
        where: { id: order.id },
        data: {
          createdAt: new Date('2026-03-20T10:00:00.000Z'),
          updatedAt: new Date('2026-03-20T10:00:00.000Z'),
        },
      });
      ordersFixed++;
    }

    // Fix products with pre-March-2026 createdAt
    const oldProducts = await db.product.findMany({
      where: { createdAt: { lt: new Date(PLATFORM_LAUNCH) } },
    });

    for (const product of oldProducts) {
      await db.product.update({
        where: { id: product.id },
        data: {
          createdAt: new Date(PLATFORM_LAUNCH),
        },
      });
      productsFixed++;
    }

    // Also fix order trackingInfo dates
    const allOrders = await db.order.findMany();
    for (const order of allOrders) {
      if (order.trackingInfo) {
        let trackingInfo: Array<{
          status: string;
          message: string;
          timestamp: string;
          completed: boolean;
        }>;
        try {
          trackingInfo = JSON.parse(order.trackingInfo);
        } catch {
          continue;
        }
        let needsUpdate = false;

        trackingInfo = trackingInfo.map((step) => {
          if (step.timestamp && new Date(step.timestamp) < new Date(PLATFORM_LAUNCH)) {
            needsUpdate = true;
            return { ...step, timestamp: PLATFORM_LAUNCH };
          }
          return step;
        });

        if (needsUpdate) {
          await db.order.update({
            where: { id: order.id },
            data: { trackingInfo: JSON.stringify(trackingInfo) },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration complete: ${ordersFixed} orders, ${productsFixed} products fixed to March 2026.`,
      ordersFixed,
      productsFixed,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Migration failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
