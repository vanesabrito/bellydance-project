export type EnrollmentStatus = "PENDING" | "APPROVED" | "REJECTED";

export function statusLabel(status?: EnrollmentStatus | string | null): string {
  switch (status) {
    case "PENDING":
      return "Pendiente";
    case "APPROVED":
      return "Aprobada";
    case "REJECTED":
      return "Rechazada";
    default:
      return "Pendiente";
  }
}

export function statusChipColor(
  status?: EnrollmentStatus | string | null
): "default" | "success" | "error" {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
}
