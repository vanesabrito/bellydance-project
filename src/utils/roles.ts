export type AppRole = "ADMIN" | "COORDINATOR" | "INSTRUCTOR" | "STUDENT" | string | null | undefined;

export function roleLabel(role: AppRole): string {
  switch (role) {
    case "ADMIN":
      return "Administrador";
    case "COORDINATOR":
      return "Coordinador";
    case "INSTRUCTOR":
      return "Instructor";
    case "STUDENT":
      return "Estudiante";
    default:
      return "Usuario";
  }
}
