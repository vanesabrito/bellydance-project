"use client";
import { useSession } from "next-auth/react";
import EnrolledStudentsView from "@/components/EnrolledStudentsView";

export default function DirectoraViewStudentsPage() {
  const { data: session } = useSession();

  if (!session || (session as any)?.user?.role !== "DIRECTORA_ACADEMICA") {
    return null;
  }

  return <EnrolledStudentsView readOnly={true} />;
}
