import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginClient from "./login-client";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return <LoginClient />;
}
