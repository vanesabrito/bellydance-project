"use client";
import React, { useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import BackButton from "@/components/atoms/BackButton";
import Link from "next/link";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResetLink(null);

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      
      if (json.ok) {
        setSuccess("Se ha generado un enlace de recuperación");
        setEmail("");
        // Mostrar el enlace para desarrollo sin servicio de email
        if (json.resetLink) {
          setResetLink(json.resetLink);
        }
      } else {
        setError(json.error || "No se pudo enviar el enlace de recuperación");
      }
    } catch (err: any) {
      setError(err?.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <BackButton />
      <Paper sx={{ p: 4, borderRadius: 3, mt: 2 }} elevation={6}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: 700 }}
        >
          Recuperar Contraseña
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mb: 3 }}
        >
          Ingresa tu correo electrónico para generar un enlace de recuperación
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, display: "grid", gap: 2 }}
        >
          <TextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              backgroundColor: "#ec407a",
              color: "#fff",
              '&:hover': {
                backgroundColor: "#d81b60",
              },
            }}
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </Button>
        </Box>
        {resetLink && (
          <Box sx={{ mt: 3, p: 3, backgroundColor: "#e3f2fd", borderRadius: 2, border: "1px solid #2196f3" }}>
            <Typography variant="subtitle1" color="#1976d2" sx={{ fontWeight: 600, mb: 1 }}>
              Enlace de recuperación generado:
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: "break-all", mb: 2 }}>
              <a href={resetLink} style={{ color: "#1976d2", fontWeight: 500 }}>
                {resetLink}
              </a>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Haz clic en el enlace para restablecer tu contraseña. Este enlace expirará en 1 hora.
            </Typography>
          </Box>
        )}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Link href="/login" style={{ textDecoration: "none", color: "#ec407a" }}>
            Volver a iniciar sesión
          </Link>
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
        autoHideDuration={6000}
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
