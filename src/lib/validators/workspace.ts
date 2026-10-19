import { z } from "zod";
import { MAX_DEAL_VALUE_CENTS } from "@/lib/crm-metrics";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");

export const projectIdSchema = objectId;
export const taskIdSchema = objectId;
export const clientIdSchema = objectId;

export const projectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).default("ACTIVE"),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]);

export const dealValueSchema = z
  .string()
  .trim()
  .regex(
    /^\d+(?:\.\d{1,2})?$/,
    "Deal value must be a nonnegative USD amount with no more than two decimal places",
  )
  .transform((value) => {
    const [wholeDollars, fractionalCents = ""] = value.split(".");
    return (
      BigInt(wholeDollars) * BigInt(100) +
      BigInt(fractionalCents.padEnd(2, "0") || "0")
    );
  })
  .refine((value) => value <= MAX_DEAL_VALUE_CENTS, {
    message: "Deal value cannot exceed $1,000,000,000.00",
  });

export const clientSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().max(120),
  email: z.union([z.literal(""), z.string().trim().email().max(254)]),
  value: dealValueSchema,
  status: z.enum(["LEAD", "CONTACTED", "WON", "LOST"]).default("LEAD"),
});

export const clientStatusSchema = z.enum(["LEAD", "CONTACTED", "WON", "LOST"]);

export const nameSchema = z.string().trim().min(2).max(80);
export const workspaceNameSchema = z.string().trim().min(2).max(100);
