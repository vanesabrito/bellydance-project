"use client";
import { useSession } from "next-auth/react";
import StudentClassesView from "@/components/student/StudentClassesView";

export default function StudentClassesPage() {
  const { data: session } = useSession();

  if (!session || (session as any)?.user?.role !== "ALUMNA") {
    return null;
  }

  return <StudentClassesView />;
}
