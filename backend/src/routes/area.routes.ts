import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { validate } from '../middleware/validate';
import { verifyToken, authorize } from '../middleware/auth';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();
router.use(verifyToken, authorize('ADMIN'));

const areaSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    pincode: z.string().min(4),
    zoneId: z.string().uuid(),
    lat: z.number(),
    lng: z.number(),
  }),
});

/**
 * @swagger
 * tags:
 *   name: Areas
 *   description: Area Management (Admin)
 */

router.get('/', async (req, res, next) => {
  try {
    const areas = await prisma.area.findMany({ include: { zone: true } });
    res.json(areas);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(areaSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const existing = await prisma.area.findUnique({ where: { pincode: data.pincode } });
    if (existing) throw new AppError('Area with pincode already exists', 400);

    const area = await prisma.area.create({ data });
    res.status(201).json(area);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(areaSchema), async (req, res, next) => {
  try {
    const area = await prisma.area.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(area);
  } catch (err) {
    next(new NotFoundError('Area not found'));
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.area.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(new NotFoundError('Area not found'));
  }
});

export default router;
