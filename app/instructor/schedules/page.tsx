import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import InstructorScheduleView from "@/components/instructor/InstructorScheduleView";

export default async function InstructorSchedulesPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session) redirect("/login");
  if (session.user?.role !== "PROFESORA") redirect("/dashboard");

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Ver Horarios
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Visualización de horarios de clases asignados.
        </Typography>
        <InstructorScheduleView />
      </Paper>
    </Container>
  );
}
