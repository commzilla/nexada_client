export type UserRole = "admin" | "client";

export type PlanInterval = "one_time" | "month" | "year";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "incomplete"
  | "trialing";

export type PaymentStatus = "succeeded" | "pending" | "failed";
