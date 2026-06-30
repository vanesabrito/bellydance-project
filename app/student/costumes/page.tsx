"use client";
import { useSession } from "next-auth/react";
import StudentCostumesView from "@/components/student/StudentCostumesView";

export default function StudentCostumesPage() {
  const { data: session } = useSession();

  if (!session || (session as any)?.user?.role !== "ALUMNA") {
    return null;
  }

  return <StudentCostumesView />;
}
