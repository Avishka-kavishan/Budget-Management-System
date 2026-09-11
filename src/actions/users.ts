"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role.toLowerCase() !== "admin") {
    throw new Error("Unauthorized admin access.");
  }
}

export async function getUsersAction(includeTrashed = false) {
  await checkAdmin();

  return await prisma.user.findMany({
    where: includeTrashed ? { deletedAt: { not: null } } : { deletedAt: null },
    include: { zone: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getZonesAction() {
  return await prisma.zone.findMany({
    orderBy: { zoneName: "asc" },
  });
}

export async function createUserAction(formData: FormData) {
  await checkAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const zoneIdStr = formData.get("zoneId") as string;

  if (!name || !email || !password || !role) {
    return { error: "Please fill all required fields." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "User with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const zoneId = zoneIdStr ? parseInt(zoneIdStr, 10) : null;

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      zoneId,
    },
  });

  revalidatePath("/admin/users");
  return { success: true, message: "User created successfully." };
}

export async function updateUserAction(id: number, formData: FormData) {
  await checkAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const zoneIdStr = formData.get("zoneId") as string;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { error: "User not found." };

  const updateData: { name?: string; email?: string; role?: string; zoneId?: number | null; password?: string } = {
    name,
    email,
    role,
    zoneId: zoneIdStr ? parseInt(zoneIdStr, 10) : null,
  };

  if (password && password.trim().length >= 6) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/users");
  return { success: true, message: "User updated successfully." };
}

export async function deleteUserAction(id: number) {
  await checkAdmin();
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/admin/users");
  return { success: true, message: "User moved to trash." };
}

export async function restoreUserAction(id: number) {
  await checkAdmin();
  await prisma.user.update({
    where: { id },
    data: { deletedAt: null },
  });
  revalidatePath("/admin/users");
  return { success: true, message: "User restored successfully." };
}

export async function forceDeleteUserAction(id: number) {
  await checkAdmin();
  await prisma.user.delete({
    where: { id },
  });
  revalidatePath("/admin/users");
  return { success: true, message: "User permanently deleted." };
}
