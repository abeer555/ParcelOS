import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { validate } from '../middleware/validate';
import { verifyToken, authorize } from '../middleware/auth';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();
router.use(verifyToken);

router.patch('/:id/location', authorize('AGENT'), async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const profile = await prisma.agentProfile.update({
      where: { id: req.params.id },
      data: { currentLat: lat, currentLng: lng },
    });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/availability', authorize('AGENT'), async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const profile = await prisma.agentProfile.update({
      where: { id: req.params.id },
      data: { isAvailable },
    });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/orders', authorize('AGENT'), async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { agentId: req.params.id },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Admin routes
router.get('/', authorize('ADMIN'), async (req, res, next) => {
  try {
    const agents = await prisma.agentProfile.findMany({ include: { user: true } });
    res.json(agents);
  } catch (err) {
    next(err);
  }
});

const createAgentSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    phone: z.string().optional(),
    zoneId: z.string().uuid().optional(),
  }),
});

router.post('/', authorize('ADMIN'), validate(createAgentSchema), async (req, res, next) => {
  try {
    const { email, password, name, phone, zoneId } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email in use', 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const agent = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: 'AGENT',
        agentProfile: {
          create: { zoneId },
        },
      },
      include: { agentProfile: true },
    });

    res.status(201).json(agent);
  } catch (err) {
    next(err);
  }
});

export default router;
