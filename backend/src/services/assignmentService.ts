import { prisma } from '../config/prisma';
import { AgentProfile } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

export const autoAssignAgent = async (
  orderId: string,
  pickupLat: number,
  pickupLng: number
): Promise<AgentProfile> => {
  return await prisma.$transaction(async (tx) => {
    // Basic PostGIS-like distance calculation with raw SQL
    const agents = await tx.$queryRaw<AgentProfile[]>`
      SELECT ap.*, 
        (6371 * acos(cos(radians(${pickupLat})) * cos(radians(ap."currentLat")) * cos(radians(ap."currentLng") - radians(${pickupLng})) + sin(radians(${pickupLat})) * sin(radians(ap."currentLat")))) AS distance
      FROM "AgentProfile" ap
      WHERE ap."isAvailable" = true
        AND ap."currentLat" IS NOT NULL
        AND ap."currentLng" IS NOT NULL
      ORDER BY distance ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `;

    if (!agents || agents.length === 0) {
      throw new NotFoundError('No available agents nearby');
    }

    const assignedAgent = agents[0];

    // Update order with agent
    await tx.order.update({
      where: { id: orderId },
      data: { agentId: assignedAgent.id, status: 'ASSIGNED' },
    });

    // Update agent availability
    await tx.agentProfile.update({
      where: { id: assignedAgent.id },
      data: { isAvailable: false },
    });

    // Create tracking event
    await tx.trackingEvent.create({
      data: {
        orderId,
        status: 'ASSIGNED',
        description: 'Agent automatically assigned',
        actor: 'SYSTEM',
        actorRole: 'ADMIN',
      },
    });

    return assignedAgent;
  });
};
