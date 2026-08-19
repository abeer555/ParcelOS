import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

router.get('/dashboard', verifyToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const totalOrders = await prisma.order.count();
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } } },
    });

    const totalAgents = await prisma.agentProfile.count();
    const availableAgents = await prisma.agentProfile.count({ where: { isAvailable: true } });

    res.json({
      totalOrders,
      ordersByStatus,
      recentOrders,
      agentUtilization: {
        total: totalAgents,
        available: availableAgents,
        busy: totalAgents - availableAgents,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/seed', async (req, res, next) => {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return res.status(400).json({ message: 'Database already seeded' });
    }

    const zone1 = await prisma.zone.create({ data: { name: 'North Zone' } });
    const zone2 = await prisma.zone.create({ data: { name: 'South Zone' } });

    await prisma.area.createMany({
      data: [
        { name: 'North Area 1', pincode: '110001', zoneId: zone1.id, lat: 28.6, lng: 77.2 },
        { name: 'South Area 1', pincode: '600001', zoneId: zone2.id, lat: 13.0, lng: 80.2 },
      ],
    });

    await prisma.rateCard.create({
      data: {
        zoneId: zone1.id,
        destinationZoneId: zone2.id,
        orderType: 'B2C',
        ratePerKg: 50,
        baseRate: 100,
        codSurcharge: 50,
      },
    });

    const hashedPw = await bcrypt.hash('password123', 10);
    
    await prisma.user.create({
      data: {
        email: 'customer1@example.com',
        password: hashedPw,
        name: 'John Doe',
        role: 'CUSTOMER',
      },
    });

    await prisma.user.create({
      data: {
        email: 'agent1@example.com',
        password: hashedPw,
        name: 'Agent Smith',
        role: 'AGENT',
        agentProfile: {
          create: {
            zoneId: zone1.id,
            currentLat: 28.61,
            currentLng: 77.21,
          },
        },
      },
    });

    res.json({ message: 'Database seeded successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
