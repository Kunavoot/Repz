import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignUpClient from "./signup-client";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return <SignUpClient />;
}
