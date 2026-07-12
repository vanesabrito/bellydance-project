export type AppRole = "ADMINISTRADOR" | "DIRECTORA_ACADEMICA" | "PROFESORA" | "ALUMNA" | string | null | undefined;

export function roleLabel(role: AppRole): string {
  switch (role) {
    case "ADMINISTRADOR":
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

// Función auxiliar para obtener el rol de un usuario desde la tabla Role
export function getUserRole(roleNombre: string | null | undefined): string {
  return roleNombre || "ALUMNA";
}
