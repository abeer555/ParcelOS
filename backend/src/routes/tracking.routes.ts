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
        scheduledDate: true,
        createdAt: true,
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

    res.json(order);
  } catch (err) {
    next(err);
  }
});

export default router;
