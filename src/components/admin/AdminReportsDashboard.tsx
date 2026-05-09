"use client";
import React, { useCallback, useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import RecentEnrollmentsTable from "@/components/admin/RecentEnrollmentsTable";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

type RecentEnrollment = {
  id: string;
  className: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  student?: { email: string | null } | null;
};

type Stats = {
  totalUsers: number;
  totalAdmins: number;
  totalStudents: number;
  totalEnrollments: number;
  pending: number;
  approved: number;
  rejected: number;
};

export default function AdminReportsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/summary", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const json = (await res.json()) as { stats: Stats; recent: RecentEnrollment[] };
      setStats(json.stats);
      setRecentEnrollments(json.recent ?? []);
    } catch (err) {
      setError("No pudimos cargar los reportes. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useRefreshOnFocus(loadSummary);

  const Card = ({ label, value }: { label: string; value: number }) => (
    <Paper sx={{ p: 3, borderRadius: 3 }} elevation={4}>
      <Typography variant="overline" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Reportes
        </Typography>
        {isLoading && <CircularProgress size={20} />}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={loadSummary}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {stats ? (
        <Grid container spacing={2}>
          <Grid xs={12} md={3}>
            <Card label="Usuarios" value={stats.totalUsers} />
          </Grid>
          <Grid xs={12} md={3}>
            <Card label="Administradores" value={stats.totalAdmins} />
          </Grid>
          <Grid xs={12} md={3}>
            <Card label="Estudiantes" value={stats.totalStudents} />
          </Grid>
          <Grid xs={12} md={3}>
            <Card label="Inscripciones" value={stats.totalEnrollments} />
          </Grid>
          <Grid xs={12} md={4}>
            <Card label="Pendientes" value={stats.pending} />
          </Grid>
          <Grid xs={12} md={4}>
            <Card label="Aprobadas" value={stats.approved} />
          </Grid>
          <Grid xs={12} md={4}>
            <Card label="Rechazadas" value={stats.rejected} />
          </Grid>
        </Grid>
      ) : (
        !isLoading && (
          <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
            <Typography>No hay datos para mostrar.</Typography>
          </Paper>
        )
      )}

      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }} elevation={6}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Últimas inscripciones
            </Typography>
            <Button
              variant="outlined"
              href="/api/reports/enrollments"
              target="_blank"
            >
              Exportar CSV
            </Button>
          </Box>
          <RecentEnrollmentsTable docs={recentEnrollments} />
        </Paper>
      </Box>
    </Container>
  );
}
