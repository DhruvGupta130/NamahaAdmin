// lib/constants.ts
export const DiscountType = {
  FLAT: "FLAT",
  PERCENTAGE: "PERCENTAGE",
} as const;

export const OfferType = {
  ONE_TIME: "ONE_TIME",
  SUBSCRIPTION: "SUBSCRIPTION",
} as const;

export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;