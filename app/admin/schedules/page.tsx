import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ScheduleManagement from "@/components/admin/ScheduleManagement";

export default async function AdminSchedulesPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN") redirect("/dashboard");

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Gestionar Horarios
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Registro y gestión de horarios de clases de la academia.
        </Typography>
        <ScheduleManagement />
      </Paper>
    </Container>
  );
}
