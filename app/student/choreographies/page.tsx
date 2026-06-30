"use client";
import { useSession } from "next-auth/react";
import StudentChoreographiesView from "@/components/student/StudentChoreographiesView";

export default function StudentChoreographiesPage() {
  const { data: session } = useSession();

  if (!session || (session as any)?.user?.role !== "ALUMNA") {
    return null;
  }

  return <StudentChoreographiesView />;
}
