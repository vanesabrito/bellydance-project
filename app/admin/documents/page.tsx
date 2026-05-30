import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default async function AdminDocumentsPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN") redirect("/dashboard");

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Documentos
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Aquí podrás gestionar la recepción y entrega de documentos de las alumnas.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
