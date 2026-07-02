export type AppRole = "ADMIN" | "DIRECTORA_ACADEMICA" | "PROFESORA" | "ALUMNA" | string | null | undefined;

export function roleLabel(role: AppRole): string {
  switch (role) {
    case "ADMIN":
      return "Administrador";
    case "DIRECTORA_ACADEMICA":
      return "Directora Académica";
    case "PROFESORA":
      return "Profesora";
    case "ALUMNA":
      return "Alumna";
    default:
      return "Usuario";
  }
}
