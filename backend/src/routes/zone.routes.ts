import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { validate } from '../middleware/validate';
import { verifyToken, authorize } from '../middleware/auth';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();
router.use(verifyToken, authorize('ADMIN'));

const createZoneSchema = z.object({
  body: z.object({
    name: z.string().min(2),
  }),
});

/**
 * @swagger
 * tags:
 *   name: Zones
 *   description: Zone Management (Admin)
 */

/**
 * @swagger
 * /api/zones:
 *   get:
 *     summary: List all zones
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of zones
 */
router.get('/', async (req, res, next) => {
  try {
    const zones = await prisma.zone.findMany({ include: { areas: true } });
    res.json(zones);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/zones:
 *   post:
 *     summary: Create a new zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', validate(createZoneSchema), async (req, res, next) => {
  try {
    const { name } = req.body;
    const existing = await prisma.zone.findUnique({ where: { name } });
    if (existing) throw new AppError('Zone already exists', 400);

    const zone = await prisma.zone.create({ data: { name } });
    res.status(201).json(zone);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/zones/{id}:
 *   put:
 *     summary: Update a zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', validate(createZoneSchema), async (req, res, next) => {
  try {
    const { name } = req.body;
    const zone = await prisma.zone.update({
      where: { id: req.params.id },
      data: { name },
    });
    res.json(zone);
  } catch (err) {
    next(new NotFoundError('Zone not found'));
  }
});

/**
 * @swagger
 * /api/zones/{id}:
 *   delete:
 *     summary: Delete a zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.zone.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(new NotFoundError('Zone not found'));
  }
});

export default router;
