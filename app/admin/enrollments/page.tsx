import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ReviewEnrollmentsTable from "@/components/admin/ReviewEnrollmentsTable";

export default async function AdminEnrollmentsPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN")
    redirect("/dashboard");

  return <ReviewEnrollmentsTable />;
}
