import { Order, OrderStatus } from '@prisma/client';
import { sendStatusNotification } from './emailService';
import { prisma } from '../config/prisma';

export const notifyStatusChange = async (order: Order, newStatus: OrderStatus) => {
  try {
    const customer = await prisma.user.findUnique({
      where: { id: order.customerId },
    });

    if (customer && customer.email) {
      await sendStatusNotification(
        customer.email,
        order.orderNumber,
        newStatus,
        order.failureReason || undefined
      );
    }
  } catch (error) {
    console.error('Error notifying status change:', error);
  }
};
