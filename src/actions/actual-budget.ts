"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { recalculateVoteBalance } from "./votes";
import { revalidatePath } from "next/cache";

export async function getApprovedEstimatesForUserAction(userId?: number) {
  const session = await getSession();
  const targetUserId = userId || session?.userId;
  if (!targetUserId) return [];

  return await prisma.estimatedBudget.findMany({
    where: {
      userId: targetUserId,
      status: "approved",
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActualBudgetsAction(filterUserId?: number) {
  const where = filterUserId ? { userId: filterUserId } : {};

  return await prisma.actualBudget.findMany({
    where,
    include: {
      user: { include: { zone: true } },
      estimatedBudget: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActualBudgetByIdAction(id: number) {
  return await prisma.actualBudget.findUnique({
    where: { id },
    include: {
      user: { include: { zone: true } },
      estimatedBudget: { include: { items: true } },
      items: true,
    },
  });
}

export async function createActualBudgetAction(data: {
  estimatedBudgetId: number;
  items: {
    category: string;
    estRate: number;
    estQuantity: number;
    estDaysHours: number;
    estAmount: number;
    actualRate: number;
    actualQuantity: number;
    actualDaysHours: number;
    actualAmount: number;
  }[];
}) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const estimate = await prisma.estimatedBudget.findUnique({
    where: { id: data.estimatedBudgetId },
  });
  if (!estimate) return { error: "Estimated budget not found." };

  const actualTotal = data.items.reduce((acc, item) => acc + (item.actualAmount || 0), 0);
  const advance = estimate.advanceAmount || 0;
  const balance = advance - actualTotal;
  const deficitAmount = actualTotal > advance ? actualTotal - advance : 0;

  const actual = await prisma.actualBudget.create({
    data: {
      estimatedBudgetId: estimate.id,
      userId: session.userId,
      actualTotal,
      balance,
      deficitAmount,
      preparedBy: session.name,
      status: "pending",
      items: {
        create: data.items.map((i) => ({
          category: i.category,
          estRate: i.estRate,
          estQuantity: i.estQuantity,
          estDaysHours: i.estDaysHours,
          estAmount: i.estAmount,
          actualRate: i.actualRate,
          actualQuantity: i.actualQuantity,
          actualDaysHours: i.actualDaysHours,
          actualAmount: i.actualAmount,
        })),
      },
    },
  });

  revalidatePath("/user/actual-budget/my-list");
  revalidatePath("/admin/actual-budgets");
  return { success: true, actualBudgetId: actual.id };
}

export async function approveActualBudgetAction(id: number) {
  const session = await getSession();
  if (!session || session.role.toLowerCase() !== "admin") {
    return { error: "Unauthorized." };
  }

  const actual = await prisma.actualBudget.findUnique({
    where: { id },
    include: { estimatedBudget: true },
  });
  if (!actual) return { error: "Record not found." };

  await prisma.actualBudget.update({
    where: { id },
    data: { status: "approved" },
  });

  if (actual.estimatedBudget.vote) {
    await recalculateVoteBalance(actual.estimatedBudget.vote);
  }

  revalidatePath("/admin/actual-budgets");
  revalidatePath(`/admin/actual-budgets/${id}`);
  revalidatePath("/admin/votes");
  revalidatePath("/admin/dashboard");
  return { success: true, message: "Actual budget settlement approved. Related vote ledger updated!" };
}

export async function rejectActualBudgetAction(id: number) {
  const session = await getSession();
  if (!session || session.role.toLowerCase() !== "admin") {
    return { error: "Unauthorized." };
  }

  const actual = await prisma.actualBudget.findUnique({
    where: { id },
    include: { estimatedBudget: true },
  });
  if (!actual) return { error: "Record not found." };

  await prisma.actualBudget.update({
    where: { id },
    data: { status: "rejected" },
  });

  if (actual.estimatedBudget.vote) {
    await recalculateVoteBalance(actual.estimatedBudget.vote);
  }

  revalidatePath("/admin/actual-budgets");
  revalidatePath(`/admin/actual-budgets/${id}`);
  revalidatePath("/admin/votes");
  revalidatePath("/admin/dashboard");
  return { success: true, message: "Actual budget rejected." };
}
