import { z } from "zod";

/** Amounts are positive integer cents, up to $1,000,000. */
const cents = z.int().positive().max(100_000_000);

export const createCustomer = z.object({
  email: z.email().max(254),
  name: z.string().trim().min(1).max(120),
});

export const moneyMovement = z.object({ amount: cents });

export const createCharge = z.object({
  customer: z.string().startsWith("cus_"),
  product: z.string().min(1),
  quantity: z.int().min(1).max(100).default(1),
  promo_code: z.string().trim().min(1).max(40).optional(),
});

export const createRefund = z.object({
  charge: z.string().startsWith("ch_"),
  amount: cents,
});
