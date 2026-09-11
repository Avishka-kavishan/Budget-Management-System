"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getEstimatedBudgetsAction(filterUserId?: number) {
  const where = filterUserId ? { userId: filterUserId } : {};

  return await prisma.estimatedBudget.findMany({
    where,
    include: {
      user: { include: { zone: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEstimatedBudgetByIdAction(id: number) {
  return await prisma.estimatedBudget.findUnique({
    where: { id },
    include: {
      user: { include: { zone: true } },
      items: true,
      actualBudgets: { include: { items: true } },
    },
  });
}

export async function createEstimatedBudgetAction(data: {
  zone: string;
  subject: string;
  activityCode: string;
  activityDescription: string;
  programme?: string;
  vote?: string;
  venue?: string;
  date?: string;
  fundingSource?: string;
  estimateAuthorizationCircular?: string;
  dateSubmittedForSettlement?: string;
  referenceFileNo?: string;
  invitedParticipants?: string;
  advanceDate?: string;
  advanceAmount?: number;
  totalExpenditure?: number;
  balance?: number;
  deficitAmount?: number;
  items: {
    category: string;
    rate: number;
    quantity: number;
    daysHours: number;
    amount: number;
  }[];
}) {
  const session = await getSession();
  if (!session) return { error: "You must be logged in to submit a budget." };

  const calculatedTotal = data.items.reduce((acc, item) => acc + (item.amount || 0), 0);

  const budget = await prisma.estimatedBudget.create({
    data: {
      userId: session.userId,
      zone: data.zone,
      subject: data.subject,
      activityCode: data.activityCode,
      activityDescription: data.activityDescription,
      programme: data.programme || null,
      vote: data.vote || null,
      venue: data.venue || null,
      date: data.date ? new Date(data.date) : null,
      fundingSource: data.fundingSource || null,
      estimateAuthorizationCircular: data.estimateAuthorizationCircular || null,
      dateSubmittedForSettlement: data.dateSubmittedForSettlement ? new Date(data.dateSubmittedForSettlement) : null,
      referenceFileNo: data.referenceFileNo || null,
      invitedParticipants: data.invitedParticipants || null,
      estimatedTotal: calculatedTotal,
      advanceDate: data.advanceDate ? new Date(data.advanceDate) : null,
      advanceAmount: data.advanceAmount || 0,
      totalExpenditure: data.totalExpenditure || calculatedTotal,
      balance: data.balance || 0,
      deficitAmount: data.deficitAmount || 0,
      preparedBy: session.name,
      status: "pending",
      items: {
        create: data.items.map((item) => ({
          category: item.category,
          rate: item.rate,
          quantity: item.quantity,
          daysHours: item.daysHours,
          amount: item.amount,
        })),
      },
    },
  });

  revalidatePath("/user/estimated-budget/my-list");
  revalidatePath("/admin/estimated-budgets");
  return { success: true, budgetId: budget.id };
}

export async function approveEstimatedBudgetAction(id: number) {
  const session = await getSession();
  if (!session || (session.role.toLowerCase() !== "admin" && session.role.toLowerCase() !== "accountant")) {
    return { error: "Unauthorized." };
  }

  await prisma.estimatedBudget.update({
    where: { id },
    data: { status: "approved" },
  });

  revalidatePath("/admin/estimated-budgets");
  revalidatePath(`/admin/estimated-budgets/${id}`);
  revalidatePath("/accountant/dashboard");
  return { success: true, message: "Estimated budget approved successfully." };
}

export async function rejectEstimatedBudgetAction(id: number) {
  const session = await getSession();
  if (!session || session.role.toLowerCase() !== "admin") {
    return { error: "Unauthorized." };
  }

  await prisma.estimatedBudget.update({
    where: { id },
    data: { status: "rejected" },
  });

  revalidatePath("/admin/estimated-budgets");
  revalidatePath(`/admin/estimated-budgets/${id}`);
  return { success: true, message: "Estimated budget rejected." };
}
