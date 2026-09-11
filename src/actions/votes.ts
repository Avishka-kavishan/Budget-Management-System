"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role.toLowerCase() !== "admin") {
    throw new Error("Unauthorized admin access.");
  }
}

export async function recalculateVoteBalance(voteNumber: string) {
  const vote = await prisma.vote.findUnique({
    where: { voteNumber },
    include: { allocations: true },
  });
  if (!vote) return;

  const totalAllocated = vote.allocations.reduce((acc, a) => acc + a.amount, 0);

  // Sum of all approved actual budgets referencing this vote
  const approvedActuals = await prisma.actualBudget.findMany({
    where: {
      status: "approved",
      estimatedBudget: { vote: voteNumber },
    },
  });

  const totalUsed = approvedActuals.reduce((acc, b) => acc + b.actualTotal, 0);
  const remaining = totalAllocated - totalUsed;

  await prisma.vote.update({
    where: { id: vote.id },
    data: {
      totalAllocated,
      totalUsed,
      remaining,
    },
  });
}

export async function getVotesAction() {
  return await prisma.vote.findMany({
    include: { allocations: { orderBy: { createdAt: "desc" } } },
    orderBy: { voteNumber: "asc" },
  });
}

export async function createVoteAction(formData: FormData) {
  await checkAdmin();

  const voteNumber = formData.get("voteNumber") as string;
  const description = formData.get("description") as string;

  if (!voteNumber || !description) {
    return { error: "Vote number and description are required." };
  }

  const existing = await prisma.vote.findUnique({ where: { voteNumber } });
  if (existing) {
    return { error: "A vote head with this number already exists." };
  }

  await prisma.vote.create({
    data: {
      voteNumber,
      description,
      totalAllocated: 0,
      totalUsed: 0,
      remaining: 0,
    },
  });

  revalidatePath("/admin/votes");
  revalidatePath("/admin/dashboard");
  return { success: true, message: "Vote created successfully." };
}

export async function addFundAllocationAction(formData: FormData) {
  await checkAdmin();

  const voteIdStr = formData.get("voteId") as string;
  const yearStr = formData.get("year") as string;
  const monthStr = formData.get("month") as string;
  const amountStr = formData.get("amount") as string;
  const remarks = formData.get("remarks") as string;

  if (!voteIdStr || !yearStr || !monthStr || !amountStr) {
    return { error: "All required fields must be filled." };
  }

  const voteId = parseInt(voteIdStr, 10);
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    return { error: "Allocation amount must be greater than zero." };
  }

  const vote = await prisma.vote.findUnique({ where: { id: voteId } });
  if (!vote) return { error: "Vote not found." };

  await prisma.fundAllocation.create({
    data: {
      voteId,
      year,
      month,
      amount,
      remarks,
    },
  });

  await recalculateVoteBalance(vote.voteNumber);

  revalidatePath("/admin/votes");
  revalidatePath("/admin/dashboard");
  return { success: true, message: "Fund allocation added and vote balance updated." };
}
