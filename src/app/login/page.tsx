import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sanitizeCallbackUrl } from "@/lib/utils";
import LoginClient from "./login-client";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    const { callbackUrl } = await searchParams;
    redirect(sanitizeCallbackUrl(callbackUrl));
  }

  return <LoginClient />;
}
