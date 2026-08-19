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
    const zone1 = await prisma.zone.upsert({
      where: { name: 'North Zone' },
      update: {},
      create: { name: 'North Zone' },
    });
    const zone2 = await prisma.zone.upsert({
      where: { name: 'South Zone' },
      update: {},
      create: { name: 'South Zone' },
    });
    const zone3 = await prisma.zone.upsert({
      where: { name: 'Central Zone' },
      update: {},
      create: { name: 'Central Zone' },
    });

    const areas = [
      { name: 'North Area 1', pincode: '110001', zoneId: zone1.id, lat: 28.6000, lng: 77.2000 },
      { name: 'North Area 2', pincode: '110002', zoneId: zone1.id, lat: 28.6139, lng: 77.2090 },
      { name: 'Noida Sector 62', pincode: '201301', zoneId: zone1.id, lat: 28.6270, lng: 77.3724 },
      { name: 'Ghaziabad City', pincode: '201001', zoneId: zone1.id, lat: 28.6692, lng: 77.4538 },
      { name: 'South Area 1', pincode: '600001', zoneId: zone2.id, lat: 13.0000, lng: 80.2000 },
      { name: 'VIT Chennai', pincode: '600127', zoneId: zone2.id, lat: 12.8406, lng: 80.1534 },
      { name: 'Tambaram', pincode: '600045', zoneId: zone2.id, lat: 12.9249, lng: 80.1000 },
      { name: 'Velachery', pincode: '600042', zoneId: zone2.id, lat: 12.9759, lng: 80.2212 },
      { name: 'Central Area 1', pincode: '560001', zoneId: zone3.id, lat: 12.9716, lng: 77.5946 },
      { name: 'Whitefield', pincode: '560066', zoneId: zone3.id, lat: 12.9698, lng: 77.7500 },
      { name: 'Indiranagar', pincode: '560038', zoneId: zone3.id, lat: 12.9784, lng: 77.6408 },
    ];

    const areaResult = await prisma.area.createMany({
      data: areas,
      skipDuplicates: true,
    });

    const rateCards = [
      { zoneId: zone1.id, destinationZoneId: zone1.id, orderType: 'B2C' as const, ratePerKg: 35, baseRate: 70, codSurcharge: 35 },
      { zoneId: zone1.id, destinationZoneId: zone1.id, orderType: 'B2B' as const, ratePerKg: 30, baseRate: 65, codSurcharge: 30 },
      { zoneId: zone1.id, destinationZoneId: zone2.id, orderType: 'B2C' as const, ratePerKg: 50, baseRate: 100, codSurcharge: 50 },
      { zoneId: zone1.id, destinationZoneId: zone2.id, orderType: 'B2B' as const, ratePerKg: 45, baseRate: 90, codSurcharge: 45 },
      { zoneId: zone2.id, destinationZoneId: zone1.id, orderType: 'B2C' as const, ratePerKg: 52, baseRate: 105, codSurcharge: 50 },
      { zoneId: zone2.id, destinationZoneId: zone1.id, orderType: 'B2B' as const, ratePerKg: 46, baseRate: 95, codSurcharge: 45 },
      { zoneId: zone2.id, destinationZoneId: zone2.id, orderType: 'B2C' as const, ratePerKg: 34, baseRate: 68, codSurcharge: 30 },
      { zoneId: zone2.id, destinationZoneId: zone2.id, orderType: 'B2B' as const, ratePerKg: 29, baseRate: 60, codSurcharge: 25 },
      { zoneId: zone3.id, destinationZoneId: zone3.id, orderType: 'B2C' as const, ratePerKg: 36, baseRate: 72, codSurcharge: 30 },
      { zoneId: zone3.id, destinationZoneId: zone3.id, orderType: 'B2B' as const, ratePerKg: 31, baseRate: 66, codSurcharge: 25 },
      { zoneId: zone1.id, destinationZoneId: zone3.id, orderType: 'B2C' as const, ratePerKg: 55, baseRate: 115, codSurcharge: 55 },
      { zoneId: zone1.id, destinationZoneId: zone3.id, orderType: 'B2B' as const, ratePerKg: 48, baseRate: 100, codSurcharge: 45 },
      { zoneId: zone3.id, destinationZoneId: zone1.id, orderType: 'B2C' as const, ratePerKg: 56, baseRate: 118, codSurcharge: 55 },
      { zoneId: zone3.id, destinationZoneId: zone1.id, orderType: 'B2B' as const, ratePerKg: 49, baseRate: 102, codSurcharge: 45 },
      { zoneId: zone2.id, destinationZoneId: zone3.id, orderType: 'B2C' as const, ratePerKg: 53, baseRate: 110, codSurcharge: 50 },
      { zoneId: zone2.id, destinationZoneId: zone3.id, orderType: 'B2B' as const, ratePerKg: 47, baseRate: 98, codSurcharge: 42 },
      { zoneId: zone3.id, destinationZoneId: zone2.id, orderType: 'B2C' as const, ratePerKg: 54, baseRate: 112, codSurcharge: 50 },
      { zoneId: zone3.id, destinationZoneId: zone2.id, orderType: 'B2B' as const, ratePerKg: 47, baseRate: 99, codSurcharge: 42 },
    ];

    const rateCardResult = await prisma.rateCard.createMany({
      data: rateCards,
      skipDuplicates: true,
    });

    const hashedPw = await bcrypt.hash('password123', 10);
    
    await prisma.user.upsert({
      where: { email: 'customer1@example.com' },
      update: {
        password: hashedPw,
        name: 'John Doe',
        role: 'CUSTOMER',
      },
      create: {
        email: 'customer1@example.com',
        password: hashedPw,
        name: 'John Doe',
        role: 'CUSTOMER',
      },
    });

    const agentUser = await prisma.user.upsert({
      where: { email: 'agent1@example.com' },
      update: {
        password: hashedPw,
        name: 'Agent Smith',
        role: 'AGENT',
      },
      create: {
        email: 'agent1@example.com',
        password: hashedPw,
        name: 'Agent Smith',
        role: 'AGENT',
      },
    });

    await prisma.agentProfile.upsert({
      where: { userId: agentUser.id },
      update: {
        zoneId: zone1.id,
        currentLat: 28.6139,
        currentLng: 77.2090,
        isAvailable: true,
      },
      create: {
        userId: agentUser.id,
        zoneId: zone1.id,
        currentLat: 28.6139,
        currentLng: 77.2090,
        isAvailable: true,
      },
    });

    res.json({
      message: 'Database seeded successfully',
      addedAreas: areaResult.count,
      addedRateCards: rateCardResult.count,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
