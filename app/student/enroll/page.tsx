"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface DanceClass {
  id: string;
  name: string;
  description?: string | null;
}

export default function StudentEnroll() {
  const [classes, setClasses] = useState<DanceClass[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch("/api/classes");
        if (!res.ok) throw new Error("Error cargando clases");
        const json = await res.json();
        setClasses(json.classes ?? []);
      } catch (err: any) {
        setError(err?.message || "No se pudieron cargar las clases");
      }
    }
    loadClasses();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClass) return setError("Selecciona una clase");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/enrollments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClass }),
      });
      const json = await res.json();
      if (json.ok) {
        setSuccess("Inscripción enviada correctamente");
        setTimeout(() => router.push("/student/enrollments"), 1000);
      } else {
        setError(json.error || "No se pudo enviar la inscripción");
      }
    } catch (err: any) {
      setError(err?.message || "Error de red");
    } finally {
      setLoading(false);
    }
  }

  if (!session) return <p>Debes iniciar sesión para inscribirte en una clase.</p>;

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Inscribirse en clase
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, display: "grid", gap: 2 }}
        >
          <TextField
            select
            label="Selecciona una clase"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            fullWidth
            required
          >
            {classes.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !selectedClass}
            sx={{ textTransform: "none", borderRadius: 3 }}
          >
            {loading ? "Enviando..." : "Inscribirse"}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
      >
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}
