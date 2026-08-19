import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { validate } from '../middleware/validate';
import { verifyToken, authorize } from '../middleware/auth';
import { AppError, NotFoundError } from '../utils/errors';
import { OrderType } from '@prisma/client';

const router = Router();
router.use(verifyToken, authorize('ADMIN'));

const rateCardSchema = z.object({
  body: z.object({
    zoneId: z.string().uuid(),
    destinationZoneId: z.string().uuid(),
    orderType: z.nativeEnum(OrderType),
    ratePerKg: z.number().positive(),
    baseRate: z.number().nonnegative(),
    codSurcharge: z.number().nonnegative().default(0),
  }),
});

router.get('/', async (req, res, next) => {
  try {
    const rateCards = await prisma.rateCard.findMany();
    res.json(rateCards);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(rateCardSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const existing = await prisma.rateCard.findUnique({
      where: {
        zoneId_destinationZoneId_orderType: {
          zoneId: data.zoneId,
          destinationZoneId: data.destinationZoneId,
          orderType: data.orderType,
        },
      },
    });
    if (existing) throw new AppError('Rate card already exists for this combination', 400);

    const rc = await prisma.rateCard.create({ data });
    res.status(201).json(rc);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(rateCardSchema), async (req, res, next) => {
  try {
    const rc = await prisma.rateCard.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(rc);
  } catch (err) {
    next(new NotFoundError('Rate card not found'));
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.rateCard.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(new NotFoundError('Rate card not found'));
  }
});

export default router;
