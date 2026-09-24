"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, destroySession, getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { zone: true },
  });

  if (!user || user.deletedAt) {
    return { error: "Invalid email or password." };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return { error: "Invalid email or password." };
  }

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    zoneId: user.zoneId,
  });

  const role = user.role.toLowerCase();
  let redirectUrl = "/user/dashboard";
  if (role === "admin") redirectUrl = "/admin/dashboard";
  else if (role === "accountant") redirectUrl = "/accountant/dashboard";

  return { success: true, redirectUrl };
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirmation = formData.get("password_confirmation") as string;
  const zoneIdStr = formData.get("zoneId") as string;

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  if (password !== passwordConfirmation) {
    return { error: "Passwords do not match." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "A user with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const zoneId = zoneIdStr ? parseInt(zoneIdStr, 10) : null;

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "user",
      zoneId,
    },
  });

  await createSession({
    userId: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    zoneId: newUser.zoneId,
  });

  return { success: true, redirectUrl: "/user/dashboard" };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const currentPassword = formData.get("current_password") as string;
  const newPassword = formData.get("new_password") as string;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "User not found." };

  const updateData: { name?: string; email?: string; password?: string } = {};

  if (name) updateData.name = name;
  if (email && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== user.id) {
      return { error: "This email is already in use." };
    }
    updateData.email = email;
  }

  if (newPassword) {
    if (!currentPassword) {
      return { error: "Current password is required to set a new password." };
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { error: "Current password does not match." };
    }
    if (newPassword.length < 6) {
      return { error: "New password must be at least 6 characters." };
    }
    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  revalidatePath("/profile");
  return { success: true, message: "Profile updated successfully." };
}

export async function getCurrentSessionUserAction() {
  const session = await getSession();
  if (!session) return null;
  return {
    id: session.userId,
    name: session.name,
    email: session.email,
    role: session.role,
    zoneId: session.zoneId,
  };
}
