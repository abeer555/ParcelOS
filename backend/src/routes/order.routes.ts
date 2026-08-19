import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { validate } from '../middleware/validate';
import { verifyToken, authorize } from '../middleware/auth';
import { calculateCharge } from '../services/rateEngine';
import { autoAssignAgent } from '../services/assignmentService';
import { notifyStatusChange } from '../services/notificationService';
import { generateOrderNumber } from '../utils/generateOrderNumber';
import { AppError, NotFoundError } from '../utils/errors';
import { OrderType, PaymentType } from '@prisma/client';

const router = Router();

const calcSchema = z.object({
  body: z.object({
    pickupPincode: z.string(),
    dropPincode: z.string(),
    packageLength: z.number().positive(),
    packageBreadth: z.number().positive(),
    packageHeight: z.number().positive(),
    actualWeight: z.number().positive(),
    orderType: z.nativeEnum(OrderType),
    paymentType: z.nativeEnum(PaymentType),
  }),
});

router.post('/calculate', validate(calcSchema), async (req, res, next) => {
  try {
    const charge = await calculateCharge(req.body);
    res.json(charge);
  } catch (err) {
    next(err);
  }
});

const createOrderSchema = calcSchema.and(
  z.object({
    body: z.object({
      idempotencyKey: z.string().optional(),
      pickupAddress: z.string(),
      pickupLat: z.number().optional(),
      pickupLng: z.number().optional(),
      dropAddress: z.string(),
      dropLat: z.number().optional(),
      dropLng: z.number().optional(),
    }),
  })
);

router.post('/', verifyToken, validate(createOrderSchema), async (req, res, next) => {
  try {
    const data = req.body;
    
    if (data.idempotencyKey) {
      const existing = await prisma.order.findUnique({ where: { idempotencyKey: data.idempotencyKey } });
      if (existing) return res.status(200).json(existing);
    }

    const charge = await calculateCharge(req.body);
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        idempotencyKey: data.idempotencyKey,
        customerId: req.user!.id,
        pickupAddress: data.pickupAddress,
        pickupPincode: data.pickupPincode,
        pickupLat: data.pickupLat,
        pickupLng: data.pickupLng,
        dropAddress: data.dropAddress,
        dropPincode: data.dropPincode,
        dropLat: data.dropLat,
        dropLng: data.dropLng,
        packageLength: data.packageLength,
        packageBreadth: data.packageBreadth,
        packageHeight: data.packageHeight,
        actualWeight: data.actualWeight,
        volumetricWeight: charge.volumetricWeight,
        billableWeight: charge.billableWeight,
        orderType: data.orderType,
        paymentType: data.paymentType,
        baseCharge: charge.baseCharge,
        weightCharge: charge.weightCharge,
        codSurcharge: charge.codSurcharge,
        totalCharge: charge.totalCharge,
        status: 'CREATED',
        trackingHistory: {
          create: {
            status: 'CREATED',
            description: 'Order created',
            actor: req.user!.id,
            actorRole: req.user!.role,
          },
        },
      },
    });

    notifyStatusChange(order, 'CREATED');
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const where: any = {};
    if (req.user!.role === 'CUSTOMER') {
      where.customerId = req.user!.id;
    } else if (req.user!.role === 'AGENT') {
      const agentProfile = await prisma.agentProfile.findUnique({ where: { userId: req.user!.id } });
      if (!agentProfile) throw new AppError('Agent profile not found', 404);
      where.agentId = agentProfile.id;
    }

    if (req.query.status) where.status = req.query.status as string;

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { trackingHistory: { orderBy: { createdAt: 'desc' } } },
    });
    
    if (!order) throw new NotFoundError('Order not found');

    if (req.user!.role === 'CUSTOMER' && order.customerId !== req.user!.id) {
      throw new AppError('Forbidden', 403);
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', verifyToken, authorize('AGENT', 'ADMIN'), async (req, res, next) => {
  try {
    const { status, description, failureReason } = req.body;
    
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status, failureReason },
    });

    await prisma.trackingEvent.create({
      data: {
        orderId: order.id,
        status,
        description,
        actor: req.user!.id,
        actorRole: req.user!.role,
      },
    });

    notifyStatusChange(order, status);
    
    if (status === 'DELIVERED' && order.agentId) {
      await prisma.agentProfile.update({
        where: { id: order.agentId },
        data: { isAvailable: true },
      });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/auto-assign', verifyToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new NotFoundError('Order not found');
    if (!order.pickupLat || !order.pickupLng) throw new AppError('Order missing pickup coordinates', 400);

    const agent = await autoAssignAgent(order.id, order.pickupLat, order.pickupLng);
    res.json({ message: 'Assigned successfully', agent });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/assign', verifyToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { agentId } = req.body;
    if (!agentId) throw new AppError('agentId is required', 400);

    const agent = await prisma.agentProfile.findUnique({ where: { id: agentId } });
    if (!agent) throw new NotFoundError('Agent not found');

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { agentId, status: 'ASSIGNED' },
    });

    await prisma.agentProfile.update({
      where: { id: agentId },
      data: { isAvailable: false },
    });

    await prisma.trackingEvent.create({
      data: {
        orderId: order.id,
        status: 'ASSIGNED',
        description: `Agent manually assigned by admin`,
        actor: req.user!.id,
        actorRole: 'ADMIN',
      },
    });

    notifyStatusChange(order, 'ASSIGNED');
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/reschedule', verifyToken, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new NotFoundError('Order not found');
    if (order.status !== 'FAILED') throw new AppError('Only failed orders can be rescheduled', 400);

    if (req.user!.role === 'CUSTOMER' && order.customerId !== req.user!.id) {
      throw new AppError('Forbidden', 403);
    }

    const { rescheduledDate } = req.body;

    // Release old agent
    if (order.agentId) {
      await prisma.agentProfile.update({
        where: { id: order.agentId },
        data: { isAvailable: true },
      });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'RESCHEDULED',
        rescheduledDate: rescheduledDate ? new Date(rescheduledDate) : new Date(),
        agentId: null,
      },
    });

    await prisma.trackingEvent.create({
      data: {
        orderId: order.id,
        status: 'RESCHEDULED',
        description: `Delivery rescheduled${rescheduledDate ? ' for ' + rescheduledDate : ''}`,
        actor: req.user!.id,
        actorRole: req.user!.role,
      },
    });

    notifyStatusChange(updated, 'RESCHEDULED');

    // Auto-reassign if coordinates available
    if (updated.pickupLat && updated.pickupLng) {
      try {
        await autoAssignAgent(updated.id, updated.pickupLat, updated.pickupLng);
      } catch {
        // No agent available, admin will assign manually
      }
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/override', verifyToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { status, description } = req.body;
    if (!status) throw new AppError('status is required', 400);

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    await prisma.trackingEvent.create({
      data: {
        orderId: order.id,
        status,
        description: description || `Status overridden to ${status} by admin`,
        actor: req.user!.id,
        actorRole: 'ADMIN',
      },
    });

    if (status === 'DELIVERED' && order.agentId) {
      await prisma.agentProfile.update({
        where: { id: order.agentId },
        data: { isAvailable: true },
      });
    }

    notifyStatusChange(order, status);
    res.json(order);
  } catch (err) {
    next(err);
  }
});

export default router;
