import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminReportsDashboard from "@/components/admin/AdminReportsDashboard";

export default async function AdminReportsPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN") redirect("/dashboard");

  return <AdminReportsDashboard />;
}
