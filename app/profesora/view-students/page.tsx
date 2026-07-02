"use client";
import { useSession } from "next-auth/react";
import EnrolledStudentsView from "@/components/EnrolledStudentsView";

export default function ProfesoraViewStudentsPage() {
  const { data: session } = useSession();

  if (!session || (session as any)?.user?.role !== "PROFESORA") {
    return null;
  }

  return <EnrolledStudentsView readOnly={true} />;
}
