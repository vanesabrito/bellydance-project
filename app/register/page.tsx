"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import BackButton from "@/components/atoms/BackButton";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordsMismatch = confirm.length > 0 && confirm !== password;

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // basic client-side validation
    if (passwordTooShort) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (passwordsMismatch) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.ok) {
        setSuccess(
          "Registrado correctamente. Redirigiendo a iniciar sesión..."
        );
        setTimeout(() => router.push("/login"), 1200);
      } else {
        const msg = (() => {
          // Prefer status code when available
          switch (res.status) {
            case 409:
              return "El email ya está registrado";
            case 400:
              return "Faltan campos obligatorios";
            case 500:
              return "Error interno del servidor";
            default:
              // Fallback by message content
              if (typeof json.error === "string") {
                const e = json.error.toLowerCase();
                if (e.includes("already in use"))
                  return "El email ya está registrado";
                if (e.includes("missing")) return "Faltan campos obligatorios";
              }
              return "No se pudo completar el registro";
          }
        })();
        setError(msg);
      }
    } catch (err: any) {
      setError(err?.message || "Error de red");
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
          sx={{ textAlign: "left", fontWeight: 700 }}
        >
          Registrar estudiante
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, display: "grid", gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            fullWidth
            required
          />
          <TextField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            fullWidth
            required
            error={passwordTooShort}
            helperText={passwordTooShort ? "Mínimo 8 caracteres" : ""}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirmar contraseña"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirm(e.target.value)
            }
            fullWidth
            required
            error={passwordsMismatch}
            helperText={passwordsMismatch ? "Las contraseñas no coinciden" : ""}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowConfirm((s) => !s)}
                    edge="end"
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || passwordTooShort || passwordsMismatch}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            {loading ? "Registrando..." : "Registrar"}
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
