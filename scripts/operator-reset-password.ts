import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

if (process.env.CONFIRM_OPERATOR_PASSWORD_RESET !== "1") throw new Error("Set CONFIRM_OPERATOR_PASSWORD_RESET=1 after privately verifying the account owner.");
const email = z.string().trim().toLowerCase().email().parse(process.env.RECOVERY_EMAIL);
const password = z.string().min(12).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/).parse(process.env.RECOVERY_PASSWORD);
const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
if (!user) throw new Error("Account not found.");
await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(password, 12) } });
await prisma.$disconnect();
console.log("Password reset completed. No credential value was logged.");
