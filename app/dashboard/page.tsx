import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { redirect } from "next/navigation";
import { roleLabel } from "@/utils/roles";

export default async function Dashboard() {
  const session = await getServerSession(authOptions as any);
  if (!session) {
    // Redirect unauthenticated users to login
    redirect("/login");
  }

  const s: any = session;
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper sx={{ p: 6, borderRadius: 4 }} elevation={6}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
          Dashboard
        </Typography>
        <Box>
          <Typography sx={{ mb: 1 }}>Bienvenido, {s.user?.email}</Typography>
          <Typography>Rol: {roleLabel(s.user?.role)}</Typography>
        </Box>
      </Paper>
    </Container>
  );
}
