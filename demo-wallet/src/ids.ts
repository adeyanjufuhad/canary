import { randomInt } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Stripe-style IDs: cus_…, ch_…, re_… */
export function newId(prefix: "cus" | "ch" | "re", length = 14): string {
  let id = "";
  for (let i = 0; i < length; i++) id += ALPHABET[randomInt(ALPHABET.length)];
  return `${prefix}_${id}`;
}
