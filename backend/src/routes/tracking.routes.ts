import { Router } from 'express';
import { prisma } from '../config/prisma';
import { generalLimiter } from '../middleware/rateLimiter';
import { NotFoundError } from '../utils/errors';

const router = Router();

router.get('/:orderNumber', generalLimiter, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      select: {
        orderNumber: true,
        status: true,
        pickupPincode: true,
        dropPincode: true,
        pickupLat: true,
        pickupLng: true,
        dropLat: true,
        dropLng: true,
        scheduledDate: true,
        createdAt: true,
        agent: {
          select: {
            currentLat: true,
            currentLng: true,
          },
        },
        trackingHistory: {
          orderBy: { createdAt: 'desc' },
          select: {
            status: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) throw new NotFoundError('Order not found');

    let pickupLat = order.pickupLat;
    let pickupLng = order.pickupLng;
    let dropLat = order.dropLat;
    let dropLng = order.dropLng;

    if (
      pickupLat == null ||
      pickupLng == null ||
      dropLat == null ||
      dropLng == null
    ) {
      const [pickupArea, dropArea] = await Promise.all([
        prisma.area.findUnique({
          where: { pincode: order.pickupPincode },
          select: { lat: true, lng: true },
        }),
        prisma.area.findUnique({
          where: { pincode: order.dropPincode },
          select: { lat: true, lng: true },
        }),
      ]);

      pickupLat = pickupLat ?? pickupArea?.lat ?? null;
      pickupLng = pickupLng ?? pickupArea?.lng ?? null;
      dropLat = dropLat ?? dropArea?.lat ?? null;
      dropLng = dropLng ?? dropArea?.lng ?? null;
    }

    res.json({
      ...order,
      pickupLat,
      pickupLng,
      dropLat,
      dropLng,
      agentLat: order.agent?.currentLat ?? null,
      agentLng: order.agent?.currentLng ?? null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
