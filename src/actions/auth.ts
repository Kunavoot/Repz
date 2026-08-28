"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type SignUpResult = {
  success: boolean;
  error?: string;
};

export async function signUpUser(formData: FormData): Promise<SignUpResult> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "กรุณากรอกอีเมลและรหัสผ่าน" };
  }

  if (password.length < 6) {
    return { success: false, error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const displayName = name || email.split("@")[0];

    await prisma.user.create({
      data: {
        email,
        name: displayName,
        password: hashedPassword,
        image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("SignUp error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง" };
  }
}
