import crypto from 'crypto';

export const generateOrderNumber = (): string => {
  const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `POS-${randomChars}`;
};
