import { prisma } from '../config/prisma';
import { OrderType, PaymentType, Zone } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';

export const detectZone = async (pincode: string): Promise<Zone> => {
  const area = await prisma.area.findUnique({
    where: { pincode },
    include: { zone: true },
  });

  if (!area) {
    throw new NotFoundError(`Area not found for pincode: ${pincode}`);
  }

  return area.zone;
};

export const calculateVolumetricWeight = (l: number, b: number, h: number): number => {
  return (l * b * h) / 5000;
};

export interface ChargeBreakdown {
  volumetricWeight: number;
  billableWeight: number;
  baseCharge: number;
  weightCharge: number;
  codSurcharge: number;
  totalCharge: number;
  pickupZoneId: string;
  dropZoneId: string;
}

export const calculateCharge = async (params: {
  pickupPincode: string;
  dropPincode: string;
  actualWeight: number;
  packageLength: number;
  packageBreadth: number;
  packageHeight: number;
  orderType: OrderType;
  paymentType: PaymentType;
}): Promise<ChargeBreakdown> => {
  const { pickupPincode, dropPincode, actualWeight, packageLength, packageBreadth, packageHeight, orderType, paymentType } = params;

  const pickupZone = await detectZone(pickupPincode);
  const dropZone = await detectZone(dropPincode);

  const volumetricWeight = calculateVolumetricWeight(packageLength, packageBreadth, packageHeight);
  const billableWeight = Math.max(actualWeight, volumetricWeight);

  const rateCard = await prisma.rateCard.findUnique({
    where: {
      zoneId_destinationZoneId_orderType: {
        zoneId: pickupZone.id,
        destinationZoneId: dropZone.id,
        orderType,
      },
    },
  });

  if (!rateCard) {
    throw new ValidationError(`No rate card found for route from ${pickupZone.name} to ${dropZone.name} for ${orderType}`);
  }

  const weightCharge = rateCard.ratePerKg * billableWeight;
  const codSurchargeAmount = paymentType === PaymentType.COD ? rateCard.codSurcharge : 0;
  const totalCharge = rateCard.baseRate + weightCharge + codSurchargeAmount;

  return {
    volumetricWeight,
    billableWeight,
    baseCharge: rateCard.baseRate,
    weightCharge,
    codSurcharge: codSurchargeAmount,
    totalCharge,
    pickupZoneId: pickupZone.id,
    dropZoneId: dropZone.id,
  };
};
