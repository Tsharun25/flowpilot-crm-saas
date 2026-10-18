import { z } from "zod";

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

export const clientSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().max(120),
  email: z.union([z.literal(""), z.string().trim().email().max(254)]),
  value: z.coerce.number().int().min(0).max(1_000_000_000),
  status: z.enum(["LEAD", "CONTACTED", "WON", "LOST"]).default("LEAD"),
});

export const clientStatusSchema = z.enum(["LEAD", "CONTACTED", "WON", "LOST"]);

export const nameSchema = z.string().trim().min(2).max(80);
export const workspaceNameSchema = z.string().trim().min(2).max(100);
